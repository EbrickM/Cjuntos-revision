import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AppProvider, ROUTES } from './state/AppContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import Splash from './pages/auth/Splash';

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
const EmpNuevaSolicitud = lazy(() => import('./pages/contratante/EmpNuevaSolicitud'));

const R = ROUTES;

export default function App() {
  return (
    <AppProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-orange" />
        </div>
      }>
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

          {/* Contratante */}
          <Route path={R.empDash}            element={<EmpDash />} />
          <Route path={R.empContratos}       element={<EmpContratos />} />
          <Route path={R.empContratoDetalle} element={<EmpContratoDetalle />} />
          <Route path={R.empFacturas}        element={<EmpFacturas />} />
          <Route path={R.empPymes}           element={<EmpPymes />} />
          <Route path={R.empSolicitudes}     element={<EmpSolicitudes />} />
          <Route path={R.empESG}             element={<EmpESG />} />
          <Route path={R.empPerfil}          element={<EmpPerfil />} />
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppProvider>
  );
}
