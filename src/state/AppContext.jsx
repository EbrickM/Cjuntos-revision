import { createContext, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Mapa screenId → path URL ──────────────────────────────────────────────────
export const ROUTES = {
  // Auth
  splash:             '/',
  login:              '/login',
  roleSelect:         '/seleccionar-rol',
  solicitarContrato:  '/solicitar-contrato',
  kyc1:               '/kyc/paso-1',
  kyc2:               '/kyc/paso-2',
  kyc3:               '/kyc/paso-3',
  kyc4:               '/kyc/paso-4',

  // Admin
  adminDash:          '/admin',
  adminKYC:           '/admin/kyc',
  adminConf:          '/admin/contratos',
  adminEmpresas:      '/admin/empresas',
  adminRisk:          '/admin/riesgo',
  adminAnalytics:     '/admin/analiticas',
  adminSettings:      '/admin/configuracion',

  // Empresa Pequeña
  epHome:             '/pyme',
  epProveedores:      '/pyme/proveedores',
  epFacturacion:      '/pyme/facturas',
  epCreditos:         '/pyme/creditos',
  epBilletera:        '/pyme/billetera',
  epPerfil:           '/pyme/perfil',
  epDocs:             '/pyme/documentos',
  epESG:              '/pyme/huella-verde',
  epSolicitudes:      '/pyme/solicitudes',
  epNuevaSolicitud:   '/pyme/solicitudes/nueva',

  // Contratante
  empDash:            '/contratante',
  empContratos:       '/contratante/contratos',
  empContratoDetalle: '/contratante/contratos/detalle',
  empNuevaSolicitud:  '/contratante/solicitudes/nueva',
  empFacturas:        '/contratante/facturas',
  empPymes:           '/contratante/pymes',
  empSolicitudes:     '/contratante/solicitudes',
  empESG:             '/contratante/huella-verde',
  empPerfil:          '/contratante/perfil',
  // legacy
  empConf:            '/contratante/confirming',
  empConfDet:         '/contratante/confirming/detalle',
  empFactEP:          '/contratante/facturas-pyme',
  empVerifContr:      '/contratante/verificar-contratos',
  empProv:            '/contratante/proveedores-legacy',
  empProvPerfil:      '/contratante/proveedores-legacy/perfil',
  empRisk:            '/contratante/riesgo',
  empNotif:           '/contratante/notificaciones',
  empSettings:        '/contratante/ajustes',
};

const PATH_TO_SCREEN = Object.fromEntries(
  Object.entries(ROUTES).map(([id, path]) => [path, id])
);

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [opts, setOpts] = useState({});

  // Pantalla activa derivada de la URL
  const screen = PATH_TO_SCREEN[location.pathname] ?? 'splash';

  // Rol inferido de la URL cuando no está seteado explícitamente
  const derivedRole = (() => {
    const p = location.pathname;
    if (p.startsWith('/pyme'))        return 'empresa-pequena';
    if (p.startsWith('/contratante')) return 'contratante';
    if (p.startsWith('/admin'))       return 'admin';
    return null;
  })();
  const effectiveRole = role ?? derivedRole;

  function go(screenId, newOpts = {}) {
    setOpts(newOpts);
    const path = ROUTES[screenId] ?? '/';
    // Auto-set role al navegar
    if (screenId.startsWith('ep'))    setRole('empresa-pequena');
    else if (screenId.startsWith('emp'))  setRole('contratante');
    else if (screenId.startsWith('admin')) setRole('admin');
    else if (screenId === 'splash' || screenId === 'login') setRole(null);
    navigate(path);
    window.scrollTo(0, 0);
  }

  return (
    <AppContext.Provider value={{ screen, role: effectiveRole, setRole, opts, go }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
