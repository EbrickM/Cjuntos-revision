import { useState } from "react";
import { useCountUp } from "../../hooks/useCountUp";
import {
  FileText,
  Trash2,
  Pencil,
  Search,
  ChevronRight,
  Plus,
  LayoutGrid, CheckCircle, AlertCircle, Clock, Settings2, MessageCircle,
  Truck,
  Receipt,
  Building2,
  CreditCard,
  ScrollText,
  UserSquare,
  CalendarDays,
  Landmark,
  MessageSquare,
  Eye,
  Upload,
  Paperclip, History, Save,
  ArrowUpDown, ArrowUp, ArrowDown, Layers2,
} from "lucide-react";
import { useApp } from "../../state/AppContext";
import AppShell from "../../components/layout/AppShell";
import BackButton from "../../components/common/BackButton";
import { StatCard } from "../../components/common/StatCard";
import InfiniteScrollSentinel from "../../components/common/InfiniteScrollSentinel";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import FormGroup, {
  Input,
  Select,
  Textarea,
} from "../../components/ui/FormGroup";
import FacturaContratanteModal from "../../components/invoices/FacturaContratanteModal";
import InvoiceStatusBadge from "../../components/invoices/InvoiceStatusBadge";
import { defaultVencimiento } from "../../components/invoices/facturaUtils";
import BorradoresSeccion from '../../components/contratos/BorradoresSeccion';
import ConfirmarEliminarModal from '../../components/common/ConfirmarEliminarModal';
import { contratoService } from "../../services/contrato.service";
import { useProviders, initialProviders, fmt } from "./epData";
import { registrosContrato } from '../../components/contratos/contratoUtils';
import RegistrosTabla from '../../components/contratos/RegistrosTabla';

const TAB_ICON = {
  'Todos':                       LayoutGrid,
  'Activo':                      CheckCircle,
  'Con Requerimientos':          AlertCircle,
  'Pendiente de Revisión':       Clock,
  'Pendiente de Configuración':  Settings2,
  'En Discusión de Términos':    MessageCircle,
  'Borradores':                  Save,
};

const formatXaf = (value) =>
  `${new Intl.NumberFormat("de-DE").format(Number(value) || 0)} XAF`;
const pct = (part, total) =>
  total > 0 ? ((part / total) * 100).toFixed(1) : "0.0";
const fmtDate = (iso) =>
  iso
    ? new Date(iso + "T00:00:00").toLocaleDateString("es-GQ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const scoreStyle = (score) => {
  if (score >= 750) return { bg: "#FFF3E0", color: "#EF7A2C" };
  if (score >= 600) return { bg: "#FDF6E8", color: "#C68A1D" };
  return { bg: "#FDEEEB", color: "#B8352A" };
};

// Badge de estado de contrato (mismo criterio que los otros portales): cada
// estado del ciclo de vida con su color distinto (Anexo Digital MIC v1.0).
const contratoBadge = (estado) =>
  estado === "Activo"
    ? "orange"
    : estado === "Con Requerimientos"
      ? "red"
      : estado === "En Discusión de Términos"
        ? "brand"
        : estado === "Pendiente de Revisión"
          ? "amber"
          : "amber";

const InfoRow = ({ label, value }) => (
  <div>
    <div className="text-[11px] font-semibold text-text-4 uppercase tracking-wide mb-1">
      {label}
    </div>
    <div className="text-[13px] text-text-1">{value || "—"}</div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div className="flex items-start gap-3">
      <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-text-1">{title}</div>
        {subtitle && <div className="text-[12px] text-text-4">{subtitle}</div>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

const INV_CT_EMPTY = {
  open: false,
  editId: null,
  monto: "",
  concepto: "",
  fechaVencimiento: "",
  documento: null,
};
const INV_PR_EMPTY = {
  open: false,
  editId: null,
  proveedorId: "",
  monto: "",
  concepto: "",
  fecha: "",
  fechaVencimiento: "",
  documento: null,
};
const PAGO_MODAL_EMPTY = {
  open: false,
  editId: null,
  monto: "",
  concepto: "",
  fecha: "",
  facturaProvId: "",
  proveedorId: "",
  documento: null,
};

const KYC_BADGE = { vigente: "orange", pendiente: "yellow", vencido: "red" };

// ── Agregar Proveedor directamente desde este contrato ──────────────────────
// Mismos campos y validación que "Nuevo proveedor" en MisProveedores.jsx; sin
// selector de contrato, ya que queda ligado automáticamente al contrato que
// se está viendo. Comparte el mismo directorio persistido (epData.useProviders).
const PREFIJO_TEL_PROV = "+240";
const EMAIL_REGEX_PROV = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SECTORES_PROV = [
  "Energía", "Construcción", "Manufactura", "Transporte", "Tecnología",
  "Servicios", "Alimentación", "Minería", "Agricultura", "Comercio",
  "Materiales", "Otro",
];
const NUEVO_PROV_EMPTY = { open: false, provSel: "", razonSocial: "", nombreComercial: "", sector: "Materiales", telefono: "", correo: "", esClienteBonafide: false, monto: "" };

const parseMontoProv = (str) => Number(String(str).replace(/[^\d]/g, "")) || 0;

// Vista en vivo en el input: el estado guarda solo dígitos, el campo muestra
// el monto agrupado con puntos (5.000.000) mientras se escribe.
const fmtMontoProv = (digits) => {
  const n = Number(String(digits ?? "").replace(/\D/g, ""));
  return n ? fmt(n) : "";
};

const initialInvoices = [
  {
    id: "FAC-2026-0911",
    tipo: "contratante",
    contrato: "CT-2026-0041",
    monto: 21_500_000,
    estado: "Enviada",
    concepto: "Obras de estructura fase 2 — planta baja y primer piso",
    fecha: "28/06/2026",
    fechaVencimiento: "28/07/2026",
    documento: null,
  },
  {
    id: "FAC-2026-0918",
    tipo: "contratante",
    contrato: "CT-2026-0041",
    monto: 26_000_000,
    estado: "Enviada",
    concepto: "Acabados interiores y carpintería — módulos A y B",
    fecha: "05/07/2026",
    fechaVencimiento: "05/08/2026",
    documento: null,
  },
];

const initialPagos = [];

const TABS = [
  { id: 'contrato',     label: 'Contrato',     Icon: ScrollText,  iconBg: '#FFF3E0', iconColor: '#EF7A2C' },
  { id: 'contratante',  label: 'Contratante',  Icon: Building2,   iconBg: '#FFF3E0', iconColor: '#EF7A2C' },
  { id: 'proveedores',  label: 'Proveedores', Icon: Truck,       iconBg: '#FFF3E0', iconColor: '#EF7A2C' },
  { id: 'facturas',     label: 'Facturas',     Icon: Receipt,     iconBg: '#FFF3E0', iconColor: '#EF7A2C' },
  { id: 'pagos',        label: 'Pagos',        Icon: CreditCard,  iconBg: '#FFF3E0', iconColor: '#EF7A2C' },
  { id: 'registros',    label: 'Registros',    Icon: History,     iconBg: '#FFF3E0', iconColor: '#EF7A2C' },
];

// ── Sub-component: Contract Card ─────────────────────────────────────────────
function CreditoContractCard({ contract, idx, setDetailId, setActiveTab, setReqModal }) {
  const usedPct = contract.monto > 0 ? Math.round((contract.asignado / contract.monto) * 100) : 0;
  const animPct = useCountUp(usedPct, 1200, 80 + idx * 60);
  const ctName  = contract.contratante?.razonSocial || contract.contratanteNombre || '—';

  return (
    <div
      onClick={() => { setDetailId(contract.id); setActiveTab('contrato'); }}
      className="relative bg-white rounded-[16px] p-5 cursor-pointer flex flex-col gap-3.5 transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] card-enter"
      style={{ animationDelay: `${idx * 70}ms` }}
    >
      {contract.requerimiento && (
        <button
          onClick={e => { e.stopPropagation(); setReqModal(contract); }}
          title="Ver requerimiento"
          className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-orange-dark text-white flex items-center justify-center shadow-lg animate-bounce cursor-pointer z-10"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      )}

      {/* Fila 1: ID + estado */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[15px] font-extrabold text-text-1 tracking-wide">{contract.id}</span>
        <Badge variant={contratoBadge(contract.estado)}>{contract.estado}</Badge>
      </div>

      {/* Fila 2: Empresa Contratante */}
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-text-4 mb-0.5">Empresa Contratante</p>
        <p className="text-[13px] font-medium text-text-3 leading-tight truncate">{ctName}</p>
      </div>

      {/* Fila 3: Monto Asignado + Disponible */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-text-4 mb-0.5">Monto Asignado</p>
          <p className="text-[12px] font-semibold text-text-3 tabular-nums leading-tight">{formatXaf(contract.monto)}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-text-4 mb-0.5">Disponible</p>
          <p className="text-[12px] font-semibold tabular-nums leading-tight" style={{ color: '#EF7A2C' }}>{formatXaf(contract.disponible)}</p>
        </div>
      </div>

      {/* Fila 4: Barra de progreso + utilizado */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
          <div className="h-full rounded-full" style={{ width: `${animPct}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tabular-nums" style={{ color: '#E0201C' }}>Utilizado: {formatXaf(contract.asignado)}</span>
          <span className="text-[10px] font-bold tabular-nums" style={{ color: '#E0201C' }}>{animPct}%</span>
        </div>
      </div>

      {/* Fila 5: Facturas + Ver contrato */}
      <div className="flex items-center justify-between mt-auto pt-0.5">
        <span className="inline-flex items-center gap-1 text-[11px] text-text-4">
          <Receipt className="w-3.5 h-3.5 shrink-0" />{contract.facturas ?? 0} facturas
        </span>
        <button
          onClick={e => { e.stopPropagation(); setDetailId(contract.id); setActiveTab('contrato'); }}
          className="flex items-center gap-0.5 text-[11px] font-semibold text-orange hover:opacity-75 transition cursor-pointer"
        >
          Ver contrato <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function EpCreditos() {
  const { go } = useApp();
  const contracts = contratoService.listarPorVista("pyme");
  const [providers, setProviders]                 = useProviders();
  const [detailId, setDetailId]                   = useState(null);
  const [activeTab, setActiveTab]                 = useState('contrato');
  const [invoices, setInvoices]                   = useState(initialInvoices);
  const [pagos, setPagos]                         = useState(initialPagos);
  const [search, setSearch]                       = useState('');
  const [filtroEstado, setFiltroEstado]           = useState('Todos');
  const [invCtModal, setInvCtModal]               = useState(INV_CT_EMPTY);
  const [invPrModal, setInvPrModal]               = useState(INV_PR_EMPTY);
  const [pagoModal, setPagoModal]                 = useState(PAGO_MODAL_EMPTY);
  const [reqModal, setReqModal] = useState(null);
  const [provDetailModal, setProvDetailModal] = useState(null);
  const [facSubTab, setFacSubTab]             = useState('contratante');
  const [agregarProv, setAgregarProv]         = useState(NUEVO_PROV_EMPTY);
  const [provManualesPorContrato, setProvManualesPorContrato] = useState({});
  // Proveedores de un contrato que se "eliminaron" desde esa misma tabla (los
  // que venían de la asignación del contrato, no del directorio — esos se
  // sacan directo del directorio con setProviders).
  const [provOcultosPorContrato, setProvOcultosPorContrato] = useState({});
  const [eliminarProv, setEliminarProv] = useState(null);
  const [sortFacCT, setSortFacCT]     = useState({ key: null, dir: 'asc' });
  const [groupByFacCT, setGroupByFacCT] = useState(null);
  const [sortFacPR, setSortFacPR]     = useState({ key: null, dir: 'asc' });
  const [groupByFacPR, setGroupByFacPR] = useState(null);
  const [sortProv, setSortProv]       = useState({ key: null, dir: 'asc' });
  const [groupByProv, setGroupByProv] = useState(null);

  const detailContract = detailId
    ? (contracts.find((c) => c.id === detailId) ?? null)
    : null;

  // Mismos campos, validación y lógica que "Nuevo Proveedor" en
  // MisProveedores.jsx: se puede elegir un Proveedor ya conocido por el
  // sistema (su email/teléfono quedan bloqueados) o registrar uno nuevo. La
  // única diferencia es que aquí el contrato ya viene implícito
  // (`detailContract`), así que el monto asignado es siempre obligatorio.
  const provExistenteProv   = agregarProv.provSel !== "" && agregarProv.provSel !== "__nueva__";
  const nombreResueltoProv  = provExistenteProv ? agregarProv.provSel : agregarProv.razonSocial.trim();
  const emailLimpioProv      = agregarProv.correo.trim();
  const emailInvalidoProv    = emailLimpioProv !== "" && !EMAIL_REGEX_PROV.test(emailLimpioProv);
  const telefonoLocalProv    = agregarProv.telefono.replace(/\D/g, "");
  const telefonoValidoProv   = /^\d{7,9}$/.test(telefonoLocalProv);
  const telefonoInvalidoProv = telefonoLocalProv !== "" && !telefonoValidoProv;

  // Monto disponible de ESTE contrato: lo ya asignado (proveedoresAsignados)
  // menos lo ya agregado manualmente en este mismo detalle (no vive en
  // `detailContract.proveedoresAsignados` todavía).
  const provManualesActuales = detailContract ? (provManualesPorContrato[detailContract.id] ?? []) : [];
  // `detailContract.disponible` ya viene calculado por `normalizar()` en
  // contrato.service.js (fuente única de verdad) — solo se resta lo agregado
  // manualmente en este mismo detalle, que todavía no vive en el contrato canónico.
  const disponibleParaAgregarProv = detailContract
    ? (detailContract.disponible ?? 0) - provManualesActuales.reduce((s, m) => s + (Number(m.monto) || 0), 0)
    : 0;
  const montoNumLiveProv  = parseMontoProv(agregarProv.monto);
  const montoFaltanteProv = agregarProv.monto === "";
  const montoInvalidoProv = agregarProv.monto !== "" && (montoNumLiveProv <= 0 || montoNumLiveProv > disponibleParaAgregarProv);

  const formOkProv = !!nombreResueltoProv && !!agregarProv.sector && telefonoValidoProv && emailLimpioProv !== "" && !emailInvalidoProv && !montoFaltanteProv && !montoInvalidoProv;

  const handleAgregarProv = () => {
    if (!formOkProv || !detailContract) return;
    const newId = `p${Math.max(...providers.map((p) => Number(p.id.replace("p", ""))), 0) + 1}`;
    setProviders((prev) => [
      {
        id: newId,
        razonSocial: nombreResueltoProv,
        nombreComercial: agregarProv.nombreComercial.trim(),
        sector: agregarProv.sector,
        email: emailLimpioProv,
        telefono: `${PREFIJO_TEL_PROV} ${telefonoLocalProv}`,
        contratosActivos: [{ id: detailContract.id, objeto: '', contratante: detailContract.contratante?.razonSocial ?? '', asignado: montoNumLiveProv, utilizado: 0 }],
        esClienteBonafide: agregarProv.esClienteBonafide,
        kyc: "—",
        scoreCredito: null,
      },
      ...prev,
    ]);
    // La refleja de inmediato en la tabla "Proveedores" de este contrato —
    // mismo shape que las entradas de `detailContract.proveedoresAsignados`.
    setProvManualesPorContrato((prev) => ({
      ...prev,
      [detailContract.id]: [
        {
          id: `PROV-MANUAL-${Date.now()}`,
          nombre: nombreResueltoProv,
          email: emailLimpioProv,
          cargaNomina: false,
          monto: montoNumLiveProv,
        },
        ...(prev[detailContract.id] ?? []),
      ],
    }));
    setAgregarProv(NUEVO_PROV_EMPTY);
  };

  const handleEliminarProv = () => {
    if (!eliminarProv || !detailContract) return;
    const provManuales = provManualesPorContrato[detailContract.id] ?? [];
    if (provManuales.some((p) => p.id === eliminarProv.item.id)) {
      setProvManualesPorContrato((prev) => ({
        ...prev,
        [detailContract.id]: (prev[detailContract.id] ?? []).filter((p) => p.id !== eliminarProv.item.id),
      }));
      setProviders((prev) => prev.filter((p) => p.razonSocial !== eliminarProv.item.providerName));
    } else {
      setProvOcultosPorContrato((prev) => ({
        ...prev,
        [detailContract.id]: [...(prev[detailContract.id] ?? []), eliminarProv.item.providerName],
      }));
    }
    setEliminarProv(null);
  };

  const totalContratos = contracts.length;
  const montoTotal = contracts.reduce((s, c) => s + c.monto, 0);
  const disponibleTotal = contracts.reduce((s, c) => s + c.disponible, 0);
  const kycVigentes = contracts.filter((c) => c.kyc === "vigente").length;

  const animTotalContratos  = useCountUp(totalContratos,  900,  100);
  const animMontoTotal      = useCountUp(montoTotal,      1600, 200);
  const animDisponibleTotal = useCountUp(disponibleTotal, 1500, 300);
  const animKycVigentes     = useCountUp(kycVigentes,     900,  400);

  const filteredContracts = contracts.filter(
    (c) =>
      (filtroEstado === "Todos" || c.estado === filtroEstado) &&
      (!search.trim() ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        (c.contratante?.razonSocial || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (c.contratante?.sectorProductivo || "")
          .toLowerCase()
          .includes(search.toLowerCase())),
  );

  const ESTADO_TABS = [
    "Todos",
    ...Array.from(new Set(contracts.map((c) => c.estado).filter(Boolean))),
    "Borradores",
  ];

  // Sin delay: en producción, en cuanto el backend devuelva la siguiente
  // página se debe mostrar de inmediato, sin espera artificial del frontend.
  const {
    visibleItems: pagedContracts,
    hasMore: hasMoreContracts,
    loading: loadingContracts,
    sentinelRef: contractsSentinelRef,
  } = useInfiniteScroll(filteredContracts, {
    pageSize: 10,
    delay: 0,
    resetKey: `${search}|${filtroEstado === 'Borradores' ? 'todos' : filtroEstado}`,
  });

  // ── Facturas handlers ──

  const nextInvoiceId = () => {
    const max = invoices.reduce(
      (m, inv) => Math.max(m, parseInt(inv.id.replace("FAC-2026-", "")) || 0),
      1031,
    );
    return `FAC-2026-${max + 1}`;
  };

  const handleSaveCTInvoice = () => {
    const monto =
      Number(invCtModal.monto.replace?.(/[^0-9]/g, "") ?? invCtModal.monto) ||
      0;
    if (monto <= 0 || !invCtModal.concepto.trim()) return;
    const today = new Date().toLocaleDateString("es-GQ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (invCtModal.editId) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invCtModal.editId
            ? {
                ...inv,
                monto,
                concepto: invCtModal.concepto,
                fechaVencimiento: invCtModal.fechaVencimiento,
                documento: invCtModal.documento,
              }
            : inv,
        ),
      );
    } else {
      setInvoices((prev) => [
        ...prev,
        {
          id: nextInvoiceId(),
          tipo: "contratante",
          contrato: detailContract.id,
          monto,
          estado: "Creada",
          concepto: invCtModal.concepto,
          fecha: today,
          fechaVencimiento: invCtModal.fechaVencimiento,
          documento: invCtModal.documento,
        },
      ]);
    }
    setInvCtModal(INV_CT_EMPTY);
  };

  const handleOpenEditCTInvoice = (inv) =>
    setInvCtModal({
      open: true,
      editId: inv.id,
      monto: inv.monto.toString(),
      concepto: inv.concepto || "",
      fechaVencimiento: inv.fechaVencimiento || "",
      documento: inv.documento || null,
    });

  const handleSavePRInvoice = () => {
    const monto =
      Number(invPrModal.monto.replace?.(/[^0-9]/g, "") ?? invPrModal.monto) ||
      0;
    if (monto <= 0 || !invPrModal.proveedorId) return;
    const prov = providers.find((p) => p.id === invPrModal.proveedorId);
    const today =
      invPrModal.fecha ||
      new Date().toLocaleDateString("es-GQ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    if (invPrModal.editId) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invPrModal.editId
            ? {
                ...inv,
                monto,
                concepto: invPrModal.concepto,
                proveedorId: invPrModal.proveedorId,
                proveedorNombre: prov?.razonSocial || "",
                fecha: today,
                fechaVencimiento: invPrModal.fechaVencimiento,
                documento: invPrModal.documento,
              }
            : inv,
        ),
      );
    } else {
      setInvoices((prev) => [
        ...prev,
        {
          id: nextInvoiceId(),
          tipo: "proveedor",
          contrato: detailContract.id,
          monto,
          estado: "Pendiente",
          concepto: invPrModal.concepto,
          proveedorId: invPrModal.proveedorId,
          proveedorNombre: prov?.razonSocial || "",
          fecha: today,
          fechaVencimiento: invPrModal.fechaVencimiento,
          documento: invPrModal.documento,
        },
      ]);
    }
    setInvPrModal(INV_PR_EMPTY);
  };

  const handleOpenEditPRInvoice = (inv) =>
    setInvPrModal({
      open: true,
      editId: inv.id,
      proveedorId: inv.proveedorId || "",
      monto: inv.monto.toString(),
      concepto: inv.concepto || "",
      fecha: inv.fecha || "",
      fechaVencimiento: inv.fechaVencimiento || "",
      documento: inv.documento || null,
    });

  const handleDeleteInvoice = (invId) =>
    setInvoices((prev) => prev.filter((inv) => inv.id !== invId));

  // ── Pagos handlers ──

  const nextPagoId = () => {
    const max = pagos.reduce(
      (m, p) => Math.max(m, parseInt(p.id.replace("PAG-2026-", "")) || 0),
      0,
    );
    return `PAG-2026-${String(max + 1).padStart(3, "0")}`;
  };

  const handleSavePago = () => {
    const monto =
      Number(pagoModal.monto.replace?.(/[^0-9]/g, "") ?? pagoModal.monto) || 0;
    if (monto <= 0 || !pagoModal.concepto.trim()) return;
    const linkedInv = pagoModal.facturaProvId
      ? invoices.find((inv) => inv.id === pagoModal.facturaProvId)
      : null;
    if (!linkedInv && !pagoModal.proveedorId) return;
    const prov = !linkedInv
      ? providers.find((p) => p.id === pagoModal.proveedorId)
      : null;
    const today =
      pagoModal.fecha ||
      new Date().toLocaleDateString("es-GQ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    const proveedorNombre =
      linkedInv?.proveedorNombre || prov?.razonSocial || "";
    if (pagoModal.editId) {
      setPagos((prev) =>
        prev.map((p) =>
          p.id === pagoModal.editId
            ? {
                ...p,
                monto,
                concepto: pagoModal.concepto,
                fecha: today,
                facturaProvId: pagoModal.facturaProvId || null,
                proveedorId: pagoModal.proveedorId || null,
                proveedorNombre,
                documento: pagoModal.documento,
              }
            : p,
        ),
      );
    } else {
      setPagos((prev) => [
        ...prev,
        {
          id: nextPagoId(),
          contrato: detailContract.id,
          monto,
          concepto: pagoModal.concepto,
          fecha: today,
          estado: "Procesado",
          facturaProvId: pagoModal.facturaProvId || null,
          proveedorId: pagoModal.proveedorId || null,
          proveedorNombre,
          documento: pagoModal.documento,
        },
      ]);
    }
    setPagoModal(PAGO_MODAL_EMPTY);
  };

  const handleDeletePago = (pagoId) =>
    setPagos((prev) => prev.filter((p) => p.id !== pagoId));

  const handleOpenEditPago = (p) =>
    setPagoModal({
      open: true,
      editId: p.id,
      monto: p.monto.toString(),
      concepto: p.concepto,
      fecha: p.fecha,
      facturaProvId: p.facturaProvId || "",
      proveedorId: p.proveedorId || "",
      documento: p.documento || null,
    });

  const toggleSortFacCT  = k => setSortFacCT(s => s.key !== k ? { key: k, dir: 'asc' } : s.dir === 'asc' ? { key: k, dir: 'desc' } : { key: null, dir: 'asc' });
  const toggleGroupFacCT = k => setGroupByFacCT(g => g === k ? null : k);
  const sortIconFacCT    = k => sortFacCT.key !== k ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" /> : sortFacCT.dir === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" /> : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIconFacCT   = k => <Layers2 className={`w-3 h-3 shrink-0 ${groupByFacCT === k ? 'text-orange' : 'opacity-30'}`} />;

  const toggleSortFacPR  = k => setSortFacPR(s => s.key !== k ? { key: k, dir: 'asc' } : s.dir === 'asc' ? { key: k, dir: 'desc' } : { key: null, dir: 'asc' });
  const toggleGroupFacPR = k => setGroupByFacPR(g => g === k ? null : k);
  const sortIconFacPR    = k => sortFacPR.key !== k ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" /> : sortFacPR.dir === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" /> : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIconFacPR   = k => <Layers2 className={`w-3 h-3 shrink-0 ${groupByFacPR === k ? 'text-orange' : 'opacity-30'}`} />;

  const toggleSortProv  = k => setSortProv(s => s.key !== k ? { key: k, dir: 'asc' } : s.dir === 'asc' ? { key: k, dir: 'desc' } : { key: null, dir: 'asc' });
  const toggleGroupProv = k => setGroupByProv(g => g === k ? null : k);
  const sortIconProv    = k => sortProv.key !== k ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" /> : sortProv.dir === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" /> : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIconProv   = k => <Layers2 className={`w-3 h-3 shrink-0 ${groupByProv === k ? 'text-orange' : 'opacity-30'}`} />;

  const parseDate = d => { if (!d) return ''; const [dd, mm, yyyy] = d.split('/'); return `${yyyy ?? ''}-${mm ?? ''}-${dd ?? ''}`; };

  return (
    <AppShell
      active="epCreditos"
      role="empresa-pequena"
      title="Mis contratos"
      sub="Gestión de contratos de crédito"
      back={detailId === null}
    >
      <div className="fade-in">
        {/* ── LISTA ── */}
        {detailId === null ? (
          <div className="space-y-5">
            {/* Resumen */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  label: "Contratos de crédito activos",
                  display: animTotalContratos,
                },
                {
                  label: "Monto total asignado",
                  display: formatXaf(animMontoTotal),
                },
                {
                  label: "Saldo disponible para uso",
                  display: formatXaf(animDisponibleTotal),
                },
                { label: "Contratantes con KYC vigente", display: animKycVigentes },
              ].map(({ label, display }) => (
                <StatCard
                  key={label}
                  label={label}
                  value={display}
                  tone="gradient"
                />
              ))}
            </div>

            {/* Título + buscador */}
            <div>
              <div className="mb-3">
                <div className="text-[14px] font-bold text-text-1">
                  Mis Contratos
                </div>
                <div className="text-[12px] text-text-4">
                  Contratos de crédito activos con tus contratantes.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="overflow-x-auto pb-0.5 flex-1">
                  <div className="flex bg-white rounded-[10px] gap-1 p-1 w-max border border-border">
                    {ESTADO_TABS.map(t => {
                      const Icon = TAB_ICON[t] ?? LayoutGrid;
                      return (
                        <button
                          key={t}
                          onClick={() => setFiltroEstado(t)}
                          className={`bona-btn font-medium rounded-[8px] text-[12px] text-center transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3 py-1.5
                            ${filtroEstado === t ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold' : 'text-text-3 hover:text-text-1 cursor-pointer'}`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="relative shrink-0">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar contrato…"
                    className="h-8 w-64 pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
                  />
                </div>
              </div>
            </div>

            {filtroEstado === 'Borradores' ? (
              <BorradoresSeccion
                rol="pyme"
                onContinuar={b => go('epConfigurarContrato', { contratoId: b.contratoId, desdeBorrador: true })}
              />
            ) : (
            /* Grid de tarjetas */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagedContracts.map((contract, idx) => (
                <CreditoContractCard
                  key={contract.id}
                  contract={contract}
                  idx={idx}
                  setDetailId={setDetailId}
                  setActiveTab={setActiveTab}
                  setReqModal={setReqModal}
                />
              ))}
              {filteredContracts.length === 0 && (
                <div className="col-span-full text-[13px] text-text-4 text-center py-12">
                  No se encontraron contratos para &ldquo;{search}&rdquo;.
                </div>
              )}
              <InfiniteScrollSentinel
                sentinelRef={contractsSentinelRef}
                loading={loadingContracts}
                hasMore={hasMoreContracts}
              />
            </div>
            )}
          </div>
        ) : /* ── DETALLE ── */
        detailContract ? (
          <>
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <BackButton
                onClick={() => setDetailId(null)}
                label="Mis contratos"
                className="mb-0"
              />
              <span className="text-text-5">/</span>
              <span className="text-[13px] text-text-4">
                {detailContract.id}
              </span>
            </div>

            {/* Resumen financiero */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              {[
                {
                  label: "Monto del crédito",
                  value: formatXaf(detailContract.monto),
                },
                {
                  label: "Distribuido",
                  value: formatXaf(detailContract.asignado),
                },
                {
                  label: "Disponible",
                  value: formatXaf(detailContract.disponible),
                },
                {
                  label: "% Distribuido",
                  value: `${pct(detailContract.asignado, detailContract.monto)}%`,
                },
              ].map(({ label, value }) => (
                <StatCard
                  key={label}
                  label={label}
                  value={value}
                  tone="gradient"
                />
              ))}
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-[10px] gap-1 p-1 mb-5 border border-border">
              {TABS.map(({ id, label, Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`bona-btn flex-1 py-1.5 px-3 font-medium rounded-[8px] text-[12px] transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 cursor-pointer
                      ${isActive ? "bg-[#EF7A2C] shadow-sm text-white font-semibold" : "text-text-3 hover:text-text-1"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* ── TAB: Contrato ── */}
            {activeTab === "contrato" &&
              (() => {
                const ct = detailContract.contratante ?? {
                  razonSocial: detailContract.contratanteNombre ?? "—",
                  sectorProductivo: detailContract.sector ?? "",
                  scoreCredito: detailContract.scoreCredito ?? null,
                  montoGlobal:
                    detailContract.montoGlobal ??
                    String(detailContract.monto ?? ""),
                };
                return (
                  <div className="space-y-5">
                    {/* Objeto del trabajo */}
                    <div className="bg-white rounded-[14px] border border-border p-5">
                      <SectionHeader
                        icon={ScrollText}
                        iconBg="#FFF3E0"
                        iconColor="#EF7A2C"
                        title="Objeto del Trabajo"
                        subtitle="Descripción del alcance y servicios pactados en el contrato."
                      />
                      <div className="text-[13px] text-text-1 leading-relaxed">
                        {ct.objetoTrabajo || "—"}
                      </div>
                    </div>

                    {/* Condiciones económicas y plazos */}
                    <div className="bg-white rounded-[14px] border border-border p-5">
                      <SectionHeader
                        icon={CalendarDays}
                        iconBg="#FFF3E0"
                        iconColor="#EF7A2C"
                        title="Condiciones Económicas y Plazos"
                        subtitle="Montos, fechas de vigencia y plazos de ejecución."
                      />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                        <InfoRow
                          label="Monto global"
                          value={
                            ct.montoGlobal ? formatXaf(ct.montoGlobal) : "—"
                          }
                        />
                        <InfoRow
                          label="Fecha de inicio"
                          value={fmtDate(ct.fechaInicio)}
                        />
                        <InfoRow
                          label="Fecha de fin"
                          value={fmtDate(ct.fechaFin)}
                        />
                        <InfoRow
                          label="Plazo de ejecución"
                          value={ct.plazosEjecucion}
                        />
                      </div>
                    </div>

                    {/* Ficha del contrato-marco — datos fijados por Bonafide y la
                      gestión de fondos que la PYME eligió al configurarlo
                      (Subproceso 2 del BPMN). */}
                    <div className="bg-white rounded-[14px] border border-border p-5">
                      <SectionHeader
                        icon={Landmark}
                        iconBg="#FFF3E0"
                        iconColor="#EF7A2C"
                        title="Ficha del Contrato"
                        subtitle="Condiciones fijadas por Bonafide y gestión de fondos elegida."
                      />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                        <InfoRow
                          label="Banco Fondeador"
                          value={detailContract.bancoFondeador}
                        />
                        <InfoRow
                          label="Interés"
                          value={detailContract.interes}
                        />
                        <InfoRow
                          label="% Retención"
                          value={
                            detailContract.porcentajeRetencion != null
                              ? `${detailContract.porcentajeRetencion}%`
                              : "—"
                          }
                        />
                        <InfoRow
                          label="% Gestión de Cobranza"
                          value={
                            detailContract.porcentajeGestionCobranza != null
                              ? `${detailContract.porcentajeGestionCobranza}%`
                              : "—"
                          }
                        />
                        <InfoRow
                          label="Plazo de pago"
                          value={
                            detailContract.plazoPago
                              ? `${detailContract.plazoPago} días`
                              : "—"
                          }
                        />
                        <InfoRow
                          label="Gestión de fondos"
                          value={
                            detailContract.gestionFondos === "billetera"
                              ? "Uso en Billetera Virtual"
                              : detailContract.gestionFondos === "retirar"
                                ? "Retirar todo"
                                : "—"
                          }
                        />
                      </div>
                    </div>

                    {/* Documento */}
                    <div className="bg-white rounded-[14px] border border-border p-5">
                      <SectionHeader
                        icon={FileText}
                        iconBg="#FFF3E0"
                        iconColor="#EF7A2C"
                        title="Documento del Contrato"
                        subtitle="Archivo adjunto firmado entre las partes."
                      />
                      {ct.documentoContrato ? (
                        <div className="rounded-[12px] border border-border overflow-hidden">
                          {ct.documentoContrato.type?.startsWith("image/") ? (
                            <img
                              src={ct.documentoContrato.url}
                              loading="lazy"
                              className="w-full max-h-52 object-contain bg-page-bg"
                              alt="Vista previa"
                            />
                          ) : (
                            <iframe
                              src={ct.documentoContrato.url}
                              className="w-full h-52"
                              title="Vista previa del documento"
                            />
                          )}
                          <div className="flex items-center gap-2 px-3 py-2 bg-page-bg border-t border-border">
                            <FileText className="w-3.5 h-3.5 text-text-4 shrink-0" />
                            <span className="text-[11px] text-text-4 truncate">
                              {ct.documentoContrato.name}
                            </span>
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
            {activeTab === "contratante" &&
              (() => {
                const ct = detailContract.contratante ?? {
                  razonSocial: detailContract.contratanteNombre ?? "—",
                  sectorProductivo: detailContract.sector ?? "",
                  scoreCredito: detailContract.scoreCredito ?? null,
                };
                const score = ct.scoreCredito ?? null;
                const sStyle = score !== null ? scoreStyle(score) : null;
                return (
                  <div className="space-y-5">
                    {/* Identidad */}
                    <div className="bg-white rounded-[14px] border border-border p-5">
                      <SectionHeader
                        icon={Building2}
                        iconBg="#FFF3E0"
                        iconColor="#EF7A2C"
                        title="Datos de Identidad"
                        subtitle="Información legal y fiscal de la empresa contratante."
                        action={
                          sStyle && (
                            <div
                              className="shrink-0 px-2.5 py-1.5 rounded-[8px]"
                              style={{ background: sStyle.bg }}
                            >
                              {/* Mobile */}
                              <div className="flex flex-col items-center sm:hidden">
                                <span
                                  className="text-[10px] font-semibold whitespace-nowrap"
                                  style={{ color: sStyle.color }}
                                >
                                  Score C.
                                </span>
                                <span
                                  className="text-[18px] font-extrabold leading-none mt-0.5"
                                  style={{ color: sStyle.color }}
                                >
                                  {score}
                                </span>
                              </div>
                              {/* Desktop */}
                              <div className="hidden sm:flex items-center gap-1.5">
                                <span
                                  className="text-[11px] font-semibold"
                                  style={{ color: sStyle.color }}
                                >
                                  Score crediticio
                                </span>
                                <span
                                  className="text-[15px] font-extrabold"
                                  style={{ color: sStyle.color }}
                                >
                                  {score}
                                </span>
                              </div>
                            </div>
                          )
                        }
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        <InfoRow label="Razón Social" value={ct.razonSocial} />
                        <InfoRow
                          label="Nombre Comercial"
                          value={ct.nombreComercial}
                        />
                        <InfoRow label="RUC / NIF" value={ct.ruc} />
                        <InfoRow
                          label="Sector Productivo"
                          value={ct.sectorProductivo}
                        />
                        <InfoRow
                          label="Teléfono"
                          value={ct.telefonoCorporativo}
                        />
                        <InfoRow label="Correo" value={ct.correoCorporativo} />
                      </div>
                    </div>

                    {/* Representante Legal */}
                    <div className="bg-white rounded-[14px] border border-border p-5">
                      <SectionHeader
                        icon={UserSquare}
                        iconBg="#FFF3E0"
                        iconColor="#EF7A2C"
                        title="Representante Legal"
                        subtitle="Persona autorizada para firmar y representar a la empresa."
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        <InfoRow
                          label="Nombre y Apellido"
                          value={ct.repNombre}
                        />
                        <InfoRow
                          label="Tipo de Documento"
                          value={ct.repTipoDoc}
                        />
                        <InfoRow
                          label="Nº de Identificación"
                          value={ct.repIdentificacion}
                        />
                        <InfoRow label="Cargo" value={ct.repCargo} />
                        <InfoRow label="Teléfono" value={ct.repTelefono} />
                        <InfoRow label="Correo" value={ct.repCorreo} />
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* ── TAB: Proveedores ── */}
            {activeTab === 'proveedores' && (() => {
              // Si la PYME ya repartió el contrato en el wizard (Subproceso 2
              // del BPMN), se muestran sus proveedoresAsignados; si no, se cae
              // a las asignaciones de `distribucion` con un proveedor real
              // vinculado (los conceptos sin proveedor no pertenecen a esta
              // vista de solo lectura). Los agregados manualmente desde este
              // mismo detalle (botón "Agregar Proveedor") van primero.
              const provManuales = provManualesPorContrato[detailContract.id] ?? [];
              const ocultosProv = provOcultosPorContrato[detailContract.id] ?? [];
              const asignados = [...provManuales, ...(detailContract.proveedoresAsignados ?? [])];
              const filas = (asignados.length > 0
                ? asignados.map(p => {
                    const dir = providers.find(x => x.razonSocial === p.nombre);
                    return {
                      item: {
                        id: p.id, providerName: p.nombre,
                        concepto: p.email || '', providerSector: p.cargaNomina ? 'Con nómina' : '',
                        monto: p.monto, providerId: dir?.id ?? '',
                      },
                      prov: dir ?? { kyc: 'sin KYC' },
                    };
                  })
                : detailContract.distribucion
                    .map(item => ({ item, prov: providers.find(p => p.id === item.providerId) }))
                    .filter(({ prov }) => prov)
              ).filter(({ item }) => !ocultosProv.includes(item.providerName));
              return (
              <div className="space-y-5">
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <SectionHeader icon={Truck}
                    title="Proveedores" subtitle="Proveedores de este contrato y el monto que le corresponde a cada uno."
                    action={
                      <Button size="sm" onClick={() => {
                        const primera = initialProviders[0] ?? null;
                        setAgregarProv({
                          ...NUEVO_PROV_EMPTY, open: true,
                          provSel: primera?.razonSocial ?? "__nueva__",
                          nombreComercial: primera?.nombreComercial ?? "",
                          sector: primera?.sector ?? "Materiales",
                          correo: primera?.email ?? "",
                          telefono: (primera?.telefono ?? "").replace(/\D/g, "").slice(0, 9),
                        });
                      }}>
                        <Plus className="w-3.5 h-3.5" /> Agregar Proveedor
                      </Button>
                    }
                  />

                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto -mx-5 -mb-5">
                    {(() => {
                      const sortedFil = (() => {
                        const ek = groupByProv || sortProv.key;
                        if (!ek) return filas;
                        const dir = groupByProv ? 1 : (sortProv.dir === 'asc' ? 1 : -1);
                        return [...filas].sort((a, b) => {
                          if (ek === 'nombre') return dir * (a.item.providerName ?? '').localeCompare(b.item.providerName ?? '');
                          if (ek === 'kyc') return dir * (a.prov.kyc ?? '').localeCompare(b.prov.kyc ?? '');
                          if (ek === 'score') return dir * ((a.prov.scoreCredito ?? 0) - (b.prov.scoreCredito ?? 0));
                          if (ek === 'monto') return dir * (a.item.monto - b.item.monto);
                          return 0;
                        });
                      })();
                      return (
                        <div className="min-w-[640px] rounded-b-[14px] overflow-hidden">
                          <div className="grid [grid-template-columns:3fr_1.5fr_1fr_1fr_1.2fr_1fr] bg-page-bg px-4 py-2.5 border-t border-border gap-3 items-center">
                            <button onClick={() => toggleSortProv('nombre')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                              Proveedor {sortIconProv('nombre')}
                            </button>
                            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Sector</span>
                            <button onClick={() => toggleGroupProv('kyc')} className={`text-[11px] font-semibold uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer hover:text-text-1 ${groupByProv === 'kyc' ? 'text-orange' : 'text-text-4'}`}>
                              KYC {groupIconProv('kyc')}
                            </button>
                            <button onClick={() => toggleSortProv('score')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer hover:text-text-1">
                              Score {sortIconProv('score')}
                            </button>
                            <button onClick={() => toggleSortProv('monto')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer hover:text-text-1">
                              Monto {sortIconProv('monto')}
                            </button>
                            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
                          </div>
                          {sortedFil.flatMap(({ item, prov }, i) => {
                            const gVal = groupByProv === 'kyc' ? (prov.kyc ?? 'sin KYC') : null;
                            const prevGVal = i === 0 ? null : groupByProv === 'kyc' ? (sortedFil[i-1].prov.kyc ?? 'sin KYC') : null;
                            const isNewGroup = gVal !== null && (i === 0 || gVal !== prevGVal);
                            const sStyle = prov.scoreCredito != null ? scoreStyle(prov.scoreCredito) : null;
                            const groupSep = isNewGroup ? [
                              <div key={`grp-pv-${i}`} className="min-w-[640px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                                <span className="text-[11px] font-bold text-orange">{gVal}</span>
                              </div>
                            ] : [];
                            const row = (
                              <div key={item.id}
                                onClick={() => setProvDetailModal(prov)}
                                className="grid [grid-template-columns:3fr_1.5fr_1fr_1fr_1.2fr_1fr] px-4 py-3 border-t border-border cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                              >
                                <div className="min-w-0">
                                  <div className="text-[13px] font-bold text-text-1 truncate">{item.providerName}</div>
                                  {item.concepto && <div className="text-[11px] text-text-4 truncate">{item.concepto}</div>}
                                </div>
                                <span className="text-[12px] text-text-4">{item.providerSector || '—'}</span>
                                <div className="flex justify-center">
                                  <Badge variant={KYC_BADGE[prov.kyc] ?? 'yellow'}>{prov.kyc ?? 'sin KYC'}</Badge>
                                </div>
                                <div className="flex justify-center">
                                  {sStyle ? (
                                    <div className="text-center">
                                      <div className="text-[13px] font-bold" style={{ color: sStyle.color }}>{prov.scoreCredito}</div>
                                    </div>
                                  ) : <span className="text-[12px] text-text-4">—</span>}
                                </div>
                                <span className="text-[13px] font-extrabold text-text-1 text-center">{formatXaf(item.monto)}</span>
                                <div className="flex items-center justify-center gap-0.5" onClick={e => e.stopPropagation()}>
                                  <button onClick={e => { e.stopPropagation(); setProvDetailModal(prov); }}
                                    className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); setEliminarProv({ item, prov }); }}
                                    className="p-1.5 rounded-[8px] transition text-text-4 hover:text-red-text cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                            return [...groupSep, row];
                          })}
                          {filas.length === 0 && (
                            <div className="px-4 py-10 text-center text-[13px] text-text-4">No hay proveedores asignados aún.</div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  {/* Mobile cards */}
                  <div className="sm:hidden space-y-2 mt-0">
                    {filas.map(({ item, prov }) => (
                      <div key={item.id} className="rounded-[12px] border border-border p-3.5 flex flex-col gap-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-text-1 truncate">{item.providerName}</div>
                          </div>
                          <div className="flex justify-center">
                            <Badge variant={KYC_BADGE[prov.kyc] ?? "yellow"}>{prov.kyc}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-[13px] font-extrabold text-text-1">{formatXaf(item.monto)}</span>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => setProvDetailModal(prov)} className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEliminarProv({ item, prov })} className="p-1.5 rounded-[8px] transition text-text-4 hover:text-red-text cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filas.length === 0 && (
                      <div className="py-8 text-center text-[13px] text-text-4">No hay proveedores asignados aún.</div>
                    )}
                  </div>
                </div>
              </div>
              );
            })()}

            {/* ── TAB: Facturas ── */}
            {activeTab === "facturas" &&
              (() => {
                const contractInvoices = invoices.filter(
                  (inv) => inv.contrato === detailContract.id,
                );
                const contratanteInvoices = contractInvoices.filter(
                  (inv) => inv.tipo === "contratante",
                );
                const proveedorInvoices = contractInvoices.filter(
                  (inv) => inv.tipo === "proveedor",
                );
                return (
                  <div className="space-y-4">
                    {/* Sub-tabs */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex bg-white rounded-[10px] gap-1 p-1 border border-border">
                        {[
                          { id: "contratante", lbl: `Al Contratante (${contratanteInvoices.length})`, Icon: Building2 },
                          { id: "proveedor",   lbl: `De Proveedores (${proveedorInvoices.length})`,  Icon: Truck },
                        ].map(({ id, lbl, Icon }) => (
                          <button
                            key={id}
                            onClick={() => setFacSubTab(id)}
                            className={`bona-btn font-medium rounded-[8px] text-[12px] transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3 py-1.5 cursor-pointer
                              ${facSubTab === id ? "bg-[#EF7A2C] text-white font-semibold shadow-sm" : "text-text-3 hover:text-text-1"}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {lbl}
                          </button>
                        ))}
                      </div>
                      {facSubTab === "contratante" ? (
                        <Button
                          variant="primary"
                          onClick={() => setInvCtModal({ ...INV_CT_EMPTY, open: true, fechaVencimiento: defaultVencimiento() })}
                        >
                          Nueva Factura
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => setInvPrModal({ ...INV_PR_EMPTY, open: true })}
                        >
                          Importar Factura
                        </Button>
                      )}
                    </div>

                    {/* Facturas al Contratante */}
                    {facSubTab === "contratante" && (() => {
                      const sortedInvCT = (() => {
                        const ek = groupByFacCT || sortFacCT.key;
                        if (!ek) return contratanteInvoices;
                        const dir = groupByFacCT ? 1 : (sortFacCT.dir === 'asc' ? 1 : -1);
                        return [...contratanteInvoices].sort((a, b) => {
                          if (ek === 'fecha') return dir * parseDate(a.fecha).localeCompare(parseDate(b.fecha));
                          if (ek === 'monto') return dir * (a.monto - b.monto);
                          if (ek === 'estado') return dir * (a.estado ?? '').localeCompare(b.estado ?? '');
                          return 0;
                        });
                      })();
                      return (
                        <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
                          <div className="min-w-[640px] grid [grid-template-columns:1.4fr_0.9fr_1.6fr_1.2fr_1.4fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3 items-center">
                            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Cod. Factura</span>
                            <button onClick={() => toggleSortFacCT('fecha')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                              Fecha {sortIconFacCT('fecha')}
                            </button>
                            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Concepto</span>
                            <button onClick={() => toggleSortFacCT('monto')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center justify-end gap-1 cursor-pointer hover:text-text-1">
                              Monto {sortIconFacCT('monto')}
                            </button>
                            <button onClick={() => toggleGroupFacCT('estado')} className={`text-[11px] font-semibold uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer hover:text-text-1 ${groupByFacCT === 'estado' ? 'text-orange' : 'text-text-4'}`}>
                              Estado {groupIconFacCT('estado')}
                            </button>
                            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
                          </div>
                          {sortedInvCT.flatMap((inv, i) => {
                            const gVal = groupByFacCT === 'estado' ? (inv.estado || '—') : null;
                            const prevGVal = i === 0 ? null : groupByFacCT === 'estado' ? (sortedInvCT[i-1].estado || '—') : null;
                            const isNewGroup = gVal !== null && (i === 0 || gVal !== prevGVal);
                            const groupSep = isNewGroup ? [
                              <div key={`grp-ct-${i}`} className="min-w-[640px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                                <span className="text-[11px] font-bold text-orange">{gVal}</span>
                              </div>
                            ] : [];
                            const row = (
                              <div key={inv.id}
                                onClick={() => handleOpenEditCTInvoice(inv)}
                                className="min-w-[640px] grid [grid-template-columns:1.4fr_0.9fr_1.6fr_1.2fr_1.4fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                              >
                                <div>
                                  <div className="text-[12px] font-mono font-bold text-text-1">{inv.id}</div>
                                </div>
                                <div className="text-[11px] text-text-4">{inv.fecha || '—'}</div>
                                <div className="text-[12px] text-text-3 truncate text-center">{inv.concepto}</div>
                                <div className="text-[13px] font-extrabold text-text-1 text-right">{formatXaf(inv.monto)}</div>
                                <div className="flex justify-center">
                                  <InvoiceStatusBadge estado={inv.estado} noDot />
                                </div>
                                <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                                  <button onClick={e => { e.stopPropagation(); handleOpenEditCTInvoice(inv); }}
                                    className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); handleDeleteInvoice(inv.id); }}
                                    className="p-1.5 rounded-[8px] transition text-text-4 hover:text-red-text cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                            return [...groupSep, row];
                          })}
                          {contratanteInvoices.length === 0 && (
                            <div className="min-w-[640px] px-4 py-10 text-center text-[13px] text-text-4">No hay facturas al contratante para este contrato.</div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Facturas de Proveedores */}
                    {facSubTab === "proveedor" && (() => {
                      const sortedInvPR = (() => {
                        const ek = groupByFacPR || sortFacPR.key;
                        if (!ek) return proveedorInvoices;
                        const dir = groupByFacPR ? 1 : (sortFacPR.dir === 'asc' ? 1 : -1);
                        return [...proveedorInvoices].sort((a, b) => {
                          if (ek === 'fecha') return dir * parseDate(a.fecha).localeCompare(parseDate(b.fecha));
                          if (ek === 'proveedor') return dir * (a.proveedorNombre ?? '').localeCompare(b.proveedorNombre ?? '');
                          if (ek === 'monto') return dir * (a.monto - b.monto);
                          if (ek === 'estado') return dir * (a.estado ?? '').localeCompare(b.estado ?? '');
                          return 0;
                        });
                      })();
                      return (
                        <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
                          <div className="min-w-[640px] grid [grid-template-columns:1.4fr_0.9fr_1.4fr_1.4fr_1.2fr_1.2fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3 items-center">
                            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Cod. Factura</span>
                            <button onClick={() => toggleSortFacPR('fecha')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                              Fecha {sortIconFacPR('fecha')}
                            </button>
                            <button onClick={() => toggleGroupFacPR('proveedor')} className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 ${groupByFacPR === 'proveedor' ? 'text-orange' : 'text-text-4'}`}>
                              Proveedor {groupIconFacPR('proveedor')}
                            </button>
                            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Concepto</span>
                            <button onClick={() => toggleSortFacPR('monto')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center justify-end gap-1 cursor-pointer hover:text-text-1">
                              Monto {sortIconFacPR('monto')}
                            </button>
                            <button onClick={() => toggleSortFacPR('estado')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer hover:text-text-1">
                              Estado {sortIconFacPR('estado')}
                            </button>
                            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
                          </div>
                          {sortedInvPR.flatMap((inv, i) => {
                            const gVal = groupByFacPR === 'proveedor' ? (inv.proveedorNombre || '—') : null;
                            const prevGVal = i === 0 ? null : groupByFacPR === 'proveedor' ? (sortedInvPR[i-1].proveedorNombre || '—') : null;
                            const isNewGroup = gVal !== null && (i === 0 || gVal !== prevGVal);
                            const groupSep = isNewGroup ? [
                              <div key={`grp-pr-${i}`} className="min-w-[640px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                                <span className="text-[11px] font-bold text-orange">{gVal}</span>
                              </div>
                            ] : [];
                            const row = (
                              <div key={inv.id}
                                onClick={() => handleOpenEditPRInvoice(inv)}
                                className="min-w-[640px] grid [grid-template-columns:1.4fr_0.9fr_1.4fr_1.4fr_1.2fr_1.2fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                              >
                                <div>
                                  <div className="text-[12px] font-mono font-bold text-text-1">{inv.id}</div>
                                </div>
                                <div className="text-[11px] text-text-4">{inv.fecha || '—'}</div>
                                <div className="text-[12px] font-bold text-text-1 truncate">{inv.proveedorNombre}</div>
                                <div className="text-[12px] text-text-3 truncate text-center">{inv.concepto || inv.proveedorNombre}</div>
                                <div className="text-[13px] font-extrabold text-text-1 text-right">{formatXaf(inv.monto)}</div>
                                <div className="flex justify-center">
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"><InvoiceStatusBadge estado={inv.estado} noDot /></span>
                                </div>
                                <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                                  <button onClick={e => { e.stopPropagation(); handleOpenEditPRInvoice(inv); }}
                                    className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); handleDeleteInvoice(inv.id); }}
                                    className="p-1.5 rounded-[8px] transition text-text-4 hover:text-red-text cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                            return [...groupSep, row];
                          })}
                          {proveedorInvoices.length === 0 && (
                            <div className="min-w-[640px] px-4 py-10 text-center text-[13px] text-text-4">No hay facturas de proveedores importadas para este contrato.</div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}

            {/* ── TAB: Pagos ── */}
            {activeTab === 'pagos' && (() => {
              const contractPagos     = pagos.filter(p => p.contrato === detailContract.id);
              return (
                <div className="space-y-5">
                  <div className="bg-white rounded-[14px] border border-border p-5">
                    <SectionHeader icon={CreditCard} iconBg="#FFF3E0" iconColor="#EF7A2C"
                      title="Pagos"
                      subtitle="Registra pagos a proveedores. Pueden vincularse a una factura recibida o ser pagos directos."
                      action={
                        <div className="flex items-center">
                          <div className="sm:hidden">
                            <Button variant="primary" size="sm" onClick={() => setPagoModal({ ...PAGO_MODAL_EMPTY, open: true })}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="hidden sm:block">
                            <Button variant="primary" onClick={() => setPagoModal({ ...PAGO_MODAL_EMPTY, open: true })}>Nuevo Pago</Button>
                          </div>
                        </div>
                      }
                    />
                    <div className="space-y-3">
                      {contractPagos.map(p => {
                        const linkedInv = p.facturaProvId ? invoices.find(inv => inv.id === p.facturaProvId) : null;
                        return (
                          <div key={p.id}
                            className="bg-white rounded-[16px] p-4 border border-border transition-all duration-200 cursor-default"
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(46,125,91,0.12)'; e.currentTarget.style.borderColor = '#A8D5BE'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#ECEAE7'; }}
                          >
                            {/* Mobile */}
                            <div className="sm:hidden">
                              <div className="flex items-center gap-2.5 mb-2">
                                <div className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                                  <CreditCard className="w-4 h-4" style={{ color: '#EF7A2C' }} />
                                </div>
                                <span className="text-[13px] font-bold text-text-1 truncate">{p.id}</span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: '#E3F4EA', color: '#2E7D5B' }}>{p.estado}</span>
                                {p.documento && <span className="flex items-center gap-0.5 text-[10px] text-text-4 shrink-0"><Paperclip className="w-3 h-3" /> Doc</span>}
                              </div>
                              <div className="text-[12px] text-text-3 truncate mb-1">{p.concepto}</div>
                              {linkedInv ? (
                                <div className="flex items-center gap-1 text-[11px] text-text-5 mb-1">
                                  <Receipt className="w-3 h-3 shrink-0" /> {linkedInv.id} · {linkedInv.proveedorNombre}
                                </div>
                              ) : p.proveedorNombre ? (
                                <div className="text-[11px] text-text-5 mb-1">{p.proveedorNombre}</div>
                              ) : (
                                <div className="text-[11px] text-text-5 mb-1">Pago directo sin factura vinculada</div>
                              )}
                              <div className="flex items-center justify-between pt-2.5 border-t border-border">
                                <div>
                                  <div className="text-[14px] font-extrabold text-text-1">{formatXaf(p.monto)}</div>
                                  <div className="text-[11px] text-text-5 mt-0.5">{p.fecha}</div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleOpenEditPago(p)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeletePago(p.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                            </div>
                            {/* Desktop */}
                            <div className="hidden sm:flex items-center gap-4">
                              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                                <CreditCard className="w-5 h-5" style={{ color: '#EF7A2C' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[13px] font-bold text-text-1">{p.id}</span>
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#E3F4EA', color: '#2E7D5B' }}>{p.estado}</span>
                                  {p.documento && <span className="flex items-center gap-0.5 text-[10px] text-text-4"><Paperclip className="w-3 h-3" /> Doc</span>}
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
                                  <button onClick={() => handleOpenEditPago(p)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeletePago(p.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
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

            {/* ── TAB: Registros ── */}
            {activeTab === 'registros' && (() => {
              const contractInvoices = invoices.filter(inv => inv.contrato === detailContract.id);
              return (
                <RegistrosTabla registros={registrosContrato(detailContract, contractInvoices)} />
              );
            })()}
          </>
        ) : null}
      </div>

      {/* ── Modal: Nueva / Editar factura al Contratante ── */}
      {invCtModal.open && (
        <FacturaContratanteModal
          modal={invCtModal}
          contratoFijo={detailContract}
          onChange={(p) => setInvCtModal((prev) => ({ ...prev, ...p }))}
          onSave={handleSaveCTInvoice}
          onCancel={() => setInvCtModal(INV_CT_EMPTY)}
        />
      )}

      {/* ── Modal: Importar / Editar factura de Proveedor ── */}
      {invPrModal.open && (
        <Modal
          title={
            invPrModal.editId
              ? `Editar factura ${invPrModal.editId}`
              : "Importar Factura de Proveedor"
          }
          onClose={() => setInvPrModal(INV_PR_EMPTY)}
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setInvPrModal(INV_PR_EMPTY)}
              >
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSavePRInvoice}>
                {invPrModal.editId ? "Guardar cambios" : "Importar factura"}
              </Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Proveedor" required>
                <Select
                  value={invPrModal.proveedorId}
                  onChange={(e) =>
                    setInvPrModal({
                      ...invPrModal,
                      proveedorId: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar proveedor…</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.razonSocial} · {p.sector}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Monto (XAF)" required>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 4,500,000"
                  value={invPrModal.monto}
                  onChange={(e) =>
                    setInvPrModal({
                      ...invPrModal,
                      monto: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                />
                {invPrModal.monto && (
                  <div className="text-[11px] text-text-4 mt-1">
                    {formatXaf(invPrModal.monto)}
                  </div>
                )}
              </FormGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Fecha de emisión">
                <Input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={invPrModal.fecha}
                  onChange={(e) =>
                    setInvPrModal({ ...invPrModal, fecha: e.target.value })
                  }
                />
              </FormGroup>
              <FormGroup label="Fecha de vencimiento">
                <Input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={invPrModal.fechaVencimiento}
                  onChange={(e) =>
                    setInvPrModal({
                      ...invPrModal,
                      fechaVencimiento: e.target.value,
                    })
                  }
                />
              </FormGroup>
            </div>
            <FormGroup label="Concepto">
              <Textarea
                value={invPrModal.concepto}
                onChange={(e) =>
                  setInvPrModal({ ...invPrModal, concepto: e.target.value })
                }
                placeholder="Descripción del servicio o producto facturado…"
              />
            </FormGroup>
            <div>
              <div className="text-[12px] font-medium text-text-3 mb-1.5">
                Adjuntar documento
              </div>
              {invPrModal.documento ? (
                <div className="flex items-center gap-2 bg-page-bg rounded-[8px] px-3 py-2 text-[12px] text-text-3 border border-border">
                  <Paperclip className="w-3.5 h-3.5 text-text-4 shrink-0" />
                  <span className="flex-1 truncate">
                    {invPrModal.documento.name}
                  </span>
                  <button
                    onClick={() =>
                      setInvPrModal((p) => ({ ...p, documento: null }))
                    }
                    className="text-text-4 hover:text-red-text text-[14px] leading-none"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 border border-dashed border-border rounded-[8px] px-3 py-2.5 text-[12px] text-text-4 cursor-pointer hover:border-orange/40 hover:bg-orange-tint transition">
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  Seleccionar archivo (PDF, imagen)
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        setInvPrModal((p) => ({
                          ...p,
                          documento: {
                            name: file.name,
                            url: URL.createObjectURL(file),
                          },
                        }));
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Nuevo / Editar pago ── */}
      {pagoModal.open &&
        (() => {
          const proveedorInvoices = invoices.filter(
            (inv) =>
              inv.contrato === detailContract?.id && inv.tipo === "proveedor",
          );
          return (
            <Modal
              title={
                pagoModal.editId
                  ? `Editar pago ${pagoModal.editId}`
                  : "Nuevo Pago"
              }
              onClose={() => setPagoModal(PAGO_MODAL_EMPTY)}
              footer={
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setPagoModal(PAGO_MODAL_EMPTY)}
                  >
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleSavePago}>
                    {pagoModal.editId ? "Guardar cambios" : "Realizar Pago"}
                  </Button>
                </>
              }
              wide
            >
              <div className="space-y-4">
                <div className="text-[12px] text-text-4">
                  El pago puede vincularse a una factura de proveedor o
                  realizarse directamente especificando el proveedor.
                </div>
                {proveedorInvoices.length > 0 && (
                  <FormGroup label="Vincular a factura de proveedor (opcional)">
                    <Select
                      value={pagoModal.facturaProvId}
                      onChange={(e) =>
                        setPagoModal({
                          ...pagoModal,
                          facturaProvId: e.target.value,
                          proveedorId: "",
                        })
                      }
                    >
                      <option value="">Sin vinculación — pago directo</option>
                      {proveedorInvoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.id} · {inv.proveedorNombre} ·{" "}
                          {formatXaf(inv.monto)}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                )}
                {!pagoModal.facturaProvId && (
                  <FormGroup label="Proveedor" required>
                    <Select
                      value={pagoModal.proveedorId}
                      onChange={(e) =>
                        setPagoModal({
                          ...pagoModal,
                          proveedorId: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccionar proveedor…</option>
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.razonSocial} · {p.sector}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="Monto (XAF)" required>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej: 2,500,000"
                      value={pagoModal.monto}
                      onChange={(e) =>
                        setPagoModal({
                          ...pagoModal,
                          monto: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                    />
                    {pagoModal.monto && (
                      <div className="text-[11px] text-text-4 mt-1">
                        {formatXaf(pagoModal.monto)}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup label="Fecha del pago">
                    <Input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={pagoModal.fecha}
                      onChange={(e) =>
                        setPagoModal({ ...pagoModal, fecha: e.target.value })
                      }
                    />
                  </FormGroup>
                </div>
                <FormGroup label="Concepto" required>
                  <Textarea
                    value={pagoModal.concepto}
                    onChange={(e) =>
                      setPagoModal({ ...pagoModal, concepto: e.target.value })
                    }
                    placeholder="Descripción del pago realizado…"
                  />
                </FormGroup>
                <div>
                  <div className="text-[12px] font-medium text-text-3 mb-1.5">
                    Adjuntar documento / factura
                  </div>
                  {pagoModal.documento ? (
                    <div className="flex items-center gap-2 bg-page-bg rounded-[8px] px-3 py-2 text-[12px] text-text-3 border border-border">
                      <Paperclip className="w-3.5 h-3.5 text-text-4 shrink-0" />
                      <span className="flex-1 truncate">
                        {pagoModal.documento.name}
                      </span>
                      <button
                        onClick={() =>
                          setPagoModal((p) => ({ ...p, documento: null }))
                        }
                        className="text-text-4 hover:text-red-text text-[14px] leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 border border-dashed border-border rounded-[8px] px-3 py-2.5 text-[12px] text-text-4 cursor-pointer hover:border-orange/40 hover:bg-orange-tint transition">
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      Adjuntar comprobante o factura (PDF, imagen)
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            setPagoModal((p) => ({
                              ...p,
                              documento: {
                                name: file.name,
                                url: URL.createObjectURL(file),
                              },
                            }));
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </Modal>
          );
        })()}

      {/* ── Modal: Agregar Proveedor (ligado a este contrato) ── */}
      {agregarProv.open && detailContract && (
        <Modal
          title="Agregar Proveedor"
          onClose={() => setAgregarProv(NUEVO_PROV_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setAgregarProv(NUEVO_PROV_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleAgregarProv} disabled={!formOkProv}>Guardar proveedor</Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="text-[12px] text-text-4">
              Selecciona un proveedor ya conocido por el sistema, o registra
              uno nuevo. Quedará ligado al contrato {detailContract.id}.
            </div>
            <FormGroup label="Proveedor" required>
              <Select value={agregarProv.provSel} onChange={(e) => {
                const v = e.target.value;
                const p = initialProviders.find((x) => x.razonSocial === v);
                setAgregarProv((a) => ({
                  ...a, provSel: v,
                  nombreComercial: p?.nombreComercial ?? "",
                  sector: p?.sector ?? "Materiales",
                  correo: p?.email ?? "",
                  telefono: (p?.telefono ?? "").replace(/\D/g, "").slice(0, 9),
                }));
              }}>
                <option value="__nueva__">Otro (nuevo)…</option>
                {initialProviders.map((p) => <option key={p.razonSocial} value={p.razonSocial}>{p.razonSocial}</option>)}
              </Select>
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!provExistenteProv && (
                <FormGroup label="Razón Social" required>
                  <Input
                    value={agregarProv.razonSocial}
                    onChange={(e) => setAgregarProv((a) => ({ ...a, razonSocial: e.target.value }))}
                    placeholder="Nombre legal exacto"
                  />
                </FormGroup>
              )}
              <FormGroup label="Nombre Comercial">
                <Input
                  value={agregarProv.nombreComercial}
                  onChange={(e) => setAgregarProv((a) => ({ ...a, nombreComercial: e.target.value }))}
                  placeholder="Nombre comercial o marca"
                />
              </FormGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormGroup label="Sector Productivo" required>
                <Select
                  value={agregarProv.sector}
                  onChange={(e) => setAgregarProv((a) => ({ ...a, sector: e.target.value }))}
                >
                  {SECTORES_PROV.map((s) => <option key={s}>{s}</option>)}
                </Select>
              </FormGroup>
              <div>
                <FormGroup label="Teléfono" required className={provExistenteProv ? "mb-0" : ""}>
                  <div className="flex">
                    <span className="flex items-center h-12 px-3 border-2 border-r-0 border-gray-200 rounded-l-[8px] bg-[#fafafa] text-[14px] font-semibold text-text-2">
                      {PREFIJO_TEL_PROV}
                    </span>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={telefonoLocalProv.slice(0, 9)}
                      onChange={(e) => setAgregarProv((a) => ({ ...a, telefono: e.target.value.replace(/\D/g, "").slice(0, 9) }))}
                      placeholder="222 XXX XXX"
                      disabled={provExistenteProv}
                      className={`!rounded-l-none ${telefonoInvalidoProv ? "!border-red-400 focus:!border-red-500" : ""}`}
                    />
                  </div>
                </FormGroup>
                {provExistenteProv ? (
                  <p className="text-xs text-text-4 mt-1.5">Dato del perfil del proveedor; no se puede modificar aquí.</p>
                ) : telefonoInvalidoProv && (
                  <p className="text-xs text-red-500 mt-1.5">El teléfono debe tener entre 7 y 9 dígitos.</p>
                )}
              </div>
              <div>
                <FormGroup label="Correo" required className={provExistenteProv ? "mb-0" : ""}>
                  <Input
                    type="email"
                    value={agregarProv.correo}
                    onChange={(e) => setAgregarProv((a) => ({ ...a, correo: e.target.value }))}
                    placeholder="correo@empresa.gq"
                    disabled={provExistenteProv}
                    className={emailInvalidoProv ? "!border-red-400 focus:!border-red-500" : ""}
                  />
                </FormGroup>
                {provExistenteProv ? (
                  <p className="text-xs text-text-4 mt-1.5">Dato del perfil del proveedor; no se puede modificar aquí.</p>
                ) : emailInvalidoProv && (
                  <p className="text-xs mt-1.5 text-red-500">Ingresa un correo electrónico válido.</p>
                )}
              </div>
            </div>

            <FormGroup label="Monto asignado (XAF)" required>
              <Input
                inputMode="numeric"
                value={fmtMontoProv(agregarProv.monto)}
                onChange={(e) => setAgregarProv((a) => ({ ...a, monto: e.target.value.replace(/\D/g, "") }))}
                placeholder="Ej. 5.000.000"
                className={montoInvalidoProv ? "!border-red-400 focus:!border-red-500" : ""}
              />
              {montoInvalidoProv && (
                <p className="text-xs text-red-500 mt-1.5">
                  {montoNumLiveProv <= 0 ? "Ingresa un monto válido." : `El monto supera el disponible (${fmt(disponibleParaAgregarProv)} XAF).`}
                </p>
              )}
            </FormGroup>

            <button
              type="button"
              onClick={() => setAgregarProv((a) => ({ ...a, esClienteBonafide: !a.esClienteBonafide }))}
              className="flex items-center gap-3 w-full rounded-[10px] border px-4 py-3 transition-all"
              style={{
                borderColor: agregarProv.esClienteBonafide ? "rgba(224,32,28,0.35)" : "#ECEAE7",
                background: agregarProv.esClienteBonafide ? "#FFF3E0" : "#F6F5F3",
              }}
            >
              <div
                className="w-9 h-5 rounded-full flex items-center transition-all shrink-0 px-0.5"
                style={{ background: agregarProv.esClienteBonafide ? "#E0201C" : "#A9A6A1" }}
              >
                <div
                  className="w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: agregarProv.esClienteBonafide ? "translateX(16px)" : "translateX(0)" }}
                />
              </div>
              <div className="text-left">
                <div className="text-[13px] font-semibold text-text-1">Cliente Bonafide</div>
                <div className="text-[11px] text-text-4">Este proveedor también opera como cliente dentro del ecosistema Bonafide.</div>
              </div>
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Ver proveedor ── */}
      {provDetailModal && (
        <Modal
          title={`${provDetailModal.razonSocial} · ${provDetailModal.id}`}
          onClose={() => setProvDetailModal(null)}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <Badge variant={KYC_BADGE[provDetailModal.kyc] ?? "yellow"}>
                {provDetailModal.kyc}
              </Badge>
              {provDetailModal.scoreCredito != null &&
                (() => {
                  const sStyle = scoreStyle(provDetailModal.scoreCredito);
                  return (
                    <div
                      className="px-2.5 py-1.5 rounded-[8px]"
                      style={{ background: sStyle.bg }}
                    >
                      <span
                        className="text-[11px] font-semibold mr-1.5"
                        style={{ color: sStyle.color }}
                      >
                        Score crediticio
                      </span>
                      <span
                        className="text-[15px] font-extrabold"
                        style={{ color: sStyle.color }}
                      >
                        {provDetailModal.scoreCredito}
                      </span>
                    </div>
                  );
                })()}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow
                label="Nombre Comercial"
                value={provDetailModal.nombreComercial}
              />
              <InfoRow label="RUC / NIF" value={provDetailModal.ruc} />
              <InfoRow label="Sector" value={provDetailModal.sector} />
              <InfoRow label="Teléfono" value={provDetailModal.telefono} />
              <InfoRow label="Correo" value={provDetailModal.email} />
            </div>
          </div>
        </Modal>
      )}

      {eliminarProv && detailContract && (
        <ConfirmarEliminarModal
          nombre={eliminarProv.item.providerName}
          tipoEntidad="Proveedor"
          contratoVinculado={detailContract.id}
          onConfirm={handleEliminarProv}
          onClose={() => setEliminarProv(null)}
        />
      )}

      {/* ── Modal: Requerimiento de Bonafide ── */}
      {reqModal && (
        <Modal
          title={`Requerimiento · ${reqModal.id}`}
          onClose={() => setReqModal(null)}
        >
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-[12px] bg-red-bg border border-red/20">
              <MessageSquare className="w-5 h-5 shrink-0 mt-0.5 text-red-text" />
              <div>
                <p className="text-[13px] text-text-1 leading-relaxed">
                  {reqModal.requerimiento?.mensaje}
                </p>
                <p className="text-[11px] text-text-5 mt-2">
                  Reportado el {reqModal.requerimiento?.fecha}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              full
              className="h-[46px] justify-center"
              onClick={() => {
                const contratoId =
                  reqModal.requerimiento?.contratoId ?? reqModal.id;
                setReqModal(null);
                go("epConfigurarContrato", { contratoId });
              }}
            >
              Reconfigurar Contrato
            </Button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
