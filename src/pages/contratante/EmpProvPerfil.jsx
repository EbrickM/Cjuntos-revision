import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

// ── PROVEEDOR PERFIL ──
export default function EmpProvPerfil() {
  const { go } = useApp();
  return (
    <AppShell active="empProv" role="contratante" title="Tradex">
      <div className="fade-in">
        <Button variant="ghost" size="sm" className="mb-5" onClick={() => go('empProv')}>← Directorio</Button>
        <div className="bg-white rounded-[14px] border border-border p-7 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-[60px] h-[60px] rounded-[14px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[20px] shrink-0">CS</div>
            <div className="flex-1 min-w-0">
              <div className="text-[22px] font-bold mb-1">Tradex</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[13px] text-text-4">
                <span>RUC: GE-2021-00234</span><span className="hidden sm:inline">·</span><span>Construcción</span><span className="hidden sm:inline">·</span><span>Activo desde Ene 2025</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {[['🟢 Verde','Bajo Riesgo','bg-green-bg border-green-border'],['🌿 Verde B.','Etiqueta ESG','bg-green-bg border-green-border'],['820/1000','Score financiero','bg-orange-tint border-orange-border']].map(([val,lbl,cls]) => (
                <div key={lbl} className={`${cls} border rounded-[12px] p-3.5 text-center min-w-[90px]`}>
                  <div className="text-[18px] font-bold mb-0.5">{val}</div>
                  <div className="text-[11px] text-text-4">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <div className="bg-white rounded-[14px] border border-border">
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
              <span className="text-[14px] font-bold">Historial Confirming</span>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr>{['ID','Monto','Estado','Fecha'].map(h=><th key={h} className="text-left px-4 py-2 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>)}</tr></thead>
              <tbody>
                {[['CONF-04821','12,500,000','green','Aprobada','12/05'],['CONF-04803','9,800,000','green','Aprobada','28/04'],['CONF-04789','7,200,000','green','Aprobada','15/04']].map(([id,a,cls,st,dt]) => (
                  <tr key={id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8] cursor-pointer">
                    <td className="px-4 py-3 font-mono text-[11px] text-text-4">{id}</td>
                    <td className="px-4 py-3 font-bold">{a}</td>
                    <td className="px-4 py-3"><Badge variant={cls}>{st}</Badge></td>
                    <td className="px-4 py-3 text-[12px] text-text-4">{dt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold mb-3">Compliance / KYC</div>
              {[['✅','KYC verificado','green'],['✅','AML aprobado','green'],['✅','Documentos vigentes','green'],['⚠️','RUC vence Jun 2026','yellow']].map(([ico,lbl,cls]) => (
                <div key={lbl} className="flex items-center gap-2.5 py-2.5 border-b border-page-bg last:border-0">
                  <span className="text-[18px]">{ico}</span>
                  <span className="text-[13px] flex-1">{lbl}</span>
                  {cls === 'yellow' && <Button variant="ghost" size="sm">Notificar</Button>}
                </div>
              ))}
            </div>
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold mb-3">Contacto</div>
              {['👤 Carlos Esono Mbá','📧 c.esono@constsilva.gq','📞 +240 222 123 456'].map(c => (
                <div key={c} className="text-[13px] text-text-3 py-1">{c}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
