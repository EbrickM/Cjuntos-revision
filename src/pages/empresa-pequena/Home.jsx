import {
  Wallet, Users, Receipt, CreditCard,
  FileText,
  DollarSign, Hammer, HardHat,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';

const kpis = [
  { Icon: Wallet,     bg: 'bg-green-bg',    val: '85,000,000', valCls: 'text-text-1',    lbl: 'Crédito Disponible (XAF)', sub: 'Saldo ejecutable este mes',    trend: '↑ +12%',   trendCls: 'bg-green-bg text-green-text',   to: 'epBilletera' },
  { Icon: CreditCard, bg: 'bg-blue-bg',     val: '2',          valCls: 'text-blue-text', lbl: 'Contratos de crédito',      sub: 'Aprobados por Bonafide',    trend: '1 pendiente', trendCls: 'bg-green-bg text-green-text',   to: 'epCreditos' },
  { Icon: Receipt,    bg: 'bg-orange-tint', val: '3',          valCls: 'text-orange',    lbl: 'Facturas Pendientes',      sub: 'Al contratante · XAF 28.5M',   trend: '2 nuevas', trendCls: 'bg-yellow-bg text-yellow-text', to: 'epFacturacion' },
];

const acciones = [
  { Icon: FileText,   lbl: 'Nueva Factura', id: 'epFacturacion' },
  { Icon: CreditCard, lbl: 'Mis Créditos',  id: 'epCreditos' },
  { Icon: Users,      lbl: 'Proveedores',   id: 'epProveedores' },
];

const txns = [
  { Icon: DollarSign, desc: 'Pago contrato TotalEnerGE', dt: '15/05', amt: '+15,000,000', c: 'text-green-text' },
  { Icon: Hammer,     desc: 'Pago a Cemex GE',           dt: '14/05', amt: '−3,200,000',  c: 'text-red-text' },
  { Icon: HardHat,    desc: 'Nómina quincenal',           dt: '10/05', amt: '−12,500,000', c: 'text-red-text' },
];

export default function EpHome() {
  const { go } = useApp();
  return (
    <AppShell active="epHome" role="empresa-pequena" title="Inicio" sub="Mi Panel">
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-[20px] font-bold text-text-1">Buenos días, Construcciones Silva</div>
            <div className="text-[13px] text-text-4">GE-2021-00234 · Empresa Pequeña</div>
          </div>
          <div className="flex gap-2">
            <span className="bg-green-bg text-green-text text-[12px] font-semibold px-3.5 py-1.5 rounded-[8px] border border-green-border flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green shrink-0" />
              Semáforo Verde
            </span>
            <span className="bg-green-bg text-green-text text-[12px] font-semibold px-3.5 py-1.5 rounded-[8px] border border-green-border">
              Verde Bonafide
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {kpis.map(k => (
            <div key={k.lbl} onClick={() => go(k.to)} className="bg-white rounded-[14px] p-5 border border-border cursor-pointer hover:shadow-sm transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center ${k.bg}`}>
                  <k.Icon className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${k.trendCls}`}>{k.trend}</span>
              </div>
              <div className={`text-[26px] font-extrabold leading-none mb-1 ${k.valCls}`}>{k.val}</div>
              <div className="text-[12px] text-text-4 mb-1">{k.lbl}</div>
              <div className="text-[11px] text-text-3 font-medium mt-auto">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="text-[14px] font-bold mb-4">Acciones Rápidas</div>
            <div className="grid grid-cols-2 gap-2.5">
              {acciones.map(({ Icon, lbl, id }) => (
                <div key={id} onClick={() => go(id)}
                  className="border-2 border-[#E5E7EB] rounded-[12px] p-4 text-center cursor-pointer transition-all hover:border-orange hover:bg-orange-tint">
                  <Icon className="w-6 h-6 text-orange mx-auto mb-1.5" />
                  <div className="text-[12px] font-semibold text-text-2">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[14px] font-bold text-text-1">Pagos Recientes</span>
              <a className="text-[12px] text-orange font-semibold cursor-pointer" onClick={() => go('epBilletera')}>Ver todo</a>
            </div>
            {txns.map(({ Icon, desc, dt, amt, c }) => (
              <div key={desc} className="flex items-center gap-3 py-2 border-b border-page-bg last:border-0">
                <div className="w-8 h-8 rounded-[8px] bg-page-bg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-text-3" />
                </div>
                <div className="flex-1 text-[13px] font-medium">{desc}</div>
                <div className="text-[12px] text-text-4">{dt}</div>
                <div className={`text-[13px] font-bold ${c}`}>{amt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
