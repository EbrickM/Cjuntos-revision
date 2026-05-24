import { FileText, Building2, Truck, Package, Cpu, Wrench, Zap, HardHat, Leaf, ShoppingCart, Settings } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';

const formatXaf = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;
const pct = (part, total) => total > 0 ? ((part / total) * 100).toFixed(1) : '0.0';

const SECTOR_ICONS = {
  Materiales: Package, Transporte: Truck, Tecnología: Cpu, Servicios: Wrench,
  Energía: Zap, Construcción: HardHat, Minería: HardHat, Manufactura: Settings,
  Agricultura: Leaf, Alimentación: ShoppingCart, Comercio: ShoppingCart,
};

const contractBadge = (paso) => ({
  1: { variant: 'yellow', label: 'Pend. datos' },
  2: { variant: 'blue',   label: 'Esp. confirmación' },
  3: { variant: 'yellow', label: 'Esp. autorización' },
  4: { variant: 'green',  label: 'Activo' },
}[paso] ?? { variant: 'yellow', label: 'Pendiente' });

// ── Datos de la aplicación ───────────────────────────────────────────────────
const contracts = [
  { id: 'CTR-2026-001', paso: 1, monto: 58000000, asignado: 0, disponible: 58000000, contratante: '', estado: 'Pendiente datos del contratante' },
  { id: 'CTR-2026-003', paso: 2, monto: 31000000, asignado: 0, disponible: 31000000, contratante: 'Petro Guinea S.A.', estado: 'En espera de confirmación' },
  { id: 'CTR-2026-004', paso: 3, monto: 75000000, asignado: 0, disponible: 75000000, contratante: 'Ministerio de Obras Públicas', estado: 'Pendiente autorización Bonafide' },
  { id: 'CTR-2026-002', paso: 4, monto: 42000000, asignado: 9000000, disponible: 33000000, contratante: 'Evans Construction & Engineering S.A.', estado: '' },
  { id: 'CTR-2026-005', paso: 4, monto: 25000000, asignado: 0, disponible: 25000000, contratante: 'Autoridad Portuaria de Bata S.A.', estado: '' },
];

const providers = [
  { id: 'p1', razonSocial: 'Cemex GE',     sector: 'Materiales', ruc: 'GE-2019-00123', contratos: 0 },
  { id: 'p2', razonSocial: 'TransGE S.L.', sector: 'Transporte', ruc: 'GE-2020-00445', contratos: 1 },
  { id: 'p3', razonSocial: 'ServTec GE',   sector: 'Tecnología', ruc: 'GE-2022-00112', contratos: 0 },
];

const invoices = [
  { id: 'FAC-2026-1025', tipo: 'proveedor',   contrato: 'CTR-2026-002', proveedor: 'TransGE S.L.', monto: 4500000,  estado: 'Enviada',   concepto: 'Transporte de materiales al sitio de obra' },
  { id: 'FAC-2026-1031', tipo: 'contratante', contrato: 'CTR-2026-002', monto: 18000000, estado: 'Pagada',   concepto: 'Avance de obra fase 1 – Cimentación y estructura' },
  { id: 'FAC-2026-1036', tipo: 'contratante', contrato: 'CTR-2026-005', monto: 6500000,  estado: 'Pendiente', concepto: 'Mantenimiento preventivo instalaciones portuarias' },
];

// ── Sub-componentes de card ──────────────────────────────────────────────────
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

export default function EpHome() {
  const { go } = useApp();

  const activos       = contracts.filter(c => c.paso === 4).length;
  const provAsociados = providers.filter(p => p.contratos > 0).length;
  const invContrat    = invoices.filter(i => i.tipo === 'contratante').length;
  const invProv       = invoices.filter(i => i.tipo === 'proveedor').length;

  const kpis = [
    { value: contracts.length, label: 'Contratos totales',            cls: 'text-text-1'     },
    { value: activos,           label: 'Contratos activos',            cls: 'text-green-text' },
    { value: providers.length,  label: 'Proveedores registrados',      cls: 'text-text-1'     },
    { value: provAsociados,     label: 'Proveedores en contratos',     cls: 'text-orange'     },
    { value: invoices.length,   label: 'Facturas totales',             cls: 'text-text-1'     },
    { value: invContrat,        label: 'Facturas del contratante',     cls: 'text-blue-text'  },
    { value: invProv,           label: 'Facturas de proveedores',      cls: 'text-orange'     },
  ];

  return (
    <AppShell active="epHome" role="empresa-pequena" title="Inicio" sub="Mi Panel">
      <div className="fade-in space-y-6">

        {/* Cabecera */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[20px] font-bold text-text-1">Bienvenido, Construcciones Silva</div>
            <div className="text-[13px] text-text-4">GE-2021-00234 · Empresa Pequeña</div>
          </div>
          <div className="flex gap-2">
            <span className="bg-green-bg text-green-text text-[12px] font-semibold px-3.5 py-1.5 rounded-[8px] border border-green-border flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green shrink-0" />Semáforo Verde
            </span>
            <span className="bg-green-bg text-green-text text-[12px] font-semibold px-3.5 py-1.5 rounded-[8px] border border-green-border">
              Verde Bonafide
            </span>
          </div>
        </div>

        {/* 7 KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
          {kpis.map(({ value, label, cls }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4">
              <div className={`text-[30px] font-extrabold leading-none mb-1.5 ${cls}`}>{value}</div>
              <div className="text-[11px] text-text-4 leading-snug">{label}</div>
            </div>
          ))}
        </div>

        {/* 3 listas */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Contratos */}
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[14px] font-bold">Contratos</div>
              <button onClick={() => go('epCreditos')} className="text-[12px] text-orange font-semibold hover:opacity-75 transition">
                Ver todos →
              </button>
            </div>
            <div className="space-y-2.5">
              {contracts.slice(0, 5).map(c => {
                const badge  = contractBadge(c.paso);
                const pctVal = parseFloat(pct(c.asignado, c.monto));
                return (
                  <HoverCard key={c.id} onClick={() => go('epCreditos')}>
                    <div className="w-10 h-10 rounded-[12px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="text-[12px] font-bold text-text-1">{c.id}</span>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                      <div className="text-[11px] text-text-4 truncate">
                        {c.contratante || c.estado}
                      </div>
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
                      {c.paso === 4 && <div className="text-[10px] text-text-5 mt-0.5">Disp: {formatXaf(c.disponible)}</div>}
                    </div>
                  </HoverCard>
                );
              })}
            </div>
          </div>

          {/* Proveedores */}
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[14px] font-bold">Proveedores</div>
              <button onClick={() => go('epProveedores')} className="text-[12px] text-orange font-semibold hover:opacity-75 transition">
                Ver todos →
              </button>
            </div>
            <div className="space-y-2.5">
              {providers.slice(0, 5).map(p => {
                const SectorIcon = SECTOR_ICONS[p.sector] ?? Building2;
                return (
                  <HoverCard key={p.id} onClick={() => go('epProveedores')}>
                    <div className="w-10 h-10 rounded-[12px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
                      <SectorIcon className="w-4 h-4 text-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-text-1 mb-0.5 truncate">{p.razonSocial}</div>
                      <div className="text-[11px] text-text-4">{p.sector} · <span className="font-mono">{p.ruc}</span></div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-[18px] font-extrabold leading-tight ${p.contratos > 0 ? 'text-orange' : 'text-text-5'}`}>
                        {p.contratos}
                      </div>
                      <div className="text-[9px] font-semibold text-text-5 uppercase tracking-wide">
                        {p.contratos === 1 ? 'contrato' : 'contratos'}
                      </div>
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
              <button onClick={() => go('epFacturacion')} className="text-[12px] text-orange font-semibold hover:opacity-75 transition">
                Ver todas →
              </button>
            </div>
            <div className="space-y-2.5">
              {invoices.slice(0, 5).map(inv => (
                <HoverCard key={inv.id} onClick={() => go('epFacturacion')}>
                  <div className="w-10 h-10 rounded-[12px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
                    {inv.tipo === 'contratante' ? <Building2 className="w-4 h-4 text-orange" /> : <Truck className="w-4 h-4 text-orange" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-[12px] font-bold text-text-1">{inv.id}</span>
                      <Badge variant={inv.estado === 'Pagada' ? 'green' : inv.estado === 'Enviada' ? 'blue' : 'yellow'}>{inv.estado}</Badge>
                    </div>
                    <div className="text-[11px] text-text-4 truncate">{inv.concepto}</div>
                    <span className="text-[10px] font-semibold text-orange bg-orange-tint px-1.5 py-0.5 rounded-full border border-orange/20 mt-1 inline-block">{inv.contrato}</span>
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
