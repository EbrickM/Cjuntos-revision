import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useApp, AppProvider } from './state/AppContext';

// Auth
const Splash = lazy(() => import('./pages/auth/Splash'));
const Login = lazy(() => import('./pages/auth/Login'));
const RoleSelect = lazy(() => import('./pages/auth/RoleSelect'));
const SolicitarContrato = lazy(() => import('./pages/auth/SolicitarContrato'));
const KycStep1 = lazy(() => import('./pages/auth/KycWizard').then((m) => ({ default: m.KycStep1 })));
const KycStep2 = lazy(() => import('./pages/auth/KycWizard').then((m) => ({ default: m.KycStep2 })));
const KycStep3 = lazy(() => import('./pages/auth/KycWizard').then((m) => ({ default: m.KycStep3 })));
const KycStep4 = lazy(() => import('./pages/auth/KycWizard').then((m) => ({ default: m.KycStep4 })));

// Admin
const AdminDash = lazy(() => import('./pages/admin/Dashboard'));
const AdminKYC = lazy(() => import('./pages/admin/KYC'));
const AdminEmpresas = lazy(() => import('./pages/admin/Empresas'));
const AdminContratos = lazy(() => import('./pages/admin/Contratos'));
const AdminRisk = lazy(() => import('./pages/admin/AdminRisk'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Empresa Pequeña
const EpHome = lazy(() => import('./pages/empresa-pequena/Home'));
const EpMisProveedores = lazy(() => import('./pages/empresa-pequena/MisProveedores'));
const EpFacturacion = lazy(() => import('./pages/empresa-pequena/Facturacion'));
const EpBilletera = lazy(() => import('./pages/empresa-pequena/Billetera'));
const EpCreditos = lazy(() => import('./pages/empresa-pequena/Creditos'));
const EpPerfil = lazy(() => import('./pages/empresa-pequena/Perfil'));
const EpDocumentos = lazy(() => import('./pages/empresa-pequena/Documentos'));
const EpProyectosAmbientales = lazy(() => import('./pages/empresa-pequena/ProyectosAmbientales'));
const EpSolicitudes = lazy(() => import('./pages/empresa-pequena/Solicitudes'));

// Contratante
const EmpDash = lazy(() => import('./pages/contratante/Dashboard'));
const EmpConf = lazy(() => import('./pages/contratante/Confirming'));
const EmpFactEP = lazy(() => import('./pages/contratante/FacturasEmpresaPequena'));
const EmpVerifContr = lazy(() => import('./pages/contratante/VerifContratos'));
const EmpConfDet = lazy(() => import('./pages/contratante/EmpConfDet'));
const EmpProv = lazy(() => import('./pages/contratante/EmpProv'));
const EmpProvPerfil = lazy(() => import('./pages/contratante/EmpProvPerfil'));
const EmpRisk = lazy(() => import('./pages/contratante/EmpRisk'));
const EmpESG = lazy(() => import('./pages/contratante/EmpESG'));
const EmpNotif = lazy(() => import('./pages/contratante/EmpNotif'));
const EmpSettings = lazy(() => import('./pages/contratante/EmpSettings'));
const EmpContratos = lazy(() => import('./pages/contratante/EmpContratos'));
const EmpFacturas = lazy(() => import('./pages/contratante/EmpFacturas'));
const EmpPymes = lazy(() => import('./pages/contratante/EmpPymes'));
const EmpSolicitudes = lazy(() => import('./pages/contratante/EmpSolicitudes'));
const EmpPerfil = lazy(() => import('./pages/contratante/EmpPerfil'));
const EmpContratoDetalle = lazy(() => import('./pages/contratante/EmpContratoDetalle'));
const EmpNuevaSolicitud = lazy(() => import('./pages/contratante/EmpNuevaSolicitud'));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-6 h-6 animate-spin text-orange" />
    </div>
  );
}

function Router() {
  const { screen } = useApp();

  const screens = {
    // Auth
    splash:      <Splash />,
    login:       <Login />,
    roleSelect:        <RoleSelect />,
    solicitarContrato: <SolicitarContrato />,
    kyc1:        <KycStep1 />,
    kyc2:        <KycStep2 />,
    kyc3:        <KycStep3 />,
    kyc4:        <KycStep4 />,

    // Admin
    adminDash:            <AdminDash />,
    adminKYC:             <AdminKYC />,
    adminConf:            <AdminContratos />,
    adminEmpresas:        <AdminEmpresas />,
    adminRisk:            <AdminRisk />,
    adminAnalytics:       <AdminAnalytics />,
    adminSettings:        <AdminSettings />,

    // Empresa Pequeña
    epHome:           <EpHome />,
    epProveedores:    <EpMisProveedores />,
    epFacturacion:    <EpFacturacion />,
    epCreditos:       <EpCreditos />,
    epBilletera:      <EpBilletera />,
    epPerfil:         <EpPerfil />,
    epDocs:           <EpDocumentos />,
    epESG:            <EpProyectosAmbientales />,
    epSolicitudes:    <EpSolicitudes />,

    // Contratante
    empDash:        <EmpDash />,
    empContratos:       <EmpContratos />,
    empContratoDetalle: <EmpContratoDetalle />,
    empNuevaSolicitud:  <EmpNuevaSolicitud />,
    empFacturas:        <EmpFacturas />,
    empPymes:           <EmpPymes />,
    empSolicitudes:     <EmpSolicitudes />,
    empESG:             <EmpESG />,
    empPerfil:          <EmpPerfil />,
    // legado (accesibles por navegación interna)
    empConf:       <EmpConf />,
    empConfDet:    <EmpConfDet />,
    empFactEP:     <EmpFactEP />,
    empVerifContr: <EmpVerifContr />,
    empProv:       <EmpProv />,
    empProvPerfil: <EmpProvPerfil />,
    empRisk:       <EmpRisk />,
    empNotif:      <EmpNotif />,
    empSettings:   <EmpSettings />,
  };

  return (
    <Suspense fallback={<RouteFallback />}>
      {screens[screen] ?? <Splash />}
    </Suspense>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
