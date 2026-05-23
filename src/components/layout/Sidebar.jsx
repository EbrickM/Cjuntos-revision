import {
  Home, Briefcase, Eye, CheckCircle2, Building2, AlertTriangle,
  TrendingUp, Settings, ClipboardList, Users, Receipt, Wallet,
  Folder, Bell, User, LogOut, ShieldCheck, BarChart3,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import Logo from './Logo';

const NAV = {
  admin: [
    { id: 'adminDash',      Icon: Home,          lbl: 'Dashboard' },
    { id: 'adminPrestamos', Icon: Briefcase,      lbl: 'Solicitudes Préstamo', badge: '3' },
    { id: 'adminKYC',       Icon: Eye,            lbl: 'KYC Empresas',         badge: '3' },
    { id: 'adminConf',      Icon: CheckCircle2,   lbl: 'Confirming',           badge: '5' },
    { id: 'adminEmpresas',  Icon: Building2,      lbl: 'Empresas Contratantes' },
    { id: 'adminRisk',      Icon: AlertTriangle,  lbl: 'Riesgos',              badge: '2' },
    { id: 'adminAnalytics', Icon: TrendingUp,     lbl: 'Analytics' },
    { id: 'adminSettings',  Icon: Settings,       lbl: 'Configuración' },
  ],
  'empresa-pequena': [
    { id: 'epHome',        Icon: Home,          lbl: 'Inicio' },
    { id: 'epPrestamos',   Icon: Briefcase,     lbl: 'Mis Préstamos' },
    { id: 'epProveedores', Icon: Users,         lbl: 'Mis Proveedores' },
    { id: 'epFacturacion', Icon: Receipt,       lbl: 'Facturación',      badge: '2' },
    { id: 'epBilletera',   Icon: Wallet,        lbl: 'Mi Billetera' },
    { id: 'epDocs',        Icon: Folder,        lbl: 'Documentos' },
    { id: 'epNotif',       Icon: Bell,          lbl: 'Notificaciones',   badge: '2' },
    { id: 'epPerfil',      Icon: User,          lbl: 'Mi Perfil' },
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
  admin:             { initials: 'AM', name: 'Ana Martínez',       role: 'Ops. Bonafide',      pill: { lbl: 'Admin', cls: 'bg-orange-tint text-orange border-orange-border' } },
  'empresa-pequena': { initials: 'CE', name: 'Construcciones Silva', role: 'Empresa Pequeña',   pill: { lbl: 'PYME',  cls: 'bg-green-bg text-green-text border-green-border' } },
  contratante:       { initials: 'TE', name: 'TotalEnerGE',        role: 'Empresa Contratante', pill: null },
};

const SECTIONS = {
  admin:             ['Principal', 'Operaciones'],
  'empresa-pequena': ['Principal', 'Gestión'],
  contratante:       ['Principal', 'Análisis'],
};

export default function Sidebar({ active, role }) {
  const { go } = useApp();
  const items = NAV[role] || [];
  const user  = USERS[role] || USERS.contratante;
  const [s1, s2] = SECTIONS[role] || ['Principal', 'Gestión'];
  const split = role === 'admin' ? 3 : role === 'empresa-pequena' ? 4 : 3;

  const NavItem = ({ item }) => (
    <div
      onClick={() => go(item.id)}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer text-[13px] font-medium
        transition-all duration-150 mb-0.5
        ${active === item.id
          ? 'bg-orange-tint text-orange font-semibold'
          : 'text-text-3 hover:bg-orange-tint hover:text-orange'
        }`}
    >
      <item.Icon className="w-4 h-4 shrink-0" />
      {item.lbl}
    </div>
  );

  return (
    <div style={{ width: 240, minWidth: 240, flexShrink: 0, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'white', borderRight: '1px solid #F0F2F5' }}>
      <div className="px-5 py-[18px] flex items-center gap-2 border-b border-border">
        <Logo size={16} />
        {user.pill && (
          <span className={`ml-1 text-[9px] font-bold px-[7px] py-0.5 rounded-full border ${user.pill.cls}`}>
            {user.pill.lbl}
          </span>
        )}
      </div>

      <div className="px-3 pt-4 pb-1">
        <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] px-2 mb-1.5">{s1}</div>
        {items.slice(0, split).map(i => <NavItem key={i.id} item={i} />)}
      </div>

      <div className="px-3 pt-3 pb-1">
        <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] px-2 mb-1.5">{s2}</div>
        {items.slice(split).map(i => <NavItem key={i.id} item={i} />)}
      </div>

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
    </div>
  );
}
