import AppShell from '../../components/layout/AppShell';

/* ─── Admin Analytics ─── */
export default function AdminAnalytics() {
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
