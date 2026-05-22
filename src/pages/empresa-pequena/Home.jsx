import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const kpis = [
  { ico: '💼', bg: 'bg-orange-tint', val: '2', valCls: 'text-orange', lbl: 'Préstamos Activos', sub: '1 pendiente aprobación', trend: '↑ +1 nuevo', trendCls: 'bg-green-bg text-green-text', to: 'epPrestamos' },
  { ico: '💰', bg: 'bg-green-bg',    val: '85,000,000', valCls: 'text-text-1', lbl: 'Crédito Disponible (XAF)', sub: 'Saldo ejecutable este mes', trend: '↑ +12%', trendCls: 'bg-green-bg text-green-text', to: 'epBilletera' },
  { ico: '👥', bg: 'bg-blue-bg',     val: '4', valCls: 'text-blue-text', lbl: 'Mis Proveedores', sub: '3 activos · 1 pendiente pago', trend: '↑ Activo', trendCls: 'bg-green-bg text-green-text', to: 'epProveedores' },
  { ico: '🧾', bg: 'bg-orange-tint', val: '3', valCls: 'text-orange', lbl: 'Facturas Pendientes', sub: 'Al contratante · XAF 28.5M', trend: '⚠ 2 nuevas', trendCls: 'bg-yellow-bg text-yellow-text', to: 'epFacturacion' },
];

export default function EpHome() {
  const { go } = useApp();
  return (
    <AppShell active="epHome" role="empresa-pequena" title="Inicio" sub="Mi Panel"
      extra={<Button variant="primary" size="sm" onClick={() => go('epSolicitar')}>+ Solicitar Préstamo</Button>}
    >
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-[20px] font-bold text-text-1">Buenos días, Construcciones Silva 👋</div>
            <div className="text-[13px] text-text-4">GE-2021-00234 · Empresa Pequeña</div>
          </div>
          <div className="flex gap-2">
            <span className="bg-green-bg text-green-text text-[12px] font-semibold px-3.5 py-1.5 rounded-[8px] border border-green-border">🟢 Semáforo Verde</span>
            <span className="bg-green-bg text-green-text text-[12px] font-semibold px-3.5 py-1.5 rounded-[8px] border border-green-border">🌿 Verde Bonafide</span>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map(k => (
            <div key={k.lbl} onClick={() => go(k.to)} className="bg-white rounded-[14px] p-5 border border-border cursor-pointer hover:shadow-sm transition-shadow flex flex-col">
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

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4 mb-6">
          {/* Préstamo activo */}
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[14px] font-bold text-text-1">Préstamo Activo</span>
              <Badge variant="green">✅ Aprobado</Badge>
            </div>
            <div className="bg-gradient-to-br from-orange to-orange-dark rounded-[12px] p-5 text-white mb-4">
              <div className="text-[11px] font-semibold opacity-80 mb-1">PRÉSTAMO BONAFIDE</div>
              <div className="text-[22px] font-extrabold mb-1">XAF 120,000,000</div>
              <div className="text-[12px] opacity-75">TotalEnerGE · Contrato CTR-2026-001</div>
              <div className="border-t border-white/25 mt-3 pt-3 flex justify-between text-[12px] opacity-85">
                <span>Aprobado: 01/05/2026</span>
                <span>Plazo: 12 meses</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['XAF 85M','Disponible','text-orange'],['XAF 25M','Nómina','text-blue-text'],['XAF 10M','Reserva','text-yellow-text']].map(([v,l,c]) => (
                <div key={l} className="bg-page-bg rounded-[10px] p-3">
                  <div className={`text-[15px] font-extrabold ${c}`}>{v}</div>
                  <div className="text-[11px] text-text-4">{l}</div>
                </div>
              ))}
            </div>
            <Button variant="ghost" full className="mt-4" onClick={() => go('epPrestamos')}>Ver detalle completo →</Button>
          </div>

          {/* Acciones rápidas */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[14px] font-bold mb-4">Acciones Rápidas</div>
              <div className="grid grid-cols-2 gap-2.5">
                {[['💼','Nuevo Préstamo','epSolicitar'],['🔓','Liberar Fondos','epLiberacion'],['🧾','Nueva Factura','epFacturacion'],['👥','Proveedores','epProveedores']].map(([ico,lbl,id]) => (
                  <div key={id} onClick={() => go(id)}
                    className="border-2 border-[#E5E7EB] rounded-[12px] p-4 text-center cursor-pointer transition-all hover:border-orange hover:bg-orange-tint">
                    <div className="text-[24px] mb-1.5">{ico}</div>
                    <div className="text-[12px] font-semibold text-text-2">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Últimas transacciones */}
            <div className="bg-white rounded-[14px] border border-border p-5 flex-1">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[14px] font-bold text-text-1">Pagos Recientes</span>
                <a className="text-[12px] text-orange font-semibold cursor-pointer" onClick={() => go('epBilletera')}>Ver todo →</a>
              </div>
              {[['💰','Pago contrato TotalEnerGE','15/05','+15,000,000','text-green-text'],['🏗','Pago a Cemex GE','14/05','−3,200,000','text-red-text'],['👷','Nómina quincenal','10/05','−12,500,000','text-red-text']].map(([ico,desc,dt,amt,c]) => (
                <div key={desc} className="flex items-center gap-3 py-2 border-b border-page-bg last:border-0">
                  <span className="text-[18px]">{ico}</span>
                  <div className="flex-1 text-[13px] font-medium">{desc}</div>
                  <div className="text-[12px] text-text-4">{dt}</div>
                  <div className={`text-[13px] font-bold ${c}`}>{amt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-yellow-bg border border-yellow/40 rounded-[14px] p-4 flex items-center gap-3">
          <span className="text-[20px]">⚠</span>
          <div className="flex-1">
            <div className="text-[12px] font-bold text-text-1">Datos del contratante pendientes</div>
            <div className="text-[11px] text-text-3 mt-0.5">El préstamo PRE-2026-0087 requiere que ingreses los datos del contratante</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => go('epPrestamoDetalle')}>Completar →</Button>
        </div>
      </div>
    </AppShell>
  );
}
