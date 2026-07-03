import { useState } from 'react';
import { TrendingUp, Leaf, Download, Clock, AlertTriangle, FileText, ChevronRight, ArrowUpRight, TrendingDown, Bell, CheckCircle } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';

// ── MIC Brand tokens ─────────────────────────────────────────────────────────
const GRAD   = 'linear-gradient(135deg, #E0201C 0%, #EF7A2C 100%)';
const RED    = '#E0201C';
const ORA    = '#EF7A2C';
const GREEN  = '#2E7D5B';
const WARN   = '#C68A1D';
const ERR    = '#B8352A';
const BORDER = '#ECEAE7';
const TEXT4  = '#A9A6A1';

const fmt = (v) => `${new Intl.NumberFormat('fr-FR').format(Number(v) || 0)} XAF`;

// ── DonutChart ────────────────────────────────────────────────────────────────
function DonutChart({ data, centerLabel, centerSub, size = 130 }) {
  const r = 40, cx = 55, cy = 55, circ = 2 * Math.PI * r;
  let acc = 0;
  const segs = data.map(d => {
    const dash = (d.pct / 100) * circ;
    const s = { ...d, dash, off: -acc };
    acc += dash;
    return s;
  });
  return (
    <svg viewBox="0 0 110 110" style={{ width: size, height: size, flexShrink: 0 }}>
      <defs>
        <linearGradient id="donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={RED} />
          <stop offset="100%" stopColor={ORA} />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={BORDER} strokeWidth="13" />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.gradient ? 'url(#donut-grad)' : s.color}
          strokeWidth="13"
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={s.off}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      ))}
      {centerLabel && (
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="800"
          fill="#26262B" fontFamily="Poppins,sans-serif">{centerLabel}</text>
      )}
      {centerSub && (
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize="8" fill={TEXT4}
          fontFamily="Poppins,sans-serif">{centerSub}</text>
      )}
    </svg>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color, width = 72, height = 24 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── VBarChart — pestaña Medioambiental ───────────────────────────────────────
function VBarChart({ id, data, h = 170 }) {
  const W = 420, H = h, PL = 32, PR = 12, PT = 28, PB = 32;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = Math.max(...data.map(d => d.value)) * 1.12;
  const slot = cW / data.length, bW = slot * 0.52;
  const gId = `vb-${id}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ORA} />
          <stop offset="100%" stopColor={ORA} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <line key={p} x1={PL} y1={PT + cH * (1 - p)} x2={W - PR} y2={PT + cH * (1 - p)}
          stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const x = PL + slot * i + (slot - bW) / 2;
        const bH = (d.value / maxV) * cH;
        const y = PT + cH - bH;
        const fill = d.color ?? `url(#${gId})`;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bW} height={bH} rx="5" fill={fill} opacity="0.88" />
            <text x={x + bW / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="700"
              fill={d.color ?? ORA} fontFamily="Poppins,sans-serif">{d.value}</text>
            <text x={x + bW / 2} y={H - 10} textAnchor="middle" fontSize="9"
              fill={TEXT4} fontFamily="Poppins,sans-serif">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── StackedBarChart — Flujo de Caja Proyectado ───────────────────────────────
function StackedBarChart({ data, h = 200 }) {
  const W = 500, H = h, PL = 48, PR = 20, PT = 20, PB = 36;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = Math.max(...data.map(d => d.inflow + d.outflow)) * 1.22;
  const slot = cW / data.length, bW = slot * 0.52;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {[0, 0.33, 0.67, 1].map(p => (
        <line key={p} x1={PL} y1={PT + cH * (1 - p)} x2={W - PR} y2={PT + cH * (1 - p)}
          stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const x    = PL + slot * i + (slot - bW) / 2;
        const inH  = maxV ? (d.inflow  / maxV) * cH : 0;
        const outH = maxV ? (d.outflow / maxV) * cH : 0;
        const base = PT + cH;
        return (
          <g key={i}>
            {d.inflow > 0 && (
              <rect x={x} y={base - inH} width={bW} height={inH} rx="3" fill={ORA} opacity="0.88" />
            )}
            {d.outflow > 0 && (
              <rect x={x} y={base - inH - outH} width={bW} height={outH} rx="3"
                fill="#FDEEEB" stroke={ERR} strokeWidth="0.75" />
            )}
            <text x={x + bW / 2} y={H - 10} textAnchor="middle" fontSize="10"
              fill={TEXT4} fontFamily="Poppins,sans-serif">{d.label}</text>
          </g>
        );
      })}
      {[0, 0.5, 1].map(p => (
        <text key={p} x={PL - 5} y={PT + cH * (1 - p) + 4} textAnchor="end"
          fontSize="9" fill={TEXT4} fontFamily="Poppins,sans-serif">
          {Math.round(maxV * p / 1_000_000)}M
        </text>
      ))}
    </svg>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'financiacion',   line1: 'Dashboard de', line2: 'Financiación',   Icon: TrendingUp },
  { id: 'medioambiental', line1: 'Dashboard',    line2: 'Medioambiental', Icon: Leaf },
];

// ── Datos ─────────────────────────────────────────────────────────────────────
const DISPONIBLE      = 81_000_000;
const LIMITE          = 231_000_000;
const USADO           = 150_000_000;
const CAPITAL_TRANSIT = 42_000_000;
const SCORE           = 82;
const ALERTAS_COUNT   = 1;
const FACTURAS_TOTAL_COUNT = 42;
const FACTURAS_TOTAL_MONTO = 102_500_000;
const VENCIMIENTOS_COUNT   = 4;
const PROXIMO_MONTO        = 28_700_000;

const scoreSparkline = [74, 76, 75, 78, 79, 80, 82];

const cashFlowData = [
  { label: 'Sem 1', inflow: 42_000_000, outflow: 18_000_000 },
  { label: 'Sem 2', inflow: 25_000_000, outflow: 30_000_000 },
  { label: 'Sem 3', inflow:           0, outflow: 15_000_000 },
  { label: 'Sem 4', inflow: 35_000_000, outflow: 12_000_000 },
];

const pipeline = { enEvaluacion: 3, aprobadas: 5, rechazadas: 1 };

const alertas = [
  { msg: 'Documento de representación legal vence en 5 días' },
  { msg: 'KYC — Actualización de perfil requerida antes del 10 Jul' },
];

const firmasPendientes = [
  { id: 'CTR-2026-007', desc: 'Contrato de cesión de crédito' },
];

const proximosVencimientos = [
  { id: 'FAC-2026-1025', fecha: '15 Jun', monto: 4_500_000 },
  { id: 'FAC-2026-1036', fecha: '20 Jun', monto: 6_500_000 },
  { id: 'CTR-2026-002',  fecha: '31 Dic', monto: 42_000_000 },
];

const operaciones = [
  { id: 'CTR-2026-002',  estado: 'Activa',    monto: 42_000_000, venc: '31/12/26' },
  { id: 'CTR-2026-005',  estado: 'Activa',    monto: 25_000_000, venc: '31/12/26' },
  { id: 'FAC-2026-1031', estado: 'Pagada',    monto: 18_000_000, venc: '01/06/26' },
  { id: 'FAC-2026-1025', estado: 'Enviada',   monto:  4_500_000, venc: '15/06/26' },
  { id: 'FAC-2026-1036', estado: 'Pendiente', monto:  6_500_000, venc: '20/06/26' },
];

// ── Medioambiental ────────────────────────────────────────────────────────────
const envKpis = [
  { value: '8',        label: 'Proyectos registrados', sub: 'Total registrado',          cls: 'text-green-text',  trend: '+2',      tUp: true  },
  { value: '5',        label: 'Proyectos activos',     sub: 'En ejecución actualmente',  cls: 'text-text-1',      trend: 'Estable', tUp: null  },
  { value: '3',        label: 'Proyectos financiados', sub: 'Con financiación aprobada', cls: 'text-orange',      trend: '+1',      tUp: true  },
  { value: '12 450 t', label: 'Captura potencial CO₂', sub: 'Toneladas CO₂ potencial',  cls: 'text-green-text',  trend: '+8%',     tUp: true  },
  { value: 'Medio',    label: 'Riesgo ambiental',      sub: 'Clasificación global',      cls: 'text-yellow-text', trend: 'Estable', tUp: null  },
];

const proyectoDona = [
  { tipo: 'En ejecución', pct: 45, color: GREEN },
  { tipo: 'Planificado',  pct: 18, color: ORA   },
  { tipo: 'Finalizado',   pct: 27, color: RED   },
  { tipo: 'Suspendido',   pct: 10, color: TEXT4 },
];

const catBarData = [
  { label: 'Reforestación', value: 3, color: GREEN },
  { label: 'Agricultura',   value: 2, color: ORA   },
  { label: 'Energía',       value: 2, color: RED   },
  { label: 'Residuos',      value: 1, color: TEXT4 },
];

const proyectos = [
  { nombre: 'Reforestación Bata Norte', estado: 'En ejecución', riesgo: 'Bajo',  fin: '45 000 000 XAF' },
  { nombre: 'Agro Sierra Sur',          estado: 'En ejecución', riesgo: 'Medio', fin: '28 000 000 XAF' },
  { nombre: 'Energía Solar Malabo',     estado: 'Planificado',  riesgo: 'Bajo',  fin: '62 000 000 XAF' },
  { nombre: 'Gestión Residuos Bata',    estado: 'Finalizado',   riesgo: 'Bajo',  fin: '18 000 000 XAF' },
  { nombre: 'Reforestación Ebebiyín',   estado: 'Planificado',  riesgo: 'Medio', fin: '35 000 000 XAF' },
];

const estadoBadge = (e) => e === 'En ejecución' ? 'blue' : e === 'Planificado' ? 'orange' : e === 'Finalizado' ? 'green' : 'yellow';
const riesgoBadge = (r) => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';

// ── Panel Lateral: Alertas, Firmas, Vencimientos ──────────────────────────────
function AlertsPanel() {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-[14px] border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: WARN }} />
          <span className="text-[12px] font-bold text-text-1">Alertas Críticas</span>
        </div>
        <div className="space-y-2">
          {alertas.map((a, i) => (
            <div key={i} className="flex items-start gap-2 rounded-[8px] p-2.5"
                 style={{ background: '#FDF6E8', border: '1px solid rgba(198,138,29,0.25)' }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-[5px]" style={{ background: WARN }} />
              <p className="text-[11px] leading-snug" style={{ color: '#7A5210' }}>{a.msg}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-3.5 h-3.5 shrink-0 text-text-3" />
          <span className="text-[12px] font-bold text-text-1">Firmas Pendientes</span>
        </div>
        <div className="space-y-2">
          {firmasPendientes.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-2 rounded-[8px] p-2.5 border border-border hover:bg-page-bg transition-colors cursor-pointer">
              <div>
                <p className="text-[11px] font-bold text-text-1">{f.id}</p>
                <p className="text-[10px] text-text-4 leading-snug">{f.desc}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-text-4 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[14px] border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 shrink-0 text-text-3" />
          <span className="text-[12px] font-bold text-text-1">Próximos Vencimientos</span>
        </div>
        <div className="space-y-0">
          {proximosVencimientos.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0">
              <div>
                <p className="text-[11px] font-medium text-text-1">{v.id}</p>
                <p className="text-[10px] font-semibold" style={{ color: WARN }}>{v.fecha}</p>
              </div>
              <p className="text-[11px] font-bold text-text-1 whitespace-nowrap">
                {(v.monto / 1_000_000).toFixed(1)}M XAF
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function EpHome() {
  const { go } = useApp();
  const [tab, setTab] = useState('financiacion');
  const pctUsado = Math.round((USADO / LIMITE) * 100);
  const pctDisponible = 100 - pctUsado;

  return (
    <AppShell active="epHome" role="empresa-pequena" title="Inicio" sub="Mi Panel">
      <div className="fade-in space-y-5">

        {/* Header + Tab nav */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <div className="min-w-0">
              <div className="text-[13px] text-text-4 leading-tight sm:hidden">Bienvenido,</div>
              <div className="text-[20px] font-bold text-text-1 truncate">
                <span className="hidden sm:inline">Bienvenido, </span>Construcciones Silva
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <span className="inline-flex items-center gap-1.5 bg-green-bg text-green-text text-[11px] font-bold px-3 py-1.5 rounded-[8px] border border-green-border">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: GREEN }} />
                Verde
              </span>
              <span className="inline-flex items-center gap-1.5 bg-green-bg text-green-text text-[11px] font-bold px-3 py-1.5 rounded-[8px] border border-green-border">
                <Leaf className="w-3.5 h-3.5" />
                Verde Bonafide
              </span>
            </div>
          </div>

          {/* Tabs desktop */}
          <div className="hidden sm:flex gap-1 bg-page-bg p-1 rounded-xl">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  tab === t.id ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
                }`}>
                <t.Icon className="w-3.5 h-3.5" />
                {t.line1} {t.line2}
              </button>
            ))}
          </div>
        </div>

        {/* Tab nav móvil */}
        <div className="flex sm:hidden gap-1 bg-page-bg p-1 rounded-xl w-full">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer text-center ${
                tab === t.id ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
              }`}>
              <t.Icon className="w-3.5 h-3.5" />
              <span className="leading-[1.25]">
                <span className="block">{t.line1}</span>
                <span className="block">{t.line2}</span>
              </span>
            </button>
          ))}
        </div>


        {/* ── PESTAÑA FINANCIACIÓN ──────────────────────────────────────────── */}
        {tab === 'financiacion' && (
          <div key="financiacion" className="fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-5 items-start">

              {/* ── Columna principal ── */}
              <div className="space-y-4 min-w-0">

                {/* 1. Hero — Mi Billetera (blanco + donut) */}
                <div className="bg-white rounded-[18px] border border-border overflow-hidden">
                  {/* Barra de acento superior con degradado de marca */}
                  <div className="h-1" style={{ background: GRAD }} />

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                      {/* Izquierda: info de financiación */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[1.2px] mb-4"
                           style={{ color: TEXT4 }}>
                          MI BILLETERA · CORTE JUN 2026
                        </p>
                        <p className="text-[11px] font-medium mb-1" style={{ color: TEXT4 }}>
                          FINANCIACIÓN APROBADA
                        </p>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-extrabold text-text-1 leading-none tracking-tight"
                                style={{ fontSize: 'clamp(28px, 5vw, 38px)' }}>
                            {new Intl.NumberFormat('fr-FR').format(DISPONIBLE)}
                          </span>
                          <span className="text-[16px] font-semibold" style={{ color: TEXT4 }}>XAF</span>
                        </div>
                        <p className="text-[12px] mb-5" style={{ color: TEXT4 }}>
                          de {new Intl.NumberFormat('fr-FR').format(LIMITE)} XAF aprobados
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-2.5">
                          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] font-bold text-[13px] text-white cursor-pointer transition-opacity hover:opacity-90"
                                  style={{ background: ORA }}>
                            <ArrowUpRight className="w-4 h-4" />
                            Solicitar Financiación
                          </button>
                          <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] font-semibold text-[12px] text-text-3 cursor-pointer transition-colors hover:bg-page-bg border border-border">
                            <Download className="w-3.5 h-3.5" />
                            Extracto
                          </button>
                          <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] font-semibold text-[12px] text-text-3 cursor-pointer transition-colors hover:bg-page-bg border border-border">
                            Retirar fondos
                          </button>
                        </div>
                      </div>

                      {/* Derecha: donut de disponibilidad */}
                      <div className="flex items-center gap-5 shrink-0">
                        <DonutChart
                          data={[
                            { pct: pctUsado,      gradient: true, color: RED },
                            { pct: pctDisponible, color: BORDER },
                          ]}
                          centerLabel={`${pctDisponible}%`}
                          centerSub="DISPONIBLE"
                          size={130}
                        />
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: RED }} />
                              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Utilizado</span>
                            </div>
                            <p className="text-[14px] font-extrabold text-text-1">
                              {new Intl.NumberFormat('fr-FR').format(USADO)} XAF
                            </p>
                            <p className="text-[10px]" style={{ color: TEXT4 }}>{pctUsado}%</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ORA }} />
                              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Disponible</span>
                            </div>
                            <p className="text-[14px] font-extrabold" style={{ color: ORA }}>
                              {new Intl.NumberFormat('fr-FR').format(DISPONIBLE)} XAF
                            </p>
                            <p className="text-[10px]" style={{ color: TEXT4 }}>{pctDisponible}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alertas — prioridad en móvil */}
                <div className="lg:hidden">
                  <AlertsPanel />
                </div>

                {/* 2. KPIs — 4 tarjetas en fila */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                  {/* KPI 1 — Score Crediticio */}
                  <div className="bg-white rounded-[14px] border border-border p-4">
                    <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Score Crediticio</p>
                    <div className="flex items-end gap-1.5 mb-1">
                      <p className="text-[28px] font-extrabold leading-none text-text-1">{SCORE}</p>
                      <div className="mb-0.5">
                        <Sparkline data={scoreSparkline} color={GREEN} />
                      </div>
                    </div>
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#E3F4EA', color: GREEN }}>
                      Riesgo Bajo
                    </span>
                    <p className="text-[10px] mt-2" style={{ color: TEXT4 }}>
                      +4 pts vs mes anterior
                    </p>
                  </div>

                  {/* KPI 2 — Alertas */}
                  <div className="bg-white rounded-[14px] border border-border p-4">
                    <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Alertas</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative">
                        <Bell className="w-6 h-6 text-text-3" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center"
                              style={{ background: ORA }}>
                          {ALERTAS_COUNT}
                        </span>
                      </div>
                      <p className="text-[20px] font-extrabold text-text-1 leading-none">{ALERTAS_COUNT}</p>
                    </div>
                    <p className="text-[11px] text-text-4 mb-3">Operaciones requieren atención</p>
                    <button onClick={() => {}}
                      className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition"
                      style={{ color: ORA }}>
                      Ver alertas <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* KPI 3 — Facturas Activas */}
                  <div className="bg-white rounded-[14px] border border-border p-4">
                    <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Facturas Activas</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <p className="text-[28px] font-extrabold leading-none text-text-1">{FACTURAS_TOTAL_COUNT}</p>
                    </div>
                    <p className="text-[10px] mb-3" style={{ color: TEXT4 }}>
                      por un total de {new Intl.NumberFormat('fr-FR').format(FACTURAS_TOTAL_MONTO)} XAF
                    </p>
                    <button onClick={() => go('epFacturacion')}
                      className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition"
                      style={{ color: ORA }}>
                      Ver facturas <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* KPI 4 — Próximos Vencimientos */}
                  <div className="bg-white rounded-[14px] border border-border p-4">
                    <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Próximos Vencimientos</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <p className="text-[28px] font-extrabold leading-none text-text-1">{VENCIMIENTOS_COUNT}</p>
                    </div>
                    <p className="text-[10px] mb-3" style={{ color: TEXT4 }}>
                      próximo en {new Intl.NumberFormat('fr-FR').format(PROXIMO_MONTO)} XAF
                    </p>
                    <button onClick={() => {}}
                      className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition"
                      style={{ color: ORA }}>
                      Ver vencimientos <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Barra de estado — empresa al día */}
                <div className="flex items-center justify-between gap-3 rounded-[12px] px-4 py-3 border"
                     style={{ background: '#E3F4EA', borderColor: '#A8D5BE' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                    <span className="text-[12px] font-semibold" style={{ color: GREEN }}>
                      Tu empresa se encuentra al día
                    </span>
                    <span className="hidden sm:inline text-[12px]" style={{ color: '#5B8E74' }}>
                      · No tienes obligaciones vencidas ni pagos pendientes
                    </span>
                  </div>
                  <button onClick={() => go('epFacturacion')}
                    className="text-[11px] font-semibold whitespace-nowrap flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition shrink-0"
                    style={{ color: GREEN }}>
                    Ir a mis obligaciones <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4. Pipeline — Centro Operativo */}
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="mb-4">
                    <p className="text-[14px] font-bold text-text-1">Pipeline de Operaciones</p>
                    <p className="text-[11px] text-text-4">Estado actual de facturas y contratos</p>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-border">

                    <div className="pr-4 sm:pr-6">
                      <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">En Evaluación</p>
                      <p className="text-[30px] font-extrabold text-text-1 leading-none">{pipeline.enEvaluacion}</p>
                      <p className="text-[11px] text-text-4 mt-0.5 mb-3">facturas</p>
                      <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: '#F3F4F6', color: '#6B7280' }}>
                        Pendiente KYC/AML
                      </span>
                    </div>

                    <div className="px-4 sm:px-6">
                      <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Aprobadas / Por Fondear</p>
                      <p className="text-[30px] font-extrabold leading-none" style={{ color: GREEN }}>{pipeline.aprobadas}</p>
                      <p className="text-[11px] mt-0.5 mb-3" style={{ color: GREEN }}>facturas</p>
                      <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: '#E3F4EA', color: GREEN }}>
                        Listas para desembolso
                      </span>
                    </div>

                    <div className="pl-4 sm:pl-6">
                      <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Rechazadas / Observadas</p>
                      {pipeline.rechazadas > 0 ? (
                        <>
                          <p className="text-[30px] font-extrabold leading-none" style={{ color: ERR }}>{pipeline.rechazadas}</p>
                          <p className="text-[11px] mt-0.5 mb-3" style={{ color: ERR }}>factura</p>
                          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: '#FDEEEB', color: ERR }}>
                            Requiere atención
                          </span>
                        </>
                      ) : (
                        <>
                          <p className="text-[30px] font-extrabold text-text-4 leading-none">0</p>
                          <p className="text-[11px] text-text-4 mt-0.5 mb-3">sin observaciones</p>
                          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: '#E3F4EA', color: GREEN }}>
                            Todo en orden
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Flujo de Caja Proyectado */}
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                    <div>
                      <p className="text-[14px] font-bold text-text-1">Flujo de Caja Proyectado</p>
                      <p className="text-[11px] text-text-4">Próximas 4 semanas · millones XAF</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: ORA }} />
                        <span className="text-[10px] text-text-4">Desembolsos Bonafide</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: '#FDEEEB', border: `1px solid ${ERR}` }} />
                        <span className="text-[10px] text-text-4">Obligaciones</span>
                      </div>
                    </div>
                  </div>
                  <div className="min-h-[200px]">
                    <StackedBarChart data={cashFlowData} h={200} />
                  </div>
                </div>

                {/* 6. Operaciones activas */}
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-[14px] font-bold text-text-1">Operaciones activas</div>
                      <div className="text-[11px] text-text-4">Contratos y facturas vigentes</div>
                    </div>
                    <button onClick={() => go('epFacturacion')}
                      className="text-[12px] font-semibold hover:opacity-75 transition cursor-pointer"
                      style={{ color: ORA }}>
                      Ver todas →
                    </button>
                  </div>
                  {/* Móvil: cards */}
                  <div className="sm:hidden space-y-2">
                    {operaciones.map(op => (
                      <div key={op.id} onClick={() => go('epFacturacion')}
                        className="rounded-[12px] border border-border p-3 cursor-pointer hover:bg-page-bg/60 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[11px] font-bold text-text-1">{op.id}</span>
                          <Badge variant={op.estado === 'Activa' || op.estado === 'Pagada' ? 'green' : op.estado === 'Enviada' ? 'blue' : 'yellow'}>{op.estado}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-[12px] mb-1">
                          <span className="text-text-4">Monto</span>
                          <span className="font-extrabold text-text-1">{fmt(op.monto)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-text-4">Vencimiento</span>
                          <span className="text-text-4">{op.venc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop: tabla */}
                  <table className="hidden sm:table w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {['Operación', 'Estado', 'Monto', 'Vencimiento'].map((h, i) => (
                          <th key={h} className={`text-[10px] font-semibold text-text-4 uppercase tracking-wide pb-2.5 ${i >= 2 ? 'text-right' : 'text-left'} ${i > 0 ? 'pl-2' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {operaciones.map(op => (
                        <tr key={op.id} onClick={() => go('epFacturacion')}
                          className="border-b border-border last:border-0 hover:bg-page-bg/60 cursor-pointer transition-colors">
                          <td className="py-2.5 pr-2 font-mono text-[11px] font-bold text-text-1">{op.id}</td>
                          <td className="py-2.5 pl-2 pr-2">
                            <Badge variant={op.estado === 'Activa' || op.estado === 'Pagada' ? 'green' : op.estado === 'Enviada' ? 'blue' : 'yellow'}>
                              {op.estado}
                            </Badge>
                          </td>
                          <td className="py-2.5 pl-2 text-right text-[12px] font-extrabold text-text-1 whitespace-nowrap">{fmt(op.monto)}</td>
                          <td className="py-2.5 pl-2 text-right text-[11px] text-text-4 whitespace-nowrap">{op.venc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Panel lateral derecho (desktop) ── */}
              <div className="hidden lg:block sticky top-0">
                <AlertsPanel />
              </div>
            </div>

            {/* FAB móvil */}
            <button className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:hidden z-30 flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-[14px] text-white cursor-pointer"
                    style={{ background: ORA, boxShadow: '0 8px 24px rgba(239,122,44,0.4)' }}>
              <ArrowUpRight className="w-4 h-4" />
              Solicitar Financiación
            </button>
          </div>
        )}


        {/* ── PESTAÑA MEDIOAMBIENTAL ────────────────────────────────────────── */}
        {tab === 'medioambiental' && (
          <div key="medioambiental" className="fade-in space-y-5">

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {envKpis.map(({ value, label, sub, cls, trend, tUp }) => (
                <div key={label} className="bg-white rounded-[14px] border border-border p-4 flex flex-col gap-1.5">
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide leading-tight">{label}</div>
                  <div className={`text-[17px] font-extrabold leading-none ${cls}`}>{value}</div>
                  <div className="text-[10px] text-text-5 leading-snug">{sub}</div>
                  <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tUp === true ? 'bg-green-bg text-green-text' :
                    tUp === false ? 'bg-red-bg text-red-text' :
                    'bg-orange-tint text-orange'
                  }`}>{trend}</span>
                </div>
              ))}
            </div>

            {/* Fila: DonutChart + VBarChart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-3">
                  <div className="text-[14px] font-bold text-text-1">Estado de proyectos</div>
                  <div className="text-[11px] text-text-4">Distribución por fase</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-2">
                  <DonutChart data={proyectoDona} centerLabel="8" centerSub="proyectos" size={190} />
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 w-full">
                    {proyectoDona.map(d => (
                      <div key={d.tipo} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-[11px] text-text-2 font-medium">{d.tipo}</span>
                        <span className="text-[11px] font-bold" style={{ color: d.color }}>{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-4">
                  <div className="text-[14px] font-bold text-text-1">Proyectos por categoría</div>
                  <div className="text-[11px] text-text-4">Distribución por tipo de proyecto</div>
                </div>
                <div className="flex-1 min-h-[180px]">
                  <VBarChart id="pyme-env" data={catBarData} h={170} />
                </div>
              </div>
            </div>

            {/* Tabla de proyectos */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-[14px] font-bold text-text-1">Proyectos</div>
                  <div className="text-[11px] text-text-4">Todos tus proyectos medioambientales</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-green-text" />
                  <span className="text-[11px] font-bold text-green-text">8 registrados</span>
                </div>
              </div>
              <div className="sm:hidden space-y-2">
                {proyectos.map((p, i) => (
                  <div key={i} className="rounded-[12px] border border-border p-3">
                    <div className="text-[13px] font-medium text-text-1 mb-2">{p.nombre}</div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge>
                      <Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-text-4">Financiamiento</span>
                      <span className="font-bold text-text-1">{p.fin}</span>
                    </div>
                  </div>
                ))}
              </div>
              <table className="hidden sm:table w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Proyecto', 'Estado', 'Riesgo', 'Financiamiento'].map((h, i) => (
                      <th key={h} className={`text-[10px] font-semibold text-text-4 uppercase tracking-wide pb-2.5 ${i === 3 ? 'text-right' : 'text-left'} ${i > 0 ? 'pl-3' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {proyectos.map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-page-bg/60 transition-colors">
                      <td className="py-2.5 text-[12px] font-medium text-text-1 pr-3">{p.nombre}</td>
                      <td className="py-2.5 pl-3 pr-3"><Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge></td>
                      <td className="py-2.5 pl-3 pr-3"><Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge></td>
                      <td className="py-2.5 pl-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{p.fin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Badges móvil */}
        <div className="flex sm:hidden gap-2 justify-center pt-2">
          <span className="inline-flex items-center gap-1.5 bg-green-bg text-green-text text-[11px] font-bold px-3 py-1.5 rounded-[8px] border border-green-border">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: GREEN }} />
            Verde
          </span>
          <span className="inline-flex items-center gap-1.5 bg-green-bg text-green-text text-[11px] font-bold px-3 py-1.5 rounded-[8px] border border-green-border">
            <Leaf className="w-3.5 h-3.5" />
            Verde Bonafide
          </span>
        </div>

      </div>
    </AppShell>
  );
}
