import { useState } from 'react';
import {
  Search, ArrowUpRight, ChevronRight,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { TEXT4, fmt, contratos, contratanteState } from './contratanteData';

// ── MIS CONTRATOS ─────────────────────────────────────────────────────────────

export default function EmpContratos() {
  const { go } = useApp();
  const [busqueda, setBusqueda] = useState('');

  const totalAsignado   = contratos.reduce((a, c) => a + c.asignado,  0);
  const totalUtilizado  = contratos.reduce((a, c) => a + c.utilizado, 0);
  const totalDisponible = totalAsignado - totalUtilizado;
  const activos         = contratos.filter(c => c.estado === 'Activo').length;

  const filtrados = contratos.filter(c =>
    !busqueda ||
    c.pyme.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.id.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.sector.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <AppShell active="empContratos" role="contratante" title="Mis Contratos" sub="Contratos activos con Bonafide" back>
      <div className="fade-in space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { lbl: 'Contratos Activos',    val: String(activos) },
            { lbl: 'Fondo Total Asignado', val: `${fmt(totalAsignado)} XAF` },
            { lbl: 'Utilizado',            val: `${fmt(totalUtilizado)} XAF` },
            { lbl: 'Disponible',           val: `${fmt(totalDisponible)} XAF` },
          ].map(({ lbl, val }) => (
            <StatCard key={lbl} label={lbl} value={val} tone="gradient" />
          ))}
        </div>

        {/* Buscador + botón */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-text-1">Contratos</p>
            <p className="text-[11px]" style={{ color: TEXT4 }}>Distribución, utilización y facturas por contrato</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar contrato, PYME…"
                className="w-full pl-8 pr-3 py-2 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
              />
            </div>
            <Button variant="primary" size="sm" onClick={() => go('empNuevaSolicitud')}>
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />Nueva solicitud
            </Button>
          </div>
        </div>

        {/* Cards de contratos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((c, idx) => {
            const pct  = Math.round((c.utilizado / c.asignado) * 100);
            const disp = c.asignado - c.utilizado;
            return (
              <div
                key={c.id}
                onClick={() => { contratanteState.selectedContrato = c; go('empContratoDetalle'); }}
                className="bg-white rounded-[16px] p-5 cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] card-enter"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                {/* ID + PYME + sector + estado */}
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="text-[10px] font-semibold text-text-4">{c.id}</div>
                    <Badge variant={c.estado === 'Activo' ? 'green' : 'gray'}>{c.estado}</Badge>
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
                    <span className="text-[11px] font-bold" style={{ color: '#EF7A2C' }}>{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                    <div className="h-full rounded-full"
                         style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
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
          })}
          {filtrados.length === 0 && (
            <div className="col-span-full text-[13px] text-text-4 text-center py-12">
              No se encontraron contratos para "{busqueda}".
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
