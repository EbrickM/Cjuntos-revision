import { useState } from 'react';
import {
  ArrowLeft, FileText, Trash2, CheckCircle2, Pencil, Search, ChevronRight,
  Users, Package, Truck, Wrench, Receipt, Cpu, FolderOpen, Building2, CreditCard,
  BarChart2, ScrollText, UserSquare, CalendarDays, Banknote, TrendingUp, Wallet,
  Upload, Paperclip,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';

const formatXaf  = (value) => `${new Intl.NumberFormat('de-DE').format(Number(value) || 0)} XAF`;
const pct        = (part, total) => total > 0 ? ((part / total) * 100).toFixed(1) : '0.0';
const fmtDate    = (iso) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const SECTORES  = ['Energía', 'Construcción', 'Manufactura', 'Transporte', 'Tecnología', 'Servicios', 'Alimentación', 'Minería', 'Agricultura', 'Comercio', 'Otro'];
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

const scoreStyle = (score) => {
  if (score >= 750) return { bg: '#E3F4EA', color: '#2E7D5B' };
  if (score >= 600) return { bg: '#FDF6E8', color: '#C68A1D' };
  return { bg: '#FDEEEB', color: '#B8352A' };
};

const InfoRow = ({ label, value }) => (
  <div>
    <div className="text-[11px] font-semibold text-text-4 uppercase tracking-wide mb-1">{label}</div>
    <div className="text-[13px] text-text-1">{value || '—'}</div>
  </div>
);

const SectionHeader = ({ icon: Icon, iconBg, iconColor, title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div>
        <div className="text-[14px] font-bold text-text-1">{title}</div>
        {subtitle && <div className="text-[12px] text-text-4">{subtitle}</div>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

const CTPipeline = ({ estado, tipoFactoring }) => {
  const steps = tipoFactoring === 'inverso' ? CT_ESTADOS_INVERSO : CT_ESTADOS_DIRECTO;
  const currentIdx = steps.indexOf(estado);
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center gap-0.5">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                style={
                  idx < currentIdx  ? { background: '#E3F4EA', color: '#2E7D5B' } :
                  idx === currentIdx ? { background: '#FFF3E0', color: '#EF7A2C' } :
                  { background: '#F6F5F3', color: '#A9A6A1' }
                }>
            {step}
          </span>
          {idx < steps.length - 1 && (
            <div className="w-3 h-px shrink-0" style={{ background: idx < currentIdx ? '#A8D5BE' : '#ECEAE7' }} />
          )}
        </div>
      ))}
    </div>
  );
};

const DISTRIB_EMPTY       = { open: false, editId: null, concepto: '', monto: '', asignarProveedor: false, providerId: '' };
const PROVIDER_FORM_EMPTY = { razonSocial: '', nombreComercial: '', ruc: '', sector: 'Materiales', telefono: '', correo: '', esClienteBonafide: false };
const INV_CT_EMPTY        = { open: false, editId: null, monto: '', concepto: '', fechaVencimiento: '', documento: null };
const INV_PR_EMPTY        = { open: false, editId: null, proveedorId: '', monto: '', concepto: '', fecha: '', fechaVencimiento: '', documento: null };
const PAGO_MODAL_EMPTY    = { open: false, editId: null, monto: '', concepto: '', fecha: '', facturaProvId: '', proveedorId: '', documento: null };

const CT_ESTADOS_INVERSO = ['Creada', 'Enviada', 'Validada', 'IPI Emitido', 'Pagada'];
const CT_ESTADOS_DIRECTO = ['Creada', 'Enviada', 'Validada', 'Pagada'];

const initialProviders = [
  { id: 'p1', razonSocial: 'Cemex GE',      nombreComercial: 'Cemex GE',   ruc: 'GE-2019-00123', sector: 'Materiales', email: 'ventas@cemex.gq',    telefono: '+240 222 111 222', activo: true },
  { id: 'p2', razonSocial: 'TransGE S.L.',  nombreComercial: 'TransGE',    ruc: 'GE-2020-00445', sector: 'Transporte', email: 'info@transge.gq',    telefono: '+240 222 333 444', activo: true },
  { id: 'p3', razonSocial: 'ServTec GE',    nombreComercial: 'ServTec GE', ruc: 'GE-2022-00112', sector: 'Tecnología', email: 'soporte@servtec.gq', telefono: '+240 222 777 888', activo: true },
];

const initialContracts = [
  {
    id: 'CTR-2026-001', kyc: 'vigente',
    monto: 58000000, asignado: 0, disponible: 58000000,
    contratante: {
      razonSocial: 'Constructora Malabo S.A.', nombreComercial: 'Constructora Malabo', ruc: 'GE-2023-00156', sectorProductivo: 'Construcción', scoreCredito: 720,
      telefonoCorporativo: '+240 222 100 200', correoCorporativo: 'admin@conmalabo.gq',
      objetoTrabajo: 'Construcción de sede corporativa en el Paseo Luba, Malabo — estructura, instalaciones y acabados interiores.', documentoContrato: null, montoGlobal: '58000000',
      fechaInicio: '2026-05-01', fechaFin: '2027-04-30', plazosEjecucion: '12 meses',
      repNombre: 'Pedro Ondo Mangue', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1978-00231',
      repCargo: 'Director General', repTelefono: '+240 222 100 201', repCorreo: 'pondo@conmalabo.gq',
    },
    distribucion: [],
  },
  {
    id: 'CTR-2026-003', kyc: 'vigente',
    monto: 31000000, asignado: 0, disponible: 31000000,
    contratante: {
      razonSocial: 'Petro Guinea S.A.', nombreComercial: 'PetroGE', ruc: 'GE-2019-00891', sectorProductivo: 'Energía', scoreCredito: 815,
      telefonoCorporativo: '+240 222 456 789', correoCorporativo: 'contratos@petroguinea.gq',
      objetoTrabajo: 'Suministro de combustible y lubricantes industriales para operaciones en tierra y plataformas offshore.',
      documentoContrato: null, montoGlobal: '31000000',
      fechaInicio: '2026-03-01', fechaFin: '2026-12-31', plazosEjecucion: '10 meses',
      repNombre: 'Carlos Obiang Mba', repTipoDoc: 'Pasaporte', repIdentificacion: 'GE-1985-00234',
      repCargo: 'Director Comercial', repTelefono: '+240 222 456 780', repCorreo: 'cobiang@petroguinea.gq',
    },
    distribucion: [],
  },
  {
    id: 'CTR-2026-004', kyc: 'vencido',
    monto: 75000000, asignado: 0, disponible: 75000000,
    contratante: {
      razonSocial: 'Ministerio de Obras Públicas e Infraestructuras', nombreComercial: 'MOPI-GE', ruc: 'GE-2015-00042', sectorProductivo: 'Construcción', scoreCredito: 680,
      telefonoCorporativo: '+240 222 001 002', correoCorporativo: 'adm@obras.gob.gq',
      objetoTrabajo: 'Construcción y pavimentación de 12 km de infraestructura vial en la zona norte de Malabo, incluyendo drenajes y señalización.',
      documentoContrato: null, montoGlobal: '75000000',
      fechaInicio: '2026-01-15', fechaFin: '2027-01-15', plazosEjecucion: '12 meses',
      repNombre: 'Eugenio Ndong Esono', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1972-00089',
      repCargo: 'Secretario General', repTelefono: '+240 222 001 003', repCorreo: 'endong@obras.gob.gq',
    },
    distribucion: [],
  },
  {
    id: 'CTR-2026-002', kyc: 'vigente',
    monto: 42000000, asignado: 9000000, disponible: 33000000,
    contratante: {
      razonSocial: 'Evans Construction & Engineering S.A.', nombreComercial: 'Evans GE', ruc: 'GE-2021-00278', sectorProductivo: 'Construcción', scoreCredito: 758,
      telefonoCorporativo: '+240 222 909 111', correoCorporativo: 'admin@evans.gq',
      objetoTrabajo: 'Obras de edificación, remodelación integral y adecuación de oficinas corporativas en el complejo empresarial de Sipopo.',
      documentoContrato: null, montoGlobal: '42000000',
      fechaInicio: '2026-02-01', fechaFin: '2026-08-01', plazosEjecucion: '6 meses',
      repNombre: 'John Evans Jr.', repTipoDoc: 'Pasaporte', repIdentificacion: 'GE-1980-00145',
      repCargo: 'CEO & Representante Legal', repTelefono: '+240 222 909 112', repCorreo: 'jevans@evans.gq',
    },
    distribucion: [
      { id: 'dist-001', concepto: 'Pago a Proveedor', monto: 9000000, providerId: 'p2', providerName: 'TransGE S.L.', providerSector: 'Transporte' },
    ],
  },
  {
    id: 'CTR-2026-005', kyc: 'pendiente',
    monto: 25000000, asignado: 0, disponible: 25000000,
    contratante: {
      razonSocial: 'Autoridad Portuaria de Bata S.A.', nombreComercial: 'BataPort', ruc: 'GE-2018-00317', sectorProductivo: 'Transporte', scoreCredito: 630,
      telefonoCorporativo: '+240 222 654 321', correoCorporativo: 'admin@bataporto.gq',
      objetoTrabajo: 'Gestión operativa, mantenimiento preventivo y correctivo de instalaciones y equipos en el Puerto de Bata.',
      documentoContrato: null, montoGlobal: '25000000',
      fechaInicio: '2026-04-01', fechaFin: '2027-03-31', plazosEjecucion: '12 meses',
      repNombre: 'María Esono Nguema', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1979-00312',
      repCargo: 'Directora General', repTelefono: '+240 222 654 322', repCorreo: 'mesono@bataporto.gq',
    },
    distribucion: [],
  },
];

const initialInvoices = [
  {
    id: 'FAC-2026-1025', tipo: 'proveedor', contrato: 'CTR-2026-002',
    proveedorId: 'p2', proveedorNombre: 'TransGE S.L.', monto: 4500000, estado: 'Pendiente',
    concepto: 'Transporte de materiales al sitio de obra', fecha: '01/05/2026', fechaVencimiento: '01/06/2026', documento: null,
  },
  {
    id: 'FAC-2026-1031', tipo: 'contratante', contrato: 'CTR-2026-002',
    monto: 18000000, estado: 'Validada', concepto: 'Avance de obra fase 1 – Cimentación y estructura',
    fecha: '10/05/2026', tipoFactoring: 'inverso', documento: null,
  },
];

const initialPagos = [
  {
    id: 'PAG-2026-001', contrato: 'CTR-2026-002',
    monto: 2500000, concepto: 'Anticipo por servicios de transporte — Fase 2',
    fecha: '15/05/2026', estado: 'Procesado', facturaProvId: 'FAC-2026-1025', proveedorNombre: 'TransGE S.L.', documento: null,
  },
];

const TABS = [
  { id: 'contrato',     label: 'Contrato',     Icon: ScrollText,  iconBg: '#FFF3E0', iconColor: '#EF7A2C' },
  { id: 'contratante',  label: 'Contratante',  Icon: Building2,   iconBg: '#EFF6FF', iconColor: '#3B82F6' },
  { id: 'distribucion', label: 'Distribución', Icon: BarChart2,   iconBg: '#FFF3E0', iconColor: '#EF7A2C' },
  { id: 'facturas',     label: 'Facturas',     Icon: Receipt,     iconBg: '#FDF6E8', iconColor: '#C68A1D' },
  { id: 'pagos',        label: 'Pagos',        Icon: CreditCard,  iconBg: '#E3F4EA', iconColor: '#2E7D5B' },
];

export default function EpCreditos() {
  const { go } = useApp();
  const [contracts, setContracts]                 = useState(initialContracts);
  const [providers, setProviders]                 = useState(initialProviders);
  const [detailId, setDetailId]                   = useState(null);
  const [activeTab, setActiveTab]                 = useState('contrato');
  const [invoices, setInvoices]                   = useState(initialInvoices);
  const [pagos, setPagos]                         = useState(initialPagos);
  const [search, setSearch]                       = useState('');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [distribModal, setDistribModal]           = useState(DISTRIB_EMPTY);
  const [invCtModal, setInvCtModal]               = useState(INV_CT_EMPTY);
  const [invPrModal, setInvPrModal]               = useState(INV_PR_EMPTY);
  const [pagoModal, setPagoModal]                 = useState(PAGO_MODAL_EMPTY);
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

  const updateContract = (id, patch) =>
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));

  const syncDistrib = (id, nextDist) => {
    const nextAsignado = nextDist.reduce((s, d) => s + d.monto, 0);
    updateContract(id, { distribucion: nextDist, asignado: nextAsignado, disponible: contracts.find(c => c.id === id).monto - nextAsignado });
  };

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
      providerId:     provider?.id          || null,
      providerName:   provider?.razonSocial || null,
      providerSector: provider?.sector      || null,
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

  // ── Proveedor handler ──

  const handleAddProvider = () => {
    if (!providerForm.razonSocial.trim()) return;
    const newId = `p${Math.max(...providers.map(p => Number(p.id.replace('p', ''))), 0) + 1}`;
    const next  = { id: newId, razonSocial: providerForm.razonSocial, nombreComercial: providerForm.nombreComercial, ruc: providerForm.ruc, sector: providerForm.sector, email: providerForm.correo, telefono: providerForm.telefono, esClienteBonafide: providerForm.esClienteBonafide, activo: true };
    setProviders(prev => [...prev, next]);
    setShowProviderModal(false);
    setProviderForm(PROVIDER_FORM_EMPTY);
    showToast(`${providerForm.razonSocial} ha sido añadido al directorio de proveedores.`);
  };

  // ── Facturas handlers ──

  const nextInvoiceId = () => {
    const max = invoices.reduce((m, inv) => Math.max(m, parseInt(inv.id.replace('FAC-2026-', '')) || 0), 1031);
    return `FAC-2026-${max + 1}`;
  };

  const handleSaveCTInvoice = () => {
    const monto = Number(invCtModal.monto.replace?.(/[^0-9]/g, '') ?? invCtModal.monto) || 0;
    if (monto <= 0 || !invCtModal.concepto.trim()) return;
    const today = new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (invCtModal.editId) {
      setInvoices(prev => prev.map(inv => inv.id === invCtModal.editId
        ? { ...inv, monto, concepto: invCtModal.concepto, fechaVencimiento: invCtModal.fechaVencimiento, documento: invCtModal.documento }
        : inv));
    } else {
      setInvoices(prev => [...prev, {
        id: nextInvoiceId(), tipo: 'contratante', contrato: detailContract.id,
        monto, estado: 'Creada', concepto: invCtModal.concepto, fecha: today,
        fechaVencimiento: invCtModal.fechaVencimiento, tipoFactoring: 'inverso', documento: invCtModal.documento,
      }]);
    }
    setInvCtModal(INV_CT_EMPTY);
  };

  const handleOpenEditCTInvoice = (inv) =>
    setInvCtModal({ open: true, editId: inv.id, monto: inv.monto.toString(), concepto: inv.concepto || '', fechaVencimiento: inv.fechaVencimiento || '', documento: inv.documento || null });

  const handleAdvanceCTInvoice = (invId) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invId || inv.tipo !== 'contratante') return inv;
      const steps = inv.tipoFactoring === 'inverso' ? CT_ESTADOS_INVERSO : CT_ESTADOS_DIRECTO;
      const idx = steps.indexOf(inv.estado);
      if (idx === -1 || idx >= steps.length - 1) return inv;
      return { ...inv, estado: steps[idx + 1] };
    }));
  };

  const handleSavePRInvoice = () => {
    const monto = Number(invPrModal.monto.replace?.(/[^0-9]/g, '') ?? invPrModal.monto) || 0;
    if (monto <= 0 || !invPrModal.proveedorId) return;
    const prov  = providers.find(p => p.id === invPrModal.proveedorId);
    const today = invPrModal.fecha || new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (invPrModal.editId) {
      setInvoices(prev => prev.map(inv => inv.id === invPrModal.editId
        ? { ...inv, monto, concepto: invPrModal.concepto, proveedorId: invPrModal.proveedorId, proveedorNombre: prov?.razonSocial || '', fecha: today, fechaVencimiento: invPrModal.fechaVencimiento, documento: invPrModal.documento }
        : inv));
    } else {
      setInvoices(prev => [...prev, {
        id: nextInvoiceId(), tipo: 'proveedor', contrato: detailContract.id,
        monto, estado: 'Pendiente', concepto: invPrModal.concepto,
        proveedorId: invPrModal.proveedorId, proveedorNombre: prov?.razonSocial || '', fecha: today,
        fechaVencimiento: invPrModal.fechaVencimiento, documento: invPrModal.documento,
      }]);
    }
    setInvPrModal(INV_PR_EMPTY);
  };

  const handleOpenEditPRInvoice = (inv) =>
    setInvPrModal({ open: true, editId: inv.id, proveedorId: inv.proveedorId || '', monto: inv.monto.toString(), concepto: inv.concepto || '', fecha: inv.fecha || '', fechaVencimiento: inv.fechaVencimiento || '', documento: inv.documento || null });

  const handleDeleteInvoice = (invId) =>
    setInvoices(prev => prev.filter(inv => inv.id !== invId));

  // ── Pagos handlers ──

  const nextPagoId = () => {
    const max = pagos.reduce((m, p) => Math.max(m, parseInt(p.id.replace('PAG-2026-', '')) || 0), 0);
    return `PAG-2026-${String(max + 1).padStart(3, '0')}`;
  };

  const handleSavePago = () => {
    const monto = Number(pagoModal.monto.replace?.(/[^0-9]/g, '') ?? pagoModal.monto) || 0;
    if (monto <= 0 || !pagoModal.concepto.trim()) return;
    const linkedInv = pagoModal.facturaProvId ? invoices.find(inv => inv.id === pagoModal.facturaProvId) : null;
    if (!linkedInv && !pagoModal.proveedorId) return;
    const prov  = !linkedInv ? providers.find(p => p.id === pagoModal.proveedorId) : null;
    const today = pagoModal.fecha || new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const proveedorNombre = linkedInv?.proveedorNombre || prov?.razonSocial || '';
    if (pagoModal.editId) {
      setPagos(prev => prev.map(p => p.id === pagoModal.editId
        ? { ...p, monto, concepto: pagoModal.concepto, fecha: today, facturaProvId: pagoModal.facturaProvId || null, proveedorId: pagoModal.proveedorId || null, proveedorNombre, documento: pagoModal.documento }
        : p));
    } else {
      setPagos(prev => [...prev, {
        id: nextPagoId(), contrato: detailContract.id,
        monto, concepto: pagoModal.concepto, fecha: today, estado: 'Procesado',
        facturaProvId: pagoModal.facturaProvId || null,
        proveedorId: pagoModal.proveedorId || null,
        proveedorNombre,
        documento: pagoModal.documento,
      }]);
    }
    setPagoModal(PAGO_MODAL_EMPTY);
  };

  const handleDeletePago = (pagoId) =>
    setPagos(prev => prev.filter(p => p.id !== pagoId));

  const handleOpenEditPago = (p) =>
    setPagoModal({ open: true, editId: p.id, monto: p.monto.toString(), concepto: p.concepto, fecha: p.fecha, facturaProvId: p.facturaProvId || '', proveedorId: p.proveedorId || '', documento: p.documento || null });

  return (
    <AppShell active="epCreditos" role="empresa-pequena" title="Mis créditos" sub="Gestión de contratos de crédito">
      <div className="fade-in">

        {/* ── LISTA ── */}
        {detailId === null ? (
          <>
            <h1 className="text-[22px] font-bold text-text-1 mb-4">Mis Contratos</h1>

            {/* Fila: card total + buscador */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="card-lift bg-white rounded-[12px] border border-border px-4 h-12 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                  <FileText className="w-4 h-4 text-orange" />
                </div>
                <span className="text-[22px] font-extrabold leading-none text-text-1">{totalContratos}</span>
                <span className="text-[12px] text-text-4 leading-snug">Contratos de crédito</span>
              </div>
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

            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContracts.map(contract => {
                const pctVal = parseFloat(pct(contract.asignado, contract.monto));
                const ctName = contract.contratante?.razonSocial || '—';
                const sector = contract.contratante?.sectorProductivo || '';
                const score  = contract.contratante?.scoreCredito ?? null;
                const sStyle = score !== null ? scoreStyle(score) : null;
                return (
                  <div
                    key={contract.id}
                    onClick={() => { setDetailId(contract.id); setActiveTab('contrato'); }}
                    className="bg-white rounded-[16px] p-5 border border-border cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] hover:border-orange/40"
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
                  >
                    {/* ID + empresa + sector + score */}
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-[10px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-orange" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold text-text-4 mb-0.5">{contract.id}</div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="text-[13px] font-bold text-text-1 leading-tight truncate">{ctName}</div>
                          {sStyle && (
                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-[5px]"
                                  style={{ background: sStyle.bg, color: sStyle.color }}>
                              {score}
                            </span>
                          )}
                        </div>
                        {sector && <div className="text-[11px] text-text-4 mt-0.5">{sector}</div>}
                      </div>
                    </div>

                    {/* Monto */}
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-4 mb-0.5">Monto del crédito</div>
                      <div className="text-[17px] font-extrabold text-text-1 leading-tight">{formatXaf(contract.monto)}</div>
                    </div>

                    {/* Distribución */}
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <span className="text-[11px] text-text-4">Disp: {formatXaf(contract.disponible)}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: '#FFF3E0', color: '#EF7A2C', border: '1px solid rgba(239,122,44,0.25)' }}>
                        {pctVal}% distribuido
                      </span>
                    </div>

                    {/* Botón Ver */}
                    <button
                      onClick={e => { e.stopPropagation(); setDetailId(contract.id); setActiveTab('contrato'); }}
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
                Mis contratos
              </button>
              <span className="text-text-5">/</span>
              <span className="text-[13px] text-text-4">{detailContract.id}</span>
            </div>

            {/* Resumen financiero */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Monto del crédito', value: formatXaf(detailContract.monto),      Icon: Banknote,   iconBg: '#FFF3E0', color: '#EF7A2C' },
                { label: 'Distribuido',        value: formatXaf(detailContract.asignado),   Icon: BarChart2,  iconBg: '#FFF3E0', color: '#EF7A2C' },
                { label: 'Disponible',         value: formatXaf(detailContract.disponible), Icon: Wallet,     iconBg: '#E3F4EA', color: '#2E7D5B' },
                { label: '% Distribuido',      value: `${pct(detailContract.asignado, detailContract.monto)}%`, Icon: TrendingUp, iconBg: '#EFF6FF', color: '#3B82F6' },
              ].map(({ label, value, Icon, iconBg, color }) => (
                <div key={label} className="bg-white rounded-[14px] border border-border p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-text-4 uppercase tracking-wide mb-0.5">{label}</div>
                    <div className="text-[14px] font-extrabold truncate" style={{ color }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-page-bg p-1 rounded-[10px] w-fit overflow-x-auto">
              {TABS.map(({ id, label, Icon, iconBg, iconColor }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-[13px] font-medium transition-all whitespace-nowrap
                      ${isActive ? 'bg-white shadow-sm text-text-1 font-semibold' : 'text-text-3 hover:text-text-1 cursor-pointer'}`}
                  >
                    <div className="w-5 h-5 rounded-[5px] flex items-center justify-center transition-all"
                         style={{ background: isActive ? iconBg : 'transparent' }}>
                      <Icon className="w-3 h-3" style={{ color: isActive ? iconColor : 'currentColor' }} />
                    </div>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* ── TAB: Contrato ── */}
            {activeTab === 'contrato' && (() => {
              const ct = detailContract.contratante;
              return (
                <div className="space-y-5">
                  {/* Objeto del trabajo */}
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <SectionHeader icon={ScrollText} iconBg="#FFF3E0" iconColor="#EF7A2C"
                      title="Objeto del Trabajo" subtitle="Descripción del alcance y servicios pactados en el contrato." />
                    <div className="text-[13px] text-text-1 leading-relaxed">{ct.objetoTrabajo || '—'}</div>
                  </div>

                  {/* Condiciones económicas y plazos */}
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <SectionHeader icon={CalendarDays} iconBg="#EFF6FF" iconColor="#3B82F6"
                      title="Condiciones Económicas y Plazos" subtitle="Montos, fechas de vigencia y plazos de ejecución." />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                      <InfoRow label="Monto global"       value={ct.montoGlobal ? formatXaf(ct.montoGlobal) : '—'} />
                      <InfoRow label="Fecha de inicio"    value={fmtDate(ct.fechaInicio)} />
                      <InfoRow label="Fecha de fin"       value={fmtDate(ct.fechaFin)} />
                      <InfoRow label="Plazo de ejecución" value={ct.plazosEjecucion} />
                    </div>
                  </div>

                  {/* Documento */}
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <SectionHeader icon={FileText} iconBg="#FFF3E0" iconColor="#EF7A2C"
                      title="Documento del Contrato" subtitle="Archivo adjunto firmado entre las partes." />
                    {ct.documentoContrato ? (
                      <div className="rounded-[12px] border border-border overflow-hidden">
                        {ct.documentoContrato.type?.startsWith('image/')
                          ? <img src={ct.documentoContrato.url} className="w-full max-h-52 object-contain bg-page-bg" alt="Vista previa" />
                          : <iframe src={ct.documentoContrato.url} className="w-full h-52" title="Vista previa del documento" />
                        }
                        <div className="flex items-center gap-2 px-3 py-2 bg-page-bg border-t border-border">
                          <FileText className="w-3.5 h-3.5 text-text-4 shrink-0" />
                          <span className="text-[11px] text-text-4 truncate">{ct.documentoContrato.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[12px] text-text-4">
                        <FileText className="w-4 h-4 shrink-0" />
                        No se adjuntó documento al contrato.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ── TAB: Contratante ── */}
            {activeTab === 'contratante' && (() => {
              const ct = detailContract.contratante;
              const score  = ct.scoreCredito ?? null;
              const sStyle = score !== null ? scoreStyle(score) : null;
              return (
                <div className="space-y-5">
                  {/* Identidad */}
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <SectionHeader icon={Building2} iconBg="#EFF6FF" iconColor="#3B82F6"
                      title="Datos de Identidad" subtitle="Información legal y fiscal de la empresa contratante."
                      action={sStyle && (
                        <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-[8px]"
                             style={{ background: sStyle.bg }}>
                          <span className="text-[11px] font-semibold" style={{ color: sStyle.color }}>Score crediticio</span>
                          <span className="text-[15px] font-extrabold" style={{ color: sStyle.color }}>{score}</span>
                        </div>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      <InfoRow label="Razón Social"       value={ct.razonSocial} />
                      <InfoRow label="Nombre Comercial"   value={ct.nombreComercial} />
                      <InfoRow label="RUC / NIF"          value={ct.ruc} />
                      <InfoRow label="Sector Productivo"  value={ct.sectorProductivo} />
                      <InfoRow label="Teléfono"           value={ct.telefonoCorporativo} />
                      <InfoRow label="Correo"             value={ct.correoCorporativo} />
                    </div>
                  </div>

                  {/* Representante Legal */}
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <SectionHeader icon={UserSquare} iconBg="#EFF6FF" iconColor="#3B82F6"
                      title="Representante Legal" subtitle="Persona autorizada para firmar y representar a la empresa." />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      <InfoRow label="Nombre y Apellido"        value={ct.repNombre} />
                      <InfoRow label="Tipo de Documento"        value={ct.repTipoDoc} />
                      <InfoRow label="Nº de Identificación"     value={ct.repIdentificacion} />
                      <InfoRow label="Cargo"                    value={ct.repCargo} />
                      <InfoRow label="Teléfono"                 value={ct.repTelefono} />
                      <InfoRow label="Correo"                   value={ct.repCorreo} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── TAB: Distribución del crédito ── */}
            {activeTab === 'distribucion' && (
              <div className="space-y-5">
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <SectionHeader icon={BarChart2} iconBg="#FFF3E0" iconColor="#EF7A2C"
                    title="Distribuciones" subtitle="Asignaciones del crédito por concepto y proveedor."
                    action={
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={() => setDistribModal({ ...DISTRIB_EMPTY, open: true, providerId: providers[0]?.id || '' })}>
                          Nueva Distribución
                        </Button>
                        <Button variant="ghost" onClick={() => setShowProviderModal(true)}>
                          Añadir proveedor
                        </Button>
                      </div>
                    }
                  />

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
                          <div className="w-12 h-12 rounded-[14px] bg-orange-tint flex items-center justify-center shrink-0">
                            <ConceptIcon className="w-5 h-5 text-orange" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-bold text-text-1 leading-tight">{item.concepto}</div>
                            {item.providerName
                              ? <div className="text-[12px] text-text-4 mt-0.5 truncate">{item.providerName} · <span className="text-text-5">{item.providerSector}</span></div>
                              : <div className="text-[12px] text-text-5 mt-0.5">Sin proveedor asociado</div>
                            }
                          </div>
                          <div className="shrink-0 flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-[15px] font-extrabold text-text-1 leading-tight">{formatXaf(item.monto)}</div>
                              <div className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                                   style={{ background: '#FFF3E0', color: '#EF7A2C', border: '1px solid rgba(239,122,44,0.25)' }}>
                                {pctVal}% del crédito
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 border-l border-border pl-3">
                              <button onClick={() => handleOpenEditDistrib(item)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteDistrib(item.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
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
              const contractInvoices    = invoices.filter(inv => inv.contrato === detailContract.id);
              const contratanteInvoices = contractInvoices.filter(inv => inv.tipo === 'contratante');
              const proveedorInvoices   = contractInvoices.filter(inv => inv.tipo === 'proveedor');
              return (
                <div className="space-y-5">

                  {/* Facturas al Contratante */}
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <SectionHeader icon={Building2} iconBg="#EFF6FF" iconColor="#3B82F6"
                      title="Facturas al Contratante"
                      subtitle="Emitidas por la PYME. Ciclo: Creada → Enviada → Validada → [IPI Emitido →] Pagada."
                      action={<Button variant="primary" onClick={() => setInvCtModal({ ...INV_CT_EMPTY, open: true })}>Nueva Factura</Button>}
                    />
                    <div className="space-y-3">
                      {contratanteInvoices.map(inv => {
                        const steps = inv.tipoFactoring === 'inverso' ? CT_ESTADOS_INVERSO : CT_ESTADOS_DIRECTO;
                        const isLast = steps.indexOf(inv.estado) === steps.length - 1;
                        return (
                          <div key={inv.id}
                            className="rounded-[16px] p-4 border border-border transition-all duration-200 cursor-default"
                            style={{ background: '#ffffff' }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,130,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#ECEAE7'; }}
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: '#EFF6FF' }}>
                                <Building2 className="w-5 h-5" style={{ color: '#3B82F6' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[13px] font-bold text-text-1">{inv.id}</span>
                                  {inv.documento && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-text-4"><Paperclip className="w-3 h-3" /> Doc</span>
                                  )}
                                </div>
                                <div className="text-[12px] text-text-3 truncate mb-2">{inv.concepto}</div>
                                <CTPipeline estado={inv.estado} tipoFactoring={inv.tipoFactoring} />
                              </div>
                              <div className="shrink-0 flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-[15px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
                                  <div className="text-[11px] text-text-5 mt-0.5">{inv.fecha}</div>
                                </div>
                                <div className="flex flex-col gap-1 border-l border-border pl-3">
                                  {!isLast && (
                                    <button onClick={() => handleAdvanceCTInvoice(inv.id)}
                                      title="Avanzar estado"
                                      className="p-1.5 rounded-[8px] transition text-text-4"
                                      style={{}}
                                      onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#3B82F6'; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button onClick={() => handleOpenEditCTInvoice(inv)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {contratanteInvoices.length === 0 && (
                        <div className="text-[12px] text-text-4 py-6 text-center">No hay facturas al contratante para este contrato.</div>
                      )}
                    </div>
                  </div>

                  {/* Facturas de Proveedores */}
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <SectionHeader icon={Truck} iconBg="#FDF6E8" iconColor="#C68A1D"
                      title="Facturas de Proveedores"
                      subtitle="Recibidas de proveedores. Importadas para control interno de pagos."
                      action={<Button variant="primary" onClick={() => setInvPrModal({ ...INV_PR_EMPTY, open: true })}>Importar Factura</Button>}
                    />
                    <div className="space-y-3">
                      {proveedorInvoices.map(inv => {
                        const estadoStyle =
                          inv.estado === 'Pagada'  ? { background: '#E3F4EA', color: '#2E7D5B' } :
                          inv.estado === 'Vencida' ? { background: '#FDEEEB', color: '#B8352A' } :
                          { background: '#FDF6E8', color: '#C68A1D' };
                        return (
                          <div key={inv.id}
                            className="bg-white rounded-[16px] p-4 border border-border flex items-center gap-4 transition-all duration-200 cursor-default"
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,122,44,0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#ECEAE7'; }}
                          >
                            <div className="w-12 h-12 rounded-[14px] bg-orange-tint flex items-center justify-center shrink-0">
                              <Truck className="w-5 h-5 text-orange" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[13px] font-bold text-text-1">{inv.id}</span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={estadoStyle}>{inv.estado}</span>
                                {inv.documento && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-text-4"><Paperclip className="w-3 h-3" /> Doc</span>
                                )}
                              </div>
                              <div className="text-[12px] text-text-3 truncate">{inv.concepto || inv.proveedorNombre}</div>
                              <div className="text-[11px] text-text-5 mt-0.5">
                                {inv.proveedorNombre}{inv.fechaVencimiento ? ` · Vence: ${inv.fechaVencimiento}` : ''}
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-[15px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
                                <div className="text-[11px] text-text-5 mt-0.5">{inv.fecha}</div>
                              </div>
                              <div className="flex flex-col gap-1 border-l border-border pl-3">
                                <button onClick={() => handleOpenEditPRInvoice(inv)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {proveedorInvoices.length === 0 && (
                        <div className="text-[12px] text-text-4 py-6 text-center">No hay facturas de proveedores importadas para este contrato.</div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* ── TAB: Pagos ── */}
            {activeTab === 'pagos' && (() => {
              const contractPagos     = pagos.filter(p => p.contrato === detailContract.id);
              const proveedorInvoices = invoices.filter(inv => inv.contrato === detailContract.id && inv.tipo === 'proveedor');
              return (
                <div className="space-y-5">
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <SectionHeader icon={CreditCard} iconBg="#E3F4EA" iconColor="#2E7D5B"
                      title="Pagos"
                      subtitle="Registra pagos a proveedores. Pueden vincularse a una factura recibida o ser pagos directos."
                      action={<Button variant="primary" onClick={() => setPagoModal({ ...PAGO_MODAL_EMPTY, open: true })}>Nuevo Pago</Button>}
                    />
                    <div className="space-y-3">
                      {contractPagos.map(p => {
                        const linkedInv = p.facturaProvId ? invoices.find(inv => inv.id === p.facturaProvId) : null;
                        return (
                          <div key={p.id}
                            className="bg-white rounded-[16px] p-4 border border-border flex items-center gap-4 transition-all duration-200 cursor-default"
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(46,125,91,0.12)'; e.currentTarget.style.borderColor = '#A8D5BE'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#ECEAE7'; }}
                          >
                            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: '#E3F4EA' }}>
                              <CreditCard className="w-5 h-5" style={{ color: '#2E7D5B' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[13px] font-bold text-text-1">{p.id}</span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#E3F4EA', color: '#2E7D5B' }}>{p.estado}</span>
                                {p.documento && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-text-4"><Paperclip className="w-3 h-3" /> Doc</span>
                                )}
                              </div>
                              <div className="text-[12px] text-text-3 truncate">{p.concepto}</div>
                              {linkedInv ? (
                                <div className="flex items-center gap-1 text-[11px] text-text-5 mt-0.5">
                                  <Receipt className="w-3 h-3 shrink-0" /> {linkedInv.id} · {linkedInv.proveedorNombre}
                                </div>
                              ) : p.proveedorNombre ? (
                                <div className="text-[11px] text-text-5 mt-0.5">{p.proveedorNombre}</div>
                              ) : (
                                <div className="text-[11px] text-text-5 mt-0.5">Pago directo sin factura vinculada</div>
                              )}
                            </div>
                            <div className="shrink-0 flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-[15px] font-extrabold text-text-1">{formatXaf(p.monto)}</div>
                                <div className="text-[11px] text-text-5 mt-0.5">{p.fecha}</div>
                              </div>
                              <div className="flex flex-col gap-1 border-l border-border pl-3">
                                <button onClick={() => handleOpenEditPago(p)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeletePago(p.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {contractPagos.length === 0 && (
                        <div className="text-[12px] text-text-4 py-6 text-center">No hay pagos registrados para este contrato.</div>
                      )}
                    </div>
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
            <div className="text-[12px] text-text-4">Registra un nuevo proveedor en tu directorio. Podrás asignarlo a distribuciones y pagos en cualquier momento.</div>
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
            <button
              type="button"
              onClick={() => setProviderForm({ ...providerForm, esClienteBonafide: !providerForm.esClienteBonafide })}
              className="flex items-center gap-3 w-full rounded-[10px] border px-4 py-3 transition-all"
              style={{
                borderColor: providerForm.esClienteBonafide ? 'rgba(224,32,28,0.35)' : '#ECEAE7',
                background:  providerForm.esClienteBonafide ? '#FFF3E0' : '#F6F5F3',
              }}
            >
              <div className="w-9 h-5 rounded-full flex items-center transition-all shrink-0 px-0.5"
                   style={{ background: providerForm.esClienteBonafide ? '#E0201C' : '#A9A6A1' }}>
                <div className="w-4 h-4 rounded-full bg-white shadow transition-transform"
                     style={{ transform: providerForm.esClienteBonafide ? 'translateX(16px)' : 'translateX(0)' }} />
              </div>
              <div className="text-left">
                <div className="text-[13px] font-semibold" style={{ color: providerForm.esClienteBonafide ? '#E0201C' : '#26262B' }}>
                  Cliente Bonafide
                </div>
                <div className="text-[11px] text-text-4">
                  {providerForm.esClienteBonafide ? 'Este proveedor es cliente de Bonafide' : 'Este proveedor no es cliente de Bonafide'}
                </div>
              </div>
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Nueva / Editar factura al Contratante ── */}
      {invCtModal.open && (
        <Modal
          title={invCtModal.editId ? `Editar factura ${invCtModal.editId}` : 'Nueva Factura al Contratante'}
          onClose={() => setInvCtModal(INV_CT_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setInvCtModal(INV_CT_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveCTInvoice}>{invCtModal.editId ? 'Guardar cambios' : 'Crear factura'}</Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Monto (XAF)" required>
                <Input
                  type="text" inputMode="numeric" placeholder="Ej: 18,000,000"
                  value={invCtModal.monto}
                  onChange={e => setInvCtModal({ ...invCtModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
                />
                {invCtModal.monto && <div className="text-[11px] text-text-4 mt-1">{formatXaf(invCtModal.monto)}</div>}
              </FormGroup>
              <FormGroup label="Fecha de vencimiento">
                <Input type="text" placeholder="DD/MM/AAAA" value={invCtModal.fechaVencimiento} onChange={e => setInvCtModal({ ...invCtModal, fechaVencimiento: e.target.value })} />
              </FormGroup>
            </div>
            <FormGroup label="Concepto" required>
              <Textarea
                value={invCtModal.concepto}
                onChange={e => setInvCtModal({ ...invCtModal, concepto: e.target.value })}
                placeholder="Descripción del servicio o hito facturado…"
              />
            </FormGroup>
            <div>
              <div className="text-[12px] font-medium text-text-3 mb-1.5">Adjuntar documento</div>
              {invCtModal.documento ? (
                <div className="flex items-center gap-2 bg-page-bg rounded-[8px] px-3 py-2 text-[12px] text-text-3 border border-border">
                  <Paperclip className="w-3.5 h-3.5 text-text-4 shrink-0" />
                  <span className="flex-1 truncate">{invCtModal.documento.name}</span>
                  <button onClick={() => setInvCtModal(p => ({ ...p, documento: null }))} className="text-text-4 hover:text-red-text text-[14px] leading-none">×</button>
                </div>
              ) : (
                <label className="flex items-center gap-2 border border-dashed border-border rounded-[8px] px-3 py-2.5 text-[12px] text-text-4 cursor-pointer hover:border-orange/40 hover:bg-orange-tint transition">
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  Seleccionar archivo (PDF, imagen)
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setInvCtModal(p => ({ ...p, documento: { name: file.name, url: URL.createObjectURL(file) } }));
                  }} />
                </label>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Importar / Editar factura de Proveedor ── */}
      {invPrModal.open && (
        <Modal
          title={invPrModal.editId ? `Editar factura ${invPrModal.editId}` : 'Importar Factura de Proveedor'}
          onClose={() => setInvPrModal(INV_PR_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setInvPrModal(INV_PR_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSavePRInvoice}>{invPrModal.editId ? 'Guardar cambios' : 'Importar factura'}</Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Proveedor" required>
                <Select value={invPrModal.proveedorId} onChange={e => setInvPrModal({ ...invPrModal, proveedorId: e.target.value })}>
                  <option value="">Seleccionar proveedor…</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.razonSocial} · {p.sector}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Monto (XAF)" required>
                <Input
                  type="text" inputMode="numeric" placeholder="Ej: 4,500,000"
                  value={invPrModal.monto}
                  onChange={e => setInvPrModal({ ...invPrModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
                />
                {invPrModal.monto && <div className="text-[11px] text-text-4 mt-1">{formatXaf(invPrModal.monto)}</div>}
              </FormGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Fecha de emisión">
                <Input type="text" placeholder="DD/MM/AAAA" value={invPrModal.fecha} onChange={e => setInvPrModal({ ...invPrModal, fecha: e.target.value })} />
              </FormGroup>
              <FormGroup label="Fecha de vencimiento">
                <Input type="text" placeholder="DD/MM/AAAA" value={invPrModal.fechaVencimiento} onChange={e => setInvPrModal({ ...invPrModal, fechaVencimiento: e.target.value })} />
              </FormGroup>
            </div>
            <FormGroup label="Concepto">
              <Textarea
                value={invPrModal.concepto}
                onChange={e => setInvPrModal({ ...invPrModal, concepto: e.target.value })}
                placeholder="Descripción del servicio o producto facturado…"
              />
            </FormGroup>
            <div>
              <div className="text-[12px] font-medium text-text-3 mb-1.5">Adjuntar documento</div>
              {invPrModal.documento ? (
                <div className="flex items-center gap-2 bg-page-bg rounded-[8px] px-3 py-2 text-[12px] text-text-3 border border-border">
                  <Paperclip className="w-3.5 h-3.5 text-text-4 shrink-0" />
                  <span className="flex-1 truncate">{invPrModal.documento.name}</span>
                  <button onClick={() => setInvPrModal(p => ({ ...p, documento: null }))} className="text-text-4 hover:text-red-text text-[14px] leading-none">×</button>
                </div>
              ) : (
                <label className="flex items-center gap-2 border border-dashed border-border rounded-[8px] px-3 py-2.5 text-[12px] text-text-4 cursor-pointer hover:border-orange/40 hover:bg-orange-tint transition">
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  Seleccionar archivo (PDF, imagen)
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setInvPrModal(p => ({ ...p, documento: { name: file.name, url: URL.createObjectURL(file) } }));
                  }} />
                </label>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Nuevo / Editar pago ── */}
      {pagoModal.open && (() => {
        const proveedorInvoices = invoices.filter(inv => inv.contrato === detailContract?.id && inv.tipo === 'proveedor');
        return (
          <Modal
            title={pagoModal.editId ? `Editar pago ${pagoModal.editId}` : 'Nuevo Pago'}
            onClose={() => setPagoModal(PAGO_MODAL_EMPTY)}
            footer={
              <>
                <Button variant="ghost" onClick={() => setPagoModal(PAGO_MODAL_EMPTY)}>Cancelar</Button>
                <Button variant="primary" onClick={handleSavePago}>{pagoModal.editId ? 'Guardar cambios' : 'Realizar Pago'}</Button>
              </>
            }
            wide
          >
            <div className="space-y-4">
              <div className="text-[12px] text-text-4">El pago puede vincularse a una factura de proveedor o realizarse directamente especificando el proveedor.</div>
              {proveedorInvoices.length > 0 && (
                <FormGroup label="Vincular a factura de proveedor (opcional)">
                  <Select value={pagoModal.facturaProvId} onChange={e => setPagoModal({ ...pagoModal, facturaProvId: e.target.value, proveedorId: '' })}>
                    <option value="">Sin vinculación — pago directo</option>
                    {proveedorInvoices.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.id} · {inv.proveedorNombre} · {formatXaf(inv.monto)}</option>
                    ))}
                  </Select>
                </FormGroup>
              )}
              {!pagoModal.facturaProvId && (
                <FormGroup label="Proveedor" required>
                  <Select value={pagoModal.proveedorId} onChange={e => setPagoModal({ ...pagoModal, proveedorId: e.target.value })}>
                    <option value="">Seleccionar proveedor…</option>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.razonSocial} · {p.sector}</option>)}
                  </Select>
                </FormGroup>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup label="Monto (XAF)" required>
                  <Input
                    type="text" inputMode="numeric" placeholder="Ej: 2,500,000"
                    value={pagoModal.monto}
                    onChange={e => setPagoModal({ ...pagoModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                  {pagoModal.monto && <div className="text-[11px] text-text-4 mt-1">{formatXaf(pagoModal.monto)}</div>}
                </FormGroup>
                <FormGroup label="Fecha del pago">
                  <Input type="text" placeholder="DD/MM/AAAA" value={pagoModal.fecha} onChange={e => setPagoModal({ ...pagoModal, fecha: e.target.value })} />
                </FormGroup>
              </div>
              <FormGroup label="Concepto" required>
                <Textarea
                  value={pagoModal.concepto}
                  onChange={e => setPagoModal({ ...pagoModal, concepto: e.target.value })}
                  placeholder="Descripción del pago realizado…"
                />
              </FormGroup>
              <div>
                <div className="text-[12px] font-medium text-text-3 mb-1.5">Adjuntar documento / factura</div>
                {pagoModal.documento ? (
                  <div className="flex items-center gap-2 bg-page-bg rounded-[8px] px-3 py-2 text-[12px] text-text-3 border border-border">
                    <Paperclip className="w-3.5 h-3.5 text-text-4 shrink-0" />
                    <span className="flex-1 truncate">{pagoModal.documento.name}</span>
                    <button onClick={() => setPagoModal(p => ({ ...p, documento: null }))} className="text-text-4 hover:text-red-text text-[14px] leading-none">×</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 border border-dashed border-border rounded-[8px] px-3 py-2.5 text-[12px] text-text-4 cursor-pointer hover:border-orange/40 hover:bg-orange-tint transition">
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    Adjuntar comprobante o factura (PDF, imagen)
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setPagoModal(p => ({ ...p, documento: { name: file.name, url: URL.createObjectURL(file) } }));
                    }} />
                  </label>
                )}
              </div>
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
          <div className="text-[13px] font-semibold text-text-1 mb-0.5">Acción realizada</div>
          <div className="text-[12px] text-text-4 leading-snug">{toast.message}</div>
        </div>
      </div>
    </AppShell>
  );
}
