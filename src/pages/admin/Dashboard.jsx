import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const kpis = [
  { ico:'💼', bg:'bg-orange-tint', val:'3',   valCls:'text-orange',     lbl:'Solicitudes Préstamo',    sub:'Pendientes autorización',   trend:'⚠ Acción requerida', trendCls:'bg-red-bg text-red-text',       to:'adminPrestamos' },
  { ico:'👁', bg:'bg-blue-bg',     val:'3',   valCls:'text-text-1',     lbl:'KYC Pendientes',           sub:'Empresas por verificar',    trend:'3 nuevas',           trendCls:'bg-yellow-bg text-yellow-text', to:'adminKYC' },
  { ico:'✅', bg:'bg-green-bg',    val:'24',  valCls:'text-green-text', lbl:'Confirming Activo',        sub:'XAF 847M desembolsados',    trend:'↑ +12% mes',         trendCls:'bg-green-bg text-green-text',  to:'adminConf' },
  { ico:'🏢', bg:'bg-orange-tint', val:'18',  valCls:'text-text-1',     lbl:'Empresas Contratantes',   sub:'12 activas · 6 inactivas',  trend:'↑ +2 mes',           trendCls:'bg-green-bg text-green-text',  to:'adminEmpresas' },
];

const solicitudes = [
  { id:'PRE-2026-001', empresa:'Const. Silva Ltd.', contratante:'TotalEnerGE', monto:'120,000,000', verifContr:true,  estado:'Autorizado', cls:'green' },
  { id:'PRE-2026-002', empresa:'Pinturas Bata SL',  contratante:'TotalEnerGE', monto:'45,000,000',  verifContr:true,  estado:'Pendiente',  cls:'yellow' },
  { id:'PRE-2026-003', empresa:'LogiRapid GE',      contratante:'Infraconst.', monto:'80,000,000',  verifContr:false, estado:'En revisión',cls:'blue' },
];

const liberaciones = [
  { id:'LIB-2026-042', empresa:'Const. Silva Ltd.', proveedor:'CemGE SA',    monto:'5,200,000',  dt:'12/05/26', pendiente:true },
  { id:'LIB-2026-041', empresa:'Pinturas Bata SL',  proveedor:'PinMal SRL',  monto:'2,800,000',  dt:'11/05/26', pendiente:true },
  { id:'LIB-2026-040', empresa:'LogiRapid GE',      proveedor:'FlotGE SRL',  monto:'7,100,000',  dt:'10/05/26', pendiente:false },
];

export default function AdminDash() {
  const { go } = useApp();
  return (
    <AppShell active="adminDash" role="admin" title="Dashboard" sub="Vista general Bonafide">
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-[20px] font-bold text-text-1">Buenos días, Ana 👋</div>
            <div className="text-[13px] text-text-4">Panel de operaciones Bonafide Microbank</div>
          </div>
          <div className="bg-orange-tint text-orange text-[12px] font-semibold px-3.5 py-1.5 rounded-[8px] border border-orange-border">📅 Lunes, 18 Mayo 2026</div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        {/* Alert liberaciones pendientes */}
        <div className="bg-orange-tint border border-orange-border rounded-[14px] p-4 mb-6 flex items-center gap-3">
          <span className="text-[20px]">💸</span>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-text-1">2 solicitudes de liberación de fondos pendientes de aprobación</div>
            <div className="text-[11px] text-text-3 mt-0.5">Empresas pequeñas esperan tu autorización para pagar a sus proveedores</div>
          </div>
          <Button variant="primary" size="sm" onClick={() => go('adminPrestamos')}>Revisar →</Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
          {/* Solicitudes préstamo */}
          <div className="bg-white rounded-[14px] border border-border">
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
              <span className="text-[14px] font-bold">Solicitudes de Préstamo Recientes</span>
              <a className="text-[12px] text-orange font-semibold cursor-pointer" onClick={() => go('adminPrestamos')}>Ver todas →</a>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr>{['ID','Empresa','Contratante','Monto XAF','Verif.','Estado'].map(h=><th key={h} className="text-left px-4 py-2 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>)}</tr></thead>
              <tbody>
                {solicitudes.map(s => (
                  <tr key={s.id} onClick={() => go('adminPrestamoDetalle')} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8] cursor-pointer">
                    <td className="px-4 py-3 font-mono text-[11px] text-text-4">{s.id}</td>
                    <td className="px-4 py-3 font-semibold text-[13px]">{s.empresa}</td>
                    <td className="px-4 py-3 text-[12px] text-text-4">{s.contratante}</td>
                    <td className="px-4 py-3 font-bold text-[13px]">{s.monto}</td>
                    <td className="px-4 py-3">
                      {s.verifContr
                        ? <span className="text-green-text text-[12px] font-semibold">✅ Verificado</span>
                        : <span className="text-yellow-text text-[12px] font-semibold">⏳ Pendiente</span>}
                    </td>
                    <td className="px-4 py-3"><Badge variant={s.cls}>{s.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Liberaciones pendientes */}
          <div className="bg-white rounded-[14px] border border-border">
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
              <span className="text-[14px] font-bold">💸 Liberaciones Pendientes</span>
              <a className="text-[12px] text-orange font-semibold cursor-pointer" onClick={() => go('adminPrestamos')}>Ver todas →</a>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {liberaciones.filter(l => l.pendiente).map(l => (
                <div key={l.id} className="bg-page-bg rounded-[10px] p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-bold text-text-1">{l.empresa}</div>
                    <div className="text-[11px] text-text-4">{l.id} · {l.proveedor}</div>
                    <div className="text-[13px] font-extrabold text-orange mt-0.5">XAF {l.monto}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="danger" size="sm">✕</Button>
                    <Button variant="success" size="sm" onClick={() => go('adminPrestamoDetalle')}>✓</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
