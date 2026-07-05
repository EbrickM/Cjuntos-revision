import { useState } from 'react';
import {
  ArrowLeft, Upload, FileText, Trash2, CheckCircle2, Pencil, Search, ChevronRight,
  Users, Package, Truck, Wrench, Receipt, Cpu, FolderOpen, Building2,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';

const formatXaf = (value) => `XAF ${new Intl.NumberFormat('en-US').format(Number(value) || 0)}`;
const pct       = (part, total) => total > 0 ? ((part / total) * 100).toFixed(1) : '0.0';

const SECTORES  = ['Energía', 'Construcción', 'Manufactura', 'Transporte', 'Tecnología', 'Servicios', 'Alimentación', 'Minería', 'Agricultura', 'Comercio', 'Otro'];
const TIPOS_DOC = ['Pasaporte', 'Cédula', 'Licencia de conducir', 'Carnet operativo'];
const CONCEPTOS = ['Nómina', 'Compra de Materiales', 'Pago a Proveedor', 'Servicios', 'Gastos Operativos', 'Inversión en Equipos', 'Otro'];

const CONCEPTO_ICONS = {
  'Nómina':               Users,
  'Compra de Materiales': Package,
  'Pago a Proveedor':     Truck,
  'Servicios':            Wrench,
  'Gastos Operativos':    Receipt,
  'Inversión en Equipos': Cpu,
  'Otros':                FolderOpen,
  'Otro':                 FolderOpen,
};

const KYC_BADGE = {
  vigente:  { label: 'KYC Vigente',   bg: '#E3F4EA', color: '#2E7D5B', border: '1px solid #A8D5BE'             },
  pendiente:{ label: 'KYC Pendiente', bg: '#FDF6E8', color: '#C68A1D', border: '1px solid rgba(198,138,29,.3)' },
  vencido:  { label: 'KYC Vencido',   bg: '#FDEEEB', color: '#B8352A', border: '1px solid rgba(184,53,42,.3)'  },
};

const DISTRIB_EMPTY       = { open: false, editId: null, concepto: '', monto: '', asignarProveedor: false, providerId: '' };
const PROVIDER_FORM_EMPTY = { razonSocial: '', nombreComercial: '', ruc: '', sector: 'Materiales', telefono: '', correo: '' };
const INVOICE_MODAL_EMPTY = { open: false, editId: null, type: 'contratante', monto: '', concepto: '', proveedorId: '' };

const initialProviders = [
  { id: 'p1', razonSocial: 'Cemex GE',      nombreComercial: 'Cemex GE',   ruc: 'GE-2019-00123', sector: 'Materiales', email: 'ventas@cemex.gq',    telefono: '+240 222 111 222', activo: true },
  { id: 'p2', razonSocial: 'TransGE S.L.',  nombreComercial: 'TransGE',    ruc: 'GE-2020-00445', sector: 'Transporte', email: 'info@transge.gq',    telefono: '+240 222 333 444', activo: true },
  { id: 'p3', razonSocial: 'ServTec GE',    nombreComercial: 'ServTec GE', ruc: 'GE-2022-00112', sector: 'Tecnología', email: 'soporte@servtec.gq', telefono: '+240 222 777 888', activo: true },
];

const initialContracts = [
  {
    id: 'CTR-2026-001', kyc: 'vigente',
    monto: 58000000, asignado: 0, disponible: 58000000,
    paso: 1, estado: 'Pendiente datos del contratante',
    nota: 'Aprobado por Bonafide. Completa los datos del contratante para activar la verificación.',
    contratante: {
      razonSocial: 'Constructora Malabo S.A.', nombreComercial: 'Constructora Malabo', ruc: 'GE-2023-00156', sectorProductivo: 'Construcción',
      telefonoCorporativo: '+240 222 100 200', correoCorporativo: 'admin@conmalabo.gq',
      objetoTrabajo: '', documentoContrato: null, montoGlobal: '58000000',
      fechaInicio: '2026-05-01', fechaFin: '2027-04-30', plazosEjecucion: '12 meses',
      repNombre: '', repTipoDoc: '', repIdentificacion: '', repCargo: '', repTelefono: '', repCorreo: '',
      confirmado: false, lock: false,
    },
    distribucion: [],
  },
  {
    id: 'CTR-2026-003', kyc: 'vigente',
    monto: 31000000, asignado: 0, disponible: 31000000,
    paso: 2, estado: 'En espera de confirmación del contratante',
    nota: 'Se envió la solicitud de verificación al contratante. Cuando confirme, Bonafide continuará con la autorización.',
    contratante: {
      razonSocial: 'Petro Guinea S.A.', nombreComercial: 'PetroGE', ruc: 'GE-2019-00891', sectorProductivo: 'Energía',
      telefonoCorporativo: '+240 222 456 789', correoCorporativo: 'contratos@petroguinea.gq',
      objetoTrabajo: 'Suministro de combustible y lubricantes industriales para operaciones en tierra y plataformas offshore.',
      documentoContrato: null, montoGlobal: '31000000',
      fechaInicio: '2026-03-01', fechaFin: '2026-12-31', plazosEjecucion: '10 meses',
      repNombre: 'Carlos Obiang Mba', repTipoDoc: 'Pasaporte', repIdentificacion: 'GE-1985-00234',
      repCargo: 'Director Comercial', repTelefono: '+240 222 456 780', repCorreo: 'cobiang@petroguinea.gq',
      confirmado: false, lock: false,
    },
    distribucion: [],
  },
  {
    id: 'CTR-2026-004', kyc: 'vencido',
    monto: 75000000, asignado: 0, disponible: 75000000,
    paso: 3, estado: 'Pendiente autorización Bonafide',
    nota: 'El contratante confirmó los datos. Bonafide debe autorizar para que puedas distribuir el crédito.',
    contratante: {
      razonSocial: 'Ministerio de Obras Públicas e Infraestructuras', nombreComercial: 'MOPI-GE', ruc: 'GE-2015-00042', sectorProductivo: 'Construcción',
      telefonoCorporativo: '+240 222 001 002', correoCorporativo: 'adm@obras.gob.gq',
      objetoTrabajo: 'Construcción y pavimentación de 12 km de infraestructura vial en la zona norte de Malabo, incluyendo drenajes y señalización.',
      documentoContrato: null, montoGlobal: '75000000',
      fechaInicio: '2026-01-15', fechaFin: '2027-01-15', plazosEjecucion: '12 meses',
      repNombre: 'Eugenio Ndong Esono', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1972-00089',
      repCargo: 'Secretario General', repTelefono: '+240 222 001 003', repCorreo: 'endong@obras.gob.gq',
      confirmado: true, lock: true,
    },
    distribucion: [],
  },
  {
    id: 'CTR-2026-002', kyc: 'vigente',
    monto: 42000000, asignado: 9000000, disponible: 33000000,
    paso: 4, estado: '', nota: '',
    contratante: {
      razonSocial: 'Evans Construction & Engineering S.A.', nombreComercial: 'Evans GE', ruc: 'GE-2021-00278', sectorProductivo: 'Construcción',
      telefonoCorporativo: '+240 222 909 111', correoCorporativo: 'admin@evans.gq',
      objetoTrabajo: 'Obras de edificación, remodelación integral y adecuación de oficinas corporativas en el complejo empresarial de Sipopo.',
      documentoContrato: null, montoGlobal: '42000000',
      fechaInicio: '2026-02-01', fechaFin: '2026-08-01', plazosEjecucion: '6 meses',
      repNombre: 'John Evans Jr.', repTipoDoc: 'Pasaporte', repIdentificacion: 'GE-1980-00145',
      repCargo: 'CEO & Representante Legal', repTelefono: '+240 222 909 112', repCorreo: 'jevans@evans.gq',
      confirmado: true, lock: true,
    },
    distribucion: [
      { id: 'dist-001', concepto: 'Pago a Proveedor', monto: 9000000, providerId: 'p2', providerName: 'TransGE S.L.', providerSector: 'Transporte' },
    ],
  },
  {
    id: 'CTR-2026-005', kyc: 'pendiente',
    monto: 25000000, asignado: 0, disponible: 25000000,
    paso: 4, estado: '', nota: '',
    contratante: {
      razonSocial: 'Autoridad Portuaria de Bata S.A.', nombreComercial: 'BataPort', ruc: 'GE-2018-00317', sectorProductivo: 'Transporte',
      telefonoCorporativo: '+240 222 654 321', correoCorporativo: 'admin@bataporto.gq',
      objetoTrabajo: 'Gestión operativa, mantenimiento preventivo y correctivo de instalaciones y equipos en el Puerto de Bata.',
      documentoContrato: null, montoGlobal: '25000000',
      fechaInicio: '2026-04-01', fechaFin: '2027-03-31', plazosEjecucion: '12 meses',
      repNombre: 'María Esono Nguema', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1979-00312',
      repCargo: 'Directora General', repTelefono: '+240 222 654 322', repCorreo: 'mesono@bataporto.gq',
      confirmado: true, lock: true,
    },
    distribucion: [],
  },
];

const initialInvoices = [
  { id: 'FAC-2026-1025', tipo: 'proveedor',   contrato: 'CTR-2026-002', proveedorId: 'p2', proveedor: 'TransGE S.L.', monto: 4500000,  estado: 'Enviada',  concepto: 'Transporte de materiales al sitio de obra', fecha: '01/05/2026' },
  { id: 'FAC-2026-1031', tipo: 'contratante', contrato: 'CTR-2026-002', monto: 18000000, estado: 'Pagada', concepto: 'Avance de obra fase 1 – Cimentación y estructura', fecha: '10/05/2026' },
];

const TABS = [
  { id: 'contratante', label: 'Datos del Contratante' },
  { id: 'distribucion', label: 'Distribución del crédito' },
  { id: 'facturas',     label: 'Facturas' },
];

const tabEnabled    = (tabId, paso) => tabId === 'contratante' || paso === 4;
const contractBadge = (paso) => ({
  1: { variant: 'yellow', label: 'Pend. datos' },
  2: { variant: 'blue',   label: 'Esp. confirmación' },
  3: { variant: 'yellow', label: 'Esp. autorización' },
  4: { variant: 'green',  label: 'Activo' },
}[paso] ?? { variant: 'yellow', label: 'Pendiente' });

export default function EpCreditos() {
  const { go } = useApp();
  const [contracts, setContracts]                 = useState(initialContracts);
  const [providers, setProviders]                 = useState(initialProviders);
  const [detailId, setDetailId]                   = useState(null);
  const [activeTab, setActiveTab]                 = useState('contratante');
  const [invoices, setInvoices]                   = useState(initialInvoices);
  const [search, setSearch]                       = useState('');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [distribModal, setDistribModal]           = useState(DISTRIB_EMPTY);
  const [invoiceModal, setInvoiceModal]           = useState(INVOICE_MODAL_EMPTY);
  const [providerForm, setProviderForm]           = useState(PROVIDER_FORM_EMPTY);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4500);
  };

  const detailContract = detailId ? (contracts.find(c => c.id === detailId) ?? null) : null;

  const totalContratos = contracts.length;

  const filteredContracts = search.trim()
    ? contracts.filter(c =>
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        (c.contratante?.razonSocial || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.contratante?.sectorProductivo || '').toLowerCase().includes(search.toLowerCase())
      )
    : contracts;

  const updateContract   = (id, patch) =>
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const updateContractor = (field, value) =>
    updateContract(detailId, { contratante: { ...detailContract.contratante, [field]: value } });

  const syncDistrib = (id, nextDist) => {
    const nextAsignado = nextDist.reduce((s, d) => s + d.monto, 0);
    updateContract(id, { distribucion: nextDist, asignado: nextAsignado, disponible: contracts.find(c => c.id === id).monto - nextAsignado });
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateContractor('documentoContrato', { name: file.name, url: URL.createObjectURL(file), type: file.type });
  };

  const handleSubmitContractor = () => {
    updateContract(detailId, {
      paso: 2, estado: 'En espera de confirmación del contratante',
      nota: 'Se envió la solicitud de verificación al contratante. Cuando confirme, Bonafide continuará con la autorización.',
      contratante: { ...detailContract.contratante, confirmado: false, lock: false },
    });
    showToast('Los datos han sido enviados al contratante para su verificación. Debes esperar su confirmación. Puedes editar y reenviar mientras no haya confirmado.');
  };

  const handleContractorConfirmed = () =>
    updateContract(detailId, {
      paso: 3, estado: 'Pendiente autorización Bonafide',
      nota: 'El contratante confirmó los datos. Bonafide debe autorizar para que puedas distribuir el crédito.',
      contratante: { ...detailContract.contratante, confirmado: true, lock: true },
    });

  // ── Distribución handlers ──

  const handleSaveDistrib = () => {
    const amount = Number(distribModal.monto.replace?.(/[^0-9]/g, '') ?? distribModal.monto) || 0;
    if (amount <= 0 || !distribModal.concepto) return;
    const provider = distribModal.asignarProveedor && distribModal.providerId
      ? providers.find(p => p.id === distribModal.providerId)
      : null;
    const item = {
      id: distribModal.editId || `dist-${Date.now()}`,
      concepto: distribModal.concepto,
      monto: amount,
      providerId:     provider?.id     || null,
      providerName:   provider?.razonSocial || null,
      providerSector: provider?.sector || null,
    };
    const nextDist = distribModal.editId
      ? detailContract.distribucion.map(d => d.id === distribModal.editId ? item : d)
      : [...detailContract.distribucion, item];
    syncDistrib(detailId, nextDist);
    setDistribModal(DISTRIB_EMPTY);
  };

  const handleDeleteDistrib = (distId) =>
    syncDistrib(detailId, detailContract.distribucion.filter(d => d.id !== distId));

  const handleOpenEditDistrib = (item) =>
    setDistribModal({
      open: true, editId: item.id,
      concepto: item.concepto,
      monto: item.monto.toString(),
      asignarProveedor: !!item.providerId,
      providerId: item.providerId || providers[0]?.id || '',
    });

  // ── Añadir proveedor handler ──

  const handleAddProvider = () => {
    if (!providerForm.razonSocial.trim()) return;
    const newId = `p${Math.max(...providers.map(p => Number(p.id.replace('p', ''))), 0) + 1}`;
    const next  = { id: newId, razonSocial: providerForm.razonSocial, nombreComercial: providerForm.nombreComercial, ruc: providerForm.ruc, sector: providerForm.sector, email: providerForm.correo, telefono: providerForm.telefono, activo: true };
    setProviders(prev => [...prev, next]);
    setShowProviderModal(false);
    setProviderForm(PROVIDER_FORM_EMPTY);
    showToast(`${providerForm.razonSocial} ha sido añadido al directorio de proveedores. Ya puedes asignarlo en una distribución.`);
  };

  // ── Facturas handlers ──

  const nextInvoiceId = () => {
    const max = invoices.reduce((m, inv) => Math.max(m, parseInt(inv.id.replace('FAC-2026-', '')) || 0), 1031);
    return `FAC-2026-${max + 1}`;
  };

  const getProviderMaxMonto = (proveedorId) =>
    detailContract?.distribucion.filter(d => d.providerId === proveedorId).reduce((s, d) => s + d.monto, 0) ?? 0;

  const handleOpenNewInvoice = (type) => {
    const firstProviderId = detailContract?.distribucion.find(d => d.providerId)?.providerId || '';
    setInvoiceModal({ open: true, editId: null, type, monto: '', concepto: '', proveedorId: firstProviderId });
  };

  const handleOpenEditInvoice = (inv) =>
    setInvoiceModal({ open: true, editId: inv.id, type: inv.tipo, monto: inv.monto.toString(), concepto: inv.concepto || '', proveedorId: inv.proveedorId || '' });

  const handleSaveInvoice = () => {
    const monto = Number(invoiceModal.monto.replace?.(/[^0-9]/g, '') ?? invoiceModal.monto) || 0;
    if (monto <= 0 || !invoiceModal.concepto.trim()) return;
    if (invoiceModal.editId) {
      const prov = providers.find(p => p.id === invoiceModal.proveedorId);
      setInvoices(prev => prev.map(inv => inv.id === invoiceModal.editId
        ? { ...inv, monto, concepto: invoiceModal.concepto, proveedorId: invoiceModal.proveedorId || null, proveedor: prov?.razonSocial || inv.proveedor }
        : inv));
    } else {
      const prov = providers.find(p => p.id === invoiceModal.proveedorId);
      const today = new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });
      setInvoices(prev => [...prev, {
        id: nextInvoiceId(),
        tipo: invoiceModal.type,
        contrato: detailContract.id,
        monto,
        estado: 'Pendiente',
        concepto: invoiceModal.concepto,
        fecha: today,
        ...(invoiceModal.type === 'proveedor' ? { proveedorId: invoiceModal.proveedorId, proveedor: prov?.razonSocial || '' } : {}),
      }]);
    }
    setInvoiceModal(INVOICE_MODAL_EMPTY);
  };

  const handleDeleteInvoice = (invId) =>
    setInvoices(prev => prev.filter(inv => inv.id !== invId));

  return (
    <AppShell active="epCreditos" role="empresa-pequena" title="Mis créditos" sub="Gestión de contratos de crédito">
      <div className="fade-in">

        {/* ── LISTA ── */}
        {detailId === null ? (
          <>
            {/* Título */}
            <h1 className="text-[22px] font-bold text-text-1 mb-4">Mis Contratos</h1>

            {/* Fila: card total (izquierda) + buscador (derecha) */}
            <div className="flex items-center justify-between gap-3 mb-5">
              {/* Card total — estilo dashboard */}
              <div className="card-lift bg-white rounded-[12px] border border-border px-4 h-12 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                  <FileText className="w-4 h-4 text-orange" />
                </div>
                <span className="text-[22px] font-extrabold leading-none text-text-1">{totalContratos}</span>
                <span className="text-[12px] text-text-4 leading-snug">Contratos de crédito</span>
              </div>

              {/* Buscador */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por ID, empresa o sector…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-12 pl-9 pr-4 text-[13px] rounded-[10px] border border-border bg-white focus:outline-none focus:border-orange/50 transition placeholder:text-text-4"
                />
              </div>
            </div>

            {/* Grid de tarjetas — ~3 por fila */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContracts.map(contract => {
                const pctVal = parseFloat(pct(contract.asignado, contract.monto));
                const ctName = contract.contratante?.razonSocial || '—';
                const sector = contract.contratante?.sectorProductivo || '';
                return (
                  <div
                    key={contract.id}
                    onClick={() => { setDetailId(contract.id); setActiveTab('contratante'); }}
                    className="bg-white rounded-[16px] p-5 border border-border cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] hover:border-orange/40"
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
                  >
                    {/* Empresa + sector con icono + ID */}
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-[10px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-orange" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold text-text-4 mb-0.5">{contract.id}</div>
                        <div className="text-[13px] font-bold text-text-1 leading-tight truncate">{ctName}</div>
                        {sector && <div className="text-[11px] text-text-4 mt-0.5">{sector}</div>}
                      </div>
                    </div>

                    {/* Monto: label arriba, cifra abajo */}
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-4 mb-0.5">Monto del crédito</div>
                      <div className="text-[17px] font-extrabold text-text-1 leading-tight">{formatXaf(contract.monto)}</div>
                    </div>

                    {/* Barra de distribución */}
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-text-4">Disp: {formatXaf(contract.disponible)}</span>
                        <span className="text-[10px] font-bold text-orange">{pctVal}% distribuido</span>
                      </div>
                      <div className="h-[5px] bg-page-bg rounded-full overflow-hidden">
                        <div className="h-full bg-orange rounded-full transition-all duration-500" style={{ width: `${Math.min(pctVal, 100)}%` }} />
                      </div>
                    </div>

                    {/* Botón Ver */}
                    <button
                      onClick={e => { e.stopPropagation(); setDetailId(contract.id); setActiveTab('contratante'); }}
                      className="self-end flex items-center gap-0.5 text-[11px] font-semibold text-orange hover:opacity-75 transition cursor-pointer"
                    >
                      Ver contrato <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              {filteredContracts.length === 0 && (
                <div className="col-span-full text-[13px] text-text-4 text-center py-12">
                  No se encontraron contratos para "{search}".
                </div>
              )}
            </div>
          </>

        /* ── DETALLE ── */
        ) : detailContract ? (
          <>
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={() => setDetailId(null)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-text-3 hover:text-orange transition px-3 py-2 rounded-[10px] hover:bg-orange-tint"
              >
                <ArrowLeft className="w-4 h-4" />
                Mis créditos
              </button>
              <span className="text-text-5">/</span>
              <span className="text-[14px] font-bold text-text-1">{detailContract.id}</span>
              <Badge variant={contractBadge(detailContract.paso).variant}>
                {detailContract.estado || contractBadge(detailContract.paso).label}
              </Badge>
            </div>

            {detailContract.nota && detailContract.paso !== 4 && (
              <div className="bg-blue-bg border border-blue-text/20 rounded-[12px] px-4 py-3 text-[12px] text-text-4 mb-5">
                {detailContract.nota}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-page-bg p-1 rounded-[10px] w-fit">
              {TABS.map(tab => {
                const enabled  = tabEnabled(tab.id, detailContract.paso);
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => enabled && setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all
                      ${isActive
                        ? 'bg-white shadow-sm text-text-1 font-semibold'
                        : enabled
                          ? 'text-text-3 hover:text-text-1 cursor-pointer'
                          : 'text-text-5 opacity-40 cursor-not-allowed'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
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
                    <Badge variant={detailContract.contratante.confirmado ? 'green' : detailContract.paso === 1 ? 'yellow' : 'blue'}>
                      {detailContract.contratante.confirmado ? 'Confirmado' : detailContract.paso === 1 ? 'Pendiente' : 'En revisión'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormGroup label="Razón Social" required>
                      <Input value={detailContract.contratante.razonSocial} onChange={e => updateContractor('razonSocial', e.target.value)} disabled={detailContract.contratante.lock} />
                    </FormGroup>
                    <FormGroup label="Nombre Comercial">
                      <Input value={detailContract.contratante.nombreComercial} onChange={e => updateContractor('nombreComercial', e.target.value)} disabled={detailContract.contratante.lock} />
                    </FormGroup>
                    <FormGroup label="RUC / NIF" required>
                      <Input value={detailContract.contratante.ruc} onChange={e => updateContractor('ruc', e.target.value)} disabled={detailContract.contratante.lock} />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormGroup label="Sector Productivo" required>
                      <Select value={detailContract.contratante.sectorProductivo} onChange={e => updateContractor('sectorProductivo', e.target.value)} disabled={detailContract.contratante.lock}>
                        <option value="">Seleccionar…</option>
                        {SECTORES.map(s => <option key={s}>{s}</option>)}
                      </Select>
                    </FormGroup>
                    <FormGroup label="Teléfono Corporativo" required>
                      <Input value={detailContract.contratante.telefonoCorporativo} onChange={e => updateContractor('telefonoCorporativo', e.target.value)} disabled={detailContract.contratante.lock} />
                    </FormGroup>
                    <FormGroup label="Correo Corporativo" required>
                      <Input type="email" value={detailContract.contratante.correoCorporativo} onChange={e => updateContractor('correoCorporativo', e.target.value)} disabled={detailContract.contratante.lock} />
                    </FormGroup>
                  </div>
                </div>

                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="mb-5">
                    <div className="text-[14px] font-bold">Datos del Contrato</div>
                    <div className="text-[12px] text-text-4">Descripción del objeto contractual y condiciones económicas.</div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <FormGroup label="Objeto del Trabajo" required>
                      <Textarea value={detailContract.contratante.objetoTrabajo} onChange={e => updateContractor('objetoTrabajo', e.target.value)} disabled={detailContract.contratante.lock} />
                    </FormGroup>

                    <FormGroup label="Documento del Contrato">
                      {detailContract.contratante.documentoContrato ? (
                        <div className="mt-1 rounded-[12px] border border-border overflow-hidden">
                          {detailContract.contratante.documentoContrato.type?.startsWith('image/')
                            ? <img src={detailContract.contratante.documentoContrato.url} className="w-full max-h-52 object-contain bg-page-bg" alt="Vista previa" />
                            : <iframe src={detailContract.contratante.documentoContrato.url} className="w-full h-52" title="Vista previa del documento" />
                          }
                          <div className="flex items-center justify-between px-3 py-2 bg-page-bg border-t border-border">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-3.5 h-3.5 text-text-4 shrink-0" />
                              <span className="text-[11px] text-text-4 truncate">{detailContract.contratante.documentoContrato.name}</span>
                            </div>
                            {!detailContract.contratante.lock && (
                              <button onClick={() => updateContractor('documentoContrato', null)} className="flex items-center gap-1 text-[11px] text-red-text hover:opacity-75 transition ml-3 shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      ) : !detailContract.contratante.lock ? (
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-[12px] cursor-pointer hover:bg-page-bg transition mt-1">
                          <Upload className="w-5 h-5 text-text-4 mb-1.5" />
                          <span className="text-[12px] text-text-4">Haz clic para subir el documento</span>
                          <span className="text-[11px] text-text-5 mt-0.5">PDF, PNG, JPG</span>
                          <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleDocumentChange} />
                        </label>
                      ) : (
                        <div className="text-[12px] text-text-4 mt-1">No se adjuntó documento.</div>
                      )}
                    </FormGroup>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <FormGroup label="Monto Global (XAF)" required>
                        <Input type="text" inputMode="numeric" placeholder="Ej: 58000000" value={detailContract.contratante.montoGlobal} onChange={e => updateContractor('montoGlobal', e.target.value.replace(/[^0-9]/g, ''))} disabled={detailContract.contratante.lock} />
                        {detailContract.contratante.montoGlobal && <div className="text-[11px] text-text-4 mt-1">{formatXaf(detailContract.contratante.montoGlobal)}</div>}
                      </FormGroup>
                      <FormGroup label="Fecha de Inicio" required>
                        <Input type="date" value={detailContract.contratante.fechaInicio} onChange={e => updateContractor('fechaInicio', e.target.value)} disabled={detailContract.contratante.lock} />
                      </FormGroup>
                      <FormGroup label="Fecha de Fin" required>
                        <Input type="date" value={detailContract.contratante.fechaFin} onChange={e => updateContractor('fechaFin', e.target.value)} disabled={detailContract.contratante.lock} />
                      </FormGroup>
                      <FormGroup label="Plazos de Ejecución" required>
                        <Input placeholder="Ej: 6 meses" value={detailContract.contratante.plazosEjecucion} onChange={e => updateContractor('plazosEjecucion', e.target.value)} disabled={detailContract.contratante.lock} />
                      </FormGroup>
                    </div>

                    <div className="pt-1">
                      <div className="text-[13px] font-bold text-text-1 mb-3 pb-2 border-b border-border">Representante Legal</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <FormGroup label="Nombre y Apellido" required>
                          <Input value={detailContract.contratante.repNombre} onChange={e => updateContractor('repNombre', e.target.value)} disabled={detailContract.contratante.lock} />
                        </FormGroup>
                        <FormGroup label="Tipo de Documento" required>
                          <Select value={detailContract.contratante.repTipoDoc} onChange={e => updateContractor('repTipoDoc', e.target.value)} disabled={detailContract.contratante.lock}>
                            <option value="">Seleccionar…</option>
                            {TIPOS_DOC.map(t => <option key={t}>{t}</option>)}
                          </Select>
                        </FormGroup>
                        <FormGroup label="Número de Identificación" required>
                          <Input value={detailContract.contratante.repIdentificacion} onChange={e => updateContractor('repIdentificacion', e.target.value)} disabled={detailContract.contratante.lock} />
                        </FormGroup>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormGroup label="Cargo" required>
                          <Input value={detailContract.contratante.repCargo} onChange={e => updateContractor('repCargo', e.target.value)} disabled={detailContract.contratante.lock} />
                        </FormGroup>
                        <FormGroup label="Teléfono" required>
                          <Input value={detailContract.contratante.repTelefono} onChange={e => updateContractor('repTelefono', e.target.value)} disabled={detailContract.contratante.lock} />
                        </FormGroup>
                        <FormGroup label="Correo" required>
                          <Input type="email" value={detailContract.contratante.repCorreo} onChange={e => updateContractor('repCorreo', e.target.value)} disabled={detailContract.contratante.lock} />
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                </div>

                {!detailContract.contratante.lock && (
                  <div className="flex justify-end flex-wrap gap-3">
                    <Button variant="primary" onClick={handleSubmitContractor}>
                      {detailContract.paso === 2 ? 'Reenviar datos actualizados' : 'Enviar datos al contratante'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Distribución del crédito ── */}
            {activeTab === 'distribucion' && (
              <div className="space-y-5">

                {/* Resumen */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: 'Monto del crédito', value: formatXaf(detailContract.monto),     cls: 'text-text-1'     },
                    { label: 'Asignado',           value: formatXaf(detailContract.asignado),  cls: 'text-orange'     },
                    { label: 'Disponible',         value: formatXaf(detailContract.disponible),cls: 'text-green-text' },
                    { label: '% Asignado',         value: `${pct(detailContract.asignado, detailContract.monto)}%`, cls: 'text-blue-text' },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="bg-white rounded-[14px] border border-border p-4">
                      <div className={`text-[20px] font-extrabold leading-none mb-1 ${cls}`}>{value}</div>
                      <div className="text-[12px] text-text-4">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Lista de distribuciones */}
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="text-[14px] font-bold">Distribuciones</div>
                      <div className="text-[12px] text-text-4">Asignaciones del crédito por concepto y proveedor.</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" onClick={() => setDistribModal({ ...DISTRIB_EMPTY, open: true, providerId: providers[0]?.id || '' })}>
                        Nueva Distribución
                      </Button>
                      <Button variant="ghost" onClick={() => setShowProviderModal(true)}>
                        Añadir proveedor
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {detailContract.distribucion.map(item => {
                      const ConceptIcon = CONCEPTO_ICONS[item.concepto] ?? FolderOpen;
                      const pctVal = parseFloat(pct(item.monto, detailContract.monto));
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-[16px] p-4 border border-border flex items-center gap-4 transition-all duration-200 hover:scale-[1.015] hover:border-orange/40 cursor-default"
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.18)'; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
                        >
                          {/* Icono */}
                          <div className="w-12 h-12 rounded-[14px] bg-orange-tint flex items-center justify-center shrink-0">
                            <ConceptIcon className="w-5 h-5 text-orange" />
                          </div>

                          {/* Info + barra */}
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-bold text-text-1 leading-tight">{item.concepto}</div>
                            {item.providerName
                              ? <div className="text-[12px] text-text-4 mt-0.5 truncate">{item.providerName} · <span className="text-text-5">{item.providerSector}</span></div>
                              : <div className="text-[12px] text-text-5 mt-0.5">Sin proveedor asociado</div>
                            }
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="flex-1 h-[5px] bg-page-bg rounded-full overflow-hidden">
                                <div className="h-full bg-orange rounded-full transition-all duration-500" style={{ width: `${Math.min(pctVal, 100)}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-orange shrink-0">{pctVal}%</span>
                            </div>
                          </div>

                          {/* Monto + acciones */}
                          <div className="shrink-0 flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-[15px] font-extrabold text-text-1 leading-tight">{formatXaf(item.monto)}</div>
                              <div className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-tint text-orange border border-orange/20">
                                {pctVal}% del crédito
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 border-l border-border pl-3">
                              <button onClick={() => handleOpenEditDistrib(item)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteDistrib(item.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {detailContract.distribucion.length === 0 && (
                      <div className="text-[12px] text-text-4 py-6 text-center">No hay distribuciones registradas aún.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Facturas ── */}
            {activeTab === 'facturas' && (() => {
              const contractInvoices     = invoices.filter(inv => inv.contrato === detailContract.id);
              const contratanteInvoices  = contractInvoices.filter(inv => inv.tipo === 'contratante');
              const proveedorInvoices    = contractInvoices.filter(inv => inv.tipo === 'proveedor');

              const InvoiceCard = ({ inv }) => (
                <div
                  className="bg-white rounded-[16px] p-4 border border-border flex items-center gap-4 transition-all duration-200 hover:scale-[1.015] hover:border-orange/40 cursor-default"
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
                >
                  <div className="w-12 h-12 rounded-[14px] bg-orange-tint flex items-center justify-center shrink-0">
                    {inv.tipo === 'contratante'
                      ? <Building2 className="w-5 h-5 text-orange" />
                      : <Truck className="w-5 h-5 text-orange" />
                    }
                  </div>
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
                  <div className="shrink-0 flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[15px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
                      <div className="text-[11px] text-text-5 mt-0.5">{inv.fecha}</div>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-border pl-3">
                      <button onClick={() => handleOpenEditInvoice(inv)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );

              return (
                <div className="space-y-5">
                  {/* Resumen */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: contractInvoices.length,    label: 'Total de facturas',          cls: 'text-text-1'     },
                      { value: contratanteInvoices.length, label: 'Facturas del contratante',   cls: 'text-blue-text'  },
                      { value: proveedorInvoices.length,   label: 'Facturas de proveedores',    cls: 'text-orange'     },
                    ].map(({ value, label, cls }) => (
                      <div key={label} className="bg-white rounded-[14px] border border-border p-4">
                        <div className={`text-[32px] font-extrabold leading-none mb-1 ${cls}`}>{value}</div>
                        <div className="text-[12px] text-text-4">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Lista agrupada */}
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <div className="text-[14px] font-bold">Facturas</div>
                        <div className="text-[12px] text-text-4">Historial de facturas asociadas a este contrato.</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={() => handleOpenNewInvoice('contratante')}>
                          Nueva Factura al Contratante
                        </Button>
                        <Button variant="primary" onClick={() => handleOpenNewInvoice('proveedor')}>
                          Factura a Proveedor
                        </Button>
                      </div>
                    </div>

                    {contractInvoices.length === 0 && (
                      <div className="text-[12px] text-text-4 py-6 text-center">No hay facturas para este contrato.</div>
                    )}

                    {contratanteInvoices.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] mb-2.5">Al contratante</div>
                        <div className="space-y-3">
                          {contratanteInvoices.map(inv => <InvoiceCard key={inv.id} inv={inv} />)}
                        </div>
                      </div>
                    )}

                    {proveedorInvoices.length > 0 && (
                      <div>
                        <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] mb-2.5">A proveedores</div>
                        <div className="space-y-3">
                          {proveedorInvoices.map(inv => <InvoiceCard key={inv.id} inv={inv} />)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </>
        ) : null}
      </div>

      {/* ── Modal: Nueva / Editar Distribución ── */}
      {distribModal.open && (
        <Modal
          title={distribModal.editId ? 'Editar distribución' : 'Nueva distribución'}
          onClose={() => setDistribModal(DISTRIB_EMPTY)}
          footer={
            <>
              <Button variant="ghost"   onClick={() => setDistribModal(DISTRIB_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveDistrib}>
                {distribModal.editId ? 'Guardar cambios' : 'Añadir distribución'}
              </Button>
            </>
          }
          wide
        >
          <div className="grid grid-cols-1 gap-4">
            <FormGroup label="Concepto" required>
              <Select value={distribModal.concepto} onChange={e => setDistribModal({ ...distribModal, concepto: e.target.value })}>
                <option value="">Seleccionar concepto…</option>
                {CONCEPTOS.map(c => <option key={c}>{c}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Monto asignado (XAF)" required>
              <Input
                type="text" inputMode="numeric" placeholder="Ej: 5,000,000"
                value={distribModal.monto}
                onChange={e => setDistribModal({ ...distribModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
              />
              {distribModal.monto && <div className="text-[11px] text-text-4 mt-1">{formatXaf(distribModal.monto)}</div>}
            </FormGroup>
            <div className="flex items-center gap-3">
              <input
                id="asignar-proveedor-distrib"
                type="checkbox"
                checked={distribModal.asignarProveedor}
                onChange={() => setDistribModal({
                  ...distribModal,
                  asignarProveedor: !distribModal.asignarProveedor,
                  providerId: !distribModal.asignarProveedor ? (providers[0]?.id || '') : '',
                })}
              />
              <label htmlFor="asignar-proveedor-distrib" className="text-[13px] text-text-3">Asignar a un proveedor</label>
            </div>
            {distribModal.asignarProveedor && (
              <FormGroup label="Proveedor" required>
                <Select value={distribModal.providerId} onChange={e => setDistribModal({ ...distribModal, providerId: e.target.value })}>
                  <option value="">Seleccionar proveedor…</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.razonSocial} · {p.sector}</option>)}
                </Select>
              </FormGroup>
            )}
          </div>
        </Modal>
      )}

      {/* ── Modal: Añadir proveedor ── */}
      {showProviderModal && (
        <Modal
          title="Añadir proveedor"
          onClose={() => { setShowProviderModal(false); setProviderForm(PROVIDER_FORM_EMPTY); }}
          footer={
            <>
              <Button variant="ghost" onClick={() => { setShowProviderModal(false); setProviderForm(PROVIDER_FORM_EMPTY); }}>Cancelar</Button>
              <Button variant="primary" onClick={handleAddProvider}>Guardar proveedor</Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="text-[12px] text-text-4">Registra un nuevo proveedor en tu directorio. Podrás asignarlo a distribuciones de crédito en cualquier momento.</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormGroup label="Razón Social" required>
                <Input value={providerForm.razonSocial} onChange={e => setProviderForm({ ...providerForm, razonSocial: e.target.value })} placeholder="Nombre legal exacto" />
              </FormGroup>
              <FormGroup label="Nombre Comercial">
                <Input value={providerForm.nombreComercial} onChange={e => setProviderForm({ ...providerForm, nombreComercial: e.target.value })} placeholder="Nombre comercial o marca" />
              </FormGroup>
              <FormGroup label="RUC / NIF" required>
                <Input value={providerForm.ruc} onChange={e => setProviderForm({ ...providerForm, ruc: e.target.value })} placeholder="Ej: GE-2024-00123" />
              </FormGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormGroup label="Sector Productivo" required>
                <Select value={providerForm.sector} onChange={e => setProviderForm({ ...providerForm, sector: e.target.value })}>
                  <option value="">Seleccionar…</option>
                  {SECTORES.map(s => <option key={s}>{s}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Teléfono">
                <Input value={providerForm.telefono} onChange={e => setProviderForm({ ...providerForm, telefono: e.target.value })} placeholder="+240 222 000 000" />
              </FormGroup>
              <FormGroup label="Correo" required>
                <Input type="email" value={providerForm.correo} onChange={e => setProviderForm({ ...providerForm, correo: e.target.value })} placeholder="correo@empresa.gq" />
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Nueva / Editar factura ── */}
      {invoiceModal.open && (() => {
        const isEdit       = !!invoiceModal.editId;
        const isProv       = invoiceModal.type === 'proveedor';
        const selProvider  = providers.find(p => p.id === invoiceModal.proveedorId);
        const maxMonto     = isProv && invoiceModal.proveedorId ? getProviderMaxMonto(invoiceModal.proveedorId) : null;
        const autoId       = isEdit ? invoiceModal.editId : nextInvoiceId();
        return (
          <Modal
            title={isEdit
              ? `Editar factura ${invoiceModal.editId}`
              : (isProv ? 'Nueva factura a proveedor' : 'Nueva factura al contratante')}
            onClose={() => setInvoiceModal(INVOICE_MODAL_EMPTY)}
            footer={
              <>
                <Button variant="ghost" onClick={() => setInvoiceModal(INVOICE_MODAL_EMPTY)}>Cancelar</Button>
                <Button variant="primary" onClick={handleSaveInvoice}>
                  {isEdit ? 'Guardar cambios' : 'Crear factura'}
                </Button>
              </>
            }
            wide
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup label="Nº de factura">
                  <Input value={autoId} disabled />
                </FormGroup>
                <FormGroup label="Contrato">
                  <Input value={detailContract?.id || ''} disabled />
                </FormGroup>
              </div>

              {isProv ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="Proveedor" required>
                    <Select
                      value={invoiceModal.proveedorId}
                      onChange={e => setInvoiceModal({ ...invoiceModal, proveedorId: e.target.value, monto: '' })}
                    >
                      <option value="">Seleccionar proveedor…</option>
                      {detailContract?.distribucion.filter(d => d.providerId).map(item => (
                        <option key={item.id} value={item.providerId}>{item.providerName} · {item.providerSector}</option>
                      ))}
                    </Select>
                  </FormGroup>
                  <FormGroup label="Monto (XAF)" required>
                    <Input
                      type="text" inputMode="numeric" placeholder="Ej: 4,500,000"
                      value={invoiceModal.monto}
                      onChange={e => setInvoiceModal({ ...invoiceModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
                    />
                    {maxMonto !== null && (
                      <div className={`text-[11px] mt-1 ${Number(invoiceModal.monto) > maxMonto ? 'text-red-text font-semibold' : 'text-text-4'}`}>
                        Máximo asignable: {formatXaf(maxMonto)}
                        {Number(invoiceModal.monto) > maxMonto && ' — supera el monto otorgado'}
                      </div>
                    )}
                    {invoiceModal.monto && Number(invoiceModal.monto) <= (maxMonto ?? Infinity) && (
                      <div className="text-[11px] text-text-4 mt-1">{formatXaf(invoiceModal.monto)}</div>
                    )}
                  </FormGroup>
                </div>
              ) : (
                <FormGroup label="Monto (XAF)" required>
                  <Input
                    type="text" inputMode="numeric" placeholder="Ej: 18,000,000"
                    value={invoiceModal.monto}
                    onChange={e => setInvoiceModal({ ...invoiceModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                  {invoiceModal.monto && <div className="text-[11px] text-text-4 mt-1">{formatXaf(invoiceModal.monto)}</div>}
                </FormGroup>
              )}

              <FormGroup label="Concepto" required>
                <Textarea
                  value={invoiceModal.concepto}
                  onChange={e => setInvoiceModal({ ...invoiceModal, concepto: e.target.value })}
                  placeholder="Descripción del servicio o trabajo facturado…"
                />
              </FormGroup>
            </div>
          </Modal>
        );
      })()}

      {/* ── Toast ── */}
      <div className={`fixed bottom-6 right-6 z-50 w-[340px] bg-white rounded-[14px] shadow-xl border border-border p-4 flex items-start gap-3 transition-all duration-300 ease-out
        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      >
        <div className="w-8 h-8 rounded-[8px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-orange" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-text-1 mb-0.5">Datos enviados</div>
          <div className="text-[12px] text-text-4 leading-snug">{toast.message}</div>
        </div>
      </div>
    </AppShell>
  );
}
