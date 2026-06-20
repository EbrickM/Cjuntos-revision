import {
  Home, Building2, AlertTriangle,
  Settings, ClipboardList, Users, Receipt,
  Bell, User, LogOut, ShieldCheck, BarChart3, CreditCard,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';

const NAV = {
  admin: [
    { id: 'adminDash',     Icon: Home,          lbl: 'Inicio' },
    { id: 'adminConf',     Icon: ClipboardList, lbl: 'Contratos' },
    { id: 'adminEmpresas', Icon: Building2,     lbl: 'Empresas Contratantes' },
    { id: 'adminRisk',     Icon: Receipt,       lbl: 'Facturas' },
  ],
  'empresa-pequena': [
    { id: 'epHome',        Icon: Home,       lbl: 'Inicio' },
    { id: 'epCreditos',    Icon: CreditCard, lbl: 'Mis créditos' },
    { id: 'epProveedores', Icon: Users,      lbl: 'Mis Proveedores' },
    { id: 'epFacturacion', Icon: Receipt,    lbl: 'Mis Facturas',  badge: '2' },
    { id: 'epPerfil',      Icon: User,       lbl: 'Mi Perfil' },
  ],
  contratante: [
    { id: 'empDash',       Icon: Home,          lbl: 'Inicio' },
    { id: 'empConf',       Icon: ClipboardList, lbl: 'Confirming',           badge: '5' },
    { id: 'empFactEP',     Icon: Receipt,       lbl: 'Facturas PYME',        badge: '3' },
    { id: 'empVerifContr', Icon: ShieldCheck,   lbl: 'Verificar Contratos',  badge: '2' },
    { id: 'empProv',       Icon: Users,         lbl: 'Proveedores' },
    { id: 'empRisk',       Icon: AlertTriangle, lbl: 'Riesgos',              badge: '2' },
    { id: 'empESG',        Icon: BarChart3,     lbl: 'Reportes ESG' },
    { id: 'empNotif',      Icon: Bell,          lbl: 'Notificaciones' },
    { id: 'empSettings',   Icon: Settings,      lbl: 'Configuración' },
  ],
};

const USERS = {
  contratante: { initials: 'TE', name: 'TotalEnerGE', role: 'Empresa Contratante', pill: null },
};

const SECTIONS = {
  contratante: { split: 3, s1: 'Principal', s2: 'Análisis' },
};

export default function Sidebar({ active, role }) {
  const { go } = useApp();
  const items    = NAV[role] || [];
  const user     = USERS[role] ?? null;
  const sections = SECTIONS[role] ?? null;

  const NavItem = ({ item }) => (
    <div
      onClick={() => go(item.id)}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-[13px] font-medium
        transition-all duration-150 mb-0.5
        ${active === item.id
          ? 'bg-gradient-to-r from-orange to-orange-dark text-white'
          : 'text-text-2 hover:bg-[#f5f5f5] hover:text-text-1'
        }`}
    >
      <item.Icon className="w-5 h-5 shrink-0" />
      {item.lbl}
    </div>
  );

  return (
    <div style={{ width: 220, minWidth: 220, flexShrink: 0, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>

      {/* Nav items */}
      {role === 'empresa-pequena' ? (
        <div className="px-3 pt-4 pb-1 flex-1">
          {items.map(i => <NavItem key={i.id} item={i} />)}
        </div>
      ) : sections ? (
        <>
          <div className="px-3 pt-4 pb-1">
            <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] px-2 mb-1.5">{sections.s1}</div>
            {items.slice(0, sections.split).map(i => <NavItem key={i.id} item={i} />)}
          </div>
          <div className="px-3 pt-3 pb-1">
            <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] px-2 mb-1.5">{sections.s2}</div>
            {items.slice(sections.split).map(i => <NavItem key={i.id} item={i} />)}
          </div>
        </>
      ) : (
        <div className="px-3 pt-4 pb-1">
          {items.map(i => <NavItem key={i.id} item={i} />)}
        </div>
      )}

      {/* Footer: usuario + logout (solo admin y contratante) */}
      {user && (
        <div className="mt-auto px-3 py-4 border-t border-border">
          <div className="flex items-center gap-2.5 p-2.5 rounded-[10px] cursor-pointer hover:bg-page-bg">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[13px] shrink-0">
              {user.initials}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-text-1">{user.name}</div>
              <div className="text-[11px] text-text-4">{user.role}</div>
            </div>
            <span className="ml-auto text-text-5">⋯</span>
          </div>
          <div
            onClick={() => go('login')}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer text-red-text text-[13px] font-medium mt-1 hover:bg-red-bg"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </div>
        </div>
      )}
    </div>
  );
}
