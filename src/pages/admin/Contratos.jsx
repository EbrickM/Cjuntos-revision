import { useState } from 'react';
import { CheckCircle2, Trash2, Building2, Plus, ScrollText, Search, ListFilter, Eye, AlertTriangle, Send, X } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import BackButton from '../../components/common/BackButton';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';

const BANCO_FONDEADORES = ['Bonafide', 'VistaBank', 'CCEIBank', 'Vigifi Bange', 'ECOBank'];

const EMPRESAS_CONTRATANTES = ['TotalEnerGE SA', 'Infraconst. SA', 'MinGE Sociedad Est.', 'AgroGE Holdings'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PREFIJO_TEL_GQ = '+240';

const formatDateDDMMYYYY = (d = new Date()) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const formatDateAddDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + (Number(days) || 0));
  return formatDateDDMMYYYY(d);
};

const formatXaf = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;
const pct = (part, total) => total > 0 ? ((part / total) * 100).toFixed(1) : '0.0';

// Estados válidos según el flujo BPMN de configuración de contrato: Bonafide
// registra la ficha (Fase 1) → la Contratante la configura repartiéndola
// entre sus PYMEs (Subproceso 1) → cada PYME acepta términos y reparte su
// parte entre Proveedores (Subproceso 2) → cada Proveedor reparte la suya
// entre Suministradores (Subproceso 3) → Bonafide valida y activa (Fase 3).
// 'Con Requerimientos' y 'En Discusión de Términos' son las dos ramas de
// rechazo del diagrama (Bonafide pide corrección / la PYME rechaza términos).
const contractBadge = (estado) => ({
  'Pendiente de Configuración': { variant: 'yellow', label: 'Pend. Configuración' },
  'Pendiente de Revisión':      { variant: 'blue',   label: 'Pend. Revisión' },
  'Con Requerimientos':         { variant: 'orange', label: 'Con Requerimientos' },
  'En Discusión de Términos':   { variant: 'orange', label: 'En Discusión' },
  'Activo':                     { variant: 'green',  label: 'Activo' },
}[estado] ?? { variant: 'yellow', label: estado || 'Pendiente' });

const ESTADOS_FILTRO = ['Todos', 'Pendiente de Configuración', 'Pendiente de Revisión', 'Con Requerimientos', 'En Discusión de Términos', 'Activo'];

const ENTIDADES_REQUERIMIENTO = ['Empresa Contratante', 'PYME', 'Proveedor'];
const REQ_MODAL_EMPTY = { open: false, contractId: null, entidades: [], pymes: [], proveedores: [], mensaje: '' };

const TABS = [
  { id: 'contratante',  label: 'Datos del Contratante' },
  { id: 'distribucion', label: 'Distribución del crédito' },
  { id: 'facturas',     label: 'Facturas' },
];

const initialContracts = [
  {
    id: 'CTR-2026-001', pymeNombre: 'Construcciones Silva Ltd.',
    monto: 58000000, asignado: 0, disponible: 58000000,
    estado: 'Pendiente de Configuración',
    nota: 'Contrato registrado por Bonafide. En espera de que la Empresa Contratante lo configure y lo reparta entre sus PYMEs.',
    contratante: {
      razonSocial: '', nombreComercial: '', ruc: '', sectorProductivo: '',
      telefonoCorporativo: '', correoCorporativo: '', objetoTrabajo: '',
      documentoContrato: null, montoGlobal: '', fechaInicio: '', fechaFin: '', plazosEjecucion: '',
      repNombre: '', repTipoDoc: '', repIdentificacion: '', repCargo: '', repTelefono: '', repCorreo: '',
      confirmado: false,
    },
    distribucion: [], facturas: [],
  },
  {
    id: 'CTR-2026-003', pymeNombre: 'Pinturas Bata SL',
    monto: 31000000, asignado: 0, disponible: 31000000,
    estado: 'En Discusión de Términos',
    nota: 'La PYME rechazó los términos del contrato. Bonafide debe contactar a ambas partes para resolver el desacuerdo.',
    contratante: {
      razonSocial: 'Petro Guinea S.A.', nombreComercial: 'PetroGE', ruc: 'GE-2019-00891', sectorProductivo: 'Energía',
      telefonoCorporativo: '+240 222 456 789', correoCorporativo: 'contratos@petroguinea.gq',
      objetoTrabajo: 'Suministro de combustible y lubricantes industriales para operaciones en tierra y plataformas offshore.',
      documentoContrato: null, montoGlobal: '31000000',
      fechaInicio: '2026-03-01', fechaFin: '2026-12-31', plazosEjecucion: '10 meses',
      repNombre: 'Carlos Obiang Mba', repTipoDoc: 'Pasaporte', repIdentificacion: 'GE-1985-00234',
      repCargo: 'Director Comercial', repTelefono: '+240 222 456 780', repCorreo: 'cobiang@petroguinea.gq',
      confirmado: false,
    },
    distribucion: [], facturas: [],
  },
  {
    id: 'CTR-2026-004', pymeNombre: 'LogiRapid GE',
    monto: 75000000, asignado: 0, disponible: 75000000,
    estado: 'Pendiente de Revisión',
    nota: 'La Empresa Contratante ya configuró el contrato. Revisa los datos y autorízalo para activarlo.',
    // Un mismo contrato-marco puede repartirse entre varias PYMEs
    // (Subproceso 1), por eso un requerimiento dirigido a "PYME" debe poder
    // apuntar a una o más de ellas, no asumir que solo hay una.
    pymesAsignadas: ['LogiRapid GE', 'Transportes Ecuato SL'],
    contratante: {
      razonSocial: 'Ministerio de Obras Públicas e Infraestructuras', nombreComercial: 'MOPI-GE', ruc: 'GE-2015-00042', sectorProductivo: 'Construcción',
      telefonoCorporativo: '+240 222 001 002', correoCorporativo: 'adm@obras.gob.gq',
      objetoTrabajo: 'Construcción y pavimentación de 12 km de infraestructura vial en la zona norte de Malabo, incluyendo drenajes y señalización.',
      documentoContrato: null, montoGlobal: '75000000',
      fechaInicio: '2026-01-15', fechaFin: '2027-01-15', plazosEjecucion: '12 meses',
      repNombre: 'Eugenio Ndong Esono', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1972-00089',
      repCargo: 'Secretario General', repTelefono: '+240 222 001 003', repCorreo: 'endong@obras.gob.gq',
      confirmado: true,
    },
    distribucion: [
      { id: 'dist-101', concepto: 'Pago a Proveedor', monto: 12_000_000, providerId: 'p10', providerName: 'ViaLogix GE',         providerSector: 'Logística' },
      { id: 'dist-102', concepto: 'Pago a Proveedor', monto: 8_000_000,  providerId: 'p11', providerName: 'Materiales del Norte', providerSector: 'Materiales' },
    ],
    facturas: [],
  },
  {
    id: 'CTR-2026-007', pymeNombre: 'ServTec GE',
    monto: 18500000, asignado: 0, disponible: 18500000,
    estado: 'Con Requerimientos',
    nota: 'La configuración enviada no cumple los requisitos. Se solicitó una corrección a la parte responsable.',
    // Todo contrato "Con Requerimientos" trae un mensaje del admin dirigido a
    // una o más entidades (Contratante/PYME/Proveedor) indicando qué corregir.
    requerimiento: {
      entidades: ['PYME'],
      mensaje: 'La PYME ServTec GE no adjuntó la documentación de respaldo requerida para validar el monto asignado por el contratante. Favor de adjuntar el contrato comercial actualizado antes de continuar con la autorización.',
      fecha: '11/07/2026',
    },
    contratante: {
      razonSocial: 'GEPetrol S.A.', nombreComercial: 'GEPetrol', ruc: 'GE-2010-00056', sectorProductivo: 'Energía',
      telefonoCorporativo: '+240 222 100 200', correoCorporativo: 'admin@gepetrol.gq',
      objetoTrabajo: 'Mantenimiento y soporte técnico de sistemas informáticos y redes de comunicación en las instalaciones de GEPetrol en Malabo.',
      documentoContrato: null, montoGlobal: '18500000',
      fechaInicio: '2026-05-01', fechaFin: '2026-10-31', plazosEjecucion: '6 meses',
      repNombre: 'Anastasio Ndong Ela', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1981-00203',
      repCargo: 'Director de Operaciones', repTelefono: '+240 222 100 201', repCorreo: 'andong@gepetrol.gq',
      confirmado: true,
    },
    distribucion: [], facturas: [],
  },
  {
    id: 'CTR-2026-002', pymeNombre: 'Construcciones Silva Ltd.',
    monto: 42000000, asignado: 9000000, disponible: 33000000,
    estado: 'Activo', nota: '',
    contratante: {
      razonSocial: 'Evans Construction & Engineering S.A.', nombreComercial: 'Evans GE', ruc: 'GE-2021-00278', sectorProductivo: 'Construcción',
      telefonoCorporativo: '+240 222 909 111', correoCorporativo: 'admin@evans.gq',
      objetoTrabajo: 'Obras de edificación, remodelación integral y adecuación de oficinas corporativas en el complejo empresarial de Sipopo.',
      documentoContrato: null, montoGlobal: '42000000',
      fechaInicio: '2026-02-01', fechaFin: '2026-08-01', plazosEjecucion: '6 meses',
      repNombre: 'John Evans Jr.', repTipoDoc: 'Pasaporte', repIdentificacion: 'GE-1980-00145',
      repCargo: 'CEO & Representante Legal', repTelefono: '+240 222 909 112', repCorreo: 'jevans@evans.gq',
      confirmado: true,
    },
    distribucion: [
      { id: 'dist-001', concepto: 'Pago a Proveedor', monto: 9000000, providerId: 'p2', providerName: 'TransGE S.L.', providerSector: 'Transporte' },
    ],
    facturas: [
      { id: 'FAC-2026-1025', tipo: 'proveedor',   monto: 4500000,  estado: 'Enviada', concepto: 'Transporte de materiales al sitio de obra',          fecha: '01/05/2026', proveedor: 'TransGE S.L.' },
      { id: 'FAC-2026-1031', tipo: 'contratante', monto: 18000000, estado: 'Pagada',  concepto: 'Avance de obra fase 1 – Cimentación y estructura',   fecha: '10/05/2026' },
    ],
  },
  {
    id: 'CTR-2026-005', pymeNombre: 'TransGE S.L.',
    monto: 25000000, asignado: 0, disponible: 25000000,
    estado: 'Activo', nota: '',
    contratante: {
      razonSocial: 'Autoridad Portuaria de Bata S.A.', nombreComercial: 'BataPort', ruc: 'GE-2018-00317', sectorProductivo: 'Transporte',
      telefonoCorporativo: '+240 222 654 321', correoCorporativo: 'admin@bataporto.gq',
      objetoTrabajo: 'Gestión operativa, mantenimiento preventivo y correctivo de instalaciones y equipos en el Puerto de Bata.',
      documentoContrato: null, montoGlobal: '25000000',
      fechaInicio: '2026-04-01', fechaFin: '2027-03-31', plazosEjecucion: '12 meses',
      repNombre: 'María Esono Nguema', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1979-00312',
      repCargo: 'Directora General', repTelefono: '+240 222 654 322', repCorreo: 'mesono@bataporto.gq',
      confirmado: true,
    },
    distribucion: [], facturas: [],
  },
];

const ReadField = ({ label, value, multiline = false }) => (
  <div>
    <div className="text-[11px] font-semibold text-text-5 uppercase tracking-[0.5px] mb-1">{label}</div>
    <div className={`text-[13px] text-text-2 bg-page-bg rounded-[8px] px-3 py-2 min-h-[36px] ${multiline ? 'leading-relaxed whitespace-pre-wrap' : 'flex items-center'}`}>
      {value || <span className="text-text-5 italic">Sin datos</span>}
    </div>
  </div>
);

const CardHeader = ({ title, sub, Icon, right }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
    <div className="flex items-center gap-3">
      <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-[14px] font-bold text-text-1">{title}</div>
        {sub && <div className="text-[11px] text-text-4">{sub}</div>}
      </div>
    </div>
    {right}
  </div>
);

export default function AdminContratos() {
  const [contracts, setContracts] = useState(initialContracts);
  const [detailId, setDetailId]   = useState(null);
  const [activeTab, setActiveTab] = useState('contratante');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [newModal, setNewModal]   = useState({ open: false });
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [search, setSearch]             = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [reviewModal, setReviewModal]   = useState(null);
  const [reqModal, setReqModal]         = useState(REQ_MODAL_EMPTY);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4500);
  };

  const openNewModal = () => setNewModal({ open: true });
  const closeNewModal = () => setNewModal({ open: false });

  const handleCreateContract = () => {
    const { monto, intereses, plazoPago, retencion, gestionCobranza } = newModal;
    const montoNum = Number(monto) || 0;
    const emailValido = EMAIL_RE.test((newModal.email || '').trim());
    const telDgts = (newModal.telefono || '').replace(/\D/g, '');
    const telValido = !newModal.telefono || (telDgts.length >= 7 && telDgts.length <= 9);
    if (montoNum <= 0 || !newModal.empresaContratante || !newModal.email || !emailValido || !telValido || !newModal.bancoFondeador) return;

    const lastId = contracts
      .map(c => parseInt((c.id.match(/(\d+)$/) || [])[1], 10))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => b - a)[0] || 0;
    const newId = `CTR-2026-${String(lastId + 1).padStart(3, '0')}`;

    const nuevoContrato = {
      id: newId, pymeNombre: '—',
      monto: montoNum, asignado: 0, disponible: montoNum,
      estado: 'Pendiente de Configuración',
      nota: 'Contrato creado por el administrador. En espera de que la Empresa Contratante lo configure y lo reparta entre sus PYMEs.',
      contratante: {
        razonSocial: newModal.empresaContratante, nombreComercial: '',
        ruc: '', sectorProductivo: '',
        telefonoCorporativo: newModal.telefono ? `${PREFIJO_TEL_GQ} ${telDgts}` : '', correoCorporativo: newModal.email,
        objetoTrabajo: '', documentoContrato: null, montoGlobal: String(montoNum),
        fechaInicio: '', fechaFin: '', plazosEjecucion: `${plazoPago} días`,
        repNombre: '', repTipoDoc: '', repIdentificacion: '', repCargo: '', repTelefono: '', repCorreo: '',
        confirmado: false,
      },
      distribucion: [], facturas: [],
      financiero: {
        intereses: Number(intereses) || 0,
        plazoPago,
        bancoFondeador: newModal.bancoFondeador,
        retencion: Number(retencion) || 0,
        gestionCobranza: Number(gestionCobranza) || 0,
        fecha: formatDateDDMMYYYY(),
      },
    };

    setContracts(prev => [nuevoContrato, ...prev]);
    setNewModal({ open: false });
    showToast(`Contrato ${newId} creado. Pendiente de configuración por la Empresa Contratante.`);
  };

  const newEmailValido = EMAIL_RE.test((newModal.email || '').trim());
  const newTelDgts = (newModal.telefono || '').replace(/\D/g, '');
  const newTelValido = newTelDgts.length >= 7 && newTelDgts.length <= 9;
  const newFormValido = Boolean(
    newModal.empresaContratante &&
    newModal.bancoFondeador &&
    Number(newModal.monto) > 0 &&
    newModal.email && newEmailValido &&
    (!newModal.telefono || newTelValido)
  );

  const detailContract = detailId ? (contracts.find(c => c.id === detailId) ?? null) : null;

  const handleAuthorize = (id) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, estado: 'Activo', nota: '' } : c));
    showToast(`Contrato ${id} autorizado. La PYME ya puede distribuir el crédito.`);
  };

  const reqContract = reqModal.contractId ? contracts.find(c => c.id === reqModal.contractId) : null;
  const pymesDisponibles = reqContract
    ? (reqContract.pymesAsignadas?.length ? reqContract.pymesAsignadas : [reqContract.pymeNombre].filter(Boolean))
    : [];
  const proveedoresDisponibles = reqContract
    ? [...new Set((reqContract.distribucion || []).map(d => d.providerName).filter(Boolean))]
    : [];

  const toggleReqEntidad = (ent) => setReqModal(m => ({
    ...m,
    entidades: m.entidades.includes(ent) ? m.entidades.filter(x => x !== ent) : [...m.entidades, ent],
  }));
  const toggleReqPyme = (p) => setReqModal(m => ({
    ...m, pymes: m.pymes.includes(p) ? m.pymes.filter(x => x !== p) : [...m.pymes, p],
  }));
  const toggleReqProveedor = (p) => setReqModal(m => ({
    ...m, proveedores: m.proveedores.includes(p) ? m.proveedores.filter(x => x !== p) : [...m.proveedores, p],
  }));

  const reqFaltaSeleccionPyme       = reqModal.entidades.includes('PYME')      && pymesDisponibles.length > 0       && reqModal.pymes.length === 0;
  const reqFaltaSeleccionProveedor  = reqModal.entidades.includes('Proveedor') && proveedoresDisponibles.length > 0 && reqModal.proveedores.length === 0;
  const reqPuedeEnviar = reqModal.entidades.length > 0 && reqModal.mensaje.trim() && !reqFaltaSeleccionPyme && !reqFaltaSeleccionProveedor;

  const handleEnviarRequerimiento = () => {
    if (!reqPuedeEnviar) return;
    const mensaje = reqModal.mensaje.trim();
    setContracts(prev => prev.map(c => c.id === reqModal.contractId ? {
      ...c,
      estado: 'Con Requerimientos',
      nota: mensaje,
      requerimiento: {
        entidades: reqModal.entidades,
        pymes: reqModal.pymes,
        proveedores: reqModal.proveedores,
        mensaje,
        fecha: formatDateDDMMYYYY(),
      },
    } : c));
    showToast(`Requerimiento enviado para el contrato ${reqModal.contractId}.`);
    setReqModal(REQ_MODAL_EMPTY);
  };

  const handleDelete = (id) => {
    setContracts(prev => prev.filter(c => c.id !== id));
    if (detailId === id) setDetailId(null);
    setDeleteModal({ open: false, id: null });
    showToast(`Contrato ${id} eliminado.`);
  };

  const openDetail = (id) => { setDetailId(id); setActiveTab('contratante'); };

  const totalContratos     = contracts.length;
  const activosContratos   = contracts.filter(c => c.estado === 'Activo').length;
  const pendientesConfig   = contracts.filter(c => c.estado === 'Pendiente de Configuración').length;
  const pendientesRevision = contracts.filter(c => c.estado === 'Pendiente de Revisión').length;
  const requierenAtencion  = contracts.filter(c => c.estado === 'Con Requerimientos' || c.estado === 'En Discusión de Términos').length;

  const filteredContracts = contracts.filter(c => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      c.id.toLowerCase().includes(q) ||
      (c.pymeNombre || '').toLowerCase().includes(q) ||
      (c.contratante?.razonSocial || '').toLowerCase().includes(q);
    const matchesEstado = filtroEstado === 'Todos' || c.estado === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => (b.estado === 'Pendiente de Revisión') - (a.estado === 'Pendiente de Revisión'));

  return (
    <AppShell active="adminConf" role="admin" title="Contratos" sub="Todos los contratos de crédito">
      <div className="fade-in">

        {/* ── LISTA ── */}
        {detailId === null ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              {[
                { value: totalContratos,     label: 'Contratos totales',           numCls: 'text-text-1'      },
                { value: activosContratos,   label: 'Contratos activos',           numCls: 'text-green-text'  },
                { value: pendientesConfig,   label: 'Pendientes de Configuración', numCls: 'text-yellow-text' },
                { value: pendientesRevision, label: 'Pendientes de Revisión',      numCls: 'text-blue-text'   },
                { value: requierenAtencion,  label: 'Requieren Atención',          numCls: 'text-red-text'    },
              ].map(({ value, label, numCls }) => (
                <div key={label} className="bg-white rounded-[14px] border border-border p-4">
                  <div className={`text-[36px] font-extrabold leading-none mb-2 ${numCls}`}>{value}</div>
                  <div className="text-[12px] text-text-4 leading-snug">{label}</div>
                </div>
              ))}
            </div>

            {/* Listado de contratos */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <CardHeader
                title="Contratos"
                sub="Todos los contratos de crédito, pendientes de autorización y activos"
                Icon={ScrollText}
                right={
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{contracts.length} registrados</span>
                    <Button variant="primary" size="sm" onClick={openNewModal}>
                      <Plus className="w-3.5 h-3.5" />
                      Nuevo contrato
                    </Button>
                  </div>
                }
              />

              {/* Buscador + filtro de estado */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por Nº de contrato, PYME o contratante…"
                    className="w-full pl-8 pr-3 py-2 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
                  />
                </div>
                <div className="relative flex items-center shrink-0">
                  <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
                  <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    className="h-9 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                  >
                    {ESTADOS_FILTRO.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              {/* Móvil: cards */}
              <div className="sm:hidden space-y-2">
                {sortedContracts.map(c => {
                  const badge  = contractBadge(c.estado);
                  const pctVal = parseFloat(pct(c.asignado, c.monto));
                  return (
                    <div
                      key={c.id}
                      onClick={() => openDetail(c.id)}
                      className={`rounded-[12px] border px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-orange-tint/40 transition-colors ${c.estado === 'Pendiente de Revisión' ? 'border-orange/40 bg-orange-tint/20' : 'border-border'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-text-1">{c.id}</span>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <div className="text-[12px] font-semibold text-text-3 truncate mt-0.5">{c.pymeNombre}</div>
                        {c.contratante?.razonSocial && (
                          <div className="text-[11px] text-text-5 truncate">{c.contratante.razonSocial}</div>
                        )}
                        {c.estado === 'Activo' && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-[4px] bg-page-bg rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pctVal, 100)}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
                            </div>
                            <span className="text-[10px] font-bold text-orange-dark shrink-0">{pctVal}%</span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        <div onClick={e => e.stopPropagation()}>
                          {c.estado === 'Pendiente de Revisión' && (
                            <button
                              onClick={() => setReviewModal(c)}
                              title="Ver detalles y revisar"
                              className="p-1.5 rounded-[8px] hover:bg-blue-bg transition text-text-4 hover:text-blue-text cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteModal({ open: true, id: c.id })}
                            title="Eliminar contrato"
                            className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[12px] font-bold text-text-1 whitespace-nowrap ml-1">{formatXaf(c.monto)}</span>
                      </div>
                    </div>
                  );
                })}
                {sortedContracts.length === 0 && (
                  <div className="text-[12px] text-text-4 text-center py-8">No se encontraron contratos con los filtros aplicados.</div>
                )}
              </div>

              {/* Desktop: tabla */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <thead className="bg-page-bg">
                    <tr className="border-b border-border">
                      {['Contrato', 'PYME', 'Contratante', 'Estado', 'Monto', 'Asignado', 'Acciones'].map((h, i) => (
                        <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                          ${i === 0 ? 'text-left' : i === 4 ? 'text-right' : 'text-center'}
                        `}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedContracts.map(c => {
                      const badge  = contractBadge(c.estado);
                      const pctVal = parseFloat(pct(c.asignado, c.monto));
                      return (
                        <tr
                          key={c.id}
                          onClick={() => openDetail(c.id)}
                          className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-orange-tint/40 ${c.estado === 'Pendiente de Revisión' ? 'bg-orange-tint/30' : ''}`}
                        >
                          <td className="px-4 py-3 text-[12px] font-bold text-text-1 whitespace-nowrap">{c.id}</td>
                          <td className="px-4 py-3 text-[12px] font-semibold text-text-1 whitespace-nowrap">{c.pymeNombre}</td>
                          <td className="px-4 py-3 text-[12px] text-text-4 max-w-[240px]">
                            {c.contratante?.razonSocial ? (
                              <span className="block truncate">{c.contratante.razonSocial}</span>
                            ) : (
                              <span className="text-text-5 italic">Sin datos</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-[12px] font-bold text-text-1 whitespace-nowrap">{formatXaf(c.monto)}</div>
                            {c.estado === 'Activo' && (
                              <div className="text-[10px] text-text-5 whitespace-nowrap">Disp: {formatXaf(c.disponible)}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {c.estado === 'Activo' ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-20 h-[5px] bg-page-bg rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pctVal, 100)}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
                                </div>
                                <span className="text-[10px] font-bold text-orange-dark shrink-0">{pctVal}%</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-text-5">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                              {c.estado === 'Pendiente de Revisión' && (
                                <button
                                  onClick={() => setReviewModal(c)}
                                  title="Ver detalles y revisar"
                                  className="p-1.5 rounded-[8px] hover:bg-blue-bg transition text-text-4 hover:text-blue-text cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteModal({ open: true, id: c.id })}
                                title="Eliminar contrato"
                                className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {sortedContracts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[12px] text-text-4">No se encontraron contratos con los filtros aplicados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>

        /* ── DETALLE ── */
        ) : detailContract ? (
          <>
            {/* Breadcrumb + acciones */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <BackButton onClick={() => setDetailId(null)} label="Contratos" className="mb-0" />
              <span className="text-text-5">/</span>
              <span className="text-[14px] font-bold text-text-1">{detailContract.id}</span>
              <Badge variant={contractBadge(detailContract.estado).variant}>
                {detailContract.estado}
              </Badge>
              <div className="inline-flex items-center gap-1.5 bg-orange-tint text-orange text-[11px] font-semibold px-2 py-0.5 rounded-full border border-orange/20">
                <Building2 className="w-3 h-3" />
                {detailContract.pymeNombre}
              </div>
              <div className="flex-1" />
              {detailContract.estado === 'Pendiente de Revisión' && (
                <Button variant="success" onClick={() => handleAuthorize(detailContract.id)}>
                  <CheckCircle2 className="w-4 h-4" />
                  Autorizar contrato
                </Button>
              )}
              <Button variant="danger" onClick={() => setDeleteModal({ open: true, id: detailContract.id })}>
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            </div>

            {detailContract.nota && detailContract.estado !== 'Activo' && (
              <div className="bg-blue-bg border border-blue-text/20 rounded-[12px] px-4 py-3 text-[12px] text-text-4 mb-5">
                {detailContract.nota}
              </div>
            )}

            {/* Tabs — todos habilitados para el admin */}
            <div className="flex gap-1 mb-5 bg-page-bg p-1 rounded-[10px] w-fit">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-white shadow-sm text-text-1 font-semibold'
                      : 'text-text-3 hover:text-text-1 cursor-pointer'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── TAB: Datos del Contratante ── */}
            {activeTab === 'contratante' && (
              <div className="space-y-5">
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="flex justify-between items-start gap-4 mb-5">
                    <div>
                      <div className="text-[14px] font-bold">Datos de Identidad del Contratante</div>
                      <div className="text-[12px] text-text-4">Información legal y fiscal de la empresa contratante.</div>
                    </div>
                    <Badge variant={detailContract.contratante.confirmado ? 'green' : detailContract.estado === 'Pendiente de Configuración' ? 'yellow' : 'blue'}>
                      {detailContract.contratante.confirmado ? 'Confirmado' : detailContract.estado === 'Pendiente de Configuración' ? 'Pendiente' : 'En revisión'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <ReadField label="Razón Social"     value={detailContract.contratante.razonSocial} />
                    <ReadField label="Nombre Comercial" value={detailContract.contratante.nombreComercial} />
                    <ReadField label="RUC / NIF"        value={detailContract.contratante.ruc} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReadField label="Sector Productivo"    value={detailContract.contratante.sectorProductivo} />
                    <ReadField label="Teléfono Corporativo" value={detailContract.contratante.telefonoCorporativo} />
                    <ReadField label="Correo Corporativo"   value={detailContract.contratante.correoCorporativo} />
                  </div>
                </div>

                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="mb-5">
                    <div className="text-[14px] font-bold">Datos del Contrato</div>
                    <div className="text-[12px] text-text-4">Descripción del objeto contractual y condiciones económicas.</div>
                  </div>
                  <div className="space-y-4">
                    <ReadField label="Objeto del Trabajo" value={detailContract.contratante.objetoTrabajo} multiline />
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <ReadField label="Monto Global (XAF)"  value={detailContract.contratante.montoGlobal ? formatXaf(detailContract.contratante.montoGlobal) : ''} />
                      <ReadField label="Fecha de Inicio"     value={detailContract.contratante.fechaInicio} />
                      <ReadField label="Fecha de Fin"        value={detailContract.contratante.fechaFin} />
                      <ReadField label="Plazos de Ejecución" value={detailContract.contratante.plazosEjecucion} />
                    </div>
                    <div className="pt-1">
                      <div className="text-[13px] font-bold text-text-1 mb-3 pb-2 border-b border-border">Representante Legal</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <ReadField label="Nombre y Apellido"        value={detailContract.contratante.repNombre} />
                        <ReadField label="Tipo de Documento"        value={detailContract.contratante.repTipoDoc} />
                        <ReadField label="Número de Identificación" value={detailContract.contratante.repIdentificacion} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ReadField label="Cargo"    value={detailContract.contratante.repCargo} />
                        <ReadField label="Teléfono" value={detailContract.contratante.repTelefono} />
                        <ReadField label="Correo"   value={detailContract.contratante.repCorreo} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Distribución del crédito ── */}
            {activeTab === 'distribucion' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: 'Monto del crédito', value: formatXaf(detailContract.monto),      cls: 'text-text-1'     },
                    { label: 'Asignado',           value: formatXaf(detailContract.asignado),   cls: 'text-orange'     },
                    { label: 'Disponible',         value: formatXaf(detailContract.disponible), cls: 'text-green-text' },
                    { label: '% Asignado',         value: `${pct(detailContract.asignado, detailContract.monto)}%`, cls: 'text-blue-text' },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="bg-white rounded-[14px] border border-border p-4">
                      <div className={`text-[20px] font-extrabold leading-none mb-1 ${cls}`}>{value}</div>
                      <div className="text-[12px] text-text-4">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="mb-4">
                    <div className="text-[14px] font-bold">Distribuciones</div>
                    <div className="text-[12px] text-text-4">Asignaciones del crédito por concepto y proveedor.</div>
                  </div>
                  <div className="space-y-3">
                    {detailContract.distribucion.map(item => {
                      const pctVal = parseFloat(pct(item.monto, detailContract.monto));
                      return (
                        <div key={item.id} className="bg-white rounded-[16px] p-4 shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-bold text-text-1 leading-tight">{item.concepto}</div>
                            {item.providerName
                              ? <div className="text-[12px] text-text-4 mt-0.5">{item.providerName} · <span className="text-text-5">{item.providerSector}</span></div>
                              : <div className="text-[12px] text-text-5 mt-0.5">Sin proveedor asociado</div>
                            }
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="flex-1 h-[5px] bg-page-bg rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pctVal, 100)}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
                              </div>
                              <span className="text-[10px] font-bold text-orange-dark shrink-0">{pctVal}%</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-[15px] font-extrabold text-text-1 leading-tight">{formatXaf(item.monto)}</div>
                            <div className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-tint text-orange-dark">
                              {pctVal}% del crédito
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {detailContract.distribucion.length === 0 && (
                      <div className="text-[12px] text-text-4 py-6 text-center">No hay distribuciones registradas.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Facturas ── */}
            {activeTab === 'facturas' && (() => {
              const facts     = detailContract.facturas || [];
              const ctFacts   = facts.filter(f => f.tipo === 'contratante');
              const provFacts = facts.filter(f => f.tipo === 'proveedor');

              const InvoiceCard = ({ inv }) => (
                <div className="bg-white rounded-[16px] p-4 shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-bold text-text-1">{inv.id}</span>
                      <Badge variant={inv.estado === 'Pagada' ? 'green' : inv.estado === 'Enviada' ? 'blue' : 'yellow'}>{inv.estado}</Badge>
                    </div>
                    <div className="text-[12px] text-text-3 truncate">{inv.concepto}</div>
                    {inv.tipo === 'proveedor' && inv.proveedor && (
                      <div className="text-[11px] text-text-5 mt-0.5">{inv.proveedor}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
                    <div className="text-[11px] text-text-5 mt-0.5">{inv.fecha}</div>
                  </div>
                </div>
              );

              return (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: facts.length,     label: 'Total de facturas',        cls: 'text-text-1'    },
                      { value: ctFacts.length,   label: 'Facturas del contratante', cls: 'text-blue-text' },
                      { value: provFacts.length, label: 'Facturas de proveedores',  cls: 'text-orange'    },
                    ].map(({ value, label, cls }) => (
                      <div key={label} className="bg-white rounded-[14px] border border-border p-4">
                        <div className={`text-[32px] font-extrabold leading-none mb-1 ${cls}`}>{value}</div>
                        <div className="text-[12px] text-text-4">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <div className="mb-4">
                      <div className="text-[14px] font-bold">Facturas</div>
                      <div className="text-[12px] text-text-4">Historial de facturas asociadas a este contrato.</div>
                    </div>
                    {facts.length === 0 && (
                      <div className="text-[12px] text-text-4 py-6 text-center">No hay facturas para este contrato.</div>
                    )}
                    {ctFacts.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] mb-2.5">Al contratante</div>
                        <div className="space-y-3">{ctFacts.map(inv => <InvoiceCard key={inv.id} inv={inv} />)}</div>
                      </div>
                    )}
                    {provFacts.length > 0 && (
                      <div>
                        <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] mb-2.5">A proveedores</div>
                        <div className="space-y-3">{provFacts.map(inv => <InvoiceCard key={inv.id} inv={inv} />)}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </>
        ) : null}
      </div>

      {/* ── Modal: Revisión del contrato (ojo) ── */}
      {reviewModal && (
        <Modal
          title={`Revisión · ${reviewModal.id}`}
          onClose={() => setReviewModal(null)}
          wide
          footer={
            <>
              <Button variant="ghost" onClick={() => setReviewModal(null)}>Cerrar</Button>
              <div className="flex gap-2">
                <Button variant="danger" onClick={() => { setReqModal({ ...REQ_MODAL_EMPTY, open: true, contractId: reviewModal.id }); setReviewModal(null); }}>
                  <AlertTriangle className="w-4 h-4" />
                  Poner un requerimiento
                </Button>
                <Button variant="success" onClick={() => { handleAuthorize(reviewModal.id); setReviewModal(null); }}>
                  <CheckCircle2 className="w-4 h-4" />
                  Aceptar
                </Button>
              </div>
            </>
          }
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ReadField label="PYME"        value={reviewModal.pymeNombre} />
              <ReadField label="Monto"       value={formatXaf(reviewModal.monto)} />
              <ReadField label="Asignado"    value={formatXaf(reviewModal.asignado)} />
              <ReadField label="Disponible"  value={formatXaf(reviewModal.disponible)} />
            </div>

            <div>
              <div className="text-[13px] font-bold text-text-1 mb-3 pb-2 border-b border-border">Identidad del Contratante</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <ReadField label="Razón Social"     value={reviewModal.contratante.razonSocial} />
                <ReadField label="Nombre Comercial" value={reviewModal.contratante.nombreComercial} />
                <ReadField label="RUC / NIF"        value={reviewModal.contratante.ruc} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ReadField label="Sector Productivo" value={reviewModal.contratante.sectorProductivo} />
                <ReadField label="Teléfono"          value={reviewModal.contratante.telefonoCorporativo} />
                <ReadField label="Correo"            value={reviewModal.contratante.correoCorporativo} />
              </div>
            </div>

            <div>
              <div className="text-[13px] font-bold text-text-1 mb-3 pb-2 border-b border-border">Datos del Contrato</div>
              <ReadField label="Objeto del Trabajo" value={reviewModal.contratante.objetoTrabajo} multiline />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ReadField label="Monto Global"       value={reviewModal.contratante.montoGlobal ? formatXaf(reviewModal.contratante.montoGlobal) : ''} />
                <ReadField label="Fecha de Inicio"    value={reviewModal.contratante.fechaInicio} />
                <ReadField label="Fecha de Fin"       value={reviewModal.contratante.fechaFin} />
                <ReadField label="Plazo de Ejecución" value={reviewModal.contratante.plazosEjecucion} />
              </div>
            </div>

            <div>
              <div className="text-[13px] font-bold text-text-1 mb-3 pb-2 border-b border-border">Representante Legal</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <ReadField label="Nombre y Apellido"        value={reviewModal.contratante.repNombre} />
                <ReadField label="Tipo de Documento"        value={reviewModal.contratante.repTipoDoc} />
                <ReadField label="Número de Identificación" value={reviewModal.contratante.repIdentificacion} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ReadField label="Cargo"    value={reviewModal.contratante.repCargo} />
                <ReadField label="Teléfono" value={reviewModal.contratante.repTelefono} />
                <ReadField label="Correo"   value={reviewModal.contratante.repCorreo} />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Poner un requerimiento ── */}
      {reqModal.open && (
        <Modal
          title={`Poner un requerimiento · ${reqModal.contractId}`}
          onClose={() => setReqModal(REQ_MODAL_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setReqModal(REQ_MODAL_EMPTY)}>Cancelar</Button>
              <Button variant="danger" onClick={handleEnviarRequerimiento} disabled={!reqPuedeEnviar}>
                <Send className="w-4 h-4" />
                Enviar requerimiento
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-text-4 block mb-2">¿A qué entidad(es) corresponde el requerimiento?</label>
              <div className="flex flex-col gap-2">
                {ENTIDADES_REQUERIMIENTO.map(ent => (
                  <div key={ent}>
                    <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-[8px] border border-border hover:bg-page-bg transition">
                      <input
                        type="checkbox"
                        checked={reqModal.entidades.includes(ent)}
                        onChange={() => toggleReqEntidad(ent)}
                        className="w-4 h-4 accent-orange cursor-pointer"
                      />
                      <span className="text-[13px] text-text-2">{ent}</span>
                    </label>

                    {/* Un contrato puede tener varias PYMEs o proveedores —
                        hay que precisar cuál(es), no solo el tipo de entidad. */}
                    {ent === 'PYME' && reqModal.entidades.includes('PYME') && (
                      <div className="ml-7 mt-1.5 mb-1 space-y-2">
                        {pymesDisponibles.length === 0 ? (
                          <p className="text-[11px] text-text-5 italic">No hay PYMEs registradas en este contrato.</p>
                        ) : (
                          <>
                            <Select value="" onChange={e => { if (e.target.value) toggleReqPyme(e.target.value); }}>
                              <option value="">+ Seleccionar PYME…</option>
                              {pymesDisponibles.filter(p => !reqModal.pymes.includes(p)).map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </Select>
                            {reqModal.pymes.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {reqModal.pymes.map(p => (
                                  <span key={p} className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-orange-tint text-orange-dark">
                                    {p}
                                    <button type="button" onClick={() => toggleReqPyme(p)} className="p-0.5 rounded-full hover:bg-orange/20 cursor-pointer">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    {ent === 'Proveedor' && reqModal.entidades.includes('Proveedor') && (
                      <div className="ml-7 mt-1.5 mb-1 space-y-2">
                        {proveedoresDisponibles.length === 0 ? (
                          <p className="text-[11px] text-text-5 italic">No hay proveedores registrados en este contrato.</p>
                        ) : (
                          <>
                            <Select value="" onChange={e => { if (e.target.value) toggleReqProveedor(e.target.value); }}>
                              <option value="">+ Seleccionar proveedor…</option>
                              {proveedoresDisponibles.filter(p => !reqModal.proveedores.includes(p)).map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </Select>
                            {reqModal.proveedores.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {reqModal.proveedores.map(p => (
                                  <span key={p} className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-orange-tint text-orange-dark">
                                    {p}
                                    <button type="button" onClick={() => toggleReqProveedor(p)} className="p-0.5 rounded-full hover:bg-orange/20 cursor-pointer">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <FormGroup label="Mensaje del requerimiento" required>
              <Textarea
                value={reqModal.mensaje}
                onChange={e => setReqModal(m => ({ ...m, mensaje: e.target.value }))}
                rows={4}
                placeholder="Describe qué debe corregirse y por qué…"
              />
            </FormGroup>
          </div>
        </Modal>
      )}

      {/* ── Modal: Confirmar eliminación ── */}
      {deleteModal.open && (
        <Modal
          title="Eliminar contrato"
          onClose={() => setDeleteModal({ open: false, id: null })}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteModal({ open: false, id: null })}>Cancelar</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteModal.id)}>Eliminar</Button>
            </>
          }
        >
          <div className="text-[13px] text-text-3 leading-relaxed">
            ¿Estás seguro de que quieres eliminar el contrato{' '}
            <span className="font-bold text-text-1">{deleteModal.id}</span>?{' '}
            Esta acción no se puede deshacer.
          </div>
        </Modal>
      )}

      {/* ── Modal: Nuevo contrato ── */}
      {newModal.open && (
        <Modal
          title="Nuevo contrato"
          onClose={closeNewModal}
          wide
          footer={
            <>
              <Button variant="ghost" onClick={closeNewModal}>Cancelar</Button>
              <Button variant="primary" onClick={handleCreateContract} disabled={!newFormValido}>
                <Plus className="w-4 h-4" />
                Crear contrato
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1">
            <div className="md:col-span-2">
              <FormGroup label="Empresa contratante" required>
                <Select
                  value={newModal.empresaContratante || ''}
                  onChange={e => setNewModal({ ...newModal, empresaContratante: e.target.value })}
                >
                  <option value="">Seleccionar empresa…</option>
                  {EMPRESAS_CONTRATANTES.map(n => <option key={n}>{n}</option>)}
                </Select>
              </FormGroup>
            </div>

            <FormGroup label="Monto (XAF)" required>
              <Input
                type="text" inputMode="numeric" placeholder="Ej: 50,000,000"
                value={newModal.monto || ''}
                onChange={e => setNewModal({ ...newModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
              />
            </FormGroup>
            <FormGroup label="Intereses (%)" required>
              <Input
                type="text" inputMode="decimal" placeholder="Ej: 9.5"
                value={newModal.intereses || ''}
                onChange={e => setNewModal({ ...newModal, intereses: e.target.value.replace(/[^0-9.,]/g, '') })}
              />
            </FormGroup>

            <FormGroup label="Plazo de pago" required>
              <Select value={newModal.plazoPago || '30'} onChange={e => setNewModal({ ...newModal, plazoPago: e.target.value })}>
                <option value="30">30 días</option>
                <option value="60">60 días</option>
                <option value="90">90 días</option>
              </Select>
            </FormGroup>
            <FormGroup label="Banco fondeador" required>
              <Select value={newModal.bancoFondeador || ''} onChange={e => setNewModal({ ...newModal, bancoFondeador: e.target.value })}>
                <option value="">Seleccionar…</option>
                {BANCO_FONDEADORES.map(b => <option key={b}>{b}</option>)}
              </Select>
            </FormGroup>

            <FormGroup label="Email" required>
              <Input
                type="email" placeholder="admin@empresa.gq"
                value={newModal.email || ''}
                onChange={e => setNewModal({ ...newModal, email: e.target.value })}
                style={newModal.email && !newEmailValido ? { borderColor: 'var(--color-red-text)' } : undefined}
              />
              {newModal.email && !newEmailValido && (
                <span className="text-[11px] text-red-text">Introduce un correo válido, ej: nombre@empresa.gq</span>
              )}
            </FormGroup>
            <FormGroup label="Teléfono">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-text-3 select-none">{PREFIJO_TEL_GQ}</span>
                <Input
                  inputMode="numeric" placeholder="222 000 000"
                  value={newTelDgts}
                  onChange={e => setNewModal({ ...newModal, telefono: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  className="pl-14"
                  style={newModal.telefono && !newTelValido ? { borderColor: 'var(--color-red-text)' } : undefined}
                />
              </div>
              {newModal.telefono && !newTelValido && (
                <span className="text-[11px] text-red-text">El número debe tener entre 7 y 9 dígitos ({PREFIJO_TEL_GQ}).</span>
              )}
            </FormGroup>

            <FormGroup label="% de retención" required>
              <Input
                type="text" inputMode="decimal" placeholder="Ej: 5"
                value={newModal.retencion || ''}
                onChange={e => setNewModal({ ...newModal, retencion: e.target.value.replace(/[^0-9.,]/g, '') })}
              />
            </FormGroup>
            <FormGroup label="% de gestión de cobranza" required>
              <Input
                type="text" inputMode="decimal" placeholder="Ej: 2"
                value={newModal.gestionCobranza || ''}
                onChange={e => setNewModal({ ...newModal, gestionCobranza: e.target.value.replace(/[^0-9.,]/g, '') })}
              />
            </FormGroup>

            <FormGroup label="Fecha de vencimiento" className="md:col-span-2">
              <Input value={formatDateAddDays(newModal.plazoPago || 30)} readOnly title="Se calcula con el plazo de pago seleccionado" />
              <span className="text-[11px] text-text-5">Se calcula automáticamente: hoy + plazo de pago (DD/MM/AAAA).</span>
            </FormGroup>
          </div>
        </Modal>
      )}

      {/* ── Toast ── */}
      <div className={`fixed bottom-6 right-6 z-50 w-[340px] bg-white rounded-[14px] shadow-xl border border-border p-4 flex items-start gap-3 transition-all duration-300 ease-out
        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      >
        <div className="w-8 h-8 rounded-[8px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-orange" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-text-1 mb-0.5">Acción completada</div>
          <div className="text-[12px] text-text-4 leading-snug">{toast.message}</div>
        </div>
      </div>
    </AppShell>
  );
}
