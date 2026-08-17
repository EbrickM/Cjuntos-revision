import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

// ── RIESGOS ──
export default function EmpRisk() {
  const { go } = useApp();
  return (
    <AppShell active="empRisk" role="contratante" title="Monitor de Riesgos">
      <div className="fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="text-[14px] font-bold mb-4">Distribución de Riesgo</div>
            <div className="flex items-center gap-6">
              <div className="relative w-[130px] h-[130px] shrink-0">
                <svg width="130" height="130" viewBox="0 0 130 130" style={{transform:'rotate(-90deg)'}}>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#F0F2F5" strokeWidth="14"/>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#00C853" strokeWidth="14" strokeDasharray="226 113" strokeLinecap="round"/>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#FFB300" strokeWidth="14" strokeDasharray="75 264" strokeDashoffset="-226" strokeLinecap="round"/>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#E53935" strokeWidth="14" strokeDasharray="38 301" strokeDashoffset="-301" strokeLinecap="round"/>
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="block text-[22px] font-extrabold">18</span>
                  <span className="block text-[10px] text-text-4">total</span>
                </div>
              </div>
              <div className="flex-1">
                {[['#00C853','Verde','67%','12 proveedores'],['#FFB300','Amarillo','22%','4 proveedores'],['#E53935','Rojo','11%','2 proveedores']].map(([c,l,p,cnt]) => (
                  <div key={l} className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{background:c}}/>
                    <span className="text-[13px] font-semibold flex-1">{l}</span>
                    <span className="text-[13px] font-bold" style={{color:c}}>{p}</span>
                    <span className="text-[12px] text-text-4 w-[90px]">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="text-[13px] font-bold mb-3">⚠ Alertas Activas</div>
            {[['red','🔴','ServLog GE — Riesgo Alto','3 pagos tardíos desde 15/04/2026'],['yellow','🟡','AgriEco PYME — Docs','RUC vence 30/05/2026']].map(([typ,ico,t,d]) => (
              <div key={t} className={`flex items-center gap-3 rounded-[10px] p-3 mb-2 border ${typ==='red'?'bg-red-bg border-red/20':'bg-yellow-bg border-yellow/30'}`}>
                <span className="text-[20px]">{ico}</span>
                <div className="flex-1">
                  <div className="text-[12px] font-bold">{t}</div>
                  <div className="text-[11px] text-text-3 mt-0.5">{d}</div>
                </div>
                <Button variant="ghost" size="sm">Revisar</Button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border text-[14px] font-bold">Todos los Proveedores</div>
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr>{['Proveedor','Semáforo','Score','Facturas','Alertas','Acciones'].map(h=><th key={h} className="text-left px-4 py-2 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>)}</tr></thead>
            <tbody>
              {[['Const. Silva','green','🟢 Verde',870,3,'Ninguna'],['Tech Bata SL','green','🟢 Verde',820,1,'Ninguna'],['AgriEco PYME','yellow','⚠ Amarillo',610,2,'Docs por vencer'],['ServLog GE','red','🔴 Rojo',320,1,'3 pagos tardíos']].map(([name,cls,sem,score,fac,alert]) => (
                <tr key={name} onClick={() => go('empProvPerfil')} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8] cursor-pointer">
                  <td className="px-4 py-3 font-semibold">{name}</td>
                  <td className="px-4 py-3"><Badge variant={cls}>{sem}</Badge></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="font-bold">{score}</span><div className="w-20 h-1.5 bg-border rounded-full overflow-hidden"><div className="h-full bg-orange rounded-full" style={{width:`${score/10}%`}}/></div></div></td>
                  <td className="px-4 py-3">{fac}</td>
                  <td className="px-4 py-3 text-[12px]" style={{color:alert==='Ninguna'?'#059669':'#D97706'}}>{alert}</td>
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
