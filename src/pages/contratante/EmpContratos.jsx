import { useState } from 'react';
import {
  ClipboardList, TrendingUp, CreditCard, CheckCircle, Receipt, Search, ArrowUpRight, ChevronRight,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import BackButton from '../../components/common/BackButton';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { IniAvatar } from './contratanteShared';
import { RED, ORA, GREEN, WARN, ERR, TEXT4, BORDER, fmt, contratos, contratanteState } from './contratanteData';

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
    <AppShell active="empContratos" role="contratante" title="Mis Contratos" sub="Contratos activos con Bonafide">
      <div className="fade-in space-y-5">

        <BackButton to="roleSelect" />

        {/* KPI cards — compactas, sin acción */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { lbl: 'Contratos Activos',    val: String(activos),              Icon: ClipboardList, iconBg: '#FFF3E0', iconColor: ORA   },
            { lbl: 'Fondo Total Asignado', val: `${fmt(totalAsignado)} XAF`,  Icon: TrendingUp,   iconBg: '#FDEEEB', iconColor: RED   },
            { lbl: 'Utilizado',            val: `${fmt(totalUtilizado)} XAF`,  Icon: CreditCard,   iconBg: '#FDF6E8', iconColor: WARN  },
            { lbl: 'Disponible',           val: `${fmt(totalDisponible)} XAF`, Icon: CheckCircle,  iconBg: '#E3F4EA', iconColor: GREEN },
          ].map(({ lbl, val, Icon, iconBg, iconColor }) => (
            <div key={lbl} className="card-lift card-enter bg-white rounded-[12px] border border-border p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{lbl}</p>
                {val.endsWith(' XAF') ? (
                  <>
                    <p className="text-[12px] sm:text-[14px] font-extrabold text-text-1 leading-tight">{val.slice(0, -4)}</p>
                    <p className="text-[9px] font-semibold leading-tight" style={{ color: TEXT4 }}>XAF</p>
                  </>
                ) : (
                  <p className="text-[14px] font-extrabold text-text-1 leading-tight">{val}</p>
                )}
              </div>
            </div>
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
          {filtrados.map(c => {
            const pct  = Math.round((c.utilizado / c.asignado) * 100);
            const bar  = pct > 90 ? ERR : pct > 70 ? WARN : GREEN;
            const disp = c.asignado - c.utilizado;
            return (
              <div key={c.id} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <IniAvatar ini={c.ini} size={44} />
                    <div>
                      <p className="text-[13px] font-bold text-text-1 leading-snug">{c.pyme}</p>
                      <p className="text-[10px] font-mono" style={{ color: TEXT4 }}>{c.id}</p>
                      <p className="text-[11px]" style={{ color: TEXT4 }}>{c.sector}</p>
                    </div>
                  </div>
                  <Badge variant={c.estado === 'Activo' ? 'green' : 'gray'}>{c.estado}</Badge>
                </div>

                {/* Utilización */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="font-semibold" style={{ color: TEXT4 }}>Utilizado</span>
                    <span className="font-bold" style={{ color: bar }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: BORDER }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bar }} />
                  </div>
                  <div className="flex justify-between text-[10px]" style={{ color: TEXT4 }}>
                    <span>{fmt(c.utilizado)} XAF usados</span>
                    <span>{fmt(c.asignado)} XAF total</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-page-bg rounded-[10px] p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Disponible</p>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                      <div>
                        <p className="text-[13px] font-extrabold leading-tight" style={{ color: GREEN }}>{fmt(disp)}</p>
                        <p className="text-[9px] font-semibold leading-tight" style={{ color: TEXT4 }}>XAF</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-page-bg rounded-[10px] p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Facturas</p>
                    <div className="flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 shrink-0" style={{ color: ORA }} />
                      <p className="text-[15px] font-extrabold leading-none" style={{ color: ORA }}>{c.facturas}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-1 flex justify-end">
                  <button
                    onClick={() => { contratanteState.selectedContrato = c; go('empContratoDetalle'); }}
                    className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 cursor-pointer transition"
                    style={{ color: ORA }}
                  >
                    Ver contrato <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtrados.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center gap-2" style={{ color: TEXT4 }}>
              <Search className="w-8 h-8" />
              <p className="text-[13px] font-semibold">Sin resultados para "{busqueda}"</p>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
