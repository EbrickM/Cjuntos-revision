import { useState } from "react";
import { useCountUp } from "../../hooks/useCountUp";
import {
  Upload,
  Paperclip,
  Search,
  Send,
  BadgeCheck,
  Check,
  Wallet as WalletIcon,
  X,
  Eye,
  Building2,
  Truck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers2,
} from "lucide-react";
import { localDb } from "../../lib/localDb";
import AppShell from "../../components/layout/AppShell";
import { useApp } from "../../state/AppContext";
import InfiniteScrollSentinel from "../../components/common/InfiniteScrollSentinel";
import { StatCard } from "../../components/common/StatCard";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import InfoRow from "../../components/ui/InfoRow";
import FormGroup, {
  Input,
  Select,
  Textarea,
} from "../../components/ui/FormGroup";
import InvoiceDetailModal from "../../components/invoices/InvoiceDetailModal";
import InvoiceStatusBadge from "../../components/invoices/InvoiceStatusBadge";
import RequerimientoBadge from "../../components/invoices/RequerimientoBadge";
import RequerirButton from "../../components/invoices/RequerirButton";
import AprobarButton from "../../components/invoices/AprobarButton";
import FacturaContratanteModal from "../../components/invoices/FacturaContratanteModal";

import {
  formatXaf,
  defaultVencimiento,
} from "../../components/invoices/facturaUtils";
import { facturaService } from "../../services/factura.service";
import { contratoService } from "../../services/contrato.service";
import { INV, estadoLabel } from "../../lib/invoiceStates";

const BADGE_LABEL = {
  [INV.creada]: "Creada",
  [INV.enviada]: "Enviada",
  [INV.enEvaluacion]: "En evaluación",
  [INV.conCorrecciones]: "Con correcciones",
  [INV.aprobada]: "Aprobada",
  [INV.emitida]: "Emitida",
  [INV.conRequerimientos]: "Con Requerimientos",
  [INV.ordenFondeador]: "Orden al Fondeador",
  [INV.fondeado]: "Fondeado",
  [INV.otpEnviada]: "OTP enviada",
  [INV.otpVerificada]: "Verificada",
  [INV.pagada]: "Pagada",
  [INV.billetera]: "Billetera",
};

const INIT_CT_EMPTY = {
  open: false,
  editId: null,
  contratoId: "",
  monto: "",
  concepto: "",
  fechaVencimiento: "",
  documento: null,
};

const initialProviders = [
  { id: "p1", razonSocial: "SAP", sector: "Materiales" },
  { id: "p2", razonSocial: "APEX", sector: "Transporte" },
  { id: "p3", razonSocial: "APEX Tech", sector: "TecnologÃ­a" },
];

// Facturas de proveedores (control interno) â€” registro local independiente del
// BPMN de facturaciÃ³n al contratante (Fase 2 se tramita vÃ­a billetera/pagos).
const initialInvoicesPr = [
  {
    id: "PR-2026-0231",
    tipo: "proveedor",
    contrato: "CT-2026-0041",
    proveedorId: "p1",
    proveedorNombre: "SAP",
    monto: 8_000_000,
    estado: "Pendiente",
    concepto: "Suministro de cemento y añadidos al Lote 7",
    fecha: "10/07/2026",
    fechaVencimiento: "10/08/2026",
    documento: null,
  },
];

const hoy = () =>
  new Date().toLocaleDateString("es-GQ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const prEstadoStyle = (estado) =>
  estado === "Pagada"
    ? { background: "#E3F4EA", color: "#2E7D5B" }
    : estado === "Aprobada"
      ? { background: "#E3F4EA", color: "#2E7D5B" }
      : estado === "Vencida"
        ? { background: "#FDEEEB", color: "#B8352A" }
        : { background: "#FDF6E8", color: "#C68A1D" };

export default function EpFacturacion() {
  const { go } = useApp();
  const [vista, setVista] = useState("contratante");
  const [facturas, setFacturas] = useState(() =>
    facturaService.listarPorRol("empresa-pequena"),
  );
  const [invoicesPr, setInvoicesPr] = useState(() =>
    localDb.get("ep_invoices_pr", initialInvoicesPr, 1),
  );
  const [providers] = useState(initialProviders);
  const [ctModal, setCtModal] = useState(INIT_CT_EMPTY);
  const [prModal, setPrModal] = useState(INIT_CT_EMPTY);
  const [detalle, setDetalle] = useState(null);
  const [prDetalle, setPrDetalle] = useState(null);
  const [confirmEnvio, setConfirmEnvio] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroEstadoPr, setFiltroEstadoPr] = useState("Todos");
  const [searchCT, setSearchCT] = useState("");
  const [searchPr, setSearchPr] = useState("");
  const [sortCT, setSortCT] = useState({ key: null, dir: 'asc' });
  const [groupByCT, setGroupByCT] = useState(null);
  const toggleSortCT = (key) => setSortCT(s =>
    s.key !== key ? { key, dir: 'asc' }
    : s.dir === 'asc' ? { key, dir: 'desc' }
    : { key: null, dir: 'asc' }
  );
  const toggleGroupCT = (key) => setGroupByCT(g => g === key ? null : key);
  const [sortPR, setSortPR] = useState({ key: null, dir: 'asc' });
  const [groupByPR, setGroupByPR] = useState(null);
  const toggleSortPR = (key) => setSortPR(s =>
    s.key !== key ? { key, dir: 'asc' }
    : s.dir === 'asc' ? { key, dir: 'desc' }
    : { key: null, dir: 'asc' }
  );
  const toggleGroupPR = (key) => setGroupByPR(g => g === key ? null : key);
  const sortIconCT = (k) => sortCT.key !== k
    ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" />
    : sortCT.dir === 'asc'
      ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" />
      : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const sortIconPR = (k) => sortPR.key !== k
    ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" />
    : sortPR.dir === 'asc'
      ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" />
      : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIconCT = (k) => <Layers2 className={`w-3 h-3 shrink-0 ${groupByCT === k ? 'text-orange' : 'opacity-30'}`} />;
  const groupIconPR = (k) => <Layers2 className={`w-3 h-3 shrink-0 ${groupByPR === k ? 'text-orange' : 'opacity-30'}`} />;

  const bump = () =>
    setFacturas(facturaService.listarPorRol("empresa-pequena"));

  const contratanteInvoices = facturas;
  const proveedorInvoices = invoicesPr;

  const labelDe = (f) => BADGE_LABEL[f.estado] ?? f.estado ?? "Emitida";
  const ESTADOS = [
    "Todos",
    ...Array.from(new Set(contratanteInvoices.map(labelDe))),
  ];
  const ESTADOS_PR = [
    "Todos",
    ...Array.from(new Set(proveedorInvoices.map((inv) => inv.estado))),
  ];

  const filteredCT = contratanteInvoices.filter(
    (f) =>
      (filtroEstado === "Todos" || labelDe(f) === filtroEstado) &&
      (!searchCT.trim() ||
        f.id.toLowerCase().includes(searchCT.toLowerCase()) ||
        (f.contratante || "").toLowerCase().includes(searchCT.toLowerCase()) ||
        (f.contrato || "").toLowerCase().includes(searchCT.toLowerCase()) ||
        (f.concepto || "").toLowerCase().includes(searchCT.toLowerCase()) ||
        (f.pyme || "").toLowerCase().includes(searchCT.toLowerCase())),
  );

  const filteredPr = proveedorInvoices.filter(
    (inv) =>
      (filtroEstadoPr === "Todos" || inv.estado === filtroEstadoPr) &&
      (!searchPr.trim() ||
        inv.id.toLowerCase().includes(searchPr.toLowerCase()) ||
        (inv.concepto || "").toLowerCase().includes(searchPr.toLowerCase()) ||
        (inv.proveedorNombre || "")
          .toLowerCase()
          .includes(searchPr.toLowerCase())),
  );

  const parseDateEP = (d) => {
    if (!d) return '';
    const [dd, mm, yyyy] = (d || '').split('/');
    return `${yyyy ?? ''}-${mm ?? ''}-${dd ?? ''}`;
  };

  const sortedCT = (() => {
    const effectiveKey = groupByCT || sortCT.key;
    if (!effectiveKey) return filteredCT;
    const dir = groupByCT ? 1 : (sortCT.dir === 'asc' ? 1 : -1);
    return [...filteredCT].sort((a, b) => {
      if (effectiveKey === 'contrato') return (a.contrato ?? '').localeCompare(b.contrato ?? '');
      if (effectiveKey === 'empresa') {
        const ea = a.contratante ?? '';
        const eb = b.contratante ?? '';
        return dir * ea.localeCompare(eb);
      }
      if (effectiveKey === 'fecha') return dir * parseDateEP(a.fecha).localeCompare(parseDateEP(b.fecha));
      if (effectiveKey === 'monto') return dir * (a.monto - b.monto);
      if (effectiveKey === 'pagado') return dir * ((a.pagosAcumulados ?? 0) - (b.pagosAcumulados ?? 0));
      if (effectiveKey === 'estado') return dir * estadoLabel(a.estado).localeCompare(estadoLabel(b.estado));
      return 0;
    });
  })();

  const sortedPR = (() => {
    const effectiveKey = groupByPR || sortPR.key;
    if (!effectiveKey) return filteredPr;
    const dir = groupByPR ? 1 : (sortPR.dir === 'asc' ? 1 : -1);
    return [...filteredPr].sort((a, b) => {
      if (effectiveKey === 'contrato') return (a.contrato ?? '').localeCompare(b.contrato ?? '');
      if (effectiveKey === 'empresa') {
        const ea = a.proveedorNombre ?? '';
        const eb = b.proveedorNombre ?? '';
        return dir * ea.localeCompare(eb);
      }
      if (effectiveKey === 'fecha') return dir * parseDateEP(a.fecha).localeCompare(parseDateEP(b.fecha));
      if (effectiveKey === 'monto') return dir * (a.monto - b.monto);
      if (effectiveKey === 'pagado') return dir * ((a.pagosAcumulados ?? 0) - (b.pagosAcumulados ?? 0));
      if (effectiveKey === 'estado') return dir * String(a.estado ?? '').localeCompare(String(b.estado ?? ''));
      return 0;
    });
  })();

  const {
    visibleItems: pagedCT,
    hasMore: hasMoreCT,
    loading: loadingCT,
    sentinelRef: sentinelCTRef,
  } = useInfiniteScroll(sortedCT, {
    pageSize: 10,
    delay: 0,
    resetKey: `${searchCT}|${filtroEstado}|${sortCT.key}|${sortCT.dir}|${groupByCT}`,
  });
  const {
    visibleItems: pagedPR,
    hasMore: hasMorePR,
    loading: loadingPR,
    sentinelRef: sentinelPRRef,
  } = useInfiniteScroll(sortedPR, {
    pageSize: 10,
    delay: 0,
    resetKey: `${searchPr}|${filtroEstadoPr}|${sortPR.key}|${sortPR.dir}|${groupByPR}`,
  });

  // â”€â”€ AcciÃ³n segÃºn el estado del BPMN (lado PYME) â”€â”€
  const ctAction = (f) => {
    switch (f.estado) {
      case INV.creada:
        return {
          lbl: "Enviar a la Contratante",
          Icon: Send,
          handler: () => setConfirmEnvio(f),
        };
      case INV.conRequerimientos:
        return f.pymeNotifico
          ? null
          : {
              lbl: "Notificar a la Contratante",
              Icon: BadgeCheck,
              handler: () => {
                facturaService.notificarContratante(f.id);
                bump();
              },
            };
      case INV.billetera:
        return {
          lbl: "Ver billetera",
          Icon: WalletIcon,
          handler: () => {
            setDetalle(null);
            go("epBilletera");
          },
        };
      default:
        return null;
    }
  };

  // En "Facturas al Contratante" la PYME ni aprueba ni envía requerimientos:
  // esos acciones solo existen en "Facturas de Proveedores" (aprobarlas genera
  // la factura al Contratante). La define en esa vista con sus botones propios.

  const enviarReqPr = (inv, mensaje) => {
    const keep = localDb.get("ep_invoices_pr", initialInvoicesPr, 1);
    const next = keep.map((x) =>
      x.id === inv.id
        ? {
            ...x,
            requerimientos: [
              { mensaje, emisor: "La PYME", fecha: hoy() },
              ...(x.requerimientos ?? []),
            ],
          }
        : x,
    );
    localDb.set("ep_invoices_pr", next);
    setInvoicesPr(next);
  };

  // ── CT handlers (mediante factura.service sobre localDb) ──
  // "Refacturar": abre el modal de nueva factura precargado con los datos de la
  // factura con requerimiento; al enviar se limpia el requerimiento y pasa a
  // Emitida (facturaService.refacturar).
  const abrirRefactura = (f) => setCtModal({
    open: true,
    editId: f.id,
    refacturando: true,
    contratoId: f.contrato,
    monto: String(f.monto ?? ''),
    concepto: f.concepto ?? '',
    fechaVencimiento: f.fechaVencimiento ?? defaultVencimiento(),
    documento: f.documentos?.[0] ?? null,
  });

  const handleSaveCt = () => {
    const monto =
      Number(ctModal.monto.replace?.(/[^0-9]/g, "") ?? ctModal.monto) || 0;
    if (monto <= 0 || !ctModal.concepto.trim() || !ctModal.contratoId) return;
    const contrato = contratoService
      .listarFactoring()
      .find((c) => c.id === ctModal.contratoId);
    if (contrato?.montoMax && monto > contrato.montoMax) return;
    if (ctModal.refacturando) {
      const patch = {
        monto, concepto: ctModal.concepto, fechaVencimiento: ctModal.fechaVencimiento,
      };
      if (ctModal.documento) patch.documentos = [{ name: ctModal.documento.name, url: ctModal.documento.url }];
      facturaService.refacturar(ctModal.editId, patch);
    } else if (ctModal.editId) {
      facturaService.corregirYReenviar(ctModal.editId, {
        monto, concepto: ctModal.concepto, fechaVencimiento: ctModal.fechaVencimiento,
        documentos: ctModal.documento ? [{ name: ctModal.documento.name, url: ctModal.documento.url }] : undefined,
      });
    } else {
      facturaService.crear({
        contrato: ctModal.contratoId,
        contratante: contrato?.contratanteNombre ?? "Chevron",
        tipoFactoring: contrato?.tipoFactoring ?? "inverso",
        pyme: "Tradex",
        monto,
        concepto: ctModal.concepto,
        fechaVencimiento: ctModal.fechaVencimiento,
        documentos: ctModal.documento
          ? [{ name: ctModal.documento.name, url: ctModal.documento.url }]
          : [],
      });
    }
    setCtModal(INIT_CT_EMPTY);
    bump();
  };

  const handleSavePr = () => {
    const monto =
      Number(prModal.monto.replace?.(/[^0-9]/g, "") ?? prModal.monto) || 0;
    if (monto <= 0 || !prModal.proveedorId || !prModal.contratoId) return;
    const prov = providers.find((p) => p.id === prModal.proveedorId);
    const today =
      prModal.fecha ||
      new Date().toLocaleDateString("es-GQ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    const keep = localDb.get("ep_invoices_pr", initialInvoicesPr, 1);
    if (prModal.editId) {
      localDb.set(
        "ep_invoices_pr",
        keep.map((inv) =>
          inv.id === prModal.editId
            ? {
                ...inv,
                monto,
                concepto: prModal.concepto,
                proveedorId: prModal.proveedorId,
                proveedorNombre: prov?.razonSocial || "",
                fecha: today,
                fechaVencimiento: prModal.fechaVencimiento,
                documento: prModal.documento,
              }
            : inv,
        ),
      );
    } else {
      const max = keep.reduce(
        (m, inv) => Math.max(m, parseInt(inv.id.replace("PR-2026-", "")) || 0),
        0,
      );
      localDb.set("ep_invoices_pr", [
        ...keep,
        {
          id: `PR-2026-${String(max + 1).padStart(4, "0")}`,
          tipo: "proveedor",
          contrato: prModal.contratoId,
          monto,
          estado: "Pendiente",
          concepto: prModal.concepto,
          proveedorId: prModal.proveedorId,
          proveedorNombre: prov?.razonSocial || "",
          fecha: today,
          fechaVencimiento: prModal.fechaVencimiento,
          documento: prModal.documento,
        },
      ]);
    }
    setPrModal(INIT_CT_EMPTY);
    setFacturas(facturaService.listarPorRol("empresa-pequena"));
    setInvoicesPr(localDb.get("ep_invoices_pr", initialInvoicesPr, 1));
  };

  // ── Aprobar factura de proveedor ──
  // Marca la factura del proveedor como aprobada y emite la factura nueva al
  // Contratante (origen 'contratante'): aparece en "Facturas al Contratante"
  // de la PYME y como factura nueva aprobada en el portal del Contratante.
  const aprobarPr = (inv) => {
    const keep = localDb.get("ep_invoices_pr", initialInvoicesPr, 1);
    const invivo = keep.find((x) => x.id === inv.id);
    if (!invivo || invivo.estado === "Aprobada") return;
    facturaService.aprobarFacturaDeProveedor(invivo);
    const next = keep.map((x) =>
      x.id === inv.id ? { ...x, estado: "Aprobada" } : x,
    );
    localDb.set("ep_invoices_pr", next);
    setInvoicesPr(next);
    setFacturas(facturaService.listarPorRol("empresa-pequena"));
  };

  const kpiBilletera = facturas.filter((f) => f.estado === INV.billetera).length;
  const kpiPagadas   = facturas.filter((f) => f.estado === INV.pagada).length;

  const animTotal       = useCountUp(facturas.length,          900, 100);
  const animContratante = useCountUp(contratanteInvoices.length, 900, 200);
  const animBilletera   = useCountUp(kpiBilletera,             900, 300);
  const animPagadas     = useCountUp(kpiPagadas,               900, 400);

  return (
    <AppShell
      active="epFacturacion"
      role="empresa-pequena"
      title="Mis Facturas"
      sub="Gestión de facturas de todos los contratos activos"
      back
    >
      <div className="fade-in space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total facturas",  value: String(animTotal) },
            { label: "Al contratante",  value: String(animContratante) },
            { label: "En billetera",    value: String(animBilletera) },
            { label: "Pagadas",         value: String(animPagadas) },
          ].map(({ label, value }) => (
            <StatCard key={label} label={label} value={value} tone="gradient" />
          ))}
        </div>

        {/* Mis facturas: toggle Contratante / Proveedores */}
        <div className="flex flex-row justify-between h-25px py-0">
          <div className="flex bg-white rounded-[10px] gap-1 h-25px w-max-[370px]">
            <button
              onClick={() => setVista("contratante")}
              className={`bona-btn w-[185px] font-medium rounded-[8px] text-[12px] text-center transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5
                  ${vista === "contratante" ? "bg-[#EF7A2C] shadow-sm text-white font-semibold" : "text-text-3 hover:text-text-1 cursor-pointer"}`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              Facturas al Contratante
            </button>
            <button
              onClick={() => setVista("proveedor")}
              className={`bona-btn w-[185px] font-medium rounded-[8px] text-[12px] text-center transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5
                  ${vista === "proveedor" ? "bg-[#EF7A2C] shadow-sm text-white font-semibold" : "text-text-3 hover:text-text-1 cursor-pointer"}`}
            >
              <Truck className="w-3.5 h-3.5 shrink-0" />
              Facturas de Proveedores
            </button>
          </div>

          <Button
            variant="primary"
            className="w-[180px] justify-center"
            onClick={() =>
              vista === "contratante"
                ? setCtModal({
                    ...INIT_CT_EMPTY,
                    open: true,
                    fechaVencimiento: defaultVencimiento(),
                  })
                : setPrModal({ ...INIT_CT_EMPTY, open: true })
            }
          >
            {vista === "contratante" ? "Nueva Factura" : "Importar Factura"}
          </Button>
        </div>

        {/* Filtros: tabs de estado + búsqueda */}
        <div className="flex items-center gap-3">
          <div className="overflow-x-auto pb-0.5 flex-1">
            <div className="flex bg-white rounded-[10px] gap-1 p-1 w-max">
              {(vista === "contratante" ? ESTADOS : ESTADOS_PR).map((e) => (
                <button
                  key={e}
                  onClick={() => vista === "contratante" ? setFiltroEstado(e) : setFiltroEstadoPr(e)}
                  className={`bona-btn font-medium rounded-[8px] text-[12px] text-center transition-all whitespace-nowrap inline-flex items-center justify-center px-3 py-1.5
                    ${(vista === "contratante" ? filtroEstado : filtroEstadoPr) === e
                      ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold'
                      : 'text-text-3 hover:text-text-1 cursor-pointer'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              value={vista === "contratante" ? searchCT : searchPr}
              onChange={(e) =>
                vista === "contratante"
                  ? setSearchCT(e.target.value)
                  : setSearchPr(e.target.value)
              }
              placeholder={vista === "contratante" ? "Buscar factura o contrato…" : "Buscar proveedor o concepto…"}
              className="h-8 w-56 pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
            />
          </div>
        </div>

        {/* Tabla de facturas */}
        <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
          {vista === 'contratante' ? (
            <>
              {/* Header CT */}
              <div className="min-w-[1020px] grid [grid-template-columns:1.2fr_1.4fr_0.9fr_1fr_1.4fr_1.1fr_0.9fr_1.4fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3">
                <button onClick={() => toggleGroupCT('contrato')}
                  className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 ${groupByCT === 'contrato' ? 'text-orange' : 'text-text-4'}`}>
                  Contrato {groupIconCT('contrato')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Cod. Factura</span>
                <button onClick={() => toggleSortCT('fecha')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                  Fecha {sortIconCT('fecha')}
                </button>
                <button onClick={() => toggleGroupCT('empresa')}
                  className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 text-center justify-center ${groupByCT === 'empresa' ? 'text-orange' : 'text-text-4'}`}>
                  Contratante {groupIconCT('empresa')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Concepto</span>
                <button onClick={() => toggleSortCT('monto')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-end">
                  Monto {sortIconCT('monto')}
                </button>
                <button onClick={() => toggleSortCT('pagado')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                  Pagado {sortIconCT('pagado')}
                </button>
                <button onClick={() => toggleSortCT('estado')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                  Estado {sortIconCT('estado')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
              </div>
              {pagedCT.flatMap((f, i) => {
                const gVal = groupByCT === 'contrato' ? (f.contrato || '—')
                           : groupByCT === 'empresa'  ? (f.contratante ?? '—')
                           : null;
                const prevGVal = i === 0 ? null
                  : groupByCT === 'contrato' ? (pagedCT[i-1].contrato || '—')
                  : groupByCT === 'empresa'  ? (pagedCT[i-1].contratante ?? '—')
                  : null;
                const isNewGroup = gVal !== null && (i === 0 || gVal !== prevGVal);
                const groupSep = isNewGroup ? [
                  <div key={`grp-ct-${i}`} className="min-w-[1020px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                    <span className="text-[11px] font-bold text-orange">{gVal}</span>
                  </div>
                ] : [];
                const rowDiv = (
                  <div
                    key={f.id}
                    onClick={() => setDetalle(f)}
                    className="min-w-[1020px] grid [grid-template-columns:1.2fr_1.4fr_0.9fr_1fr_1.4fr_1.1fr_0.9fr_1.4fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                  >
                    {/* 1. Contrato */}
                    <div className="text-[13px] font-bold text-text-1">{f.contrato || '—'}</div>
                    {/* 2. Cod. Factura */}
                    <div className="text-[12px] font-mono font-bold text-text-2">{f.id}</div>
                    {/* 3. Fecha */}
                    <div className="text-[11px] text-text-4">{f.fecha || '—'}</div>
                    {/* 4. Contratante */}
                    <div className="text-[12px] font-semibold text-text-2 truncate text-center">{f.contratante ?? '—'}</div>
                    {/* 5. Concepto */}
                    <div className="text-[11px] text-text-4 truncate text-center">{f.concepto || '—'}</div>
                    {/* 6. Monto */}
                    <div className="text-[13px] font-extrabold text-text-1 text-right whitespace-nowrap">
                      {formatXaf(f.monto)}
                    </div>
                    {/* 7. Pagado/% */}
                    {(() => {
                      const total  = Number(f.monto) || 0;
                      const pagado = Number(f.pagosAcumulados) || 0;
                      const isPaid = f.estado === INV.pagada || f.estado === INV.billetera;
                      if (isPaid || pagado > 0) {
                        const amount = isPaid ? total : pagado;
                        const pct = total > 0 ? Math.round((amount / total) * 100) : 100;
                        return <span className="text-[12px] font-bold text-center block" style={{ color: '#EF7A2C' }}>{pct}%</span>;
                      }
                      return <span className="text-[12px] text-text-4 text-center block">—</span>;
                    })()}
                    {/* 8. Estado */}
                    <div className="flex justify-center">
                      <InvoiceStatusBadge estado={f.estado} noDot />
                    </div>
                    {/* 9. Acciones */}
                    <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDetalle(f); }}
                        className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <span className="w-6 h-6 flex items-center justify-center shrink-0">
                        <RequerimientoBadge factura={f} variant="inline" cta={{ label: 'Refacturar', onClick: () => abrirRefactura(f) }} />
                      </span>
                    </div>
                  </div>
                );
                return [...groupSep, rowDiv];
              })}
              {filteredCT.length === 0 && (
                <div className="min-w-[1020px] px-4 py-10 text-center text-[13px] text-text-4">
                  No hay facturas en este estado.
                </div>
              )}
              <InfiniteScrollSentinel sentinelRef={sentinelCTRef} loading={loadingCT} hasMore={hasMoreCT} />
            </>
          ) : (
            <>
              {/* Header PR */}
              <div className="min-w-[1020px] grid [grid-template-columns:1.2fr_1.4fr_0.9fr_1fr_1.4fr_1.1fr_0.9fr_1.4fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3">
                <button onClick={() => toggleGroupPR('contrato')}
                  className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 ${groupByPR === 'contrato' ? 'text-orange' : 'text-text-4'}`}>
                  Contrato {groupIconPR('contrato')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Cod. Factura</span>
                <button onClick={() => toggleSortPR('fecha')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                  Fecha {sortIconPR('fecha')}
                </button>
                <button onClick={() => toggleGroupPR('empresa')}
                  className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 text-center justify-center ${groupByPR === 'empresa' ? 'text-orange' : 'text-text-4'}`}>
                  Proveedor {groupIconPR('empresa')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Concepto</span>
                <button onClick={() => toggleSortPR('monto')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-end">
                  Monto {sortIconPR('monto')}
                </button>
                <button onClick={() => toggleSortPR('pagado')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                  Pagado {sortIconPR('pagado')}
                </button>
                <button onClick={() => toggleSortPR('estado')}
                  className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                  Estado {sortIconPR('estado')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
              </div>
              {pagedPR.flatMap((inv, i) => {
                const gVal = groupByPR === 'contrato' ? (inv.contrato || '—')
                           : groupByPR === 'empresa'  ? (inv.proveedorNombre ?? '—')
                           : null;
                const prevGVal = i === 0 ? null
                  : groupByPR === 'contrato' ? (pagedPR[i-1].contrato || '—')
                  : groupByPR === 'empresa'  ? (pagedPR[i-1].proveedorNombre ?? '—')
                  : null;
                const isNewGroup = gVal !== null && (i === 0 || gVal !== prevGVal);
                const groupSep = isNewGroup ? [
                  <div key={`grp-pr-${i}`} className="min-w-[1020px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                    <span className="text-[11px] font-bold text-orange">{gVal}</span>
                  </div>
                ] : [];
                const rowDiv = (
                  <div
                    key={inv.id}
                    onClick={() => setPrDetalle(inv)}
                    className="min-w-[1020px] grid [grid-template-columns:1.2fr_1.4fr_0.9fr_1fr_1.4fr_1.1fr_0.9fr_1.4fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                  >
                    {/* 1. Contrato */}
                    <div className="text-[13px] font-bold text-text-1">{inv.contrato || '—'}</div>
                    {/* 2. Cod. Factura */}
                    <div className="text-[12px] font-mono font-bold text-text-2">{inv.id}</div>
                    {/* 3. Fecha */}
                    <div className="text-[11px] text-text-4">{inv.fecha || '—'}</div>
                    {/* 4. Proveedor */}
                    <div className="text-[12px] font-semibold text-text-2 truncate text-center">{inv.proveedorNombre ?? '—'}</div>
                    {/* 5. Concepto */}
                    <div className="text-[11px] text-text-4 truncate text-center">{inv.concepto || '—'}</div>
                    {/* 6. Monto */}
                    <div className="text-[13px] font-extrabold text-text-1 text-right whitespace-nowrap">
                      {formatXaf(inv.monto)}
                    </div>
                    {/* 7. Pagado/% */}
                    {(() => {
                      const total  = Number(inv.monto) || 0;
                      const pagado = Number(inv.pagosAcumulados) || 0;
                      const isPaid = inv.estado === 'Pagada' || inv.estado === 'Aprobada';
                      if (isPaid || pagado > 0) {
                        const amount = isPaid ? total : pagado;
                        const pct = total > 0 ? Math.round((amount / total) * 100) : 100;
                        return <span className="text-[12px] font-bold text-center block" style={{ color: '#EF7A2C' }}>{pct}%</span>;
                      }
                      return <span className="text-[12px] text-text-4 text-center block">—</span>;
                    })()}
                    {/* 8. Estado */}
                    <div className="flex justify-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={prEstadoStyle(inv.estado)}>{inv.estado}</span>
                    </div>
                    {/* 9. Acciones */}
                    <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPrDetalle(inv); }}
                        className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {inv.estado === "Pendiente" && (
                        <AprobarButton onClick={(e) => { e?.stopPropagation?.(); aprobarPr(inv); }} />
                      )}
                      <RequerirButton
                        factura={{ id: inv.id }}
                        emisor="La PYME"
                        onEnviar={(msg) => enviarReqPr(inv, msg)}
                      />
                    </div>
                  </div>
                );
                return [...groupSep, rowDiv];
              })}
              {proveedorInvoices.length === 0 && (
                <div className="min-w-[1020px] px-4 py-10 text-center text-[13px] text-text-4">
                  No hay facturas de proveedores importadas.
                </div>
              )}
              <InfiniteScrollSentinel sentinelRef={sentinelPRRef} loading={loadingPR} hasMore={hasMorePR} />
            </>
          )}
        </div>
      </div>


      {/* â”€â”€ Modal: Nueva / Editar factura al Contratante â”€â”€ */}
      {ctModal.open && (
        <FacturaContratanteModal
          modal={ctModal}
          onChange={(p) => setCtModal((prev) => ({ ...prev, ...p }))}
          onSave={handleSaveCt}
          onCancel={() => setCtModal(INIT_CT_EMPTY)}
        />
      )}

      {/* -- Modal: Confirmar envio de factura -- */}

      {confirmEnvio && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setConfirmEnvio(null)}
        >
          <div className="bona-gradient-shadow w-full max-w-md rounded-2xl p-[2px]">
            <div className="bg-white rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setConfirmEnvio(null)}
                className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-text-3" />
              </button>
              <div className="flex justify-center mb-5">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #EF7A2C, #E0201C)",
                  }}
                >
                  <Send className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-1 mb-1">
                  Enviar factura
                </h2>
                <p className="text-sm text-text-3">
                  {confirmEnvio.id} a {confirmEnvio.contratante}
                </p>
              </div>
              <div
                className="rounded-[14px] border border-border p-4 mb-6"
                style={{ background: "#F8F7F5" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: "#A9A6A1" }}
                  >
                    Monto
                  </span>
                  <span className="text-[16px] font-extrabold text-green-text">
                    {formatXaf(confirmEnvio.monto)}{" "}
                    <span className="text-[10px] font-semibold">XAF</span>
                  </span>
                </div>
              </div>
              <Button
                onClick={() => {
                  facturaService.enviar(confirmEnvio.id);
                  setConfirmEnvio(null);
                  bump();
                }}
                full
                className="h-[48px] mb-3"
              >
                Confirmar enví­o
              </Button>
              <button
                onClick={() => setConfirmEnvio(null)}
                className="w-full text-sm text-center font-medium text-text-3 hover:text-text-1 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Modal: Detalle de factura â”€â”€ */}
      {detalle &&
        (() => {
          const viva = facturaService.obtener(detalle.id) ?? detalle;
          const a = ctAction(viva);
          return (
            <InvoiceDetailModal
              factura={viva}
              onClose={() => setDetalle(null)}
              footer={
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetalle(null)}
                  >
                    Cerrar
                  </Button>
                  <div className="flex items-center gap-2">
                    {a && (
                      <Button variant="primary" size="sm" onClick={a.handler}>
                        <a.Icon className="w-3.5 h-3.5 mr-1" />
                        {a.lbl}
                      </Button>
                    )}
                  </div>
                </>
              }
            />
          );
        })()}

      {/* â”€â”€ Modal: Importar / Editar factura de Proveedor â”€â”€ */}
      {prModal.open && (
        <Modal
          title={
            prModal.editId
              ? `Editar factura ${prModal.editId}`
              : "Importar Factura de Proveedor"
          }
          onClose={() => setPrModal(INIT_CT_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setPrModal(INIT_CT_EMPTY)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSavePr}>
                {prModal.editId ? "Guardar cambios" : "Importar factura"}
              </Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="text-[12px] text-text-4">
              Registra una factura recibida de un proveedor para control interno
              de pagos.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Proveedor" required>
                <Select
                  value={prModal.proveedorId}
                  onChange={(e) =>
                    setPrModal({ ...prModal, proveedorId: e.target.value })
                  }
                >
                  <option value="">Seleccionar proveedor</option>
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
                  value={prModal.monto}
                  onChange={(e) =>
                    setPrModal({
                      ...prModal,
                      monto: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                />
                {prModal.monto && (
                  <div className="text-[11px] text-text-4 mt-1">
                    {formatXaf(prModal.monto)}
                  </div>
                )}
              </FormGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Fecha de emisión">
                <Input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={prModal.fecha}
                  onChange={(e) =>
                    setPrModal({ ...prModal, fecha: e.target.value })
                  }
                />
              </FormGroup>
              <FormGroup label="Fecha de vencimiento">
                <Input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={prModal.fechaVencimiento}
                  onChange={(e) =>
                    setPrModal({ ...prModal, fechaVencimiento: e.target.value })
                  }
                />
              </FormGroup>
            </div>
            <FormGroup label="Concepto">
              <Textarea
                value={prModal.concepto}
                onChange={(e) =>
                  setPrModal({ ...prModal, concepto: e.target.value })
                }
                placeholder="Descripción del servicio o producto facturado"
              />
            </FormGroup>
            <div>
              <div className="text-[12px] font-medium text-text-3 mb-1.5">
                Adjuntar documento
              </div>
              {prModal.documento ? (
                <div className="flex items-center gap-2 bg-page-bg rounded-[8px] px-3 py-2 text-[12px] text-text-3 border border-border">
                  <Paperclip className="w-3.5 h-3.5 text-text-4 shrink-0" />
                  <span className="flex-1 truncate">
                    {prModal.documento.name}
                  </span>
                  <button
                    onClick={() =>
                      setPrModal((p) => ({ ...p, documento: null }))
                    }
                    className="text-text-4 hover:text-red-text text-[14px] leading-none"
                  >
                    a—
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
                        setPrModal((p) => ({
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

      {/* ── Modal: Detalle de factura de Proveedor ── */}
      {prDetalle &&
        (() => {
          const inv =
            invoicesPr.find((x) => x.id === prDetalle.id) ?? prDetalle;
          const estilo = prEstadoStyle(inv.estado);
          return (
            <Modal
              title={`Factura de Proveedor · ${inv.id}`}
              onClose={() => setPrDetalle(null)}
              footer={
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrDetalle(null)}
                  >
                    Cerrar
                  </Button>
                  <div className="flex items-center gap-2">
                    <RequerirButton
                      label="Poner requerimientos"
                      factura={{ id: inv.id }}
                      emisor="La PYME"
                      onEnviar={(msg) => enviarReqPr(inv, msg)}
                    />
                    {inv.estado === "Pendiente" && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          aprobarPr(inv);
                          setPrDetalle(null);
                        }}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Aprobar factura
                      </Button>
                    )}
                  </div>
                </>
              }
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={estilo}
                  >
                    {inv.estado}
                  </span>
                  <span className="text-[12px]" style={{ color: "#A9A6A1" }}>
                    {inv.fecha}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Proveedor" value={inv.proveedorNombre} />
                  <InfoRow label="Contrato" value={inv.contrato} />
                  <InfoRow label="Monto" value={formatXaf(inv.monto)} />
                  <InfoRow label="Emisión" value={inv.fecha} />
                  <InfoRow label="Vence" value={inv.fechaVencimiento ?? "—"} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">
                    Concepto
                  </div>
                  <p className="text-[13px] text-text-1 leading-relaxed">
                    {inv.concepto || "—"}
                  </p>
                </div>
                {inv.documento && (
                  <div
                    className="flex items-center gap-2.5 p-3 rounded-[10px] border border-border"
                    style={{ color: "#A9A6A1" }}
                  >
                    <Paperclip className="w-4 h-4 shrink-0" />
                    <span className="text-[12px]">{inv.documento.name}</span>
                  </div>
                )}
                {inv.requerimientos && inv.requerimientos.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">
                      Requerimientos enviados
                    </div>
                    {inv.requerimientos.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-[12px] p-3 border"
                        style={{
                          background: "#FDF6E8",
                          borderColor: "rgba(239,122,44,0.25)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-orange">
                            {r.emisor}
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: "#A9A6A1" }}
                          >
                            {r.fecha}
                          </span>
                        </div>
                        <p className="text-[12px] text-text-1 leading-relaxed">
                          {r.mensaje}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Modal>
          );
        })()}
    </AppShell>
  );
}
