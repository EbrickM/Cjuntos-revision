import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, ROUTES } from './state/AppContext';

// Auth
import Splash from './pages/auth/Splash';
import Login from './pages/auth/Login';
import RoleSelect from './pages/auth/RoleSelect';
import SolicitarContrato from './pages/auth/SolicitarContrato';
import { KycStep1, KycStep2, KycStep3, KycStep4 } from './pages/auth/KycWizard';

// Admin
import AdminDash from './pages/admin/Dashboard';
import AdminKYC from './pages/admin/KYC';
import AdminEmpresas from './pages/admin/Empresas';
import AdminContratos from './pages/admin/Contratos';
import { AdminRisk, AdminAnalytics, AdminSettings } from './pages/admin/OtherScreens';

// Empresa Pequeña
import EpHome from './pages/empresa-pequena/Home';
import EpMisProveedores from './pages/empresa-pequena/MisProveedores';
import EpFacturacion from './pages/empresa-pequena/Facturacion';
import EpBilletera from './pages/empresa-pequena/Billetera';
import EpCreditos from './pages/empresa-pequena/Creditos';
import EpPerfil from './pages/empresa-pequena/Perfil';
import EpDocumentos from './pages/empresa-pequena/Documentos';
import EpProyectosAmbientales from './pages/empresa-pequena/ProyectosAmbientales';
import EpSolicitudes, { EpNuevaSolicitud } from './pages/empresa-pequena/Solicitudes';

// Contratante
import EmpDash from './pages/contratante/Dashboard';
import EmpConf from './pages/contratante/Confirming';
import EmpFactEP from './pages/contratante/FacturasEmpresaPequena';
import EmpVerifContr from './pages/contratante/VerifContratos';
import { EmpConfDet, EmpProv, EmpProvPerfil, EmpRisk, EmpESG, EmpNotif, EmpSettings } from './pages/contratante/OtherScreens';
import { EmpContratos, EmpFacturas, EmpPymes, EmpSolicitudes, EmpPerfil, EmpContratoDetalle, EmpNuevaSolicitud } from './pages/contratante/ContratanteScreens';

const R = ROUTES;

export default function App() {
  return (
    <AppProvider>
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
        <Route path={R.epHome}            element={<EpHome />} />
        <Route path={R.epProveedores}     element={<EpMisProveedores />} />
        <Route path={R.epFacturacion}     element={<EpFacturacion />} />
        <Route path={R.epCreditos}        element={<EpCreditos />} />
        <Route path={R.epBilletera}       element={<EpBilletera />} />
        <Route path={R.epPerfil}          element={<EpPerfil />} />
        <Route path={R.epDocs}            element={<EpDocumentos />} />
        <Route path={R.epESG}             element={<EpProyectosAmbientales />} />
        <Route path={R.epNuevaSolicitud}  element={<EpNuevaSolicitud />} />
        <Route path={R.epSolicitudes}     element={<EpSolicitudes />} />

        {/* Contratante */}
        <Route path={R.empDash}            element={<EmpDash />} />
        <Route path={R.empContratos}       element={<EmpContratos />} />
        <Route path={R.empContratoDetalle} element={<EmpContratoDetalle />} />
        <Route path={R.empNuevaSolicitud}  element={<EmpNuevaSolicitud />} />
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
    </AppProvider>
  );
}
