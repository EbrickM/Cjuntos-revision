import { useState } from 'react';
import { Building2, Truck } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';

const formatXaf = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;

/* ─── Admin Confirming ─── */
const confRows = [
  ['CONF-04821','TotalEnerGE','Const. Silva','12,500,000','12,250,000','green','Aprobada','12/05/26'],
  ['CONF-04820','TotalEnerGE','Tech Bata SL','8,200,000','8,036,000','yellow','Pendiente','11/05/26'],
  ['CONF-04819','Infraconst.','LogiGE S.A.','23,100,000','22,638,000','green','Aprobada','10/05/26'],
  ['CONF-04818','TotalEnerGE','AgriEco PYME','5,700,000','5,586,000','blue','En revisión','09/05/26'],
];

export function AdminConf() {
  return (
    <AppShell active="adminConf" role="admin" title="Confirming" sub="Todas las operaciones">
      <div className="fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[['✅','24','Operaciones activas','text-text-1'],['💰','XAF 847M','Desembolsado total','text-green-text'],['⏳','5','Pendientes aprobación','text-orange'],['📅','XAF 124M','Vence este mes','text-yellow-text']].map(([ico,v,l,c]) => (
            <div key={l} className="bg-white rounded-[14px] p-5 border border-border">
              <div className="text-[22px] mb-2">{ico}</div>
              <div className={`text-[20px] font-extrabold ${c} mb-1`}>{v}</div>
              <div className="text-[12px] text-text-4">{l}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <span className="text-[14px] font-bold">Operaciones de Confirming</span>
            <Button variant="ghost" size="sm">📥 Exportar CSV</Button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr>{['ID','Contratante','Proveedor','Monto XAF','Anticipo XAF','Estado','Fecha',''].map(h=>(
              <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>
            ))}</tr></thead>
            <tbody>
              {confRows.map(([id,cont,prov,amt,anti,cls,st,dt]) => (
                <tr key={id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8]">
                  <td className="px-4 py-3 font-mono text-[11px] text-text-4">{id}</td>
                  <td className="px-4 py-3 text-[12px] text-text-3">{cont}</td>
                  <td className="px-4 py-3 font-semibold text-[13px]">{prov}</td>
                  <td className="px-4 py-3 font-bold text-[13px]">{amt}</td>
                  <td className="px-4 py-3 font-semibold text-green-text text-[13px]">{anti}</td>
                  <td className="px-4 py-3"><Badge variant={cls}>{st}</Badge></td>
                  <td className="px-4 py-3 text-[12px] text-text-4">{dt}</td>
                  <td className="px-4 py-3"><Button variant="ghost" size="sm">Ver →</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

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
  <div
    className="bg-white rounded-[16px] p-4 border border-border flex items-start gap-4 transition-all duration-200 hover:scale-[1.015] hover:border-orange/40 cursor-default"
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.18)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
  >
    <div className="w-12 h-12 rounded-[14px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
      {inv.tipo === 'contratante' ? <Building2 className="w-5 h-5 text-orange" /> : <Truck className="w-5 h-5 text-orange" />}
    </div>
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
        <span className="text-[10px] font-semibold text-orange bg-orange-tint px-2 py-0.5 rounded-full border border-orange/20">{inv.contrato}</span>
        <span className="text-[11px] text-text-5 truncate">· {contratos[inv.contrato]}</span>
      </div>
    </div>
    <div className="shrink-0 text-right">
      <div className="text-[15px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
      <div className="text-[11px] text-text-5 mt-0.5">{inv.fecha}</div>
    </div>
  </div>
);

export function AdminRisk() {
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

/* ─── Admin Analytics ─── */
export function AdminAnalytics() {
  return (
    <AppShell active="adminAnalytics" role="admin" title="Analytics" sub="Métricas y tendencias">
      <div className="fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[['📈','XAF 2.4B','Volumen acumulado','text-text-1'],['💼','47','Préstamos activos','text-orange'],['⏱','98.2%','Tasa reembolso','text-green-text'],['🚀','+23%','Crecimiento mensual','text-blue-text']].map(([ico,v,l,c]) => (
            <div key={l} className="bg-white rounded-[14px] p-5 border border-border">
              <div className="text-[24px] mb-2">{ico}</div>
              <div className={`text-[20px] font-extrabold ${c} mb-1`}>{v}</div>
              <div className="text-[12px] text-text-4">{l}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="text-[14px] font-bold mb-4">Distribución por Sector</div>
            {[['Construcción',42,'#C62828'],['Transporte',28,'#00C853'],['Industria',18,'#FFB300'],['Otros',12,'#2196F3']].map(([s,p,c]) => (
              <div key={s} className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{background:c}}/>
                <div className="text-[12px] text-text-2 flex-1">{s}</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-page-bg rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${p}%`,background:c}}/>
                  </div>
                  <span className="text-[12px] font-bold w-8 text-right">{p}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="text-[14px] font-bold mb-4">Desembolsos por Mes (XAF M)</div>
            <div className="flex items-end gap-2 h-32">
              {[['Ene',120],['Feb',145],['Mar',180],['Abr',160],['May',210]].map(([mes,val]) => (
                <div key={mes} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-bold text-orange">{val}M</div>
                  <div className="w-full bg-orange rounded-t-[4px]" style={{height:`${(val/210)*100}%`}}/>
                  <div className="text-[10px] text-text-4">{mes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* ─── Admin Settings ─── */
export function AdminSettings() {
  return (
    <AppShell active="adminSettings" role="admin" title="Configuración" sub="Parámetros del sistema">
      <div className="fade-in max-w-[600px]">
        <div className="bg-white rounded-[14px] border border-border p-6 mb-4">
          <div className="text-[14px] font-bold mb-4">Confirming</div>
          <FormGroup label="Porcentaje anticipo estándar (%)">
            <Input type="number" defaultValue="98" />
          </FormGroup>
          <FormGroup label="Días máximos plazo factura">
            <Input type="number" defaultValue="90" />
          </FormGroup>
        </div>
        <Button variant="primary">Guardar configuración</Button>
      </div>
    </AppShell>
  );
}
