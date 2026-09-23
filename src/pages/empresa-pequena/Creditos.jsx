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
import { contratoService } from "../../services/contrato.service";
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

const initialProviders = [
  {
    id: "p1",
    razonSocial: "SAP",
    nombreComercial: "SAP",
    ruc: "GE-2019-00123",
    sector: "Materiales",
    email: "ventas@cemex.gq",
    telefono: "+240 222 111 222",
    activo: true,
    kyc: "vigente",
    scoreCredito: 780,
  },
  {
    id: "p2",
    razonSocial: "APEX",
    nombreComercial: "APEX",
    ruc: "GE-2020-00445",
    sector: "Transporte",
    email: "info@transge.gq",
    telefono: "+240 222 333 444",
    activo: true,
    kyc: "vigente",
    scoreCredito: 690,
  },
  {
    id: "p3",
    razonSocial: "APEX Tech",
    nombreComercial: "APEX Tech",
    ruc: "GE-2022-00112",
    sector: "Tecnología",
    email: "soporte@servtec.gq",
    telefono: "+240 222 777 888",
    activo: true,
    kyc: "pendiente",
    scoreCredito: 510,
  },
];

const KYC_BADGE = { vigente: "orange", pendiente: "yellow", vencido: "red" };

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
        <span className="text-[13px] font-bold text-text-3 tracking-wide">{contract.id}</span>
        <Badge variant={contratoBadge(contract.estado)}>{contract.estado}</Badge>
      </div>

      {/* Fila 2: Empresa Contratante */}
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-text-4 mb-0.5">Empresa Contratante</p>
        <p className="text-[13px] font-bold text-text-1 leading-tight truncate">{ctName}</p>
      </div>

      {/* Fila 3: Monto Asignado + Disponible */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-text-4 mb-0.5">Monto Asignado</p>
          <p className="text-[13px] font-extrabold text-text-1 tabular-nums leading-tight">{formatXaf(contract.monto)}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-text-4 mb-0.5">Disponible</p>
          <p className="text-[13px] font-extrabold tabular-nums leading-tight" style={{ color: '#EF7A2C' }}>{formatXaf(contract.disponible)}</p>
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
  const providers = initialProviders;
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

  const detailContract = detailId
    ? (contracts.find((c) => c.id === detailId) ?? null)
    : null;

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
                  <div className="flex bg-white rounded-[10px] gap-1 p-1 w-max">
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
                onContinuar={b => go('epConfigurarContrato', { contratoId: b.contratoId })}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex gap-1 mb-5 bg-white rounded-[10px] p-1">
              {TABS.map(({ id, label, Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-[8px] text-[12px] sm:text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer
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
              // vista de solo lectura).
              const asignados = detailContract.proveedoresAsignados ?? [];
              const filas = asignados.length > 0
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
                    .filter(({ prov }) => prov);
              return (
              <div className="space-y-5">
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <SectionHeader icon={Truck} iconBg="#FFF3E0" iconColor="#EF7A2C"
                    title="Proveedores" subtitle="Proveedores de este contrato y el monto que le corresponde a cada uno."
                  />

                  {/* Móvil: cards */}
                  <div className="sm:hidden space-y-2">
                    {filas.map(({ item, prov }) => (
                      <div key={item.id} className="rounded-[12px] border border-border p-3.5 flex flex-col gap-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-text-1 truncate">{item.providerName}</div>
                          </div>
                          <div className="text-[12px] text-text-3 truncate text-center">{item.concepto}</div>
                          <span className="text-[12px] text-text-4 text-center">{item.providerSector || "—"}</span>
                          <div className="flex justify-center">
                            <Badge variant={KYC_BADGE[prov.kyc] ?? "yellow"}>{prov.kyc}</Badge>
                          </div>
                          <span className="text-[13px] font-extrabold text-text-1 text-center">{formatXaf(item.monto)}</span>
                          <div className="flex justify-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); setProvDetailModal(prov); }}
                              className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      ))}
                      {filas.length === 0 && (
                        <div className="min-w-[640px] px-4 py-10 text-center text-[13px] text-text-4">
                          No hay proveedores asignados aún.
                        </div>
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
                      <div className="flex bg-white rounded-[10px] gap-1 p-1">
                        {[
                          { id: "contratante", lbl: `Al Contratante (${contratanteInvoices.length})`, Icon: Building2 },
                          { id: "proveedor",   lbl: `De Proveedores (${proveedorInvoices.length})`,  Icon: Truck },
                        ].map(({ id, lbl, Icon }) => (
                          <button
                            key={id}
                            onClick={() => setFacSubTab(id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all whitespace-nowrap cursor-pointer
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
                    {facSubTab === "contratante" && (
                      <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
                        <div className="min-w-[640px] grid [grid-template-columns:1.5fr_2.5fr_1.2fr_1.5fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3">
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">ID</span>
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Concepto</span>
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Monto</span>
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Estado</span>
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
                        </div>
                        {contratanteInvoices.map((inv) => (
                          <div
                            key={inv.id}
                            onClick={() => handleOpenEditCTInvoice(inv)}
                            className="min-w-[640px] grid [grid-template-columns:1.5fr_2.5fr_1.2fr_1.5fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                          >
                            <div>
                              <div className="text-[12px] font-mono font-bold text-text-1">{inv.id}</div>
                              <div className="text-[11px] text-text-5">{inv.fecha}</div>
                            </div>
                            <div className="text-[12px] text-text-3 truncate text-center">{inv.concepto}</div>
                            <div className="text-[13px] font-extrabold text-text-1 text-center">{formatXaf(inv.monto)}</div>
                            <div className="flex justify-center">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"><InvoiceStatusBadge estado={inv.estado} /></span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenEditCTInvoice(inv); }}
                                className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(inv.id); }}
                                className="p-1.5 rounded-[8px] transition text-text-4 hover:text-red-text cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {contratanteInvoices.length === 0 && (
                          <div className="min-w-[640px] px-4 py-10 text-center text-[13px] text-text-4">
                            No hay facturas al contratante para este contrato.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Facturas de Proveedores */}
                    {facSubTab === "proveedor" && (
                      <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
                        <div className="min-w-[640px] grid [grid-template-columns:1.5fr_1.5fr_2fr_1.2fr_1.5fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3">
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">ID</span>
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Proveedor</span>
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Concepto</span>
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Monto</span>
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Estado</span>
                          <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
                        </div>
                        {proveedorInvoices.map((inv) => {
                          return (
                            <div
                              key={inv.id}
                              onClick={() => handleOpenEditPRInvoice(inv)}
                              className="min-w-[640px] grid [grid-template-columns:1.5fr_1.5fr_2fr_1.2fr_1.5fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                            >
                              <div>
                                <div className="text-[12px] font-mono font-bold text-text-1">{inv.id}</div>
                                <div className="text-[11px] text-text-5">{inv.fecha}</div>
                              </div>
                              <div className="text-[12px] font-bold text-text-1 truncate">{inv.proveedorNombre}</div>
                              <div className="text-[12px] text-text-3 truncate text-center">{inv.concepto || inv.proveedorNombre}</div>
                              <div className="text-[13px] font-extrabold text-text-1 text-center">{formatXaf(inv.monto)}</div>
                              <div className="flex justify-center">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"><InvoiceStatusBadge estado={inv.estado} /></span>
                              </div>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOpenEditPRInvoice(inv); }}
                                  className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(inv.id); }}
                                  className="p-1.5 rounded-[8px] transition text-text-4 hover:text-red-text cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {proveedorInvoices.length === 0 && (
                          <div className="min-w-[640px] px-4 py-10 text-center text-[13px] text-text-4">
                            No hay facturas de proveedores importadas para este contrato.
                          </div>
                        )}
                      </div>
                    )}
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
