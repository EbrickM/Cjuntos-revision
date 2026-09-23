import { useState } from 'react';
import {
  Search, ChevronRight, MessageSquare, Save, Receipt,
  LayoutGrid, CheckCircle, AlertCircle, Clock, Settings2, MessageCircle,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import BorradoresSeccion from '../../components/contratos/BorradoresSeccion';
import { TEXT4, fmt, provState, contratoBadge } from './provData';
import { contratoService } from '../../services/contrato.service';
import { aViewContrato } from '../../components/contratos/contratoUtils';
import { useCountUp } from '../../hooks/useCountUp';

const TAB_ICON = {
  'Todos':                       LayoutGrid,
  'Activo':                      CheckCircle,
  'Con Requerimientos':          AlertCircle,
  'Pendiente de Revisión':       Clock,
  'Pendiente de Configuración':  Settings2,
  'En Discusión de Términos':    MessageCircle,
  'Borradores':                  Save,
};

// ── Sub-component: Contract Card ──────────────────────────────────────────────
function ContractCard({ c, idx, go, setReqModal }) {
  const usedPct = c.asignado > 0 ? Math.round((c.utilizado / c.asignado) * 100) : 0;
  const animPct = useCountUp(usedPct, 1200, 80 + idx * 60);

  return (
    <div
      onClick={() => { provState.selectedContrato = c; go('provContratoDetalle'); }}
      className="relative bg-white rounded-[16px] p-5 cursor-pointer flex flex-col gap-3.5 transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] card-enter"
      style={{ animationDelay: `${idx * 70}ms` }}
    >
      {c.requerimiento && (
        <button
          onClick={e => { e.stopPropagation(); setReqModal(c); }}
          title="Ver requerimiento"
          className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-orange-dark text-white flex items-center justify-center shadow-lg animate-bounce cursor-pointer z-10"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      )}

      {/* Fila 1: ID + estado */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold text-text-3 tracking-wide">{c.id}</span>
        <Badge variant={contratoBadge(c.estado)}>{c.estado}</Badge>
      </div>

      {/* Fila 2: Empresa Contratante */}
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-text-4 mb-0.5">Empresa Contratante</p>
        <p className="text-[13px] font-bold text-text-1 leading-tight truncate">{c.pyme || '—'}</p>
      </div>

      {/* Fila 3: Monto Asignado + Monto Disponible */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-text-4 mb-0.5">Monto Asignado</p>
          <p className="text-[13px] font-extrabold text-text-1 tabular-nums leading-tight">{fmt(c.asignado)} XAF</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-text-4 mb-0.5">Disponible</p>
          <p className="text-[13px] font-extrabold tabular-nums leading-tight" style={{ color: '#EF7A2C' }}>{fmt(c.disponible)} XAF</p>
        </div>
      </div>

      {/* Fila 4: Barra de progreso + utilizado */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
          <div className="h-full rounded-full" style={{ width: `${animPct}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tabular-nums" style={{ color: '#E0201C' }}>Utilizado: {fmt(c.utilizado)} XAF</span>
          <span className="text-[10px] font-bold tabular-nums" style={{ color: '#E0201C' }}>{animPct}%</span>
        </div>
      </div>

      {/* Fila 5: Facturas + Ver detalles */}
      <div className="flex items-center justify-between mt-auto pt-0.5">
        <span className="inline-flex items-center gap-1 text-[11px] text-text-4">
          <Receipt className="w-3.5 h-3.5 shrink-0" />{c.facturas ?? 0} facturas
        </span>
        <button
          onClick={e => { e.stopPropagation(); provState.selectedContrato = c; go('provContratoDetalle'); }}
          className="flex items-center gap-0.5 text-[11px] font-semibold text-orange hover:opacity-75 transition cursor-pointer"
        >
          Ver detalles <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── MIS CONTRATOS ─────────────────────────────────────────────────────────────

export default function ProvContratos() {
  const { go } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState('Todos');
  const [reqModal, setReqModal] = useState(null);

  // Vista "Mis Contratos" del Proveedor (mismo store local que admin/portales).
  const contratos = contratoService.listarPorVista('proveedor').map(aViewContrato);

  const totalAsignado   = contratos.reduce((a, c) => a + c.asignado,  0);
  const totalUtilizado  = contratos.reduce((a, c) => a + c.utilizado, 0);
  const totalDisponible = totalAsignado - totalUtilizado;
  const activos         = contratos.filter(c => c.estado === 'Activo').length;

  const animActivos     = useCountUp(activos,         900,  100);
  const animAsignado    = useCountUp(totalAsignado,   1600,  200);
  const animUtilizado   = useCountUp(totalUtilizado,  1500,  300);
  const animDisponible  = useCountUp(totalDisponible, 1500,  400);

  const TABS = ['Todos', ...Array.from(new Set(contratos.map(c => c.estado).filter(Boolean))), 'Borradores'];

  const filtrados = contratos.filter(c =>
    (tab === 'Todos' || c.estado === tab) &&
    (!busqueda ||
    c.pyme.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.id.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.sector.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Sin delay artificial: cuando exista backend, la siguiente página debe
  // mostrarse en cuanto llegue, no tras una espera puesta a mano.
  const { visibleItems: pagedContratos, hasMore, loading, sentinelRef } =
    useInfiniteScroll(filtrados, { pageSize: 10, delay: 0, resetKey: busqueda });

  return (
    <AppShell active="provContratos" role="proveedor" title="Mis Contratos" sub="Contratos activos con Bonafide" back>
      <div className="fade-in space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { lbl: 'Contratos Activos',    val: String(animActivos) },
            { lbl: 'Fondo Total Asignado', val: `${fmt(animAsignado)} XAF` },
            { lbl: 'Utilizado',            val: `${fmt(animUtilizado)} XAF` },
            { lbl: 'Disponible',           val: `${fmt(animDisponible)} XAF` },
          ].map(({ lbl, val }) => (
            <StatCard key={lbl} label={lbl} value={val} tone="gradient" />
          ))}
        </div>

        {/* Título + buscador + tabs */}
        <div className="space-y-3">
          <div>
            <p className="text-[13px] font-bold text-text-1">Contratos</p>
            <p className="text-[11px]" style={{ color: TEXT4 }}>Distribución, utilización y facturas por contrato</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="overflow-x-auto pb-0.5 flex-1">
              <div className="flex bg-white rounded-[10px] gap-1 p-1 w-max">
                {TABS.map(t => {
                  const Icon = TAB_ICON[t] ?? LayoutGrid;
                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`bona-btn font-medium rounded-[8px] text-[12px] text-center transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3 py-1.5
                        ${tab === t ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold' : 'text-text-3 hover:text-text-1 cursor-pointer'}`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar contrato, PYME…"
                className="h-8 w-64 pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
              />
            </div>
          </div>
        </div>

        {tab === 'Borradores' ? (
          <BorradoresSeccion
            rol="proveedor"
            onContinuar={b => go('provConfigurarContrato', { contratoId: b.contratoId })}
          />
        ) : (

        <div className="rounded-[14px] pt-2 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagedContratos.map((c, idx) => (
            <ContractCard key={c.id} c={c} idx={idx} go={go} setReqModal={setReqModal} />
          ))}
          {filtrados.length === 0 && (
            <div className="col-span-full text-[13px] text-text-4 text-center py-12">
              No se encontraron contratos con los filtros aplicados.
            </div>
          )}
          <InfiniteScrollSentinel sentinelRef={sentinelRef} loading={loading} hasMore={hasMore} />
          </div>
        </div>
        )}

      </div>

      {/* ── Modal: Requerimiento de Bonafide ── */}
      {reqModal && (
        <Modal title={`Requerimiento · ${reqModal.id}`} onClose={() => setReqModal(null)}>
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-[12px] bg-red-bg border border-red/20">
              <MessageSquare className="w-5 h-5 shrink-0 mt-0.5 text-red-text" />
              <div>
                <p className="text-[13px] text-text-1 leading-relaxed">{reqModal.requerimiento?.mensaje}</p>
                <p className="text-[11px] mt-2" style={{ color: TEXT4 }}>Reportado el {reqModal.requerimiento?.fecha}</p>
              </div>
            </div>
            <Button
              variant="primary"
              full
              className="h-[46px] justify-center"
              onClick={() => { const contratoId = reqModal.requerimiento?.contratoId ?? reqModal.id; setReqModal(null); go('provConfigurarContrato', { contratoId }); }}
            >
              Reconfigurar Contrato
            </Button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
