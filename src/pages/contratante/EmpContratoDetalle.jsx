import { useState } from 'react';
import {
  ChevronRight, CheckCircle, FileText, FileCheck, Clock, Building2, User, Users,
  LayoutGrid, Search, Zap, X, Eye, Landmark, History, Send,
  ArrowUpDown, ArrowUp, ArrowDown, Layers2,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import RequerirButton from '../../components/invoices/RequerirButton';
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
  { id: 'facturas', lbl: 'Facturas', Icon: FileCheck,   iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'registros', lbl: 'Registros', Icon: History,   iconBg: '#FFF3E0', iconColor: ORA },
];

const parseDate = d => { if (!d) return ''; const [dd, mm, yyyy] = d.split('/'); return `${yyyy ?? ''}-${mm ?? ''}-${dd ?? ''}`; };
const TAB_ICON_FAC = { 'Todos': LayoutGrid, 'Recibida': Send, 'Verificada': CheckCircle, 'Emitida': FileCheck };

// Estados en los que el bloque de pago no aplica: facturas con requerimientos
// (no se paga una factura con deficiencias) o ya terminales de pago.
const esPagoAplicable = (e) =>
  e !== INV.conRequerimientos && e !== 'Con Requerimientos' &&
  e !== INV.pagada && e !== INV.billetera &&
  e !== 'Pagada' && e !== 'Saldo en Billetera';

// ── Bloque: Completar pago de la factura (Contratante) ───────────────────────
// Dos checkboxes: "Pagar al completo" (habilita Aceptar al instante) o "Pagar
// un % de la factura" (despliega % y monto con validación cruzada: el % no
// puede ser 0 ni >100, el monto no puede superar el de la factura, y el sistema
// solo calcula el otro campo). El botón Aceptar queda deshabilitado hasta elegir
// una modalidad válida; por ahora Aceptar cierra el modal. Si el pago es parcial
// (no se paga la factura completa), la factura NO cambia de estado.
function PagoFacturaBlock({ factura, onAceptar }) {
  const [opcion, setOpcion]     = useState('');   // '' | 'total' | 'parcial'
  const [pctStr, setPctStr]     = useState('');
  const [montoStr, setMontoStr] = useState('');
  const fmtMonto = (n) => new Intl.NumberFormat('de-DE').format(Number(n) || 0);
  const total   = Number(factura?.monto) || 0;
  const pctN    = Number(String(pctStr).replace(/[^0-9]/g, '')) || 0;
  const montoN  = Number(String(montoStr).replace(/[^0-9]/g, '')) || 0;
  const pctValido   = pctN > 0 && pctN <= 100;
  const montoValido = montoN > 0 && montoN <= total;
  const aceptable   = opcion === 'total' || (opcion === 'parcial' && pctValido && montoValido);
  const montoEquivalente = Math.round(total * pctN / 100);
  const deshabilitar = pctN === 0 && montoN === 0;

  const onPctChange = (raw) => {
    const n = Number(String(raw).replace(/[^0-9]/g, '')) || 0;
    setPctStr(String(n));
    setMontoStr(total > 0 ? fmtMonto(Math.round(total * n / 100)) : '');
  };
  const onMontoChange = (raw) => {
    const n = Number(String(raw).replace(/[^0-9]/g, '')) || 0;
    setMontoStr(n > 0 ? fmtMonto(n) : '');
    setPctStr(total > 0 ? String(Number((n / total) * 100).toFixed(2)) : '');
  };

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
        <span className="text-[13px] font-medium text-text-1">Pagar la factura al completo</span>
        <span className="ml-auto text-[11px] font-semibold text-text-3">{fmt(total)} XAF</span>
      </label>

      <label
        className={`mt-2 flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 cursor-pointer transition ${opcion === 'parcial' ? 'border-orange bg-orange-tint' : 'border-border bg-white'}`}
      >
        <input
          type="checkbox"
          checked={opcion === 'parcial'}
          onChange={() => setOpcion(opcion === 'parcial' ? '' : 'parcial')}
          className="accent-orange w-4 h-4 shrink-0"
        />
        <span className="text-[13px] font-medium text-text-1">Pagar un % de la factura</span>
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
              {montoN > total && (
                <div className="text-[10px] font-semibold mt-1" style={{ color: '#B8352A' }}>No puede superar {fmt(total)} XAF.</div>
              )}
              {montoN === 0 && !deshabilitar && (
                <div className="text-[10px] font-semibold mt-1" style={{ color: '#B8352A' }}>Debe ser mayor a 0.</div>
              )}
            </div>
          </div>
          <p className="text-[11px] text-text-4 leading-relaxed">
            {pctValido && montoValido
              ? <>Pagarás el <b>{pctN}%</b> ({fmt(montoEquivalente)} XAF). La factura quedará <b>Aprobada</b> hasta que se pague al completo.</>
              : 'Ingresá el % o el monto deseado; el sistema calcula el otro valor automáticamente.'}
          </p>
        </div>
      )}

      <Button
        full
        className="mt-4 h-[44px] justify-center"
        disabled={!aceptable}
        onClick={() => onAceptar({
          completo: opcion === 'total',
          pct: opcion === 'parcial' ? pctN : 100,
          monto: opcion === 'parcial' ? montoN : total,
        })}
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
  const [busquedaFac, setBusquedaFac]   = useState('');
  const [sortPyme, setSortPyme]         = useState({ key: null, dir: 'asc' });
  const [groupByPyme, setGroupByPyme]   = useState(null);
  const [sortFac2, setSortFac2]         = useState({ key: null, dir: 'asc' });
  const [groupByFac2, setGroupByFac2]   = useState(null);
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

  const toggleSortPyme  = (k) => setSortPyme(s => s.key !== k ? { key: k, dir: 'asc' } : s.dir === 'asc' ? { key: k, dir: 'desc' } : { key: null, dir: 'asc' });
  const toggleGroupPyme = (k) => setGroupByPyme(g => g === k ? null : k);
  const sortIconPyme    = (k) => sortPyme.key !== k ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" /> : sortPyme.dir === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" /> : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIconPyme   = (k) => <Layers2 className={`w-3 h-3 shrink-0 ${groupByPyme === k ? 'text-orange' : 'opacity-30'}`} />;

  const toggleSortFac2  = (k) => setSortFac2(s => s.key !== k ? { key: k, dir: 'asc' } : s.dir === 'asc' ? { key: k, dir: 'desc' } : { key: null, dir: 'asc' });
  const toggleGroupFac2 = (k) => setGroupByFac2(g => g === k ? null : k);
  const sortIconFac2    = (k) => sortFac2.key !== k ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" /> : sortFac2.dir === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" /> : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIconFac2   = (k) => <Layers2 className={`w-3 h-3 shrink-0 ${groupByFac2 === k ? 'text-orange' : 'opacity-30'}`} />;

  const sortedHermanos = (() => {
    const ek = groupByPyme || sortPyme.key;
    if (!ek) return hermanos;
    const dir = groupByPyme ? 1 : (sortPyme.dir === 'asc' ? 1 : -1);
    return [...hermanos].sort((a, b) => {
      if (ek === 'nombre') return dir * (a.pyme ?? '').localeCompare(b.pyme ?? '');
      if (ek === 'score') { const pa = pymesDe(a.pyme); const pb = pymesDe(b.pyme); return dir * ((pa?.score ?? 0) - (pb?.score ?? 0)); }
      if (ek === 'monto') return dir * (a.asignado - b.asignado);
      if (ek === 'estado') return dir * (a.estado ?? '').localeCompare(b.estado ?? '');
      return 0;
    });
  })();

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
    facturaService.pagar(modalFac.id, pago);
    setOpsPago(prev => [...prev, {
      id: `${Date.now()}-${prev.length}`,
      facturaId: modalFac.id,
      pyme: modalFac.pyme,
      concepto: modalFac.concepto,
      tipo: pago.completo ? 'Completo' : 'Parcial',
      monto: pago.completo ? Number(modalFac.monto) : Number(pago.monto) || 0,
      pct: pago.completo ? 100 : Number(pago.pct) || 0,
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
        <div className="flex bg-white rounded-[10px] gap-1 p-1">
          {TABS_DETALLE.map(({ id, lbl, Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className={`bona-btn flex-1 py-1.5 px-4 font-medium rounded-[8px] text-[12px] transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5
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
              <div className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1.4fr_1fr_1.2fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3 items-center">
                <button onClick={() => toggleSortPyme('nombre')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                  Emp. Contratada {sortIconPyme('nombre')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Contrato</span>
                <button onClick={() => toggleGroupPyme('estado')} className={`text-[11px] font-semibold uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer hover:text-text-1 ${groupByPyme === 'estado' ? 'text-orange' : 'text-text-4'}`}>
                  Estado {groupIconPyme('estado')}
                </button>
                <button onClick={() => toggleSortPyme('score')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer hover:text-text-1">
                  Score {sortIconPyme('score')}
                </button>
                <button onClick={() => toggleSortPyme('monto')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer hover:text-text-1">
                  Monto asignado {sortIconPyme('monto')}
                </button>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
              </div>
              {sortedHermanos.flatMap((h, i) => {
                const gVal = groupByPyme === 'estado' ? (h.estado || '—') : null;
                const prevGVal = i === 0 ? null : groupByPyme === 'estado' ? (sortedHermanos[i-1].estado || '—') : null;
                const isNewGroup = gVal !== null && (i === 0 || gVal !== prevGVal);
                const hPyme = pymesDe(h.pyme);
                const groupSep = isNewGroup ? [
                  <div key={`grp-${i}`} className="min-w-[640px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                    <span className="text-[11px] font-bold text-orange">{gVal}</span>
                  </div>
                ] : [];
                const rowDiv = (
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
                return [...groupSep, rowDiv];
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
          const labelFac = (f) => estadoLabel(f.estado) || f.estado;
          const estadosDisponibles = ['Todos', ...Array.from(new Set(facturasContrato.map(labelFac)))];
          const filteredFac = facturasContrato.filter(f =>
            (filtroFac === 'Todos' || labelFac(f) === filtroFac) &&
            (!busquedaFac.trim() ||
              f.id.toLowerCase().includes(busquedaFac.toLowerCase()) ||
              (f.pyme || '').toLowerCase().includes(busquedaFac.toLowerCase()) ||
              (f.concepto || '').toLowerCase().includes(busquedaFac.toLowerCase()))
          );
          const sortedFac = (() => {
            const ek = groupByFac2 || sortFac2.key;
            if (!ek) return filteredFac;
            const dir = groupByFac2 ? 1 : (sortFac2.dir === 'asc' ? 1 : -1);
            return [...filteredFac].sort((a, b) => {
              if (ek === 'fecha') return dir * parseDate(a.fecha).localeCompare(parseDate(b.fecha));
              if (ek === 'monto') return dir * (a.monto - b.monto);
              if (ek === 'estado') return dir * labelFac(a).localeCompare(labelFac(b));
              if (ek === 'pyme') return dir * (a.pyme || '').localeCompare(b.pyme || '');
              if (ek === 'pagado') return dir * ((a.pagosAcumulados ?? 0) - (b.pagosAcumulados ?? 0));
              return 0;
            });
          })();
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-text-1">Facturas ({facturasContrato.length})</div>
                    <div className="text-[12px] text-text-4">Emitidas por la Empresa Contratada en este contrato</div>
                  </div>
                </div>
                {opsPago.length > 0 && (
                  <Button size="sm" onClick={() => setIpiOps(true)} className="shrink-0">
                    <Zap className="w-3.5 h-3.5 mr-1" /> Generar IPI
                    <span className="ml-1.5 px-1.5 py-px rounded-full text-[10px] font-bold bg-white/25">{opsPago.length}</span>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="overflow-x-auto pb-0.5 flex-1">
                  <div className="flex bg-white rounded-[10px] gap-1 p-1 w-max">
                    {estadosDisponibles.map(e => {
                      const TabIcon = TAB_ICON_FAC[e];
                      return (
                        <button key={e} onClick={() => setFiltroFac(e)}
                          className={`bona-btn font-medium rounded-[8px] text-[12px] transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3 py-1.5
                            ${filtroFac === e ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold' : 'text-text-3 hover:text-text-1 cursor-pointer'}`}>
                          {TabIcon && <TabIcon className="w-3 h-3 shrink-0" />}
                          {e}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="relative shrink-0">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
                  <input
                    value={busquedaFac}
                    onChange={e => setBusquedaFac(e.target.value)}
                    placeholder="Buscar factura, empresa…"
                    className="h-8 w-48 pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none transition"
                  />
                </div>
              </div>
              <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
                <div className="min-w-[780px] grid [grid-template-columns:1.4fr_0.8fr_1.4fr_1.4fr_1.1fr_0.8fr_1.1fr_0.8fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3 items-center">
                  <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Cod. Factura</span>
                  <button onClick={() => toggleSortFac2('fecha')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                    Fecha {sortIconFac2('fecha')}
                  </button>
                  <button onClick={() => toggleGroupFac2('pyme')} className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 ${groupByFac2 === 'pyme' ? 'text-orange' : 'text-text-4'}`}>
                    Emp. Contratada {groupIconFac2('pyme')}
                  </button>
                  <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Concepto</span>
                  <button onClick={() => toggleSortFac2('monto')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center justify-end gap-1 cursor-pointer hover:text-text-1">
                    Monto {sortIconFac2('monto')}
                  </button>
                  <button onClick={() => toggleSortFac2('pagado')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer hover:text-text-1">
                    Pagado {sortIconFac2('pagado')}
                  </button>
                  <button onClick={() => toggleSortFac2('estado')} className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer hover:text-text-1">
                    Estado {sortIconFac2('estado')}
                  </button>
                  <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
                </div>
                {sortedFac.flatMap((f, i) => {
                  const gVal = groupByFac2 === 'pyme' ? (f.pyme || '—') : null;
                  const prevGVal = i === 0 ? null : groupByFac2 === 'pyme' ? (sortedFac[i-1].pyme || '—') : null;
                  const isNewGroup = gVal !== null && (i === 0 || gVal !== prevGVal);
                  const groupSep = isNewGroup ? [
                    <div key={`grp-${i}`} className="min-w-[780px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                      <span className="text-[11px] font-bold text-orange">{gVal}</span>
                    </div>
                  ] : [];
                  const rowDiv = (
                    <div key={f.id}
                      onClick={() => { setFacturaModal(f); setIpiStep(null); }}
                      className="min-w-[780px] grid [grid-template-columns:1.4fr_0.8fr_1.4fr_1.4fr_1.1fr_0.8fr_1.1fr_0.8fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                    >
                      <div className="text-[12px] font-mono font-bold text-text-2">{f.id}</div>
                      <div className="text-[11px] text-text-4">{f.fecha || '—'}</div>
                      <div className="text-[12px] font-semibold text-text-2 truncate">{f.pyme || '—'}</div>
                      <div className="text-[11px] text-text-4 truncate">{f.concepto || '—'}</div>
                      <div className="text-[13px] font-extrabold text-text-1 text-right whitespace-nowrap">{fmt(f.monto)} XAF</div>
                      {(() => {
                        const total = Number(f.monto) || 0;
                        const pagado = Number(f.pagosAcumulados) || 0;
                        const isPaid = f.estado === INV.pagada || f.estado === INV.billetera;
                        if (isPaid || pagado > 0) {
                          const amount = isPaid ? total : pagado;
                          const pct = total > 0 ? Math.round((amount / total) * 100) : 100;
                          return <span className="text-[12px] font-bold text-center block" style={{ color: '#EF7A2C' }}>{pct}%</span>;
                        }
                        return <span className="text-[12px] text-text-4 text-center block">—</span>;
                      })()}
                      <div className="flex justify-center">
                        <Badge variant={badgeDe(f.estado)}>{estadoLabel(f.estado)}</Badge>
                      </div>
                      <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => { e.stopPropagation(); setFacturaModal(f); setIpiStep(null); }}
                          className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                  return [...groupSep, rowDiv];
                })}
                {sortedFac.length === 0 && (
                  <div className="min-w-[780px] px-4 py-10 text-center text-[13px] text-text-4">
                    Sin facturas{filtroFac !== 'Todos' ? ` con estado "${filtroFac}"` : ''}.
                  </div>
                )}
              </div>
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
