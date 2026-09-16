import { lazy, Suspense, useEffect, useState } from 'react';
import { AppProvider, ROUTES } from './state/AppContext';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Splash from './pages/auth/Splash';
import BonafideLoader from './components/common/BonafideLoader';

// Auth
const Login             = lazy(() => import('./pages/auth/Login'));
const RoleSelect        = lazy(() => import('./pages/auth/RoleSelect'));
const SolicitarContrato = lazy(() => import('./pages/auth/SolicitarContrato'));
const KycStep1 = lazy(() => import('./pages/auth/KycWizard').then(m => ({ default: m.KycStep1 })));
const KycStep2 = lazy(() => import('./pages/auth/KycWizard').then(m => ({ default: m.KycStep2 })));
const KycStep3 = lazy(() => import('./pages/auth/KycWizard').then(m => ({ default: m.KycStep3 })));
const KycStep4 = lazy(() => import('./pages/auth/KycWizard').then(m => ({ default: m.KycStep4 })));

// Admin
const AdminDash      = lazy(() => import('./pages/admin/Dashboard'));
const AdminKYC       = lazy(() => import('./pages/admin/KYC'));
const AdminEmpresas  = lazy(() => import('./pages/admin/Empresas'));
const AdminContratos = lazy(() => import('./pages/admin/Contratos'));
const AdminRisk      = lazy(() => import('./pages/admin/AdminRisk'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings  = lazy(() => import('./pages/admin/AdminSettings'));
const AdminGobierno  = lazy(() => import('./pages/admin/InformacionGubernamental'));

// Empresa Pequeña
const EpHome                = lazy(() => import('./pages/empresa-pequena/Home'));
const EpMisProveedores      = lazy(() => import('./pages/empresa-pequena/MisProveedores'));
const EpFacturacion         = lazy(() => import('./pages/empresa-pequena/Facturacion'));
const EpBilletera           = lazy(() => import('./pages/empresa-pequena/Billetera'));
const EpCreditos            = lazy(() => import('./pages/empresa-pequena/Creditos'));
const EpPerfil              = lazy(() => import('./pages/empresa-pequena/Perfil'));
const EpDocumentos          = lazy(() => import('./pages/empresa-pequena/Documentos'));
const EpProyectosAmbientales = lazy(() => import('./pages/empresa-pequena/ProyectosAmbientales'));
const EpSolicitudes         = lazy(() => import('./pages/empresa-pequena/Solicitudes'));
const EpConfigurarContrato  = lazy(() => import('./pages/empresa-pequena/EpConfigurarContrato'));

// Contratante
const EmpDash           = lazy(() => import('./pages/contratante/Dashboard'));
const EmpConf           = lazy(() => import('./pages/contratante/Confirming'));
const EmpFactEP         = lazy(() => import('./pages/contratante/FacturasEmpresaPequena'));
const EmpVerifContr     = lazy(() => import('./pages/contratante/VerifContratos'));
const EmpConfDet        = lazy(() => import('./pages/contratante/EmpConfDet'));
const EmpProv           = lazy(() => import('./pages/contratante/EmpProv'));
const EmpProvPerfil     = lazy(() => import('./pages/contratante/EmpProvPerfil'));
const EmpRisk           = lazy(() => import('./pages/contratante/EmpRisk'));
const EmpESG            = lazy(() => import('./pages/contratante/EmpESG'));
const EmpNotif          = lazy(() => import('./pages/contratante/EmpNotif'));
const EmpSettings       = lazy(() => import('./pages/contratante/EmpSettings'));
const EmpContratos      = lazy(() => import('./pages/contratante/EmpContratos'));
const EmpFacturas       = lazy(() => import('./pages/contratante/EmpFacturas'));
const EmpPymes          = lazy(() => import('./pages/contratante/EmpPymes'));
const EmpSolicitudes    = lazy(() => import('./pages/contratante/EmpSolicitudes'));
const EmpPerfil         = lazy(() => import('./pages/contratante/EmpPerfil'));
const EmpContratoDetalle = lazy(() => import('./pages/contratante/EmpContratoDetalle'));
const EmpConfigurarContrato = lazy(() => import('./pages/contratante/EmpConfigurarContrato'));

// Proveedor (sin dashboard propio)
const ProvConfigurarContrato = lazy(() => import('./pages/proveedor/ProvConfigurarContrato'));

const R = ROUTES;

export default function App() {
  const location = useLocation();
  // Al recargar en cualquier pantalla (no solo "/") se muestra brevemente la
  // misma animación de carga de marca antes de renderizar la ruta pedida —
  // "/" ya tiene su propio splash (más largo, con redirección incluida), así
  // que este gate se salta ahí para no mostrar el loader dos veces seguidas.
  const [booting, setBooting] = useState(location.pathname !== R.splash);

  useEffect(() => {
    if (!booting) return;
    const timer = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(timer);
  }, [booting]);

  if (booting) return <BonafideLoader />;

  return (
    <AppProvider>
      <Suspense fallback={<BonafideLoader />}>
        <Routes>
          {/* Auth */}
          <Route path={R.splash}            element={<Splash />} />
          <Route path={R.login}             element={<Login />} />
          <Route path={R.roleSelect}        element={<RoleSelect />} />
          <Route path={R.solicitarContrato} element={<SolicitarContrato />} />
          <Route path={R.kyc1}              element={<KycStep1 />} />
          <Route path={R.kyc2}              element={<KycStep2 />} />
          <Route path={R.kyc3}              element={<KycStep3 />} />
          <Route path={R.kyc4}              element={<KycStep4 />} />

          {/* Admin */}
          <Route path={R.adminDash}       element={<AdminDash />} />
          <Route path={R.adminKYC}        element={<AdminKYC />} />
          <Route path={R.adminConf}       element={<AdminContratos />} />
          <Route path={R.adminEmpresas}   element={<AdminEmpresas />} />
          <Route path={R.adminRisk}       element={<AdminRisk />} />
          <Route path={R.adminAnalytics}  element={<AdminAnalytics />} />
          <Route path={R.adminSettings}   element={<AdminSettings />} />
          <Route path={R.adminGobierno}   element={<AdminGobierno />} />

          {/* Empresa Pequeña */}
          <Route path={R.epHome}        element={<EpHome />} />
          <Route path={R.epProveedores} element={<EpMisProveedores />} />
          <Route path={R.epFacturacion} element={<EpFacturacion />} />
          <Route path={R.epCreditos}    element={<EpCreditos />} />
          <Route path={R.epBilletera}   element={<EpBilletera />} />
          <Route path={R.epPerfil}      element={<EpPerfil />} />
          <Route path={R.epDocs}        element={<EpDocumentos />} />
          <Route path={R.epESG}         element={<EpProyectosAmbientales />} />
          <Route path={R.epSolicitudes} element={<EpSolicitudes />} />
          <Route path={R.epConfigurarContrato} element={<EpConfigurarContrato />} />
          <Route path={R.epSolicitarContrato} element={<SolicitarContrato />} />

          {/* Contratante */}
          <Route path={R.empDash}            element={<EmpDash />} />
          <Route path={R.empContratos}       element={<EmpContratos />} />
          <Route path={R.empContratoDetalle} element={<EmpContratoDetalle />} />
          <Route path={R.empConfigurarContrato} element={<EmpConfigurarContrato />} />
          <Route path={R.empFacturas}        element={<EmpFacturas />} />
          <Route path={R.empPymes}           element={<EmpPymes />} />
          <Route path={R.empSolicitudes}     element={<EmpSolicitudes />} />
          <Route path={R.empESG}             element={<EmpESG />} />
          <Route path={R.empPerfil}          element={<EmpPerfil />} />
          <Route path={R.empSolicitarContrato} element={<SolicitarContrato />} />
          {/* Legado */}
          <Route path={R.empConf}       element={<EmpConf />} />
          <Route path={R.empConfDet}    element={<EmpConfDet />} />
          <Route path={R.empFactEP}     element={<EmpFactEP />} />
          <Route path={R.empVerifContr} element={<EmpVerifContr />} />
          <Route path={R.empProv}       element={<EmpProv />} />
          <Route path={R.empProvPerfil} element={<EmpProvPerfil />} />
          <Route path={R.empRisk}       element={<EmpRisk />} />
          <Route path={R.empNotif}      element={<EmpNotif />} />
          <Route path={R.empSettings}   element={<EmpSettings />} />

          {/* Proveedor */}
          <Route path={R.provConfigurarContrato} element={<ProvConfigurarContrato />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppProvider>
  );
}
