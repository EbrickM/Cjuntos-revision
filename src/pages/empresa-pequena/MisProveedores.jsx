import { useState } from "react";
import { useCountUp } from "../../hooks/useCountUp";
import {
  Pencil,
  Trash2,
  Building2,
  FileText,
  Search,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Star,
  ClipboardList,
  Plus,
} from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import { StatCard } from "../../components/common/StatCard";
import ConfirmarEliminarModal from "../../components/common/ConfirmarEliminarModal";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import InfoRow from "../../components/ui/InfoRow";
import FormGroup, { Input, Select } from "../../components/ui/FormGroup";
import { useProviders, fmt } from "./epData";
import { contratoService } from "../../services/contrato.service";
import { CST } from "../../lib/contractStates";
import InfiniteScrollSentinel from "../../components/common/InfiniteScrollSentinel";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

const SECTORES = [
  "Energía",
  "Construcción",
  "Manufactura",
  "Transporte",
  "Tecnología",
  "Servicios",
  "Alimentación",
  "Minería",
  "Agricultura",
  "Comercio",
  "Materiales",
  "Otro",
];

const KYC_BADGE = {
  vigente: {
    label: "KYC Vigente",
    bg: "#FFF3E0",
    color: "#EF7A2C",
    border: "1px solid rgba(239,122,44,.3)",
  },
  pendiente: {
    label: "KYC Pendiente",
    bg: "#FDF6E8",
    color: "#C68A1D",
    border: "1px solid rgba(198,138,29,.3)",
  },
  vencido: {
    label: "KYC Vencido",
    bg: "#FDEEEB",
    color: "#B8352A",
    border: "1px solid rgba(184,53,42,.3)",
  },
  "—": {
    label: "—",
    bg: "#F6F5F3",
    color: "#A9A6A1",
    border: "1px solid rgba(169,166,161,.3)",
  },
};

const scoreStyle = (score) => {
  if (!score) return { bg: "#F6F5F3", color: "#A9A6A1", label: "En espera" };
  if (score >= 750) return { bg: "#FFF3E0", color: "#EF7A2C", label: "Bajo" };
  if (score >= 600)
    return { bg: "#FDF6E8", color: "#C68A1D", label: "Moderado" };
  return { bg: "#FDEEEB", color: "#B8352A", label: "Alto" };
};

const PREFIJO_TEL = "+240";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const KYC_SUB = {
  vigente: "Documentación al día",
  pendiente: "Pendiente de verificación",
  vencido: "Requiere renovación",
  "—": "Sin información",
};

const numContratos = (p) => (p.contratosActivos ?? []).length;

const initials = (name = "") => {
  const words = name
    .replace(/[^A-Za-zÀ-ÿÑñ0-9 ]/g, "")
    .split(" ")
    .filter(Boolean);
  if (words.length === 0) return "--";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
};

const ModalLabel = ({ text, Icon }) => (
  <div className="flex items-center gap-2 mb-3">
    {Icon && (
      <div className="bona-gradient-bg w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-white" />
      </div>
    )}
    <span className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">
      {text}
    </span>
  </div>
);

const ComplianceItem = ({ label, value, sub, Icon, iconColor }) => (
  <div className="rounded-[12px] border border-border p-4">
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className="w-9 h-9 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div>
        <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">
          {label}
        </div>
        <div
          className="text-[13px] font-bold leading-tight"
          style={{ color: iconColor }}
        >
          {value}
        </div>
      </div>
    </div>
    <div className="text-[11px] text-text-4 leading-snug">{sub}</div>
  </div>
);

const MODAL_EMPTY = {
  open: false,
  editId: null,
  razonSocial: "",
  nombreComercial: "",
  sector: "Materiales",
  telefono: "",
  correo: "",
  esClienteBonafide: false,
  contratoId: "",
};

// Los 15 proveedores mock del directorio viven en `epData.initialProviders`
// (compartido con EpConfigurarContrato para autocompletar correo/teléfono) — se
// usan para probar el scroll infinito (pageSize 10): las primeras 10 cards se
// ven de una sola carga y las 5 restantes aparecen al llegar al final, con un
// loader que simula la llamada a backend.

export default function EpMisProveedores() {
  const [providers, setProviders] = useProviders();
  const [modal, setModal] = useState(MODAL_EMPTY);
  const [detalle, setDetalle] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [eliminar, setEliminar] = useState(null);

  const filteredProviders = search.trim()
    ? providers.filter(
        (p) =>
          p.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
          (p.nombreComercial || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          p.ruc.toLowerCase().includes(search.toLowerCase()) ||
          p.sector.toLowerCase().includes(search.toLowerCase()),
      )
    : providers;

  // Delay solo de prueba, para ver el loader funcionando con estos 15 mocks —
  // en el resto de pantallas (y cuando esto se conecte a un backend real) el
  // delay se deja en 0 para no meter una espera artificial desde el frontend.
  const {
    visibleItems: pagedProviders,
    hasMore,
    loading,
    sentinelRef,
  } = useInfiniteScroll(filteredProviders, {
    pageSize: 10,
    delay: 900,
    resetKey: search,
  });

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 4500);
  };

  // Contratos activos del portal (para asignar el proveedor opcionalmente).
  const contratosActivos = contratoService
    .listarPorVista("pyme")
    .filter((c) => c.estado === CST.activo);

  // Normaliza el contrato seleccionado al shape que lee el detalle del proveedor.
  const contratoActivoMapeado = (id) => {
    const c = contratosActivos.find((x) => x.id === id);
    return c
      ? {
          id: c.id,
          objeto: c.objeto ?? "",
          contratante: c.contratanteNombre ?? c.pymeNombre ?? "",
          asignado: c.asignado ?? 0,
          utilizado: c.utilizado ?? 0,
        }
      : null;
  };

  const kycVigentes = providers.filter((p) => p.kyc === "vigente").length;
  const clientesBonafide = providers.filter((p) => p.esClienteBonafide).length;
  const conContratos = providers.filter((p) => numContratos(p) > 0).length;

  const animTotal          = useCountUp(providers.length, 900, 100);
  const animBonafide       = useCountUp(clientesBonafide, 900, 200);
  const animKyc            = useCountUp(kycVigentes,      900, 300);
  const animConContratos   = useCountUp(conContratos,     900, 400);

  const handleOpenEdit = (p) =>
    setModal({
      open: true,
      editId: p.id,
      razonSocial: p.razonSocial,
      nombreComercial: p.nombreComercial,
      sector: p.sector,
      telefono: (p.telefono ?? "").replace(/\D/g, "").slice(0, 9),
      correo: p.email,
      esClienteBonafide: p.esClienteBonafide ?? false,
      contratoId: p.contratosActivos?.[0]?.id ?? "",
    });
  const handleClose = () => setModal(MODAL_EMPTY);

  const emailLimpio = modal.correo.trim();
  const emailInvalido = emailLimpio !== "" && !EMAIL_REGEX.test(emailLimpio);
  const telefonoLocal = modal.telefono.replace(/\D/g, "");
  const telefonoValido = /^\d{7,9}$/.test(telefonoLocal);
  const telefonoInvalido = telefonoLocal !== "" && !telefonoValido;
  // Todos los campos obligatorios (los marcados con *) deben estar completos
  // antes de habilitar "Guardar": Razón Social, Sector, Teléfono y Correo. El
  // Nombre Comercial y el contrato son explícitamente opcionales.
  const formOk =
    modal.razonSocial.trim() && !!modal.sector && telefonoValido && emailLimpio && !emailInvalido;

  const handleSave = () => {
    if (!formOk) return;
    const nuevoContrato = contratoActivoMapeado(modal.contratoId);
    if (modal.editId) {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === modal.editId
            ? {
                ...p,
                razonSocial: modal.razonSocial,
                nombreComercial: modal.nombreComercial,
                sector: modal.sector,
                telefono: `${PREFIJO_TEL} ${telefonoLocal}`,
                email: emailLimpio,
                esClienteBonafide: modal.esClienteBonafide,
                contratosActivos:
                  nuevoContrato &&
                  !(p.contratosActivos ?? []).some((x) => x.id === nuevoContrato.id)
                    ? [...(p.contratosActivos ?? []), nuevoContrato]
                    : p.contratosActivos,
              }
            : p,
        ),
      );
      showToast(`${modal.razonSocial} ha sido actualizado correctamente.`);
    } else {
      const newId = `p${Math.max(...providers.map((p) => Number(p.id.replace("p", ""))), 0) + 1}`;
      setProviders((prev) => [
        {
          id: newId,
          razonSocial: modal.razonSocial,
          nombreComercial: modal.nombreComercial,
          sector: modal.sector,
          email: emailLimpio,
          telefono: `${PREFIJO_TEL} ${telefonoLocal}`,
          contratosActivos: nuevoContrato ? [nuevoContrato] : [],
          esClienteBonafide: modal.esClienteBonafide,
          kyc: "—",
          scoreCredito: null,
        },
        ...prev,
      ]);
      showToast(
        `${modal.razonSocial} ha sido añadido al directorio de proveedores.`,
      );
    }
    handleClose();
  };

  const handleDelete = () => {
    if (!eliminar) return;
    setProviders((prev) => prev.filter((pr) => pr.id !== eliminar.id));
    showToast(`${eliminar.razonSocial} ha sido eliminado del directorio.`);
    setEliminar(null);
  };

  return (
    <AppShell
      active="epProveedores"
      role="empresa-pequena"
      title="Mis Proveedores"
      sub="Directorio de proveedores"
      back
    >
      <div className="fade-in space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { value: animTotal,        label: "Proveedores registrados" },
            { value: animBonafide,     label: "Clientes Bonafide" },
            { value: animKyc,          label: "KYC Vigentes" },
            { value: animConContratos, label: "Con contratos activos" },
          ].map(({ value, label }) => (
            <StatCard key={label} label={label} value={value} tone="gradient" />
          ))}
        </div>

        {/* Directorio */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[14px] font-bold text-text-1">Directorio</div>
            <div className="text-[12px] text-text-4">
              Todos los proveedores registrados en tu cuenta.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button size="sm" onClick={() => setModal({ ...MODAL_EMPTY, open: true })}>
              <Plus className="w-3.5 h-3.5" /> Nuevo Proveedor
            </Button>
            <div className="relative flex-1 sm:flex-none sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar proveedor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 pr-3 w-full sm:w-56 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder:text-text-4 focus:outline-none focus:border-orange transition"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
          {/* Header */}
          <div className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1fr_1fr_0.8fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3">
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Proveedor</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">RUC</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">KYC</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Score</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Contratos</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
          </div>

          {/* Rows */}
          {pagedProviders.map((p) => {
            const kycStyle = KYC_BADGE[p.kyc] ?? KYC_BADGE.pendiente;
            const sStyle = scoreStyle(p.scoreCredito);
            return (
              <div
                key={p.id}
                onClick={() => setDetalle(p)}
                className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1fr_1fr_0.8fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
              >
                {/* Proveedor */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--bonafide-gradient)" }}
                  >
                    <span className="text-white text-[11px] font-extrabold leading-none tracking-wide">
                      {initials(p.razonSocial)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-text-1 leading-tight truncate">{p.razonSocial}</div>
                    <div className="text-[11px] text-text-4">{p.sector}</div>
                  </div>
                </div>

                {/* RUC */}
                <span className="text-[12px] font-mono text-text-3 text-center">{p.ruc}</span>

                {/* KYC */}
                <div className="flex justify-center">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: kycStyle.bg, color: kycStyle.color, border: kycStyle.border }}
                  >
                    {kycStyle.label}
                  </span>
                </div>

                {/* Score */}
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-[13px] font-bold" style={{ color: sStyle.color }}>
                      {p.scoreCredito ?? "—"}
                    </div>
                    <div className="text-[10px]" style={{ color: sStyle.color }}>Riesgo {sStyle.label}</div>
                  </div>
                </div>

                {/* Contratos */}
                <div className="text-[12px] text-text-3 text-center">
                  {numContratos(p)} <span className="text-text-4">{numContratos(p) === 1 ? "contrato" : "contratos"}</span>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(p); }}
                    className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEliminar(p); }}
                    title="Eliminar"
                    className="p-1.5 rounded-[8px] transition text-text-4 hover:text-red-text cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDetalle(p); }}
                    className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProviders.length === 0 && (
            <div className="min-w-[640px] px-4 py-10 text-center text-[13px] text-text-4">
              {search.trim()
                ? `Sin resultados para "${search}".`
                : "No hay proveedores registrados aún."}
            </div>
          )}

          <InfiniteScrollSentinel
            sentinelRef={sentinelRef}
            loading={loading}
            hasMore={hasMore}
          />
        </div>
      </div>

      {/* Modal nuevo / editar proveedor */}
      {modal.open && (
        <Modal
          title={modal.editId ? "Editar proveedor" : "Nuevo proveedor"}
          onClose={handleClose}
          footer={
            <>
              <Button variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={!formOk}>
                {modal.editId ? "Guardar cambios" : "Guardar proveedor"}
              </Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="text-[12px] text-text-4">
              {modal.editId
                ? "Modifica los datos del proveedor."
                : "Registra un nuevo proveedor en tu directorio. Podrás asignarlo a distribuciones de crédito en cualquier momento."}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Razón Social" required>
                <Input
                  value={modal.razonSocial}
                  onChange={(e) =>
                    setModal({ ...modal, razonSocial: e.target.value })
                  }
                  placeholder="Nombre legal exacto"
                />
              </FormGroup>
              <FormGroup label="Nombre Comercial">
                <Input
                  value={modal.nombreComercial}
                  onChange={(e) =>
                    setModal({ ...modal, nombreComercial: e.target.value })
                  }
                  placeholder="Nombre comercial o marca"
                />
              </FormGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormGroup label="Sector Productivo" required>
                <Select
                  value={modal.sector}
                  onChange={(e) =>
                    setModal({ ...modal, sector: e.target.value })
                  }
                >
                  <option value="">Seleccionar…</option>
                  {SECTORES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Teléfono" required>
                <div className="flex">
                  <span className="flex items-center h-12 px-3 border-2 border-r-0 border-gray-200 rounded-l-[8px] bg-[#fafafa] text-[14px] font-semibold text-text-2">
                    {PREFIJO_TEL}
                  </span>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={telefonoLocal.slice(0, 9)}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        telefono: e.target.value.replace(/\D/g, "").slice(0, 9),
                      })
                    }
                    placeholder="222 XXX XXX"
                    className={`!rounded-l-none ${telefonoInvalido ? "!border-red-400 focus:!border-red-500" : ""}`}
                  />
                </div>
                {telefonoInvalido && (
                  <p className="text-xs text-red-500 mt-1.5">El teléfono debe tener entre 7 y 9 dígitos.</p>
                )}
              </FormGroup>
              <FormGroup label="Correo" required>
                <Input
                  type="email"
                  value={modal.correo}
                  onChange={(e) =>
                    setModal({ ...modal, correo: e.target.value })
                  }
                  placeholder="correo@empresa.gq"
                  className={emailInvalido ? "!border-red-400 focus:!border-red-500" : ""}
                />
                {emailInvalido && (
                  <p className="text-xs mt-1.5 text-red-500">
                    Ingresa un correo electrónico válido.
                  </p>
                )}
              </FormGroup>
            </div>

            <FormGroup label="Añadir a contrato activo (opcional)">
              <Select
                value={modal.contratoId}
                onChange={(e) => setModal({ ...modal, contratoId: e.target.value })}
              >
                <option value="">Ninguno</option>
                {contratosActivos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} · {c.pymeNombre || c.pyme || c.objeto || "Activo"}
                  </option>
                ))}
              </Select>
            </FormGroup>

            {/* Toggle Cliente Bonafide */}
            <button
              type="button"
              onClick={() =>
                setModal({
                  ...modal,
                  esClienteBonafide: !modal.esClienteBonafide,
                })
              }
              className="flex items-center gap-3 w-full rounded-[10px] border px-4 py-3 transition-all"
              style={{
                borderColor: modal.esClienteBonafide
                  ? "rgba(224,32,28,0.35)"
                  : "#ECEAE7",
                background: modal.esClienteBonafide ? "#FFF3E0" : "#F6F5F3",
              }}
            >
              <div
                className="w-9 h-5 rounded-full flex items-center transition-all shrink-0 px-0.5"
                style={{
                  background: modal.esClienteBonafide ? "#E0201C" : "#A9A6A1",
                }}
              >
                <div
                  className="w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{
                    transform: modal.esClienteBonafide
                      ? "translateX(16px)"
                      : "translateX(0)",
                  }}
                />
              </div>
              <div className="text-left">
                <div className="text-[13px] font-semibold text-text-1">
                  Cliente Bonafide
                </div>
                <div className="text-[11px] text-text-4">
                  Este proveedor también opera como cliente dentro del
                  ecosistema Bonafide.
                </div>
              </div>
            </button>
          </div>
        </Modal>
      )}

      {/* Modal detalle de proveedor */}
      {detalle &&
        (() => {
          const p = detalle;
          const kycStyle = KYC_BADGE[p.kyc] ?? KYC_BADGE.pendiente;
          const sStyle = scoreStyle(p.scoreCredito);
          return (
            <Modal
              wide
              title={p.razonSocial}
              onClose={() => setDetalle(null)}
              footer={
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setDetalle(null)}
                  >
                    Cerrar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setDetalle(null);
                      handleOpenEdit(p);
                    }}
                  >
                    Editar proveedor
                  </Button>
                </>
              }
            >
              <div className="space-y-6">
                {/* Hero */}
                <div
                  className="flex items-center gap-4 p-4 rounded-[12px]"
                  style={{ background: "#F8F7F5" }}
                >
                  <div
                    className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--bonafide-gradient)" }}
                  >
                    <span className="text-white text-[17px] font-extrabold leading-none tracking-wide">
                      {initials(p.razonSocial)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold text-text-1 leading-snug">
                      {p.razonSocial}
                    </p>
                    <p className="text-[12px] text-text-4">
                      {p.nombreComercial || "—"} · {p.sector}
                    </p>
                    <p className="text-[11px] font-mono mt-0.5 text-text-4">
                      {p.ruc}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        background: kycStyle.bg,
                        color: kycStyle.color,
                        border: kycStyle.border,
                      }}
                    >
                      {kycStyle.label}
                    </span>
                    {p.esClienteBonafide && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{
                          background: "#FDEEEB",
                          color: "#E0201C",
                          border: "1px solid rgba(224,32,28,0.2)",
                        }}
                      >
                        Cliente Bonafide
                      </span>
                    )}
                    <span
                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        background: sStyle.bg,
                        color: sStyle.color,
                        border: `1px solid ${sStyle.color}22`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: sStyle.color }}
                      />
                      Riesgo {sStyle.label}
                    </span>
                  </div>
                </div>

                {/* Score crediticio */}
                <div className="rounded-[12px] border border-border p-4">
                  <ModalLabel text="Score crediticio" Icon={ShieldCheck} />
                  <div className="flex items-end gap-4 mb-3">
                    <span
                      className="text-[42px] font-extrabold leading-none"
                      style={{ color: sStyle.color }}
                    >
                      {p.scoreCredito ?? "—"}
                    </span>
                    <div className="pb-1">
                      <p
                        className="text-[13px] font-bold"
                        style={{ color: sStyle.color }}
                      >
                        {p.scoreCredito
                          ? `Riesgo ${sStyle.label}`
                          : "En espera de calificación"}
                      </p>
                      <p className="text-[11px] text-text-4">
                        sobre 1000 puntos
                      </p>
                    </div>
                  </div>
                  <div
                    className="h-2.5 rounded-full overflow-hidden"
                    style={{ background: "#ECEAE7" }}
                  >
                    {p.scoreCredito != null && (
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.scoreCredito / 10}%`,
                          background: sStyle.color,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] mt-1.5 text-text-4">
                    <span>0 — Alto riesgo</span>
                    <span>1000 — Bajo riesgo</span>
                  </div>
                </div>

                {/* Datos de identidad */}
                <div>
                  <ModalLabel text="Datos de Identidad" Icon={Building2} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InfoRow label="Razón Social" value={p.razonSocial} />
                    <InfoRow
                      label="Nombre Comercial"
                      value={p.nombreComercial}
                    />
                    <InfoRow label="RUC / NIF" value={p.ruc} />
                    <InfoRow label="Sector Productivo" value={p.sector} />
                    <InfoRow label="Teléfono" value={p.telefono} />
                    <InfoRow label="Correo" value={p.email} />
                  </div>
                </div>

                {/* Estado & Compliance */}
                <div>
                  <ModalLabel text="Estado & Compliance" Icon={CheckCircle2} />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ComplianceItem
                      label="KYC"
                      value={kycStyle.label.replace("KYC ", "")}
                      sub={KYC_SUB[p.kyc] ?? KYC_SUB.pendiente}
                      Icon={CheckCircle2}
                      iconBg={kycStyle.bg}
                      iconColor={kycStyle.color}
                    />
                    <ComplianceItem
                      label="Riesgo"
                      value={p.scoreCredito ?? "—"}
                      sub={
                        p.scoreCredito
                          ? `Riesgo ${sStyle.label}`
                          : "En espera de calificación"
                      }
                      Icon={ShieldCheck}
                      iconBg={sStyle.bg}
                      iconColor={sStyle.color}
                    />
                    <ComplianceItem
                      label="Contratos"
                      value={numContratos(p)}
                      sub="Contratos activos vinculados"
                      Icon={FileText}
                      iconBg="#FFF3E0"
                      iconColor="#EF7A2C"
                    />
                    <ComplianceItem
                      label="Bonafide"
                      value={p.esClienteBonafide ? "Sí" : "No"}
                      sub="Opera como cliente en el ecosistema"
                      Icon={Star}
                      iconBg={p.esClienteBonafide ? "#FDEEEB" : "#F6F5F3"}
                      iconColor={p.esClienteBonafide ? "#E0201C" : "#A9A6A1"}
                    />
                  </div>
                </div>

                {/* Contratos activos */}
                <div>
                  <ModalLabel
                    text={`Contratos activos (${numContratos(p)})`}
                    Icon={ClipboardList}
                  />
                  {numContratos(p) === 0 ? (
                    <p className="text-[12px] text-text-4 text-center py-4">
                      Sin contratos activos
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {p.contratosActivos.map((c) => {
                        const pct = Math.round(
                          (c.utilizado / c.asignado) * 100,
                        );
                        const barC =
                          pct > 90
                            ? "#B8352A"
                            : pct > 70
                              ? "#C68A1D"
                              : "#EF7A2C";
                        return (
                          <div
                            key={c.id}
                            className="flex items-center gap-4 p-3.5 rounded-[12px] border border-border"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[12px] font-bold text-text-1 font-mono">
                                  {c.id}
                                </span>
                                <Badge variant="orange">Activo</Badge>
                              </div>
                              <p className="text-[11px] truncate text-text-4">
                                {c.objeto}
                              </p>
                              <p className="text-[11px] text-text-5 mt-0.5">
                                {c.contratante}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[13px] font-extrabold text-text-1">
                                {fmt(c.asignado)} XAF
                              </p>
                              <p
                                className="text-[10px] font-semibold"
                                style={{ color: barC }}
                              >
                                {pct}% utilizado
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Modal>
          );
        })()}

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[340px] bg-white rounded-[14px] shadow-xl border border-border p-4 flex items-start gap-3 transition-all duration-300 ease-out
        ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}
      >
        <div className="w-8 h-8 rounded-[8px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
          <Building2 className="w-4 h-4 text-orange" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-text-1 mb-0.5">
            Directorio actualizado
          </div>
          <div className="text-[12px] text-text-4 leading-snug">
            {toast.message}
          </div>
        </div>
      </div>

      {/* ── Modal: Confirmar eliminación ── */}
      {eliminar && (
        <ConfirmarEliminarModal
          nombre={eliminar.razonSocial}
          tipoEntidad="Proveedor"
          contratoVinculado={eliminar.contratosActivos?.[0]?.id || null}
          onConfirm={handleDelete}
          onClose={() => setEliminar(null)}
        />
      )}
    </AppShell>
  );
}
