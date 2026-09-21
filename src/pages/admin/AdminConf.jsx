import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

/* ─── Admin Confirming ─── */
const confRows = [
  ['CONF-04821','Chevron','Tradex','12,500,000','12,250,000','green','Aprobada','12/05/26'],
  ['CONF-04820','Chevron','Conexxia Bata','8,200,000','8,036,000','yellow','Pendiente','11/05/26'],
  ['CONF-04819','Chevron Sur','Conexxia','23,100,000','22,638,000','green','Aprobada','10/05/26'],
  ['CONF-04818','Chevron','Conexxia Agro','5,700,000','5,586,000','blue','En revisión','09/05/26'],
];

export default function AdminConf() {
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
