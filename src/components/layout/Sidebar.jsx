import {
  Home, Building2,
  ClipboardList, Users, Receipt,
  User, LogOut, Leaf, X, Clock, Landmark, Truck, Banknote,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { logout } from '../../stores/authStore';

const NAV = {
  admin: [
    { id: 'adminDash',     Icon: Home,          lbl: 'Inicio' },
    { id: 'adminConf',     Icon: ClipboardList, lbl: 'Contratos' },
    { id: 'adminEmpresas', Icon: Building2,     lbl: 'Empresas Contratantes' },
    { id: 'adminFacturas', Icon: Receipt,       lbl: 'Facturas' },
    { id: 'adminRisk',     Icon: ClipboardList, lbl: 'Riesgo' },
    { id: 'adminGobierno', Icon: Landmark,      lbl: 'Información Gubernamental' },
  ],
  'empresa-pequena': [
    { id: 'epHome',          Icon: Home,       lbl: 'Inicio' },
    { id: 'epCreditos',      Icon: ClipboardList, lbl: 'Mis contratos' },
    { id: 'epProveedores',   Icon: Users,      lbl: 'Mis Proveedores' },
    { id: 'epFacturacion',   Icon: Receipt,    lbl: 'Mis Facturas',   badge: '2' },
    { id: 'epSolicitudes',   Icon: Clock,      lbl: 'Solicitudes',    badge: '3' },
    { id: 'epESG',           Icon: Leaf,       lbl: 'Huella Verde' },
    { id: 'epPerfil',        Icon: User,       lbl: 'Mi Perfil' },
  ],
  contratante: [
    { id: 'empDash',        Icon: Home,          lbl: 'Inicio' },
    { id: 'empContratos',   Icon: ClipboardList, lbl: 'Mis Contratos',   badge: '5'  },
    { id: 'empFacturas',    Icon: Receipt,       lbl: 'Mis Facturas',    badge: '4'  },
    { id: 'empPymes',       Icon: Users,         lbl: 'Emp. Contratadas',           badge: '6'  },
    { id: 'empSolicitudes', Icon: Clock,         lbl: 'Solicitudes',     badge: '4'  },
    { id: 'empESG',         Icon: Leaf,          lbl: 'Huella Verde' },
    { id: 'empPerfil',      Icon: User,          lbl: 'Mi Perfil' },
  ],
  fondeador: [
    { id: 'fondDash',    Icon: Home,          lbl: 'Inicio' },
    { id: 'fondOrdenes', Icon: Banknote,      lbl: 'Órdenes de Fondeo' },
    { id: 'fondCartera', Icon: ClipboardList, lbl: 'Cartera' },
  ],
  proveedor: [
    { id: 'provDash',           Icon: Home,          lbl: 'Inicio' },
    { id: 'provContratos',      Icon: ClipboardList, lbl: 'Mis Contratos' },
    { id: 'provFacturas',       Icon: Receipt,       lbl: 'Mis Facturas' },
    { id: 'provSuministradores', Icon: Truck,        lbl: 'Suministradores' },
    { id: 'provSolicitudes',    Icon: Clock,         lbl: 'Solicitudes' },
    { id: 'provESG',            Icon: Leaf,          lbl: 'Huella Verde' },
    { id: 'provPerfil',         Icon: User,          lbl: 'Mi Perfil' },
  ],
};

const USERS = {
};

const SECTIONS = {
};

export default function Sidebar({ active, role, onClose }) {
  const { go } = useApp();
  const items    = NAV[role] || [];
  const user     = USERS[role] ?? null;
  const sections = SECTIONS[role] ?? null;

  const NavItem = ({ item }) => (
    <button
      onClick={() => { go(item.id); onClose?.(); }}
      className={`w-[calc(100%-1.5rem)] flex items-center gap-3 mx-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-medium
        transition-colors mb-0.5 text-left
        ${active === item.id
          ? 'text-white'
          : 'text-text-3 hover:text-text-1 hover:bg-page-bg'
        }`}
      style={active === item.id ? { background: 'var(--bonafide-gradient)' } : undefined}
    >
      <item.Icon className="w-4 h-4 shrink-0" />
      {item.lbl}
    </button>
  );

  return (
    <aside className="w-60 h-full bg-white rounded-2xl shadow-xl border border-border/40 flex flex-col py-5 overflow-y-auto">

      {/* Botón cerrar — solo en móvil */}
      {onClose && (
        <div className="flex justify-end px-3 pb-2 md:hidden">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-page-bg transition-colors text-text-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nav items */}
      {role === 'empresa-pequena' ? (
        <div className="flex-1">
          {items.map(i => <NavItem key={i.id} item={i} />)}
        </div>
      ) : sections ? (
        <>
          <div className="pb-1">
            <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] mx-3 px-1 mb-1.5">{sections.s1}</div>
            {items.slice(0, sections.split).map(i => <NavItem key={i.id} item={i} />)}
          </div>
          <div className="pt-3 pb-1">
            <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] mx-3 px-1 mb-1.5">{sections.s2}</div>
            {items.slice(sections.split).map(i => <NavItem key={i.id} item={i} />)}
          </div>
        </>
      ) : (
        <div>
          {items.map(i => <NavItem key={i.id} item={i} />)}
        </div>
      )}

      {/* Footer: usuario + logout (solo admin y contratante) */}
      {user && (
        <div className="mt-auto pt-4 mx-3 border-t border-border/40">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-page-bg">
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
            onClick={() => { void logout(); go('login'); }}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-pointer text-red-text text-[13px] font-medium mt-1 hover:bg-red-bg"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </div>
        </div>
      )}
    </aside>
  );
}
