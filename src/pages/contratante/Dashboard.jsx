import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const kpis = [
  { ico:'📋', bg:'bg-orange-tint', val:'24', valCls:'text-orange', lbl:'Facturas Activas', sub:'5 pendientes aprobación', trend:'↑ +3 hoy', trendCls:'bg-green-bg text-green-text', to:'empConf' },
  { ico:'💰', bg:'bg-green-bg',    val:'847M', valCls:'text-text-1', lbl:'Liquidez Desembolsada (XAF)', sub:'Este mes · acum. 2.4B XAF', trend:'↑ +12% mes', trendCls:'bg-green-bg text-green-text', to:'empConf' },
  { ico:'👥', bg:'bg-blue-bg',     val:'18', valCls:'text-text-1', lbl:'Proveedores Activos', sub:'12 Verde · 4 Amar. · 2 Rojo', trend:'⚠ 2 alertas', trendCls:'bg-yellow-bg text-yellow-text', to:'empProv' },
  { ico:'✅', bg:'bg-orange-tint', val:'2', valCls:'text-orange', lbl:'Contratos por Verificar', sub:'Empresas PYME pendientes', trend:'⚠ Urgente', trendCls:'bg-red-bg text-red-text', to:'empVerifContr' },
];

const solicitudes = [
  ['CONF-04821','Const. Silva','12,500,000','green','Aprobada','12/05/26'],
  ['CONF-04820','Tech Bata SL','8,200,000','yellow','Pendiente','11/05/26'],
  ['CONF-04819','LogiGE S.A.','23,100,000','green','Aprobada','10/05/26'],
  ['CONF-04818','AgriEco PYME','5,700,000','blue','En revisión','09/05/26'],
  ['CONF-04817','Mader. Bata','9,800,000','green','Aprobada','08/05/26'],
  ['CONF-04816','ServLog GE','3,200,000','red','Rechazada','07/05/26'],
];

export default function EmpDash() {
  const { go } = useApp();
  return (
    <AppShell active="empDash" role="contratante" title="Dashboard" sub="Vista general"
      extra={<Button variant="primary" size="sm" onClick={() => go('empConf')}>+ Nueva Solicitud</Button>}
    >
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-[20px] font-bold text-text-1">Buenos días, TotalEnerGE 👋</div>
            <div className="text-[13px] text-text-4">Resumen de tu cadena de suministro</div>
          </div>
          <div className="bg-orange-tint text-orange text-[12px] font-semibold px-3.5 py-1.5 rounded-[8px] border border-orange-border">📅 Martes, 12 Mayo 2026</div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map(k => (
            <div key={k.lbl} onClick={() => go(k.to)} className="bg-white rounded-[14px] p-5 border border-border cursor-pointer hover:shadow-sm flex flex-col min-w-0">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[18px] ${k.bg}`}>{k.ico}</div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${k.trendCls}`}>{k.trend}</span>
              </div>
              <div className={`text-[26px] font-extrabold leading-none mb-1 ${k.valCls}`}>{k.val}</div>
              <div className="text-[12px] text-text-4 mb-1">{k.lbl}</div>
              <div className="text-[11px] text-text-3 font-medium mt-auto">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Alertas contratos PYME */}
        <div className="bg-orange-tint border border-orange-border rounded-[14px] p-4 mb-6 flex items-center gap-3">
          <span className="text-[20px]">📋</span>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-text-1">2 contratos de PYME pendientes de verificación</div>
            <div className="text-[11px] text-text-3 mt-0.5">Empresas pequeñas esperan tu confirmación para que Bonafide autorice sus préstamos</div>
          </div>
          <Button variant="primary" size="sm" onClick={() => go('empVerifContr')}>Verificar ahora →</Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4 mb-6">
          {/* Solicitudes */}
          <div className="bg-white rounded-[14px] border border-border">
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
              <span className="text-[14px] font-bold">Solicitudes Recientes</span>
              <a className="text-[12px] text-orange font-semibold cursor-pointer" onClick={() => go('empConf')}>Ver todas →</a>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr>{['ID','Proveedor','Monto XAF','Estado','Fecha'].map(h=><th key={h} className="text-left px-4 py-2 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>)}</tr></thead>
              <tbody>
                {solicitudes.map(([id,name,amt,cls,st,dt]) => (
                  <tr key={id} onClick={() => go('empConfDet')} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8] cursor-pointer">
                    <td className="px-4 py-3 font-mono text-[11px] text-text-4">{id}</td>
                    <td className="px-4 py-3 font-semibold text-[13px]">{name}</td>
                    <td className="px-4 py-3 font-bold text-[13px]">{amt}</td>
                    <td className="px-4 py-3"><Badge variant={cls}>{st}</Badge></td>
                    <td className="px-4 py-3 text-[12px] text-text-4">{dt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Semáforo */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[14px] border border-border">
              <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                <span className="text-[14px] font-bold">🚦 Semáforo de Riesgos</span>
                <a className="text-[12px] text-orange font-semibold cursor-pointer" onClick={() => go('empRisk')}>Ver detalle →</a>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="relative w-[110px] h-[110px]">
                  <svg width="110" height="110" viewBox="0 0 110 110" style={{transform:'rotate(-90deg)'}}>
                    <circle cx="55" cy="55" r="44" fill="none" stroke="#F0F2F5" strokeWidth="12"/>
                    <circle cx="55" cy="55" r="44" fill="none" stroke="#00C853" strokeWidth="12" strokeDasharray="184 92" strokeLinecap="round"/>
                    <circle cx="55" cy="55" r="44" fill="none" stroke="#FFB300" strokeWidth="12" strokeDasharray="61 215" strokeDashoffset="-184" strokeLinecap="round"/>
                    <circle cx="55" cy="55" r="44" fill="none" stroke="#E53935" strokeWidth="12" strokeDasharray="31 245" strokeDashoffset="-245" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="block text-[22px] font-extrabold text-text-1">18</span>
                    <span className="block text-[10px] text-text-4">proveed.</span>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-4">
                {[['#00C853','Verde — Bajo Riesgo','67%','#059669','12 prov.'],['#FFB300','Amarillo — Medio','22%','#D97706','4 prov.'],['#E53935','Rojo — Alto Riesgo','11%','#E53935','2 prov.']].map(([c,lbl,pct,tc,cnt]) => (
                  <div key={lbl} onClick={() => go('empRisk')} className="flex items-center justify-between py-2 rounded-[8px] hover:bg-page-bg cursor-pointer px-2">
                    <div className="flex items-center gap-2 text-[12px] font-semibold">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{background:c}}/>
                      {lbl}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold" style={{color:tc}}>{pct}</span>
                      <span className="text-[12px] text-text-4">{cnt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
