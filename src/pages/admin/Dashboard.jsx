import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';

const kpis = [
  { ico:'👁', bg:'bg-blue-bg',     val:'3',  valCls:'text-text-1',     lbl:'KYC Pendientes',        sub:'Empresas por verificar',   trend:'3 nuevas',   trendCls:'bg-yellow-bg text-yellow-text', to:'adminKYC' },
  { ico:'✅', bg:'bg-green-bg',    val:'24', valCls:'text-green-text', lbl:'Confirming Activo',     sub:'XAF 847M desembolsados',   trend:'↑ +12% mes', trendCls:'bg-green-bg text-green-text',  to:'adminConf' },
  { ico:'🏢', bg:'bg-orange-tint', val:'18', valCls:'text-text-1',     lbl:'Empresas Contratantes', sub:'12 activas · 6 inactivas', trend:'↑ +2 mes',   trendCls:'bg-green-bg text-green-text',  to:'adminEmpresas' },
];

export default function AdminDash() {
  const { go } = useApp();
  return (
    <AppShell active="adminDash" role="admin" title="Inicio" sub="Vista general Bonafide">
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-[20px] font-bold text-text-1">Bienvenida, Ana 👋</div>
            <div className="text-[13px] text-text-4">Panel de operaciones Bonafide Microbank</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {kpis.map(k => (
            <div key={k.lbl} onClick={() => go(k.to)} className="bg-white rounded-[14px] p-5 border border-border cursor-pointer hover:shadow-sm flex flex-col">
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
      </div>
    </AppShell>
  );
}
