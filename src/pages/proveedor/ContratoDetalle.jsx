import { useState } from 'react';
import {
  ChevronRight, CheckCircle, FileText, Clock, Building2, User, Truck,
<<<<<<< HEAD
  Receipt, ListFilter, Zap, X, Eye, Landmark, History, Plus, Trash2,
=======
  Zap, X, Eye, Landmark, History, Search, LayoutGrid, Send, FileCheck, Plus,
  ArrowUpDown, ArrowUp, ArrowDown, Layers2,
>>>>>>> 182e0fa43752600a0d250fe2e54a77d26cc5db98
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import ConfirmarEliminarModal from '../../components/common/ConfirmarEliminarModal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';
import FacturaContratanteModal from '../../components/invoices/FacturaContratanteModal';
import { defaultVencimiento } from '../../components/invoices/facturaUtils';
import { facturaService } from '../../services/factura.service';
import { InfoRow, SectionHeader, IpiVerificacionModal, IniAvatar, useSuministradores } from './provShared';
import { StatCard } from '../../components/common/StatCard';
import { ORA, GREEN, TEXT4, fmt, facturas, facturaBadge, scoreColor, kycBadge, provState } from './provData';
import { contratoService } from '../../services/contrato.service';
import { aViewContrato, registrosContrato } from '../../components/contratos/contratoUtils';
import RegistrosTabla from '../../components/contratos/RegistrosTabla';

const iniFor    = n => (n || '').split(/\s+/).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '??';
const KYC_ORDER = { vigente: 0, pendiente: 1, vencido: 2 };
const parseDate = d => { if (!d) return ''; const [dd, mm, yyyy] = d.split('/'); return `${yyyy ?? ''}-${mm ?? ''}-${dd ?? ''}`; };

const TAB_ICON_FAC = {
  'Todos':     LayoutGrid,
  'Recibida':  Send,
  'Verificada': CheckCircle,
  'Emitida':   FileCheck,
};

const cuentaLabel = (c) => c.cuentaBancaria?.tipo === 'bonafide'
  ? 'Cuenta Bonafide existente'
  : `Cuenta en mi Banco · ${c.cuentaBancaria?.numero || '—'}`;

const INIT_FAC_EMPTY = { open: false, editId: null, contratoId: '', monto: '', concepto: '', fechaVencimiento: '', documento: null };

const PREFIJO_TEL = '+240';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SECTORES = [
  'Energía', 'Construcción', 'Manufactura', 'Transporte', 'Tecnología',
  'Servicios', 'Alimentación', 'Minería', 'Agricultura', 'Comercio',
  'Materiales', 'Otro',
];
const NUEVO_SUM_EMPTY = { open: false, nombre: '', nombreComercial: '', sector: 'Construcción', telefono: '', correo: '' };

const initialesDe = (name = '') => {
  const words = name
    .replace(/[^A-Za-zÀ-ÿÑñ0-9 ]/g, '')
    .split(' ')
    .filter(Boolean);
  if (words.length === 0) return '--';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join('');
};

// ── DETALLE DE CONTRATO ───────────────────────────────────────────────────────
const TABS_DETALLE = [
  { id: 'contrato',        lbl: 'Contrato',        Icon: FileText, iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'suministradores', lbl: 'Suministradores', Icon: Truck,    iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'facturas',        lbl: 'Facturas',        Icon: FileText, iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'registros',       lbl: 'Registros',       Icon: History,  iconBg: '#FFF3E0', iconColor: ORA },
];

export default function ProvContratoDetalle() {
  const { go } = useApp();
  const [tab, setTab] = useState('contrato');
  const [facturaModal, setFacturaModal] = useState(null);
  const [ipiStep, setIpiStep]           = useState(null);
  const [estadoMap, setEstadoMap]       = useState({});
  const [filtroFac, setFiltroFac]       = useState('Todos');
  const [busquedaFac, setBusquedaFac]   = useState('');
  const [sortSum, setSortSum]           = useState({ key: null, dir: 'asc' });
  const [groupBySum, setGroupBySum]     = useState(null);
  const [sortFac, setSortFac]           = useState({ key: null, dir: 'asc' });
  const [groupByFac, setGroupByFac]     = useState(null);
  const [sumDetalle, setSumDetalle]     = useState(null);
  const [facCtModal, setFacCtModal]     = useState(INIT_FAC_EMPTY);
  // ── Agregar Suministrador directamente desde este contrato ────────────────
  // Mismo directorio y validación que Suministradores.jsx; sin selector de
  // contrato, ya que queda ligado automáticamente al contrato que se está viendo,
  // y aparece de inmediato en la tabla de este mismo contrato (además de en el
  // directorio). Guardado por contrato porque esta pantalla no se desmonta al
  // navegar entre contratos (misma ruta siempre).
  const [listaSuministradores, setListaSuministradores] = useSuministradores();
  const [agregarSum, setAgregarSum]     = useState(NUEVO_SUM_EMPTY);
  const [sumManualesPorContrato, setSumManualesPorContrato] = useState({});
  // Suministradores de este contrato que se "eliminaron" desde esta misma
  // tabla (los que venían de la asignación del contrato, no del directorio —
  // esos se sacan directo del directorio con setListaSuministradores).
  const [sumOcultosPorContrato, setSumOcultosPorContrato] = useState({});
  const [eliminarSum, setEliminarSum] = useState(null);
  const [, setTick] = useState(0);
  const bump = () => setTick(t => t + 1);

  const toggleSortSum  = k => setSortSum(s => s.key !== k ? { key: k, dir: 'asc' } : s.dir === 'asc' ? { key: k, dir: 'desc' } : { key: null, dir: 'asc' });
  const toggleGroupSum = k => setGroupBySum(g => g === k ? null : k);
  const sortIconSum    = k => sortSum.key !== k ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" /> : sortSum.dir === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" /> : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIconSum   = k => <Layers2 className={`w-3 h-3 shrink-0 ${groupBySum === k ? 'text-orange' : 'opacity-30'}`} />;

  const toggleSortFac  = k => setSortFac(s => s.key !== k ? { key: k, dir: 'asc' } : s.dir === 'asc' ? { key: k, dir: 'desc' } : { key: null, dir: 'asc' });
  const toggleGroupFac = k => setGroupByFac(g => g === k ? null : k);
  const sortIconFac    = k => sortFac.key !== k ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" /> : sortFac.dir === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" /> : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIconFac   = k => <Layers2 className={`w-3 h-3 shrink-0 ${groupByFac === k ? 'text-orange' : 'opacity-30'}`} />;
  const c    = provState.selectedContrato
    ?? contratoService.listarPorVista('proveedor').map(aViewContrato)[0] ?? null;
  const pct  = c && c.asignado > 0 ? Math.round((c.utilizado / c.asignado) * 100) : 0;
  const disp = c ? c.asignado - c.utilizado : 0;
  const facturasContrato = c
    ? facturas
        .filter(f => f.contrato === c.id)
        .map(f => ({ ...f, estado: estadoMap[f.id] ?? f.estado }))
    : [];
  const modalFac = facturaModal ? (facturasContrato.find(f => f.id === facturaModal.id) ?? facturaModal) : null;

  // Suministradores que este Proveedor registró bajo este contrato
  // (Subproceso 3 del BPMN: el Proveedor reparte el monto que la PYME le
  // asignó entre sus propios Suministradores). Los agregados manualmente desde
  // este mismo detalle (botón "Agregar Suministrador") van primero.
  const sumManuales = c ? (sumManualesPorContrato[c.id] ?? []) : [];
  const ocultosSum = c ? (sumOcultosPorContrato[c.id] ?? []) : [];
  const sumBase = (c?.suministradores ?? c?.suministradoresAsignados ?? []).filter(s => !ocultosSum.includes(s.nombre));
  const misSuministradores = [...sumManuales, ...sumBase];

  // Elimina un Suministrador de la tabla de este contrato — igual que en el
  // directorio (Suministradores.jsx): si venía del directorio persistido,
  // también se quita de allí; si era una fila propia de la asignación del
  // contrato, se oculta localmente.
  const handleEliminarSum = () => {
    if (!eliminarSum || !c) return;
    if (sumManuales.some(s => s.id === eliminarSum.id)) {
      setSumManualesPorContrato(prev => ({
        ...prev,
        [c.id]: (prev[c.id] ?? []).filter(s => s.id !== eliminarSum.id),
      }));
      setListaSuministradores(prev => prev.filter(p => p.nombre !== eliminarSum.nombre));
    } else {
      setSumOcultosPorContrato(prev => ({
        ...prev,
        [c.id]: [...(prev[c.id] ?? []), eliminarSum.nombre],
      }));
    }
    setEliminarSum(null);
  };

  const closeModal        = () => { setFacturaModal(null); setIpiStep(null); };
  const handleVerificar   = () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Verificada' })); closeModal(); };
  const handleEnviarCodigo= () => setIpiStep('codigo');
  const handleConfirmarIPI= () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Emitida' })); closeModal(); };

  // Mismos campos y validación que "Agregar Suministrador" en Suministradores.jsx:
  // Razón Social, Sector, Teléfono y Correo son obligatorios; Nombre Comercial
  // es opcional. Sin selector de contrato — queda ligado a `c.id` directamente.
  const emailLimpioSum      = agregarSum.correo.trim();
  const emailInvalidoSum    = emailLimpioSum !== '' && !EMAIL_REGEX.test(emailLimpioSum);
  const telefonoLocalSum    = agregarSum.telefono.replace(/\D/g, '');
  const telefonoValidoSum   = /^\d{7,9}$/.test(telefonoLocalSum);
  const telefonoInvalidoSum = telefonoLocalSum !== '' && !telefonoValidoSum;
  const formOkSum = agregarSum.nombre.trim() && !!agregarSum.sector && telefonoValidoSum && emailLimpioSum !== '' && !emailInvalidoSum;

  const handleAgregarSum = () => {
    if (!formOkSum || !c) return;
    setListaSuministradores(prev => [
      {
        ini: initialesDe(agregarSum.nombre),
        nombre: agregarSum.nombre.trim(),
        sector: agregarSum.sector,
        contratos: 1,
        contratoId: c.id,
        montoTotal: 0,
        score: null,
        semaforo: 'En espera',
        nombreComercial: agregarSum.nombreComercial.trim(),
        ruc: '',
        telefono: `${PREFIJO_TEL} ${telefonoLocalSum}`,
        correo: emailLimpioSum,
        repNombre: '', repTipoDoc: '', repId: '', repCargo: '', repTel: '', repCorreo: '',
      },
      ...prev,
    ]);
    // La refleja de inmediato en la tabla "Suministradores" de este contrato.
    setSumManualesPorContrato(prev => ({
      ...prev,
      [c.id]: [
        {
          id: `SUM-MANUAL-${Date.now()}`,
          nombre: agregarSum.nombre.trim(),
          kyc: undefined,
          scoreCredito: null,
          monto: 0,
        },
        ...(prev[c.id] ?? []),
      ],
    }));
    setAgregarSum(NUEVO_SUM_EMPTY);
  };

  // Nueva factura al Contratante con este contrato fijo (mismos validadores que
  // el resto de secciones: monto/concepto obligatorios y tope = saldo disponible).
  const handleCrearFacCt = () => {
    const monto = Number((facCtModal.monto || '').replace(/[^0-9]/g, '')) || 0;
    if (monto <= 0 || !facCtModal.concepto.trim()) return;
    if (disp > 0 && monto > disp) return;
    const maxId = facturaService.listar().reduce((m, f) => Math.max(m, Number(String(f.id).replace('FAC-2026-', '')) || 0), 2108);
    const id = `FAC-2026-${maxId + 1}`;
    facturaService.crear({
      id,
      contrato: c.id,
      contratante: c.pyme,
      pyme: c.pyme,
      tipoFactoring: 'inverso',
      origen: 'suministrador',
      monto,
      concepto: facCtModal.concepto,
      fechaVencimiento: facCtModal.fechaVencimiento,
      fecha: new Date().toLocaleDateString('en-GB'),
      documentos: facCtModal.documento ? [{ name: facCtModal.documento.name, url: facCtModal.documento.url }] : [],
    });
    facturas.push({
      id,
      contrato: c.id,
      suministrador: '—',
      monto,
      fecha: new Date().toLocaleDateString('es-ES'),
      estado: 'Recibida',
      concepto: facCtModal.concepto,
    });
    setFacCtModal(INIT_FAC_EMPTY);
    bump();
  };

  if (!c) return <AppShell active="provContratos" role="proveedor" title="Detalle de Contrato" sub="—" back />;

  return (
    <AppShell active="provContratos" role="proveedor" title="Detalle de Contrato" sub={`${c.pyme} · ${c.id}`}>
      <div className="fade-in space-y-5">

        {/* Breadcrumb */}
        <button onClick={() => go('provContratos')} className="flex items-center gap-1.5 text-[12px] font-medium hover:opacity-75 transition px-3 py-2 rounded-[10px] hover:bg-page-bg w-fit" style={{ color: TEXT4 }}>
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

        {/* ── Tabs ── */}
        <div className="flex bg-white rounded-[10px] gap-1 p-1">
          {TABS_DETALLE.map(({ id, lbl, Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className={`bona-btn flex-1 py-1.5 px-4 font-medium rounded-[8px] text-[12px] transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5
                  ${active ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold' : 'text-text-3 hover:text-text-1 cursor-pointer'}`}
              >
                <Icon className="w-3.5 h-3.5" />
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
              <SectionHeader title="Condiciones Económicas y Plazos" sub="Monto asignado por la PYME, vigencia y plazos" Icon={Clock} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoRow label="Monto asignado"     value={`${fmt(c.asignado)} XAF`} />
                <InfoRow label="Plazo de pago"       value={c.plazoPago ? `${c.plazoPago} días` : '—'} />
                <InfoRow label="Fecha de inicio"    value={c.fechaInicio} />
                <InfoRow label="Fecha de fin"       value={c.fechaFin} />
                <InfoRow label="Plazo de ejecución" value={c.plazo} />
              </div>
            </div>

            {/* Ficha del contrato — datos fijados por Bonafide y la cuenta
                bancaria elegida por el Proveedor al configurarlo (Subproceso
                3 del BPMN). */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '90ms' }}>
              <SectionHeader title="Ficha del Contrato" sub="Condiciones fijadas por Bonafide para este contrato" Icon={Landmark} />
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

        {/* ── Tab: Suministradores ── */}
        {tab === 'suministradores' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[14px] font-bold text-text-1">Suministradores de este Contrato</div>
                <div className="text-[11px] text-text-4">Suministradores registrados y el monto que se les asignó</div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <Button size="sm" onClick={() => setAgregarSum({ ...NUEVO_SUM_EMPTY, open: true })}>
                  <Plus className="w-3.5 h-3.5" /> Agregar Suministrador
                </Button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Truck className="w-4 h-4" style={{ color: ORA }} />
                  <span className="text-[11px] font-bold" style={{ color: ORA }}>{misSuministradores.length} Suministrador{misSuministradores.length === 1 ? '' : 'es'}</span>
                </div>
              </div>
            </div>

<<<<<<< HEAD
            <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
              <div className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1fr_1fr_1.2fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3">
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Suministrador</span>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Contrato</span>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">KYC</span>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Score</span>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Monto asignado</span>
                <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
              </div>
              {misSuministradores.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSumDetalle(s)}
                  className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1fr_1fr_1.2fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-text-1 truncate">{s.nombre}</div>
                  </div>
                  <span className="text-[12px] font-mono text-center" style={{ color: TEXT4 }}>{c.id}</span>
                  <div className="flex justify-center">
<Badge variant={kycBadge(s.kyc ?? 'sin kyc')}>{s.kyc ?? 'sin KYC'}</Badge>
                  </div>
                  <div className="flex justify-center">
                    <div className="text-center">
                      {s.scoreCredito != null ? (
                        <>
                          <div className="text-[12px] font-semibold" style={{ color: scoreColor(s.scoreCredito) }}>{s.scoreCredito}/1000</div>
                          <div className="h-1.5 w-16 rounded-full mt-1" style={{ background: '#ECEAE7' }}>
                            <div className="h-full rounded-full" style={{ width: `${s.scoreCredito / 10}%`, background: scoreColor(s.scoreCredito) }} />
                          </div>
                        </>
                      ) : <span className="text-[12px] text-text-4">—</span>}
                    </div>
                  </div>
                  <span className="text-[13px] font-extrabold text-text-1 text-center">{fmt(s.monto)} XAF</span>
                  <div className="flex items-center justify-center gap-0.5">
                    <button
                      onClick={e => { e.stopPropagation(); setSumDetalle(s); }}
                      className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setEliminarSum(s); }}
                      title="Eliminar"
                      className="p-1.5 rounded-[8px] transition text-text-4 hover:text-red-text cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
=======
            {(() => {
              const effectiveSum = groupBySum || sortSum.key;
              const sortedSum = !effectiveSum ? misSuministradores : [...misSuministradores].sort((a, b) => {
                const dir = groupBySum ? 1 : (sortSum.dir === 'asc' ? 1 : -1);
                if (effectiveSum === 'nombre') return dir * (a.nombre ?? '').localeCompare(b.nombre ?? '');
                if (effectiveSum === 'kyc')    return dir * ((KYC_ORDER[(a.kyc ?? '').toLowerCase()] ?? 3) - (KYC_ORDER[(b.kyc ?? '').toLowerCase()] ?? 3));
                if (effectiveSum === 'score')  return dir * ((a.scoreCredito ?? 0) - (b.scoreCredito ?? 0));
                if (effectiveSum === 'monto')  return dir * (a.monto - b.monto);
                return 0;
              });
              return (
                <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
                  <div className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1fr_1fr_1.2fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3 items-center">
                    <button onClick={() => toggleSortSum('nombre')}
                      className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                      Suministrador {sortIconSum('nombre')}
                    </button>
                    <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Contrato</span>
                    <button onClick={() => toggleGroupSum('kyc')}
                      className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center ${groupBySum === 'kyc' ? 'text-orange' : 'text-text-4'}`}>
                      KYC {groupIconSum('kyc')}
                    </button>
                    <button onClick={() => toggleSortSum('score')}
                      className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                      Score {sortIconSum('score')}
                    </button>
                    <button onClick={() => toggleSortSum('monto')}
                      className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                      Monto asignado {sortIconSum('monto')}
                    </button>
                    <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
>>>>>>> 182e0fa43752600a0d250fe2e54a77d26cc5db98
                  </div>
                  {sortedSum.flatMap((s, i) => {
                    const isNewGroup = groupBySum === 'kyc' && (i === 0 || (sortedSum[i - 1].kyc ?? 'sin KYC') !== (s.kyc ?? 'sin KYC'));
                    const groupSep = isNewGroup ? [
                      <div key={`grp-sum-${i}`} className="min-w-[640px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                        <span className="text-[11px] font-bold text-orange">{s.kyc ?? 'sin KYC'}</span>
                      </div>
                    ] : [];
                    const row = (
                      <div key={s.id ?? s.nombre}
                        onClick={() => setSumDetalle(s)}
                        className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1fr_1fr_1.2fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IniAvatar ini={s.ini ?? iniFor(s.nombre)} size={32} />
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-text-1 truncate">{s.nombre}</div>
                          </div>
                        </div>
                        <span className="text-[12px] font-mono text-center" style={{ color: TEXT4 }}>{c.id}</span>
                        <div className="flex justify-center">
                          <Badge variant={kycBadge(s.kyc ?? 'sin kyc')}>{s.kyc ?? 'sin KYC'}</Badge>
                        </div>
                        <div className="flex justify-center">
                          {s.scoreCredito != null ? (
                            <div className="text-center">
                              <div className="text-[13px] font-bold" style={{ color: scoreColor(s.scoreCredito) }}>{s.scoreCredito}</div>
                              <div className="text-[10px]" style={{ color: scoreColor(s.scoreCredito) }}>Riesgo {s.scoreCredito >= 750 ? 'Bajo' : s.scoreCredito >= 500 ? 'Medio' : 'Alto'}</div>
                            </div>
                          ) : <span className="text-[12px] text-text-4">—</span>}
                        </div>
                        <span className="text-[13px] font-extrabold text-text-1 text-center">{fmt(s.monto)} XAF</span>
                        <div className="flex justify-center">
                          <button onClick={e => { e.stopPropagation(); setSumDetalle(s); }}
                            className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                    return [...groupSep, row];
                  })}
                  {misSuministradores.length === 0 && (
                    <div className="min-w-[640px] px-4 py-10 text-center text-[13px] text-text-4">
                      Aún no se registraron suministradores.
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        )}

        {/* ── Tab: Facturas ── */}
        {tab === 'facturas' && (() => {
          const estadosDisponibles = ['Todos', ...Array.from(new Set(facturasContrato.map(f => f.estado)))];
          const visibles = facturasContrato.filter(f =>
            (filtroFac === 'Todos' || f.estado === filtroFac) &&
            (!busquedaFac.trim() ||
              f.id.toLowerCase().includes(busquedaFac.toLowerCase()) ||
              (f.suministrador || '').toLowerCase().includes(busquedaFac.toLowerCase()) ||
              (f.concepto || '').toLowerCase().includes(busquedaFac.toLowerCase()))
          );
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[14px] font-bold text-text-1">Facturas ({facturasContrato.length})</div>
                <Button onClick={() => setFacCtModal({ ...INIT_FAC_EMPTY, open: true, fechaVencimiento: defaultVencimiento() })}>
                  Nueva Factura
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="overflow-x-auto pb-0.5 flex-1">
                  <div className="flex bg-white rounded-[10px] gap-1 p-1 w-max">
                    {estadosDisponibles.map(e => {
                      const Icon = TAB_ICON_FAC[e] ?? FileText;
                      return (
                        <button key={e} onClick={() => setFiltroFac(e)}
                          className={`bona-btn font-medium rounded-[8px] text-[12px] text-center transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3 py-1.5 ${
                            filtroFac === e ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold' : 'text-text-3 hover:text-text-1 cursor-pointer'
                          }`}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
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
                    placeholder="Buscar factura…"
                    className="h-8 w-48 pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
                  />
                </div>
              </div>

              {(() => {
                const effectiveFac = groupByFac || sortFac.key;
                const sortedVisibles = !effectiveFac ? visibles : [...visibles].sort((a, b) => {
                  const dir = groupByFac ? 1 : (sortFac.dir === 'asc' ? 1 : -1);
                  if (effectiveFac === 'suministrador') return dir * (a.suministrador ?? '').localeCompare(b.suministrador ?? '');
                  if (effectiveFac === 'fecha')  return dir * parseDate(a.fecha).localeCompare(parseDate(b.fecha));
                  if (effectiveFac === 'monto')  return dir * (a.monto - b.monto);
                  if (effectiveFac === 'estado') return dir * (a.estado ?? '').localeCompare(b.estado ?? '');
                  return 0;
                });
                return (
                  <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
                    <div className="min-w-[700px] grid [grid-template-columns:1.4fr_0.9fr_1.2fr_1.4fr_1.2fr_1.4fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3 items-center">
                      <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Cod. Factura</span>
                      <button onClick={() => toggleSortFac('fecha')}
                        className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                        Fecha {sortIconFac('fecha')}
                      </button>
                      <button onClick={() => toggleGroupFac('suministrador')}
                        className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 ${groupByFac === 'suministrador' ? 'text-orange' : 'text-text-4'}`}>
                        Suministrador {groupIconFac('suministrador')}
                      </button>
                      <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Concepto</span>
                      <button onClick={() => toggleSortFac('monto')}
                        className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-end">
                        Monto {sortIconFac('monto')}
                      </button>
                      <button onClick={() => toggleSortFac('estado')}
                        className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 justify-center">
                        Estado {sortIconFac('estado')}
                      </button>
                      <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
                    </div>
                    {sortedVisibles.flatMap((f, i) => {
                      const isNewGroup = groupByFac === 'suministrador' && (i === 0 || (sortedVisibles[i - 1].suministrador ?? '—') !== (f.suministrador ?? '—'));
                      const groupSep = isNewGroup ? [
                        <div key={`grp-fac-${i}`} className="min-w-[700px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                          <span className="text-[11px] font-bold text-orange">{f.suministrador ?? '—'}</span>
                        </div>
                      ] : [];
                      const row = (
                        <div key={f.id}
                          onClick={() => { setFacturaModal(f); setIpiStep(null); }}
                          className="min-w-[700px] grid [grid-template-columns:1.4fr_0.9fr_1.2fr_1.4fr_1.2fr_1.4fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
                        >
                          <div className="text-[12px] font-mono font-bold text-text-2">{f.id}</div>
                          <div className="text-[11px] text-text-4">{f.fecha || '—'}</div>
                          <div className="text-[12px] font-semibold text-text-2 truncate">{f.suministrador || '—'}</div>
                          <div className="text-[11px] text-text-4 truncate text-center">{f.concepto || '—'}</div>
                          <div className="text-[13px] font-extrabold text-text-1 text-right whitespace-nowrap">{fmt(f.monto)} XAF</div>
                          <div className="flex justify-center">
                            <Badge variant={facturaBadge(f.estado)}>{f.estado}</Badge>
                          </div>
                          <div className="flex justify-center">
                            <button onClick={e => { e.stopPropagation(); setFacturaModal(f); setIpiStep(null); }}
                              className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                      return [...groupSep, row];
                    })}
                    {visibles.length === 0 && (
                      <div className="min-w-[700px] px-4 py-10 text-center text-[13px] text-text-4">
                        No hay facturas con los filtros aplicados.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* ── Tab: Registros ── */}
        {tab === 'registros' && (
          <RegistrosTabla registros={registrosContrato(c, facturasContrato)} />
        )}

      </div>

      {/* ── Modal: Nueva Factura al Contratante (este contrato pre-seleccionado) ── */}
      {facCtModal.open && (
        <FacturaContratanteModal
          modal={facCtModal}
          contratoFijo={{ id: c.id, contratante: c.pyme, tipoFactoring: 'inverso', disponible: disp }}
          onChange={p => setFacCtModal(prev => ({ ...prev, ...p }))}
          onSave={handleCrearFacCt}
          onCancel={() => setFacCtModal(INIT_FAC_EMPTY)}
        />
      )}

      {/* ── Modal: Agregar Suministrador (ligado a este contrato) ── */}
      {agregarSum.open && (
        <Modal
          title="Agregar Suministrador"
          onClose={() => setAgregarSum(NUEVO_SUM_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setAgregarSum(NUEVO_SUM_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleAgregarSum} disabled={!formOkSum}>Guardar Suministrador</Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="text-[12px] text-text-4">
              Registra un nuevo Suministrador en tu directorio. Quedará ligado al contrato {c.id}.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <FormGroup label="Razón Social" required>
                <Input
                  value={agregarSum.nombre}
                  onChange={e => setAgregarSum(a => ({ ...a, nombre: e.target.value }))}
                  placeholder="Ej: Distribuidora del Golfo"
                />
              </FormGroup>
              <FormGroup label="Nombre Comercial">
                <Input
                  value={agregarSum.nombreComercial}
                  onChange={e => setAgregarSum(a => ({ ...a, nombreComercial: e.target.value }))}
                  placeholder="Ej: Digolf"
                />
              </FormGroup>
              <FormGroup label="Sector Productivo" required>
                <Select
                  value={agregarSum.sector}
                  onChange={e => setAgregarSum(a => ({ ...a, sector: e.target.value }))}
                >
                  {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
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
                    value={telefonoLocalSum.slice(0, 9)}
                    onChange={e => setAgregarSum(a => ({ ...a, telefono: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                    placeholder="222 XXX XXX"
                    className={`!rounded-l-none ${telefonoInvalidoSum ? '!border-red-400 focus:!border-red-500' : ''}`}
                  />
                </div>
                {telefonoInvalidoSum && (
                  <p className="text-xs text-red-500 mt-1.5">El teléfono debe tener entre 7 y 9 dígitos.</p>
                )}
              </FormGroup>
              <FormGroup label="Correo" required>
                <Input
                  type="email"
                  value={agregarSum.correo}
                  onChange={e => setAgregarSum(a => ({ ...a, correo: e.target.value }))}
                  placeholder="Ej: contacto@suministrador.gq"
                  className={emailInvalidoSum ? '!border-red-400 focus:!border-red-500' : ''}
                />
                {emailInvalidoSum && (
                  <p className="text-xs text-red-500 mt-1.5">Ingresa un correo electrónico válido.</p>
                )}
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Detalle de Suministrador (disparado por el ojo en la tabla) ── */}
      {sumDetalle && (() => {
        const p = listaSuministradores.find(x => x.nombre === sumDetalle.nombre);
        if (!p) return null;
        return (
          <Modal title={`${p.nombre} · ${c.id}`} onClose={() => setSumDetalle(null)} wide>
            <div className="space-y-5">
              <div className="card-enter bg-white rounded-[14px] border border-border p-5">
                <SectionHeader
                  title="Datos de Identidad"
                  sub="Información legal y fiscal del Suministrador"
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
                <SectionHeader title="Representante Legal" sub="Persona autorizada para firmar y representar al Suministrador" Icon={User} />
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
                <SectionHeader title="Este Contrato" sub="Condiciones específicas de la asignación a este Suministrador" Icon={FileText} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InfoRow label="Contrato"        value={c.id} />
                  <InfoRow label="Estado KYC"      value={sumDetalle.kyc} />
                  <InfoRow label="Monto asignado"  value={`${fmt(sumDetalle.monto)} XAF`} />
                  <InfoRow label="Nómina"          value={sumDetalle.cargaNomina ? 'Sí' : 'No'} />
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
              </div>
            </>
          }
        >
          <div className="space-y-5">
            {/* Estado + fecha */}
            <div className="flex items-center justify-between">
              <Badge variant={facturaBadge(modalFac.estado)}>{modalFac.estado}</Badge>
              <span className="text-[12px]" style={{ color: TEXT4 }}>{modalFac.fecha}</span>
            </div>
            {/* Datos principales */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow label="Nº Factura"     value={modalFac.id} />
              <InfoRow label="Suministrador"  value={modalFac.suministrador} />
              <InfoRow label="Contrato"       value={modalFac.contrato} />
              <InfoRow label="Monto"          value={`${fmt(modalFac.monto)} XAF`} />
              <InfoRow label="Fecha"          value={modalFac.fecha} />
              <InfoRow label="Concepto"       value={modalFac.concepto} />
            </div>
            {/* Documentos adjuntos */}
            <div>
              <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Documento adjunto</div>
              <div className="flex items-center gap-2.5 p-3 rounded-[10px] border border-border" style={{ color: TEXT4 }}>
                <FileText className="w-4 h-4 shrink-0" />
                <span className="text-[12px]">No se ha adjuntado documento a esta factura.</span>
              </div>
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
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Suministrador</span>
                  <span className="text-[12px] font-medium text-text-1">{modalFac.suministrador}</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-border">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Monto</span>
                  <span className="text-[16px] font-extrabold" style={{ color: GREEN }}>
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

      {/* ── Modal: Confirmar eliminación de Suministrador ── */}
      {eliminarSum && c && (
        <ConfirmarEliminarModal
          nombre={eliminarSum.nombre}
          tipoEntidad="Suministrador"
          contratoVinculado={c.id}
          onConfirm={handleEliminarSum}
          onClose={() => setEliminarSum(null)}
        />
      )}
    </AppShell>
  );
}
