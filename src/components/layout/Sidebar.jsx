import { useApp } from '../../state/AppContext';
import Logo from './Logo';

const NAV = {
  admin: [
    { id: 'adminDash',       ico: '🏠', lbl: 'Dashboard' },
    { id: 'adminPrestamos',  ico: '💼', lbl: 'Solicitudes Préstamo', badge: '3' },
    { id: 'adminKYC',        ico: '👁', lbl: 'KYC Empresas', badge: '3' },
    { id: 'adminConf',       ico: '✅', lbl: 'Confirming', badge: '5' },
    { id: 'adminEmpresas',   ico: '🏢', lbl: 'Empresas Contratantes' },
    { id: 'adminRisk',       ico: '🚦', lbl: 'Riesgos', badge: '2' },
    { id: 'adminAnalytics',  ico: '📈', lbl: 'Analytics' },
    { id: 'adminSettings',   ico: '⚙️', lbl: 'Configuración' },
  ],
  'empresa-pequena': [
    { id: 'epHome',          ico: '🏠', lbl: 'Inicio' },
    { id: 'epPrestamos',     ico: '💼', lbl: 'Mis Préstamos' },
    { id: 'epSolicitar',     ico: '📋', lbl: 'Solicitar Préstamo' },
    { id: 'epProveedores',   ico: '👥', lbl: 'Mis Proveedores' },
    { id: 'epFacturacion',   ico: '🧾', lbl: 'Facturación', badge: '2' },
    { id: 'epBilletera',     ico: '💳', lbl: 'Mi Billetera' },
    { id: 'epDocs',          ico: '📁', lbl: 'Documentos' },
    { id: 'epNotif',         ico: '🔔', lbl: 'Notificaciones', badge: '2' },
    { id: 'epPerfil',        ico: '👤', lbl: 'Mi Perfil' },
  ],
  contratante: [
    { id: 'empDash',         ico: '🏠', lbl: 'Inicio' },
    { id: 'empConf',         ico: '📋', lbl: 'Confirming', badge: '5' },
    { id: 'empFactEP',       ico: '🧾', lbl: 'Facturas PYME', badge: '3' },
    { id: 'empVerifContr',   ico: '✅', lbl: 'Verificar Contratos', badge: '2' },
    { id: 'empProv',         ico: '👥', lbl: 'Proveedores' },
    { id: 'empRisk',         ico: '🚦', lbl: 'Riesgos', badge: '2' },
    { id: 'empESG',          ico: '📊', lbl: 'Reportes ESG' },
    { id: 'empNotif',        ico: '🔔', lbl: 'Notificaciones' },
    { id: 'empSettings',     ico: '⚙️', lbl: 'Configuración' },
  ],
};

const USERS = {
  admin:           { initials: 'AM', name: 'Ana Martínez',     role: 'Ops. Bonafide',        pill: { lbl: 'Admin', cls: 'bg-orange-tint text-orange border-orange-border' } },
  'empresa-pequena': { initials: 'CE', name: 'Construcciones Silva', role: 'Empresa Pequeña · 🟢', pill: { lbl: 'PYME', cls: 'bg-green-bg text-green-text border-green-border' } },
  contratante:     { initials: 'TE', name: 'TotalEnerGE',      role: 'Empresa Contratante',  pill: null },
};

const SECTIONS = {
  admin:           ['Principal', 'Operaciones'],
  'empresa-pequena': ['Principal', 'Gestión'],
  contratante:     ['Principal', 'Análisis'],
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
      <span className="text-[16px] w-5 text-center">{item.ico}</span>
      {item.lbl}
      {item.badge && (
        <span className="ml-auto bg-orange text-white text-[10px] font-bold px-[7px] py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ width: 240, minWidth: 240, flexShrink: 0, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'white', borderRight: '1px solid #F0F2F5' }}>
      {/* Logo */}
      <div className="px-5 py-[18px] flex items-center gap-2 border-b border-border">
        <Logo size={16} />
        {user.pill && (
          <span className={`ml-1 text-[9px] font-bold px-[7px] py-0.5 rounded-full border ${user.pill.cls}`}>
            {user.pill.lbl}
          </span>
        )}
      </div>

      {/* Nav section 1 */}
      <div className="px-3 pt-4 pb-1">
        <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] px-2 mb-1.5">{s1}</div>
        {items.slice(0, split).map(i => <NavItem key={i.id} item={i} />)}
      </div>

      {/* Nav section 2 */}
      <div className="px-3 pt-3 pb-1">
        <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] px-2 mb-1.5">{s2}</div>
        {items.slice(split).map(i => <NavItem key={i.id} item={i} />)}
      </div>

      {/* User */}
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
          <span className="text-[16px] w-5 text-center">🚪</span>Cerrar sesión
        </div>
      </div>
    </div>
  );
}
