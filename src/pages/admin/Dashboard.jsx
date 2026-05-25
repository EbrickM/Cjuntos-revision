import { FileText, Building2, Truck } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';

const formatXaf = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;
const pct = (part, total) => total > 0 ? ((part / total) * 100).toFixed(1) : '0.0';

const contractBadge = (paso) => ({
  1: { variant: 'yellow', label: 'Pend. datos' },
  2: { variant: 'blue',   label: 'Esp. confirmación' },
  3: { variant: 'yellow', label: 'Esp. autorización' },
  4: { variant: 'green',  label: 'Activo' },
}[paso] ?? { variant: 'yellow', label: 'Pendiente' });

const contracts = [
  { id: 'CTR-2026-001', paso: 1, monto: 58000000, asignado: 0,       pyme: 'LogiGE S.A.',         contratante: '' },
  { id: 'CTR-2026-003', paso: 2, monto: 31000000, asignado: 0,       pyme: 'AgriEco PYME',         contratante: 'Petro Guinea S.A.' },
  { id: 'CTR-2026-004', paso: 3, monto: 75000000, asignado: 0,       pyme: 'TechBata PYME S.L.',   contratante: 'Ministerio de Obras Públicas' },
  { id: 'CTR-2026-007', paso: 3, monto: 12000000, asignado: 0,       pyme: 'ServLog GE',           contratante: 'AgroGE Holdings' },
  { id: 'CTR-2026-002', paso: 4, monto: 42000000, asignado: 9000000, pyme: 'Const. Silva Ltd.',    contratante: 'Evans Construction & Engineering S.A.' },
  { id: 'CTR-2026-005', paso: 4, monto: 25000000, asignado: 0,       pyme: 'LogiGE S.A.',          contratante: 'Autoridad Portuaria de Bata S.A.' },
  { id: 'CTR-2026-009', paso: 4, monto: 48000000, asignado: 3100000, pyme: 'TechBata PYME S.L.',   contratante: 'TotalEnerGE SA' },
  { id: 'CTR-2026-011', paso: 4, monto: 33000000, asignado: 0,       pyme: 'AgriEco PYME',         contratante: 'MinGE Sociedad Est.' },
];

const invoices = [
  { id: 'FAC-2026-1031', tipo: 'contratante', contrato: 'CTR-2026-002', pyme: 'Const. Silva Ltd.',   monto: 18000000, estado: 'Pagada',   concepto: 'Avance de obra fase 1 – Cimentación y estructura' },
  { id: 'FAC-2026-1044', tipo: 'contratante', contrato: 'CTR-2026-009', pyme: 'TechBata PYME S.L.',  monto: 9500000,  estado: 'Pagada',   concepto: 'Suministro e instalación de equipos eléctricos – Fase 2' },
  { id: 'FAC-2026-1036', tipo: 'contratante', contrato: 'CTR-2026-005', pyme: 'LogiGE S.A.',          monto: 6500000,  estado: 'Enviada',  concepto: 'Mantenimiento preventivo instalaciones portuarias' },
  { id: 'FAC-2026-1048', tipo: 'contratante', contrato: 'CTR-2026-011', pyme: 'AgriEco PYME',          monto: 4200000,  estado: 'Pendiente',concepto: 'Consultoría técnica explotación minera – Q2 2026' },
  { id: 'FAC-2026-1025', tipo: 'proveedor',   contrato: 'CTR-2026-002', pyme: 'Const. Silva Ltd.',   monto: 4500000,  estado: 'Pagada',   concepto: 'Transporte de materiales al sitio de obra',          proveedor: 'TransGE S.L.' },
  { id: 'FAC-2026-1039', tipo: 'proveedor',   contrato: 'CTR-2026-009', pyme: 'TechBata PYME S.L.',  monto: 3100000,  estado: 'Pagada',   concepto: 'Suministro de componentes electrónicos – Lote 3',    proveedor: 'ServTec GE' },
  { id: 'FAC-2026-1052', tipo: 'proveedor',   contrato: 'CTR-2026-005', pyme: 'LogiGE S.A.',          monto: 1800000,  estado: 'Enviada',  concepto: 'Alquiler de maquinaria portuaria – Mayo 2026',        proveedor: 'Cemex GE' },
];

function HoverCard({ onClick, children }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[16px] p-3.5 border border-border flex items-start gap-3 transition-all duration-200 hover:border-orange/40 ${onClick ? 'cursor-pointer hover:scale-[1.015]' : ''}`}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
    >
      {children}
    </div>
  );
}

export default function AdminDash() {
  const { go } = useApp();

  const activos          = contracts.filter(c => c.paso === 4).length;
  const pendContratante  = contracts.filter(c => c.paso === 1 || c.paso === 2).length;
  const pendAutorizar    = contracts.filter(c => c.paso === 3).length;
  const factPagadasCt    = invoices.filter(i => i.tipo === 'contratante' && i.estado === 'Pagada').length;

  const kpis = [
    { value: contracts.length, label: 'Total de contratos',                    cls: 'text-text-1'     },
    { value: activos,           label: 'Contratos activos',                     cls: 'text-green-text' },
    { value: pendContratante,   label: 'Pendientes del contratante',            cls: 'text-orange'     },
    { value: pendAutorizar,     label: 'Pendientes de autorizar',               cls: 'text-blue-text'  },
    { value: factPagadasCt,     label: 'Facturas pagadas por el contratante',   cls: 'text-green-text' },
  ];

  return (
    <AppShell active="adminDash" role="admin" title="Inicio" sub="Vista general Bonafide">
      <div className="fade-in space-y-6">

        {/* Cabecera */}
        <div>
          <div className="text-[20px] font-bold text-text-1">Bienvenida, Ana 👋</div>
          <div className="text-[13px] text-text-4">Panel de operaciones Bonafide Microbank</div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {kpis.map(({ value, label, cls }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4">
              <div className={`text-[30px] font-extrabold leading-none mb-1.5 ${cls}`}>{value}</div>
              <div className="text-[11px] text-text-4 leading-snug">{label}</div>
            </div>
          ))}
        </div>

        {/* Listas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Contratos */}
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[14px] font-bold">Contratos</div>
              <button onClick={() => go('adminContratos')} className="text-[12px] text-orange font-semibold hover:opacity-75 transition">
                Ver todos →
              </button>
            </div>
            <div className="space-y-2.5">
              {contracts.slice(0, 6).map(c => {
                const badge  = contractBadge(c.paso);
                const pctVal = parseFloat(pct(c.asignado, c.monto));
                return (
                  <HoverCard key={c.id} onClick={() => go('adminContratos')}>
                    <div className="w-10 h-10 rounded-[12px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="text-[12px] font-bold text-text-1">{c.id}</span>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                      <div className="text-[11px] text-text-4 font-medium truncate mb-0.5">{c.pyme}</div>
                      <div className="text-[10px] text-text-5 truncate">{c.contratante || '—'}</div>
                      {c.paso === 4 && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <div className="flex-1 h-1 bg-page-bg rounded-full overflow-hidden">
                            <div className="h-full bg-orange rounded-full" style={{ width: `${Math.min(pctVal, 100)}%` }} />
                          </div>
                          <span className="text-[9px] font-bold text-orange shrink-0">{pctVal}%</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[12px] font-extrabold text-text-1">{formatXaf(c.monto)}</div>
                    </div>
                  </HoverCard>
                );
              })}
            </div>
          </div>

          {/* Facturas */}
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[14px] font-bold">Facturas</div>
              <button onClick={() => go('adminRisk')} className="text-[12px] text-orange font-semibold hover:opacity-75 transition">
                Ver todas →
              </button>
            </div>
            <div className="space-y-2.5">
              {invoices.slice(0, 6).map(inv => (
                <HoverCard key={inv.id} onClick={() => go('adminRisk')}>
                  <div className="w-10 h-10 rounded-[12px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
                    {inv.tipo === 'contratante' ? <Building2 className="w-4 h-4 text-orange" /> : <Truck className="w-4 h-4 text-orange" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-[12px] font-bold text-text-1">{inv.id}</span>
                      <Badge variant={inv.estado === 'Pagada' ? 'green' : inv.estado === 'Enviada' ? 'blue' : 'yellow'}>{inv.estado}</Badge>
                    </div>
                    <div className="text-[11px] text-text-4 truncate mb-0.5">{inv.concepto}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-orange bg-orange-tint px-1.5 py-0.5 rounded-full border border-orange/20">{inv.contrato}</span>
                      <span className="text-[10px] text-text-5 truncate">· {inv.pyme}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
                  </div>
                </HoverCard>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
