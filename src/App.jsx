import { useApp, AppProvider } from './state/AppContext';

// Auth
import Splash from './pages/auth/Splash';
import Login from './pages/auth/Login';
import RoleSelect from './pages/auth/RoleSelect';
import { KycStep1, KycStep2, KycStep3, KycStep4 } from './pages/auth/KycWizard';

// Admin
import AdminDash from './pages/admin/Dashboard';
import AdminKYC from './pages/admin/KYC';
import AdminEmpresas from './pages/admin/Empresas';
import { AdminConf, AdminRisk, AdminAnalytics, AdminSettings } from './pages/admin/OtherScreens';

// Empresa Pequeña
import EpHome from './pages/empresa-pequena/Home';
import EpMisProveedores from './pages/empresa-pequena/MisProveedores';
import EpFacturacion from './pages/empresa-pequena/Facturacion';
import EpBilletera from './pages/empresa-pequena/Billetera';
import EpCreditos from './pages/empresa-pequena/Creditos';
import EpPerfil from './pages/empresa-pequena/Perfil';
import EpDocumentos from './pages/empresa-pequena/Documentos';

// Contratante
import EmpDash from './pages/contratante/Dashboard';
import EmpConf from './pages/contratante/Confirming';
import EmpFactEP from './pages/contratante/FacturasEmpresaPequena';
import EmpVerifContr from './pages/contratante/VerifContratos';
import { EmpConfDet, EmpProv, EmpProvPerfil, EmpRisk, EmpESG, EmpNotif, EmpSettings } from './pages/contratante/OtherScreens';

function Router() {
  const { screen } = useApp();

  const screens = {
    // Auth
    splash:      <Splash />,
    login:       <Login />,
    roleSelect:  <RoleSelect />,
    kyc1:        <KycStep1 />,
    kyc2:        <KycStep2 />,
    kyc3:        <KycStep3 />,
    kyc4:        <KycStep4 />,

    // Admin
    adminDash:            <AdminDash />,
    adminKYC:             <AdminKYC />,
    adminConf:            <AdminConf />,
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

    // Contratante
    empDash:       <EmpDash />,
    empConf:       <EmpConf />,
    empConfDet:    <EmpConfDet />,
    empFactEP:     <EmpFactEP />,
    empVerifContr: <EmpVerifContr />,
    empProv:       <EmpProv />,
    empProvPerfil: <EmpProvPerfil />,
    empRisk:       <EmpRisk />,
    empESG:        <EmpESG />,
    empNotif:      <EmpNotif />,
    empSettings:   <EmpSettings />,
  };

  return screens[screen] ?? <Splash />;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
