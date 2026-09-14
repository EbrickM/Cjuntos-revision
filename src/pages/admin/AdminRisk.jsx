import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';

const formatXaf = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;

/* ─── Admin Facturas ─── */
const contratos = {
  'CTR-2026-002': 'Evans Construction & Engineering S.A.',
  'CTR-2026-005': 'Autoridad Portuaria de Bata S.A.',
  'CTR-2026-009': 'TotalEnerGE SA',
  'CTR-2026-011': 'MinGE Sociedad Est.',
};

const allInvoices = [
  { id:'FAC-2026-1031', tipo:'contratante', contrato:'CTR-2026-002', pyme:'Const. Silva Ltd.',  monto:18000000, estado:'Pagada',   concepto:'Avance de obra fase 1 – Cimentación y estructura',           fecha:'10/05/2026' },
  { id:'FAC-2026-1044', tipo:'contratante', contrato:'CTR-2026-009', pyme:'TechBata PYME S.L.', monto:9500000,  estado:'Pagada',   concepto:'Suministro e instalación de equipos eléctricos – Fase 2',   fecha:'14/05/2026' },
  { id:'FAC-2026-1036', tipo:'contratante', contrato:'CTR-2026-005', pyme:'LogiGE S.A.',         monto:6500000,  estado:'Enviada',  concepto:'Mantenimiento preventivo instalaciones portuarias – Abr 2026', fecha:'02/05/2026' },
  { id:'FAC-2026-1048', tipo:'contratante', contrato:'CTR-2026-011', pyme:'AgriEco PYME',         monto:4200000,  estado:'Pendiente',concepto:'Consultoría técnica explotación minera – Q2 2026',            fecha:'20/05/2026' },
  { id:'FAC-2026-1025', tipo:'proveedor',   contrato:'CTR-2026-002', pyme:'Const. Silva Ltd.',  monto:4500000,  estado:'Pagada',   concepto:'Transporte de materiales al sitio de obra',                  fecha:'01/05/2026', proveedor:'TransGE S.L.' },
  { id:'FAC-2026-1039', tipo:'proveedor',   contrato:'CTR-2026-009', pyme:'TechBata PYME S.L.', monto:3100000,  estado:'Pagada',   concepto:'Suministro de componentes electrónicos – Lote 3',            fecha:'13/05/2026', proveedor:'ServTec GE' },
  { id:'FAC-2026-1052', tipo:'proveedor',   contrato:'CTR-2026-005', pyme:'LogiGE S.A.',         monto:1800000,  estado:'Enviada',  concepto:'Alquiler de maquinaria portuaria – Mayo 2026',               fecha:'21/05/2026', proveedor:'Cemex GE' },
];

const InvoiceCard = ({ inv }) => (
  <div className="bg-white rounded-[16px] p-4 flex items-start gap-4 shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
        <span className="text-[13px] font-bold text-text-1">{inv.id}</span>
        <Badge variant={inv.estado === 'Pagada' ? 'green' : inv.estado === 'Enviada' ? 'blue' : 'yellow'}>{inv.estado}</Badge>
      </div>
      <div className="text-[12px] text-text-3 truncate mb-1">{inv.concepto}</div>
      <div className="text-[11px] text-text-5 mb-1.5">
        {inv.tipo === 'proveedor' && inv.proveedor
          ? <span>Proveedor: <span className="font-medium text-text-4">{inv.proveedor}</span> · </span>
          : null
        }
        PYME: <span className="font-medium text-text-4">{inv.pyme}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-orange-dark bg-orange-tint px-2 py-0.5 rounded-full">{inv.contrato}</span>
        <span className="text-[11px] text-text-5 truncate">· {contratos[inv.contrato]}</span>
      </div>
    </div>
    <div className="shrink-0 text-right">
      <div className="text-[15px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
      <div className="text-[11px] text-text-5 mt-0.5">{inv.fecha}</div>
    </div>
  </div>
);

export default function AdminRisk() {
  const ctFacturas   = allInvoices.filter(inv => inv.tipo === 'contratante');
  const provFacturas = allInvoices.filter(inv => inv.tipo === 'proveedor');
  const totalPagadoCt  = ctFacturas.filter(inv => inv.estado === 'Pagada').reduce((s, inv) => s + inv.monto, 0);
  const totalLiberado  = provFacturas.filter(inv => inv.estado === 'Pagada').reduce((s, inv) => s + inv.monto, 0);

  return (
    <AppShell active="adminRisk" role="admin" title="Facturas" sub="Todas las facturas de la plataforma">
      <div className="fade-in space-y-5">

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: ctFacturas.length,       label: 'Facturas al contratante',          cls: 'text-blue-text' },
            { value: formatXaf(totalPagadoCt), label: 'Pagado por contratantes (cobrado)',cls: 'text-green-text', small: true },
            { value: formatXaf(totalLiberado), label: 'Fondos liberados a proveedores',  cls: 'text-orange',     small: true },
          ].map(({ value, label, cls, small }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4">
              <div className={`font-extrabold leading-none mb-1 ${cls} ${small ? 'text-[18px] mt-1' : 'text-[32px]'}`}>{value}</div>
              <div className="text-[12px] text-text-4">{label}</div>
            </div>
          ))}
        </div>

        {/* Pagadas por el contratante */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="mb-4">
            <div className="text-[14px] font-bold">Pagadas por el contratante</div>
            <div className="text-[12px] text-text-4">Ingresos cobrados por la plataforma — dinero que entra al banco.</div>
          </div>
          <div className="space-y-3">
            {ctFacturas.map(inv => <InvoiceCard key={inv.id} inv={inv} />)}
          </div>
        </div>

        {/* Fondos liberados a proveedores */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="mb-4">
            <div className="text-[14px] font-bold">Fondos liberados a proveedores</div>
            <div className="text-[12px] text-text-4">Pagos realizados a proveedores desde el crédito de cada PYME.</div>
          </div>
          <div className="space-y-3">
            {provFacturas.map(inv => <InvoiceCard key={inv.id} inv={inv} />)}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
