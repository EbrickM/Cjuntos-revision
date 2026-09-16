import { createContext, useCallback, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Mapa screenId → path URL ──────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
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
  adminGobierno:      '/admin/informacion-gubernamental',

  // Empresa Pequeña
  epHome:             '/pyme',
  epProveedores:      '/pyme/proveedores',
  epFacturacion:      '/pyme/facturas',
  epCreditos:         '/pyme/contratos',
  epBilletera:        '/pyme/billetera',
  epPerfil:           '/pyme/perfil',
  epDocs:             '/pyme/documentos',
  epESG:              '/pyme/huella-verde',
  epSolicitudes:      '/pyme/solicitudes',
  epSolicitarContrato: '/pyme/solicitar-contrato',
  epConfigurarContrato: '/pyme/contratos/configurar',

  // Contratante
  empDash:            '/contratante',
  empContratos:       '/contratante/contratos',
  empContratoDetalle: '/contratante/contratos/detalle',
  empConfigurarContrato: '/contratante/contratos/configurar',
  empFacturas:        '/contratante/facturas',
  empPymes:           '/contratante/pymes',
  empSolicitudes:     '/contratante/solicitudes',
  empESG:             '/contratante/huella-verde',
  empPerfil:          '/contratante/perfil',
  empSolicitarContrato: '/contratante/solicitar-contrato',
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

  // Proveedor (sin dashboard propio — solo el wizard de configuración del
  // Subproceso 3, accedido por enlace directo)
  provConfigurarContrato: '/proveedor/contratos/configurar',
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

  const go = useCallback((screenId, newOpts = {}) => {
    setOpts(newOpts);
    const path = ROUTES[screenId] ?? '/';
    if (screenId.startsWith('ep'))         setRole('empresa-pequena');
    else if (screenId.startsWith('emp'))   setRole('contratante');
    else if (screenId.startsWith('admin')) setRole('admin');
    else if (screenId === 'splash' || screenId === 'login') setRole(null);
    navigate(path);
    window.scrollTo(0, 0);
  }, [navigate]);

  return (
    <AppContext.Provider value={{ screen, role: effectiveRole, setRole, opts, go }}>
      {children}
    </AppContext.Provider>
  );
}

// Co-located with AppProvider deliberately; splitting into a separate file
// would mean touching every one of this hook's ~40 call sites for no
// functional gain.
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext);
}
