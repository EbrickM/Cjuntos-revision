import { useState } from 'react';
import {
  Search, ChevronRight, Save,
  LayoutGrid, CheckCircle, AlertCircle, Clock, Settings2, MessageCircle,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import Badge from '../../components/ui/Badge';
import RequerimientoBadge from '../../components/invoices/RequerimientoBadge';
import BorradoresSeccion from '../../components/contratos/BorradoresSeccion';
import { contratoService } from '../../services/contrato.service';
import { CST } from '../../lib/contractStates';
import { aViewContrato } from '../../components/contratos/contratoUtils';
import { TEXT4, fmt, contratanteState, contratoBadge } from './contratanteData';
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
function ContractCard({ c, idx, go }) {
  const pct     = Math.round((c.utilizado / c.asignado) * 100);
  const disp    = c.asignado - c.utilizado;
  const animPct = useCountUp(pct, 1200, 80 + idx * 60);
  return (
    <div
      onClick={() => { contratanteState.selectedContrato = c; go('empContratoDetalle'); }}
      className="relative bg-white rounded-[16px] p-5 cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] card-enter"
      style={{ animationDelay: `${idx * 70}ms` }}
    >
      {/* Ícono flotante: contrato con requerimiento de Bonafide */}
      <RequerimientoBadge
        factura={c}
        cta={{ label: 'Reconfigurar Contrato', onClick: () => { const marcoId = c.requerimiento?.marcoId ?? c.marcoId; go('empConfigurarContrato', { marcoId }); } }}
      />

      {/* ID + PYME + sector + estado */}
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="text-[10px] font-semibold text-text-4">{c.id}</div>
          <Badge variant={contratoBadge(c.estado)}>{c.estado}</Badge>
        </div>
        <div className="text-[13px] font-bold text-text-1 leading-tight truncate">{c.pyme}</div>
        {c.sector && <div className="text-[11px] text-text-4 mt-0.5">{c.sector}</div>}
      </div>

      {/* Monto */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-text-4 mb-0.5">Fondo Asignado</div>
        <div className="text-[17px] font-extrabold text-text-1 leading-tight">{fmt(c.asignado)} XAF</div>
      </div>

      {/* Barra de distribución */}
      <div className="mt-auto space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-text-4">Utilizado</span>
          <span className="text-[11px] font-bold" style={{ color: '#EF7A2C' }}>{animPct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
          <div className="h-full rounded-full"
               style={{ width: `${animPct}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
        </div>
        <div className="text-[10px] text-text-5">Disponible: {fmt(disp)} XAF · {c.facturas} facturas</div>
      </div>

      {/* Botón Ver */}
      <button
        onClick={e => { e.stopPropagation(); contratanteState.selectedContrato = c; go('empContratoDetalle'); }}
        className="self-end flex items-center gap-0.5 text-[11px] font-semibold text-orange hover:opacity-75 transition cursor-pointer"
      >
        Ver contrato <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── MIS CONTRATOS ─────────────────────────────────────────────────────────────

export default function EmpContratos() {
  const { go } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState('Todos');

  // Vista "Mis Contratos": asignaciones a PYMEs + los contratos-marco que la
  // Contratante ya configuró (los marcos aún pendientes de configuración viven
  // en notificaciones / wizard, no en este listado).
  const contratos = contratoService.listarPorVista('contratante')
    .filter(c => c.tipo !== 'marco' || c.estado !== CST.pendienteConfiguracion)
    .map(aViewContrato);

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
    <AppShell active="empContratos" role="contratante" title="Mis Contratos" sub="Contratos activos con Bonafide" back>
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
                placeholder="Buscar contrato, Emp. Contratada…"
                className="h-8 w-64 pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
              />
            </div>
          </div>
        </div>

        {tab === 'Borradores' ? (
          <BorradoresSeccion
            rol="contratante"
            onContinuar={b => go('empConfigurarContrato', { marcoId: b.contratoId })}
          />
        ) : (

        <div className="rounded-[14px] pt-2 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagedContratos.map((c, idx) => (
            <ContractCard key={c.id} c={c} idx={idx} go={go} />
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

    </AppShell>
  );
}
