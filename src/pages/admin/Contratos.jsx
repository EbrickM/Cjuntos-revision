import { useState } from 'react';
import {
  ArrowLeft, FileText, CheckCircle2, Trash2, Building2, Truck,
  Users, Package, Wrench, Receipt, Cpu, FolderOpen,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const formatXaf = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;
const pct = (part, total) => total > 0 ? ((part / total) * 100).toFixed(1) : '0.0';

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

const contractBadge = (paso) => ({
  1: { variant: 'yellow', label: 'Pend. datos' },
  2: { variant: 'blue',   label: 'Esp. confirmación' },
  3: { variant: 'yellow', label: 'Esp. autorización' },
  4: { variant: 'green',  label: 'Activo' },
}[paso] ?? { variant: 'yellow', label: 'Pendiente' });

const TABS = [
  { id: 'contratante',  label: 'Datos del Contratante' },
  { id: 'distribucion', label: 'Distribución del crédito' },
  { id: 'facturas',     label: 'Facturas' },
];

const initialContracts = [
  {
    id: 'CTR-2026-001', pymeNombre: 'Construcciones Silva Ltd.',
    monto: 58000000, asignado: 0, disponible: 58000000,
    paso: 1, estado: 'Pendiente datos del contratante',
    nota: 'Aprobado por Bonafide. En espera de que la PYME complete los datos del contratante para iniciar la verificación.',
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
    paso: 2, estado: 'En espera de confirmación del contratante',
    nota: 'Los datos han sido enviados al contratante. Cuando confirme, Bonafide deberá autorizar el contrato.',
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
    paso: 3, estado: 'Pendiente autorización Bonafide',
    nota: 'El contratante ha confirmado los datos. Puedes autorizar este contrato para que la PYME pueda distribuir el crédito.',
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
    distribucion: [], facturas: [],
  },
  {
    id: 'CTR-2026-007', pymeNombre: 'ServTec GE',
    monto: 18500000, asignado: 0, disponible: 18500000,
    paso: 3, estado: 'Pendiente autorización Bonafide',
    nota: 'El contratante ha confirmado los datos. Puedes autorizar este contrato para que la PYME pueda distribuir el crédito.',
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
    paso: 4, estado: '', nota: '',
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
    paso: 4, estado: '', nota: '',
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

export default function AdminContratos() {
  const [contracts, setContracts] = useState(initialContracts);
  const [detailId, setDetailId]   = useState(null);
  const [activeTab, setActiveTab] = useState('contratante');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4500);
  };

  const detailContract = detailId ? (contracts.find(c => c.id === detailId) ?? null) : null;

  const handleAuthorize = (id) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, paso: 4, estado: '', nota: '' } : c));
    showToast(`Contrato ${id} autorizado. La PYME ya puede distribuir el crédito.`);
  };

  const handleDelete = (id) => {
    setContracts(prev => prev.filter(c => c.id !== id));
    if (detailId === id) setDetailId(null);
    setDeleteModal({ open: false, id: null });
    showToast(`Contrato ${id} eliminado.`);
  };

  const openDetail = (id) => { setDetailId(id); setActiveTab('contratante'); };

  const totalContratos         = contracts.length;
  const activosContratos       = contracts.filter(c => c.paso === 4).length;
  const pendientesDatos        = contracts.filter(c => c.paso === 1).length;
  const pendientesConfirm      = contracts.filter(c => c.paso === 2).length;
  const pendientesAutorizacion = contracts.filter(c => c.paso === 3).length;

  return (
    <AppShell active="adminConf" role="admin" title="Contratos" sub="Todos los contratos de crédito">
      <div className="fade-in">

        {/* ── LISTA ── */}
        {detailId === null ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              {[
                { value: totalContratos,         label: 'Contratos totales',                          numCls: 'text-text-1'      },
                { value: activosContratos,        label: 'Contratos activos',                          numCls: 'text-green-text'  },
                { value: pendientesDatos,         label: 'Pendientes de datos',                        numCls: 'text-yellow-text' },
                { value: pendientesConfirm,       label: 'Pendientes de confirmación del contratante', numCls: 'text-blue-text'   },
                { value: pendientesAutorizacion,  label: 'Pendientes de autorización',                 numCls: 'text-orange'      },
              ].map(({ value, label, numCls }) => (
                <div key={label} className="bg-white rounded-[14px] border border-border p-4">
                  <div className={`text-[36px] font-extrabold leading-none mb-2 ${numCls}`}>{value}</div>
                  <div className="text-[12px] text-text-4 leading-snug">{label}</div>
                </div>
              ))}
            </div>

            {/* Cards agrupadas */}
            {(() => {
              const pendAuth = contracts.filter(c => c.paso === 3);
              const otros    = contracts.filter(c => c.paso !== 3);

              const ContractCard = ({ contract }) => {
                const badge  = contractBadge(contract.paso);
                const pctVal = parseFloat(pct(contract.asignado, contract.monto));
                return (
                  <div
                    key={contract.id}
                    className="bg-white rounded-[16px] p-4 border border-border flex items-start gap-4 transition-all duration-200 hover:scale-[1.015] hover:border-orange/40"
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
                  >
                      <div onClick={() => openDetail(contract.id)} className="w-12 h-12 rounded-[14px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5 cursor-pointer">
                        <FileText className="w-5 h-5 text-orange" />
                      </div>

                      <div onClick={() => openDetail(contract.id)} className="flex-1 min-w-0 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[13px] font-bold text-text-1">{contract.id}</span>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        {/* PYME chip */}
                        <div className="inline-flex items-center gap-1.5 bg-orange-tint text-orange text-[11px] font-semibold px-2 py-0.5 rounded-full border border-orange/20 mb-1">
                          <Building2 className="w-3 h-3" />
                          {contract.pymeNombre}
                        </div>
                        {contract.contratante?.razonSocial && (
                          <div className="text-[12px] text-text-4 truncate">{contract.contratante.razonSocial}</div>
                        )}
                        {contract.paso === 4 && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-[5px] bg-page-bg rounded-full overflow-hidden">
                              <div className="h-full bg-orange rounded-full transition-all duration-500" style={{ width: `${Math.min(pctVal, 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-orange shrink-0">{pctVal}% asignado</span>
                          </div>
                        )}
                      </div>

                      {/* Monto + acciones */}
                      <div className="shrink-0 flex items-start gap-2">
                        <div onClick={() => openDetail(contract.id)} className="text-right cursor-pointer">
                          <div className="text-[15px] font-extrabold text-text-1">{formatXaf(contract.monto)}</div>
                          {contract.paso === 4 && (
                            <div className="text-[11px] text-text-5 mt-0.5">Disp: {formatXaf(contract.disponible)}</div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 pl-2 border-l border-border">
                          {contract.paso === 3 && (
                            <button
                              onClick={() => handleAuthorize(contract.id)}
                              title="Autorizar contrato"
                              className="p-1.5 rounded-[8px] hover:bg-green-bg transition text-text-4 hover:text-green-text"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteModal({ open: true, id: contract.id })}
                            title="Eliminar contrato"
                            className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div onClick={() => openDetail(contract.id)} className="text-text-4 text-[18px] leading-none pt-0.5 cursor-pointer">›</div>
                      </div>
                  </div>
                );
              };

              return (
                <div className="space-y-6">
                  {pendAuth.length > 0 && (
                    <div className="bg-white rounded-[14px] border border-orange/30 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="text-[14px] font-bold">Pendientes de autorización</div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-tint text-orange border border-orange/20">{pendAuth.length}</span>
                      </div>
                      <div className="space-y-3">
                        {pendAuth.map(c => <ContractCard key={c.id} contract={c} />)}
                      </div>
                    </div>
                  )}
                  {otros.length > 0 && (
                    <div className="bg-white rounded-[14px] border border-border p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="text-[14px] font-bold">Otros contratos</div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-page-bg text-text-3 border border-border">{otros.length}</span>
                      </div>
                      <div className="space-y-3">
                        {otros.map(c => <ContractCard key={c.id} contract={c} />)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </>

        /* ── DETALLE ── */
        ) : detailContract ? (
          <>
            {/* Breadcrumb + acciones */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={() => setDetailId(null)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-text-3 hover:text-orange transition px-3 py-2 rounded-[10px] hover:bg-orange-tint"
              >
                <ArrowLeft className="w-4 h-4" />
                Contratos
              </button>
              <span className="text-text-5">/</span>
              <span className="text-[14px] font-bold text-text-1">{detailContract.id}</span>
              <Badge variant={contractBadge(detailContract.paso).variant}>
                {detailContract.estado || contractBadge(detailContract.paso).label}
              </Badge>
              <div className="inline-flex items-center gap-1.5 bg-orange-tint text-orange text-[11px] font-semibold px-2 py-0.5 rounded-full border border-orange/20">
                <Building2 className="w-3 h-3" />
                {detailContract.pymeNombre}
              </div>
              <div className="flex-1" />
              {detailContract.paso === 3 && (
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

            {detailContract.nota && detailContract.paso !== 4 && (
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
                    <Badge variant={detailContract.contratante.confirmado ? 'green' : detailContract.paso === 1 ? 'yellow' : 'blue'}>
                      {detailContract.contratante.confirmado ? 'Confirmado' : detailContract.paso === 1 ? 'Pendiente' : 'En revisión'}
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
                      const ConceptIcon = CONCEPTO_ICONS[item.concepto] ?? FolderOpen;
                      const pctVal = parseFloat(pct(item.monto, detailContract.monto));
                      return (
                        <div key={item.id} className="bg-white rounded-[16px] p-4 border border-border flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[14px] bg-orange-tint flex items-center justify-center shrink-0">
                            <ConceptIcon className="w-5 h-5 text-orange" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-bold text-text-1 leading-tight">{item.concepto}</div>
                            {item.providerName
                              ? <div className="text-[12px] text-text-4 mt-0.5">{item.providerName} · <span className="text-text-5">{item.providerSector}</span></div>
                              : <div className="text-[12px] text-text-5 mt-0.5">Sin proveedor asociado</div>
                            }
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="flex-1 h-[5px] bg-page-bg rounded-full overflow-hidden">
                                <div className="h-full bg-orange rounded-full transition-all duration-500" style={{ width: `${Math.min(pctVal, 100)}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-orange shrink-0">{pctVal}%</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-[15px] font-extrabold text-text-1 leading-tight">{formatXaf(item.monto)}</div>
                            <div className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-tint text-orange border border-orange/20">
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
                <div className="bg-white rounded-[16px] p-4 border border-border flex items-center gap-4">
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
