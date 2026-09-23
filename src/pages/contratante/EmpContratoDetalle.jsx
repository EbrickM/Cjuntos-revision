import { useState } from 'react';
import {
  ChevronRight, CheckCircle, FileText, Clock, Building2, User, Users,
  Receipt, ListFilter, Zap, X, Eye, Landmark, History, Send,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InvoiceCard from '../../components/invoices/InvoiceCard';
import RequerirButton from '../../components/invoices/RequerirButton';
import { montoRestanteFactura } from '../../components/invoices/facturaUtils';
import { InfoRow, SectionHeader, IpiVerificacionModal } from './contratanteShared';
import { contratoService } from '../../services/contrato.service';
import { facturaService } from '../../services/factura.service';
import { INV, ESTADO_LABEL, estadoLabel, estadoBadge } from '../../lib/invoiceStates';
import { aViewContrato, registrosContrato } from '../../components/contratos/contratoUtils';
import RegistrosTabla from '../../components/contratos/RegistrosTabla';
import { ORA, TEXT4, fmt, facturas, pymes, facturaBadge, scoreColor, contratanteState, contratoBadge } from './contratanteData';

const scoreLabel = (score) => score >= 750 ? 'Bajo' : score >= 500 ? 'Medio' : 'Alto';

const cuentaLabel = (c) => c.cuentaBancaria?.tipo === 'bonafide'
  ? 'Cuenta Bonafide existente'
  : `Banco Fondeador · ${c.cuentaBancaria?.numero || '—'}`;

// Estados terminales del pipeline: ya no están "abiertas".
const CERRADAS = new Set([INV.pagada, INV.billetera]);

// Variante de Badge mixta: estados del pipeline (facturaService) resuelven con
// el mapa unificado (invoiceStates); etiquetas heredadas del mock ("Recibida",
// "Verificada") usan el mapa de la Contratante.
const badgeDe = (e) => (ESTADO_LABEL[e] ? estadoBadge(e) : facturaBadge(e));

// ── DETALLE DE CONTRATO ───────────────────────────────────────────────────────
const TABS_DETALLE = [
  { id: 'contrato', lbl: 'Contrato', Icon: FileText,    iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'pyme',     lbl: 'Emp. Contratada', Icon: Users, iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'facturas', lbl: 'Facturas', Icon: Receipt,     iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'registros', lbl: 'Registros', Icon: History,   iconBg: '#FFF3E0', iconColor: ORA },
];

// Estados en los que el bloque de pago no aplica: facturas con requerimientos
// (no se paga una factura con deficiencias) o ya terminales de pago.
const esPagoAplicable = (e) =>
  e !== INV.conRequerimientos && e !== 'Con Requerimientos' &&
  e !== INV.pagada && e !== INV.billetera &&
  e !== 'Pagada' && e !== 'Saldo en Billetera';

// ── Bloque: Completar pago de la factura (Contratante) ───────────────────────
// Dos checkboxes: "Pagar al completo" (habilita Aceptar al instante) o "Pagar
// un % de la factura" (despliega % y monto con validación cruzada: el % no
// puede ser 0 ni >100, el monto no puede superar el SALDO PENDIENTE, y el
// sistema solo calcula el otro campo). El botón Aceptar queda deshabilitado
// hasta elegir una modalidad válida. Si el pago es parcial (no se paga la
// factura completa), la factura NO cambia de estado.
//
// Todos los topes (label, inputs, validación) se calculan contra el SALDO
// PENDIENTE (montoRestanteFactura), no contra el monto original de la
// factura: si ya hubo un pago parcial previo, "pagar al completo" solo cobra
// lo que falta, y "%"/"monto a pagar" tampoco pueden superar ese resto —
// nunca se puede volver a pedir un monto que ya fue cubierto.
function PagoFacturaBlock({ factura, onAceptar }) {
  const [opcion, setOpcion]     = useState('');   // '' | 'total' | 'parcial'
  const [pctStr, setPctStr]     = useState('');
  const [montoStr, setMontoStr] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fmtMonto = (n) => new Intl.NumberFormat('de-DE').format(Number(n) || 0);
  const total    = Number(factura?.monto) || 0;
  const yaPago   = Math.min(Number(factura?.pagosAcumulados) || 0, total);
  const restante = montoRestanteFactura(factura);
  const pctN    = Number(String(pctStr).replace(/[^0-9]/g, '')) || 0;
  const montoN  = Number(String(montoStr).replace(/[^0-9]/g, '')) || 0;
  const pctValido   = pctN > 0 && pctN <= 100;
  const montoValido = montoN > 0 && montoN <= restante;
  const aceptable   = opcion === 'total' || (opcion === 'parcial' && pctValido && montoValido);
  const montoEquivalente = Math.round(restante * pctN / 100);
  const deshabilitar = pctN === 0 && montoN === 0;

  const onPctChange = (raw) => {
    const n = Number(String(raw).replace(/[^0-9]/g, '')) || 0;
    setPctStr(String(n));
    setMontoStr(restante > 0 ? fmtMonto(Math.round(restante * n / 100)) : '');
  };
  const onMontoChange = (raw) => {
    const n = Number(String(raw).replace(/[^0-9]/g, '')) || 0;
    setMontoStr(n > 0 ? fmtMonto(n) : '');
    setPctStr(restante > 0 ? String(Number((n / restante) * 100).toFixed(2)) : '');
  };

  if (restante <= 0) {
    return (
      <div className="rounded-[12px] border border-border p-4" style={{ background: '#FBFAF8' }}>
        <p className="text-[12px] text-text-4">Esta factura ya no tiene saldo pendiente de pago.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-border p-4" style={{ background: '#FBFAF8' }}>
      <div className="text-[12px] font-bold text-text-1 mb-1">Completar pago</div>
      <p className="text-[11px] text-text-4 mb-3">Marcá cómo querés pagar esta factura para habilitar el botón Aceptar.</p>

      <label
        className={`flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 cursor-pointer transition ${opcion === 'total' ? 'border-orange bg-orange-tint' : 'border-border bg-white'}`}
      >
        <input
          type="checkbox"
          checked={opcion === 'total'}
          onChange={() => setOpcion(opcion === 'total' ? '' : 'total')}
          className="accent-orange w-4 h-4 shrink-0"
        />
        <span className="text-[13px] font-medium text-text-1">{yaPago > 0 ? 'Pagar el saldo restante' : 'Pagar la factura al completo'}</span>
        <span className="ml-auto text-[11px] font-semibold text-text-3">{fmt(restante)} XAF</span>
      </label>
      {yaPago > 0 && (
        <p className="text-[10px] text-text-4 mt-1 ml-1">Factura original: {fmt(total)} XAF · Ya pagado: {fmt(yaPago)} XAF</p>
      )}

      <label
        className={`mt-2 flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 cursor-pointer transition ${opcion === 'parcial' ? 'border-orange bg-orange-tint' : 'border-border bg-white'}`}
      >
        <input
          type="checkbox"
          checked={opcion === 'parcial'}
          onChange={() => setOpcion(opcion === 'parcial' ? '' : 'parcial')}
          className="accent-orange w-4 h-4 shrink-0"
        />
        <span className="text-[13px] font-medium text-text-1">Pagar un % {yaPago > 0 ? 'del saldo pendiente' : 'de la factura'}</span>
      </label>

      {opcion === 'parcial' && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-text-4 mb-1">% a pagar</div>
              <input
                value={pctStr}
                inputMode="numeric"
                placeholder="Ej: 50"
                onChange={e => onPctChange(e.target.value)}
                className="h-10 w-full border-2 border-gray-200 rounded-[8px] bg-white px-3 text-[13px] font-semibold text-text-1 outline-none focus:border-orange transition caret-orange"
              />
              {pctN > 100 && (
                <div className="text-[10px] font-semibold mt-1" style={{ color: '#B8352A' }}>El % no puede superar 100.</div>
              )}
              {pctN === 0 && !deshabilitar && (
                <div className="text-[10px] font-semibold mt-1" style={{ color: '#B8352A' }}>Debe ser mayor a 0.</div>
              )}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-text-4 mb-1">Monto a pagar (XAF)</div>
              <input
                value={montoStr}
                inputMode="numeric"
                placeholder="Ej: 5,000,000"
                onChange={e => onMontoChange(e.target.value)}
                className="h-10 w-full border-2 border-gray-200 rounded-[8px] bg-white px-3 text-[13px] font-semibold text-text-1 outline-none focus:border-orange transition caret-orange"
              />
              {montoN > restante && (
                <div className="text-[10px] font-semibold mt-1" style={{ color: '#B8352A' }}>No puede superar {fmt(restante)} XAF (saldo pendiente).</div>
              )}
              {montoN === 0 && !deshabilitar && (
                <div className="text-[10px] font-semibold mt-1" style={{ color: '#B8352A' }}>Debe ser mayor a 0.</div>
              )}
            </div>
          </div>
          <p className="text-[11px] text-text-4 leading-relaxed">
            {pctValido && montoValido
              ? <>Pagarás el <b>{pctN}%</b>{yaPago > 0 ? ' del saldo pendiente' : ''} ({fmt(montoEquivalente)} XAF). La factura quedará <b>Aprobada</b> hasta que se pague al completo.</>
              : 'Ingresá el % o el monto deseado; el sistema calcula el otro valor automáticamente.'}
          </p>
        </div>
      )}

      <Button
        full
        className="mt-4 h-[44px] justify-center"
        disabled={!aceptable || enviando}
        onClick={() => {
          if (enviando) return;
          setEnviando(true);
          onAceptar({
            completo: opcion === 'total',
            pct: opcion === 'parcial' ? pctN : 100,
            monto: opcion === 'parcial' ? montoN : restante,
          });
        }}
      >
        Aceptar
      </Button>
    </div>
  );
}

export default function EmpContratoDetalle() {
  const { go } = useApp();
  const [tab, setTab] = useState('contrato');
  const [facturaModal, setFacturaModal] = useState(null);
  const [ipiStep, setIpiStep]           = useState(null);
  const [estadoMap, setEstadoMap]       = useState({});
  const [filtroFac, setFiltroFac]       = useState('Todos');
  const [pymeDetalle, setPymeDetalle]   = useState(null);
  // ── Acumulador de operaciones de pago de la sección Facturas ───────────────
  // Cada vez que la Contratante confirma un pago desde el bloque "Completar
  // pago" (al completo o a un %), se registra una operación aquí. Mientras no
  // haya ninguna, NO se muestra el botón "Generar IPI" junto al filtro.
  const [opsPago, setOpsPago]           = useState([]);
  const [ipiOps, setIpiOps]             = useState(false); // modal resumen de operaciones
  const pymesDe = (nombre) => pymes.find(p => p.nombre === nombre) ?? null;
  const c    = contratanteState.selectedContrato
    ?? contratoService.listarPorVista('contratante').filter(x => x.tipo !== 'marco')[0] ?? null;
  const pct  = c && c.asignado > 0 ? Math.round((c.utilizado / c.asignado) * 100) : 0;
  const disp = c ? c.asignado - c.utilizado : 0;
  // Todas las facturas ABIERTAS de este contrato: las del pipeline (la semilla
  // de facturaService en localDb) más las heredadas del mock estático de la
  // Contratante (FAC-2026-0911/0918 "Recibida", que sostienen el flujo manual
  // Verificar → Emitir IPI de este portal). Se excluyen los estados terminales
  // (Pagada / Saldo en Billetera) y se evitan duplicados por id.
  const facturasContrato = c ? (() => {
    const abiertas = facturaService
      .listarPorRol('contratante')
      .filter(f => f.contrato === c.id && !CERRADAS.has(f.estado));
    const idsAbiertas = new Set(abiertas.map(f => f.id));
    return [...abiertas, ...facturas.filter(f => f.contrato === c.id && !idsAbiertas.has(f.id))]
      .map(f => ({ ...f, estado: estadoMap[f.id] ?? f.estado }));
  })() : [];
  const modalFac = facturaModal ? (facturasContrato.find(f => f.id === facturaModal.id) ?? facturaModal) : null;

  // PYMEs de este contrato: si la Contratante ya repartió el marco en el wizard
  // (Subproceso 1 del BPMN), se muestran sus pymesAsignadas; si no, se cae a los
  // hermanos del mismo contrato-marco (o a esta misma asignación como dato
  // legado sin `marcoId`).
  const hermanos = c?.pymesAsignadas?.length
    ? c.pymesAsignadas.map(a => ({
        id: a.id ?? a.pymeId ?? c.id,
        pyme: a.pymeNombre,
        estado: c.estado,
        asignado: Number(a.monto) || 0,
        plazoPago: a.plazoPago,
        documentoNombre: a.documentoNombre,
      }))
    : c?.marcoId
      ? contratoService.listarPorVista('contratante').filter(x => x.marcoId === c.marcoId).map(aViewContrato)
      : c ? [c] : [];

  const closeModal        = () => { setFacturaModal(null); setIpiStep(null); };
  const handleVerificar   = () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Verificada' })); closeModal(); };
  const handleEnviarCodigo= () => setIpiStep('codigo');
  const handleConfirmarIPI= () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Emitida' })); closeModal(); };

  // Confirmación de pago desde el bloque "Completar pago". Al completo → la
  // factura pasa a su estado terminal; parcial → queda Aprobada (acumulando
  // pagos) hasta pagarse al 100%. Cada operación confirmada se acumula para
  // generar el IPI del contrato (botón junto al filtro).
  const handleAceptarPago = (pago) => {
    if (!modalFac) return;
    const actualizada = facturaService.pagar(modalFac.id, pago);
    // Monto realmente aplicado por el servicio (ya recortado contra el saldo
    // pendiente), no el que tecleó el usuario — así el resumen de "Generar
    // IPI" siempre coincide con lo que de verdad quedó registrado.
    const montoAplicado = (Number(actualizada.pagosAcumulados) || 0) - (Number(modalFac.pagosAcumulados) || 0);
    setOpsPago(prev => [...prev, {
      id: `${Date.now()}-${prev.length}`,
      facturaId: modalFac.id,
      pyme: modalFac.pyme,
      concepto: modalFac.concepto,
      tipo: pago.completo ? 'Completo' : 'Parcial',
      monto: montoAplicado,
      pct: actualizada.pagoParcial ? Number(actualizada.pagoParcial.pct) || 0 : 100,
      fecha: new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    }]);
    closeModal();
  };

  // "Enviar IPI": manda a Bonafide el IPI global con todas las operaciones
  // acumuladas y limpia el acumulador (el botón vuelve a ocultarse).
  const handleEnviarIpi = () => {
    if (!opsPago.length) return;
    facturaService.enviarIpiDeContrato(opsPago);
    setOpsPago([]);
    setIpiOps(false);
  };

  if (!c) return <AppShell active="empContratos" role="contratante" title="Detalle de Contrato" sub="—" back />;

  return (
    <AppShell active="empContratos" role="contratante" title="Detalle de Contrato" sub={`${c.pyme} · ${c.id}`}>
      <div className="fade-in space-y-5">

        {/* Breadcrumb */}
        <button onClick={() => go('empContratos')} className="flex items-center gap-1.5 text-[12px] font-medium hover:opacity-75 transition px-3 py-2 rounded-[10px] hover:bg-page-bg w-fit" style={{ color: TEXT4 }}>
          <ChevronRight className="w-4 h-4 rotate-180" style={{ color: ORA }} />
          <span>Mis contratos</span>
          <span className="mx-1" style={{ color: TEXT4 }}>/</span>
          <span className="text-text-1 font-semibold">{c.id}</span>
        </button>

        {/* ── Resumen financiero ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { lbl: 'Fondo Asignado', val: `${fmt(c.asignado)} XAF` },
            { lbl: 'Utilizado',      val: `${fmt(c.utilizado)} XAF` },
            { lbl: 'Disponible',     val: `${fmt(disp)} XAF` },
            { lbl: '% Utilización',  val: `${pct}%` },
          ].map(({ lbl, val }) => (
            <StatCard key={lbl} label={lbl} value={val} tone="gradient" />
          ))}
        </div>

        {/* ── Tabs con iconos (como en PYME) — en grid para que quepan sin scroll
              lateral en pantallas chicas ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-page-bg p-1 rounded-[10px]">
          {TABS_DETALLE.map(({ id, lbl, Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className={`bona-btn py-1.5 px-4 font-medium rounded-[8px] text-[12px] transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5
                  ${active ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold' : 'text-text-3 hover:text-text-1 cursor-pointer'}`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {id === 'facturas' ? `${lbl} (${facturasContrato.length})` : lbl}
              </button>
            );
          })}
        </div>

        {/* ── Tab: Contrato ── */}
        {tab === 'contrato' && (
          <div className="space-y-4">

            {/* Objeto del trabajo */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5">
              <SectionHeader title="Objeto del Trabajo" sub="Descripción del alcance y servicios pactados en el contrato" Icon={FileText} />
              <p className="text-[13px] text-text-1 leading-relaxed">{c.objeto || '—'}</p>
            </div>

            {/* Condiciones económicas y plazos */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '60ms' }}>
              <SectionHeader title="Condiciones Económicas y Plazos" sub="Monto asignado a esta Empresa Contratada, vigencia y plazos" Icon={Clock} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoRow label="Monto asignado"     value={`${fmt(c.asignado)} XAF`} />
                <InfoRow label="Plazo de pago"       value={c.plazoPago ? `${c.plazoPago} días` : '—'} />
                <InfoRow label="Fecha de inicio"    value={c.fechaInicio} />
                <InfoRow label="Fecha de fin"       value={c.fechaFin} />
                <InfoRow label="Plazo de ejecución" value={c.plazo} />
              </div>
            </div>

            {/* Ficha del contrato-marco — datos fijados por Bonafide y la
                cuenta bancaria elegida por la Contratante al configurarlo
                (Subproceso 1 del BPMN), compartidos por todas las PYMEs de
                este mismo contrato-marco. */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '90ms' }}>
              <SectionHeader title="Ficha del Contrato-Marco" sub="Condiciones fijadas por Bonafide para este contrato" Icon={Landmark} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoRow label="Banco Fondeador"              value={c.bancoFondeador} />
                <InfoRow label="Interés"                      value={c.interes} />
                <InfoRow label="% Retención"                  value={c.porcentajeRetencion != null ? `${c.porcentajeRetencion}%` : '—'} />
                <InfoRow label="% Gestión de Cobranza"        value={c.porcentajeGestionCobranza != null ? `${c.porcentajeGestionCobranza}%` : '—'} />
                <InfoRow label="Cuenta bancaria operativa"    value={cuentaLabel(c)} />
              </div>
            </div>

            {/* Documento */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '120ms' }}>
              <SectionHeader title="Documento del Contrato" sub="Archivo adjunto firmado entre las partes" Icon={FileText} />
              <div className="flex items-center gap-2 text-[12px]" style={{ color: TEXT4 }}>
                <FileText className="w-4 h-4 shrink-0" />
                No se ha adjuntado documento al contrato.
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: PYME ── */}
        {tab === 'pyme' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[14px] font-bold text-text-1">Empresas Contratadas de este Contrato-Marco</div>
                <div className="text-[11px] text-text-4">Empresas Contratadas y monto que la Contratante les asignó</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Users className="w-4 h-4" style={{ color: ORA }} />
                <span className="text-[11px] font-bold" style={{ color: ORA }}>{hermanos.length} Empresa{hermanos.length === 1 ? ' Contratada' : 's Contratadas'}</span>
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
              <div className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1.4fr_1fr_1.2fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3">
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Emp. Contratada</span>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Contrato</span>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Estado</span>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Score</span>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Monto asignado</span>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
              </div>
              {hermanos.map(h => {
                const hPyme = pymesDe(h.pyme);
                return (
                  <div
                    key={h.id}
                    onClick={() => setPymeDetalle(h)}
                    className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1.4fr_1fr_1.2fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-text-1 truncate">{h.pyme}</div>
                    </div>
                    <span className="text-[12px] font-mono text-center" style={{ color: TEXT4 }}>{h.id}</span>
                    <div className="flex justify-center">
                      <span className="whitespace-nowrap">
                        <Badge variant={contratoBadge(h.estado)}>{h.estado}</Badge>
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <div className="text-center">
                        {hPyme ? (
                          <>
                            <div className="text-[13px] font-bold" style={{ color: scoreColor(hPyme.score) }}>{hPyme.score}</div>
                            <div className="text-[10px]" style={{ color: scoreColor(hPyme.score) }}>Riesgo {scoreLabel(hPyme.score)}</div>
                          </>
                        ) : <span className="text-[12px] text-text-4">—</span>}
                      </div>
                    </div>
                    <span className="text-[13px] font-extrabold text-text-1 text-center">{fmt(h.asignado)} XAF</span>
                    <div className="flex justify-center">
                      <button
                        onClick={e => { e.stopPropagation(); setPymeDetalle(h); }}
                        className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {hermanos.length === 0 && (
                <div className="min-w-[640px] px-4 py-10 text-center text-[13px] text-text-4">
                  No hay Empresas Contratadas asignadas a este contrato.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Facturas ── */}
        {tab === 'facturas' && (() => {
          const estadosDisponibles = ['Todos', ...Array.from(new Set(facturasContrato.map(f => f.estado)))];
          const visibles = filtroFac === 'Todos' ? facturasContrato : facturasContrato.filter(f => f.estado === filtroFac);
          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-text-1">Facturas ({facturasContrato.length})</div>
                    <div className="text-[12px] text-text-4">Emitidas por la Empresa Contratada en este contrato</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {opsPago.length > 0 && (
                  <Button size="sm" onClick={() => setIpiOps(true)} className="shrink-0">
                    <Zap className="w-3.5 h-3.5 mr-1" /> Generar IPI
                    <span className="ml-1.5 px-1.5 py-px rounded-full text-[10px] font-bold bg-white/25">{opsPago.length}</span>
                  </Button>
                )}
                <div className="relative flex items-center self-center sm:self-auto">
                  <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0" style={{ color: ORA }} />
                  <select
                    value={filtroFac}
                    onChange={e => setFiltroFac(e.target.value)}
                    className="h-8 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                  >
                    {estadosDisponibles.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              {visibles.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2" style={{ color: TEXT4 }}>
                <Receipt className="w-8 h-8" />
                <p className="text-[13px] font-semibold">Sin facturas con estado "{filtroFac}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibles.map((f) => (
                  <InvoiceCard
                    key={f.id}
                    factura={f}
                    onClick={() => { setFacturaModal(f); setIpiStep(null); }}
                    entidad={f.pyme}
                    concepto={f.concepto}
                    badge={<Badge variant={badgeDe(f.estado)}>{estadoLabel(f.estado)}</Badge>}
                  />
                ))}
              </div>
          )}
            </div>
          );
        })()}

        {/* ── Tab: Registros ── */}
        {tab === 'registros' && (
          <RegistrosTabla registros={registrosContrato(c, facturasContrato)} />
        )}

      </div>

      {/* ── Modal: Detalle de PYME (disparado por el ojo en la tabla) ── */}
      {pymeDetalle && (() => {
        const p = pymesDe(pymeDetalle.pyme);
        if (!p) return null;
        return (
          <Modal title={`${p.nombre} · ${pymeDetalle.id}`} onClose={() => setPymeDetalle(null)} wide>
            <div className="space-y-5">
              <div className="card-enter bg-white rounded-[14px] border border-border p-5">
                <SectionHeader
                  title="Datos de Identidad"
                  sub="Información legal y fiscal de la Empresa Contratada"
                  Icon={Building2}
                  right={
                    <div className="shrink-0 px-2.5 py-1.5 rounded-[8px]" style={{ background: scoreColor(p.score) + '20' }}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold" style={{ color: scoreColor(p.score) }}>Score crediticio</span>
                        <span className="text-[15px] font-extrabold" style={{ color: scoreColor(p.score) }}>{p.score}/1000</span>
                      </div>
                    </div>
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <InfoRow label="Razón Social"      value={p.nombre} />
                  <InfoRow label="Nombre Comercial"  value={p.nombreComercial} />
                  <InfoRow label="RUC / NIF"         value={p.ruc} />
                  <InfoRow label="Sector Productivo" value={p.sector} />
                  <InfoRow label="Teléfono"          value={p.telefono} />
                  <InfoRow label="Correo"            value={p.correo} />
                </div>
              </div>

              <div className="card-enter bg-white rounded-[14px] border border-border p-5">
                <SectionHeader title="Representante Legal" sub="Persona autorizada para firmar y representar a la Empresa Contratada" Icon={User} />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <InfoRow label="Nombre y Apellido"    value={p.repNombre} />
                  <InfoRow label="Tipo de Documento"    value={p.repTipoDoc} />
                  <InfoRow label="Nº de Identificación" value={p.repId} />
                  <InfoRow label="Cargo"                value={p.repCargo} />
                  <InfoRow label="Teléfono"             value={p.repTel} />
                  <InfoRow label="Correo"               value={p.repCorreo} />
                </div>
              </div>

              <div className="card-enter bg-white rounded-[14px] border border-border p-5">
                <SectionHeader title="Este Contrato" sub="Condiciones específicas de la asignación a esta Empresa Contratada" Icon={FileText} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InfoRow label="Contrato"        value={pymeDetalle.id} />
                  <InfoRow label="Estado"          value={pymeDetalle.estado} />
                  <InfoRow label="Monto asignado"  value={`${fmt(pymeDetalle.asignado)} XAF`} />
                  <InfoRow label="Plazo de pago"   value={pymeDetalle.plazoPago ? `${pymeDetalle.plazoPago} días` : '—'} />
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* ── Modal: Detalle de factura ── */}
      {modalFac && (
        <Modal
          title={`Factura · ${modalFac.id}`}
          onClose={closeModal}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={closeModal}>Cerrar</Button>
              <div className="flex gap-2">
                {modalFac.estado === 'Recibida' && (
                  <Button variant="primary" size="sm" onClick={handleVerificar}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />Verificar factura
                  </Button>
                )}
                {modalFac.estado === 'Verificada' && (
                  <Button variant="primary" size="sm" onClick={() => setIpiStep('confirm')}>
                    <Zap className="w-3.5 h-3.5 mr-1" />Emitir IPI
                  </Button>
                )}
                <RequerirButton
                  label="Poner requerimientos"
                  factura={{ id: modalFac.id }}
                  emisor="La Contratante"
                  onEnviar={(msg) => {
                    facturaService.enviarRequerimiento(modalFac.id, { mensaje: msg, emisor: 'La Contratante' });
                    // Si la factura quedó con requerimiento, no se paga: se
                    // cierran ambos modales (el de requerimiento y el de detalle).
                    closeModal();
                  }}
                />
              </div>
            </>
          }
        >
          <div className="space-y-5">
            {/* Estado + fecha */}
            <div className="flex items-center justify-between">
              <Badge variant={badgeDe(modalFac.estado)}>{estadoLabel(modalFac.estado)}</Badge>
              <span className="text-[12px]" style={{ color: TEXT4 }}>{modalFac.fecha}</span>
            </div>
            {/* Datos principales */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow label="Nº Factura"  value={modalFac.id} />
              <InfoRow label="Emp. Contratada" value={modalFac.pyme} />
              <InfoRow label="Contrato"    value={modalFac.contrato} />
              <InfoRow label="Monto"       value={`${fmt(modalFac.monto)} XAF`} />
              <InfoRow label="Fecha"       value={modalFac.fecha} />
              <InfoRow label="Concepto"    value={modalFac.concepto} />
            </div>
            {/* Documentos adjuntos */}
            <div>
              <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Documento adjunto</div>
              <div className="flex items-center gap-2.5 p-3 rounded-[10px] border border-border" style={{ color: TEXT4 }}>
                <FileText className="w-4 h-4 shrink-0" />
                <span className="text-[12px]">No se ha adjuntado documento a esta factura.</span>
              </div>
            </div>
            {esPagoAplicable(modalFac.estado) && (
              <PagoFacturaBlock factura={modalFac} onAceptar={handleAceptarPago} />
            )}
          </div>
        </Modal>
      )}

      {/* ── Modal IPI: resumen de operaciones acumuladas ── */}
      {ipiOps && (
        <Modal
          title={`IPI · Resumen de operaciones (${opsPago.length})`}
          onClose={() => setIpiOps(false)}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setIpiOps(false)}>Cerrar</Button>
              <Button size="sm" onClick={handleEnviarIpi} disabled={!opsPago.length}>
                <Send className="w-3.5 h-3.5 mr-1" /> Enviar IPI
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-[12px] leading-relaxed" style={{ color: TEXT4 }}>
              Se enviará a Bonafide un IPI que resume todas las operaciones de pago realizadas en el contrato <span className="font-mono font-semibold text-text-1">{c.id}</span>. La liquidación seguirá después el pipeline normal de cada factura.
            </p>

            <div className="space-y-2">
              {opsPago.map(o => (
                <div key={o.id} className="flex items-center justify-between gap-3 rounded-[10px] border border-border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-mono font-bold text-text-1 truncate">{o.facturaId}</span>
                      <Badge variant={o.tipo === 'Completo' ? 'green' : 'orange'}>{o.tipo}</Badge>
                    </div>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: TEXT4 }}>
                      {o.pyme}{o.concepto ? ` · ${o.concepto}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-extrabold text-text-1 whitespace-nowrap">{fmt(o.monto)} XAF</div>
                    <div className="text-[10px] font-semibold whitespace-nowrap" style={{ color: ORA }}>
                      {o.tipo === 'Completo' ? '100%' : `${o.pct}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[12px] p-4 flex items-center justify-between gap-3" style={{ background: 'var(--bonafide-gradient)' }}>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-white/80">Total operaciones</div>
                <div className="text-[16px] sm:text-[20px] font-extrabold text-white leading-tight">{fmt(opsPago.reduce((a, o) => a + (Number(o.monto) || 0), 0))} XAF</div>
              </div>
              <Badge variant="gold">{opsPago.length} operación{opsPago.length === 1 ? '' : 'es'}</Badge>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal IPI paso 1: confirmación ── */}
      {ipiStep === 'confirm' && modalFac && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             onClick={e => e.target === e.currentTarget && setIpiStep(null)}>
          <div className="bona-gradient-shadow w-full max-w-md rounded-2xl p-[2px]">
            <div className="bg-white rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIpiStep(null)} className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-text-3" />
              </button>

              <div className="flex justify-center mb-5">
                <div className="bona-gradient-bg w-16 h-16 rounded-[18px] flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-1 mb-1">Autorizar pago IPI</h2>
                <p className="text-sm text-text-3">Revisa los datos y confirma la autorización</p>
              </div>

              <div className="rounded-[14px] border border-border p-4 mb-4" style={{ background: '#F8F7F5' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Factura</span>
                  <span className="text-[12px] font-bold font-mono text-text-1">{modalFac.id}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Emp. Contratada</span>
                  <span className="text-[12px] font-medium text-text-1">{modalFac.pyme}</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-border">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Monto</span>
                  <span className="text-[16px] font-extrabold" style={{ color: ORA }}>
                    {fmt(modalFac.monto)} <span className="text-[10px] font-semibold">XAF</span>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[12px] p-4 mb-6" style={{ background: '#FFF3E0', border: '1px solid #FDDDB8' }}>
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: ORA }} />
                <p className="text-[13px] text-text-1 leading-relaxed">
                  Confirmo que esta factura ha sido validada y autorizo el pago en la fecha de vencimiento.
                </p>
              </div>

              <Button onClick={handleEnviarCodigo} full className="h-[48px] mb-3">
                Aceptar y continuar
              </Button>
              <button onClick={() => setIpiStep(null)} className="w-full text-sm text-center font-medium text-text-3 hover:text-text-1 transition-colors cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal IPI paso 2: verificación con código ── */}
      {ipiStep === 'codigo' && modalFac && (
        <IpiVerificacionModal
          factura={modalFac}
          onClose={() => setIpiStep(null)}
          onConfirm={handleConfirmarIPI}
        />
      )}
    </AppShell>
  );
}
