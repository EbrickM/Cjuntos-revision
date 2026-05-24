import { useState } from 'react';
import { ArrowLeft, Upload, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';

const formatXaf = (value) => `XAF ${new Intl.NumberFormat('en-US').format(Number(value) || 0)}`;

const SECTORES   = ['Energía', 'Construcción', 'Manufactura', 'Transporte', 'Tecnología', 'Servicios', 'Alimentación', 'Minería', 'Agricultura', 'Comercio'];
const TIPOS_DOC  = ['Pasaporte', 'Cédula', 'Licencia de conducir', 'Carnet operativo'];

const initialProviders = [
  { id: 'p1', nombre: 'Cemex GE',      ruc: 'GE-2019-00123', sector: 'Materiales', email: 'ventas@cemex.gq',    telefono: '+240 222 111 222', activo: true },
  { id: 'p2', nombre: 'TransGE S.L.',  ruc: 'GE-2020-00445', sector: 'Transporte', email: 'info@transge.gq',    telefono: '+240 222 333 444', activo: true },
  { id: 'p3', nombre: 'ServTec GE',    ruc: 'GE-2022-00112', sector: 'Tecnología', email: 'soporte@servtec.gq', telefono: '+240 222 777 888', activo: true },
];

const initialContracts = [
  {
    id: 'CTR-2026-001',
    monto: 58000000, asignado: 0, disponible: 58000000,
    paso: 1, estado: 'Pendiente datos del contratante',
    nota: 'Aprobado por Bonafide. Completa los datos del contratante para activar la verificación.',
    contratante: {
      razonSocial: '', nombreComercial: '', ruc: '', sectorProductivo: '',
      telefonoCorporativo: '', correoCorporativo: '',
      objetoTrabajo: '', documentoContrato: null, montoGlobal: '',
      fechaInicio: '', fechaFin: '', plazosEjecucion: '',
      repNombre: '', repTipoDoc: '', repIdentificacion: '', repCargo: '', repTelefono: '', repCorreo: '',
      confirmado: false, lock: false,
    },
    distribucion: [],
  },
  {
    id: 'CTR-2026-003',
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
    id: 'CTR-2026-004',
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
    id: 'CTR-2026-002',
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
      { id: 'p2', nombre: 'TransGE S.L.', monto: 9000000 },
    ],
  },
  {
    id: 'CTR-2026-005',
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
  { id: 'FAC-2026-1025', tipo: 'proveedor',   contrato: 'CTR-2026-002', proveedor: 'TransGE S.L.', monto: 4500000,  estado: 'Enviada' },
  { id: 'FAC-2026-1031', tipo: 'contratante', contrato: 'CTR-2026-002', monto: 18000000, estado: 'Pagada' },
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
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal]   = useState(false);
  const [invoiceType, setInvoiceType]             = useState('contratante');
  const [invoiceForm, setInvoiceForm] = useState({
    contratante: '', factura: 'FAC-2026-1001', fecha: '24 / 05 / 2026',
    monto: '', concepto: '', contrato: '', proveedor: '',
  });
  const [providerForm, setProviderForm] = useState({
    providerId: initialProviders[0].id, amount: '', nuevoNombre: '', nuevoRuc: '',
    nuevoEmail: '', nuevoTelefono: '', nuevoSector: 'Materiales', nuevoProveedor: false,
  });
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4500);
  };

  const detailContract = detailId ? (contracts.find(c => c.id === detailId) ?? null) : null;

  const totalContratos         = contracts.length;
  const activosContratos       = contracts.filter(c => c.paso === 4).length;
  const pendientesDatos        = contracts.filter(c => c.paso === 1).length;
  const pendientesConfirm      = contracts.filter(c => c.paso === 2).length;
  const pendientesAutorizacion = contracts.filter(c => c.paso === 3).length;

  const updateContract   = (id, patch) =>
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const updateContractor = (field, value) =>
    updateContract(detailId, { contratante: { ...detailContract.contratante, [field]: value } });

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

  const handleAssignProvider = () => {
    const amount = Number(providerForm.amount.replace(/[^0-9]/g, '')) || 0;
    if (amount <= 0) return;
    let providerId   = providerForm.providerId;
    let providerName = providers.find(p => p.id === providerId)?.nombre;
    const newProviders = [...providers];
    if (providerForm.nuevoProveedor && providerForm.nuevoNombre.trim()) {
      const newId = `p${Math.max(...providers.map(p => Number(p.id.replace('p', ''))), 0) + 1}`;
      const next  = { id: newId, nombre: providerForm.nuevoNombre, ruc: providerForm.nuevoRuc, sector: providerForm.nuevoSector, email: providerForm.nuevoEmail, telefono: providerForm.nuevoTelefono, activo: true };
      newProviders.push(next);
      providerId = newId; providerName = next.nombre;
      setProviders(newProviders);
    }
    const prevDist = detailContract.distribucion.filter(i => i.id !== providerId);
    updateContract(detailId, {
      distribucion: [...prevDist, { id: providerId, nombre: providerName ?? 'Proveedor nuevo', monto: amount }],
      asignado:   prevDist.reduce((s, i) => s + i.monto, 0) + amount,
      disponible: detailContract.monto - prevDist.reduce((s, i) => s + i.monto, 0) - amount,
    });
    setShowProviderModal(false);
    setProviderForm({ providerId: initialProviders[0].id, amount: '', nuevoNombre: '', nuevoRuc: '', nuevoEmail: '', nuevoTelefono: '', nuevoSector: 'Materiales', nuevoProveedor: false });
  };

  const handleAssignmentEdit = (assignmentId, amountText) => {
    const amount   = Number(amountText.replace(/[^0-9]/g, '')) || 0;
    const nextDist = detailContract.distribucion.map(i => i.id === assignmentId ? { ...i, monto: amount } : i);
    const nextAsignado = nextDist.reduce((s, i) => s + i.monto, 0);
    updateContract(detailId, { distribucion: nextDist, asignado: nextAsignado, disponible: detailContract.monto - nextAsignado });
  };

  const handleOpenInvoice = (type) => {
    setInvoiceType(type);
    setInvoiceForm(prev => ({
      ...prev, contrato: detailContract.id,
      contratante: detailContract.contratante.razonSocial,
      proveedor:   detailContract.distribucion[0]?.nombre || '',
    }));
    setShowInvoiceModal(true);
  };

  return (
    <AppShell active="epCreditos" role="empresa-pequena" title="Mis créditos" sub="Gestión de contratos de crédito">
      <div className="fade-in">

        {/* ── LISTA ── */}
        {detailId === null ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              {[
                { value: totalContratos,         label: 'Contratos de crédito totales',               numCls: 'text-text-1'     },
                { value: activosContratos,        label: 'Contratos de crédito activos',               numCls: 'text-green-text' },
                { value: pendientesDatos,         label: 'Pendientes de datos del contratante',        numCls: 'text-yellow-text'},
                { value: pendientesConfirm,       label: 'Pendientes de confirmación del contratante', numCls: 'text-blue-text'  },
                { value: pendientesAutorizacion,  label: 'Pendientes de autorización del banco',       numCls: 'text-orange'     },
              ].map(({ value, label, numCls }) => (
                <div key={label} className="bg-white rounded-[14px] border border-border p-4">
                  <div className={`text-[36px] font-extrabold leading-none mb-2 ${numCls}`}>{value}</div>
                  <div className="text-[12px] text-text-4 leading-snug">{label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[14px] font-bold mb-4">Contratos</div>
              <div className="space-y-3">
                {contracts.map(contract => {
                  const badge = contractBadge(contract.paso);
                  return (
                    <div
                      key={contract.id}
                      onClick={() => { setDetailId(contract.id); setActiveTab('contratante'); }}
                      className="rounded-[14px] border border-border p-4 cursor-pointer hover:bg-page-bg hover:border-orange transition group"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <div className="text-[13px] font-semibold text-text-1">{contract.id}</div>
                          {contract.estado && <div className="text-[12px] text-text-4 mt-0.5">{contract.estado}</div>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          <span className="text-text-5 text-[18px] leading-none group-hover:text-orange transition">›</span>
                        </div>
                      </div>
                      <div className="text-[16px] font-extrabold text-text-1 mb-1">{formatXaf(contract.monto)}</div>
                      <div className="flex gap-4 text-[12px] text-text-4">
                        {contract.paso === 4
                          ? <><span>Disponible: {formatXaf(contract.disponible)}</span><span>Asignado: {formatXaf(contract.asignado)}</span></>
                          : <span>Crédito total: {formatXaf(contract.monto)}</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
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

                {/* Sección 1: Identidad — 2 filas de 3 */}
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

                {/* Sección 2: Datos del Contrato */}
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="mb-5">
                    <div className="text-[14px] font-bold">Datos del Contrato</div>
                    <div className="text-[12px] text-text-4">Descripción del objeto contractual y condiciones económicas.</div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">

                    <FormGroup label="Objeto del Trabajo" required>
                      <Textarea value={detailContract.contratante.objetoTrabajo} onChange={e => updateContractor('objetoTrabajo', e.target.value)} disabled={detailContract.contratante.lock} />
                    </FormGroup>

                    {/* Documento del Contrato — upload/preview toggle */}
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
                              <button
                                onClick={() => updateContractor('documentoContrato', null)}
                                className="flex items-center gap-1 text-[11px] text-red-text hover:opacity-75 transition ml-3 shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar
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

                    {/* Monto + Fechas + Plazo en una sola fila */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <FormGroup label="Monto Global (XAF)" required>
                        <Input
                          type="text" inputMode="numeric" placeholder="Ej: 58000000"
                          value={detailContract.contratante.montoGlobal}
                          onChange={e => updateContractor('montoGlobal', e.target.value.replace(/[^0-9]/g, ''))}
                          disabled={detailContract.contratante.lock}
                        />
                        {detailContract.contratante.montoGlobal && (
                          <div className="text-[11px] text-text-4 mt-1">{formatXaf(detailContract.contratante.montoGlobal)}</div>
                        )}
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

                    {/* Representante Legal */}
                    <div className="pt-1">
                      <div className="text-[13px] font-bold text-text-1 mb-3 pb-2 border-b border-border">Representante Legal</div>
                      {/* Fila 1: Nombre, Tipo doc, Número */}
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
                      {/* Fila 2: Cargo, Teléfono, Correo */}
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

                {/* Acciones */}
                {!detailContract.contratante.lock && (
                  <div className="flex justify-end flex-wrap gap-3">
                    <Button variant="primary" onClick={handleSubmitContractor}>
                      {detailContract.paso === 2 ? 'Reenviar datos actualizados' : 'Enviar datos al contratante'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Distribución ── */}
            {activeTab === 'distribucion' && (
              <div className="bg-white rounded-[14px] border border-border p-5">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="text-[14px] font-bold">Distribución del crédito</div>
                    <div className="text-[12px] text-text-4">Asigna proveedores y ajusta montos para proyectos y pagos.</div>
                  </div>
                  <Button variant="secondary" onClick={() => setShowProviderModal(true)}>Añadir proveedor</Button>
                </div>
                <div className="space-y-4">
                  {detailContract.distribucion.map(item => (
                    <div key={item.id} className="bg-page-bg rounded-[14px] p-4 border border-border grid grid-cols-1 md:grid-cols-[1fr_160px] gap-4 items-center">
                      <div>
                        <div className="text-[13px] font-semibold text-text-1">{item.nombre}</div>
                        <div className="text-[11px] text-text-4">{providers.find(p => p.id === item.id)?.ruc || 'RUC no disponible'}</div>
                      </div>
                      <FormGroup label="Monto asignado (XAF)">
                        <Input value={item.monto.toString()} onChange={e => handleAssignmentEdit(item.id, e.target.value)} />
                      </FormGroup>
                    </div>
                  ))}
                  {detailContract.distribucion.length === 0 && (
                    <div className="text-[12px] text-text-4 py-6 text-center">No hay proveedores asignados aún.</div>
                  )}
                  <div className="rounded-[14px] border border-dashed border-border p-4 text-[12px] text-text-4">
                    <div className="flex justify-between gap-3 mb-2"><span>Total asignado</span><strong>{formatXaf(detailContract.asignado)}</strong></div>
                    <div className="flex justify-between gap-3"><span>Saldo disponible</span><strong>{formatXaf(detailContract.disponible)}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Facturas ── */}
            {activeTab === 'facturas' && (
              <div className="space-y-4">
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="text-[14px] font-bold mb-4">Acciones</div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary"   onClick={() => handleOpenInvoice('contratante')}>Nueva Factura al Contratante</Button>
                    <Button variant="secondary" onClick={() => handleOpenInvoice('proveedor')}>Generar Pago al Proveedor</Button>
                  </div>
                </div>
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="text-[14px] font-bold mb-3">Facturas del contrato</div>
                  <div className="space-y-3">
                    {initialInvoices.filter(inv => inv.contrato === detailContract.id).map(inv => (
                      <div key={inv.id} className="rounded-[14px] border border-border p-4 bg-page-bg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-[13px] font-semibold text-text-1">{inv.id}</div>
                            <div className="text-[11px] text-text-4">{inv.tipo === 'contratante' ? 'Al contratante' : `A ${inv.proveedor}`}</div>
                          </div>
                          <Badge variant={inv.estado === 'Pagada' ? 'green' : inv.estado === 'Enviada' ? 'blue' : 'yellow'}>{inv.estado}</Badge>
                        </div>
                        <div className="text-[12px] text-text-4">Monto: {formatXaf(inv.monto)}</div>
                      </div>
                    ))}
                    {initialInvoices.filter(inv => inv.contrato === detailContract.id).length === 0 && (
                      <div className="text-[12px] text-text-4">No hay facturas para este contrato.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* ── Modal: Añadir proveedor ── */}
      {showProviderModal && (
        <Modal
          title="Añadir proveedor al crédito"
          onClose={() => setShowProviderModal(false)}
          footer={<><Button variant="ghost" onClick={() => setShowProviderModal(false)}>Cancelar</Button><Button variant="primary" onClick={handleAssignProvider}>Asignar proveedor</Button></>}
          wide
        >
          <div className="grid grid-cols-1 gap-4">
            <FormGroup label="Proveedor existente">
              <Select value={providerForm.providerId} onChange={e => setProviderForm({ ...providerForm, providerId: e.target.value })} disabled={providerForm.nuevoProveedor}>
                {providers.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Monto asignado (XAF)" required>
              <Input type="text" placeholder="10,000,000" value={providerForm.amount} onChange={e => setProviderForm({ ...providerForm, amount: e.target.value })} />
            </FormGroup>
            <div className="flex items-center gap-3">
              <input id="nuevo-proveedor" type="checkbox" checked={providerForm.nuevoProveedor} onChange={() => setProviderForm({ ...providerForm, nuevoProveedor: !providerForm.nuevoProveedor })} />
              <label htmlFor="nuevo-proveedor" className="text-[13px] text-text-3">Crear nuevo proveedor</label>
            </div>
            {providerForm.nuevoProveedor && (
              <>
                <FormGroup label="Nombre del proveedor" required>
                  <Input value={providerForm.nuevoNombre} onChange={e => setProviderForm({ ...providerForm, nuevoNombre: e.target.value })} />
                </FormGroup>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormGroup label="RUC / NIF" required><Input value={providerForm.nuevoRuc} onChange={e => setProviderForm({ ...providerForm, nuevoRuc: e.target.value })} /></FormGroup>
                  <FormGroup label="Email" required><Input type="email" value={providerForm.nuevoEmail} onChange={e => setProviderForm({ ...providerForm, nuevoEmail: e.target.value })} /></FormGroup>
                  <FormGroup label="Teléfono"><Input value={providerForm.nuevoTelefono} onChange={e => setProviderForm({ ...providerForm, nuevoTelefono: e.target.value })} /></FormGroup>
                </div>
                <FormGroup label="Sector">
                  <Select value={providerForm.nuevoSector} onChange={e => setProviderForm({ ...providerForm, nuevoSector: e.target.value })}>
                    <option>Materiales</option><option>Transporte</option><option>Servicios</option><option>Tecnología</option><option>Alimentación</option>
                  </Select>
                </FormGroup>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ── Modal: Nueva factura ── */}
      {showInvoiceModal && (
        <Modal
          title={invoiceType === 'contratante' ? 'Nueva factura al contratante' : 'Nueva factura al proveedor'}
          onClose={() => setShowInvoiceModal(false)}
          footer={<><Button variant="ghost" onClick={() => setShowInvoiceModal(false)}>Cancelar</Button><Button variant="primary" onClick={() => setShowInvoiceModal(false)}>Crear factura</Button></>}
          wide
        >
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Contrato" required>
                <Select value={invoiceForm.contrato} onChange={e => setInvoiceForm({ ...invoiceForm, contrato: e.target.value })}>
                  {contracts.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Nº de factura" required>
                <Input value={invoiceForm.factura} onChange={e => setInvoiceForm({ ...invoiceForm, factura: e.target.value })} />
              </FormGroup>
            </div>
            {invoiceType === 'proveedor' && detailContract && (
              <FormGroup label="Proveedor" required>
                <Select value={invoiceForm.proveedor} onChange={e => setInvoiceForm({ ...invoiceForm, proveedor: e.target.value })}>
                  {detailContract.distribucion.map(item => <option key={item.id} value={item.nombre}>{item.nombre}</option>)}
                </Select>
              </FormGroup>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Fecha de emisión" required><Input value={invoiceForm.fecha} onChange={e => setInvoiceForm({ ...invoiceForm, fecha: e.target.value })} /></FormGroup>
              <FormGroup label="Monto (XAF)" required><Input value={invoiceForm.monto} onChange={e => setInvoiceForm({ ...invoiceForm, monto: e.target.value })} /></FormGroup>
            </div>
            <FormGroup label="Concepto" required>
              <Textarea value={invoiceForm.concepto} onChange={e => setInvoiceForm({ ...invoiceForm, concepto: e.target.value })} />
            </FormGroup>
            <div className="rounded-[14px] bg-blue-bg border border-blue-text/20 p-4 text-[12px] text-text-4">
              {invoiceType === 'contratante'
                ? 'La factura se generará para ser enviada al contratante vía email y pagada a Bonafide.'
                : 'La factura quedará registrada como pago a proveedor dentro del crédito seleccionado.'}
            </div>
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
          <div className="text-[13px] font-semibold text-text-1 mb-0.5">Datos enviados</div>
          <div className="text-[12px] text-text-4 leading-snug">{toast.message}</div>
        </div>
      </div>
    </AppShell>
  );
}
