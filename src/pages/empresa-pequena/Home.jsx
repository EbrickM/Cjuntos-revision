import { useState } from 'react';
import { TrendingUp, Leaf, Download, ChevronRight, ArrowUpRight, Bell, CheckCircle, FilePlus, Users, FileCheck, CreditCard, Shield, Clock, Calendar, TreePine, Wind, Recycle } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';

// ── MIC Brand tokens ─────────────────────────────────────────────────────────
const GRAD        = 'linear-gradient(135deg, #E0201C 0%, #EF7A2C 100%)';
const RED         = '#E0201C';
const ORA         = '#EF7A2C';
const GREEN       = '#2E7D5B';
const WARN        = '#C68A1D';
const ERR         = '#B8352A';
const BORDER      = '#ECEAE7';
const TEXT4       = '#A9A6A1';
const DONUT_EMPTY = '#C4C1BC';

// ── DonutChart ────────────────────────────────────────────────────────────────
// inner: radio del anillo en unidades viewBox. El viewBox se recalcula para
// que el anillo llene el SVG con margen fijo; subir `inner` expande el
// diámetro sin cambiar el grosor visual (sw=13).
function DonutChart({ data, centerLabel, centerSub, size = 130, inner = 40 }) {
  const sw = 13, margin = 8;
  const vb = Math.round((inner + sw / 2 + margin) * 2);
  const cx = vb / 2, cy = vb / 2;
  const circ = 2 * Math.PI * inner;
  const scale = vb / 110;
  let acc = 0;
  const segs = data.map(d => {
    const dash = (d.pct / 100) * circ;
    const s = { ...d, dash, off: -acc };
    acc += dash;
    return s;
  });
  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} style={{ width: size, height: size, flexShrink: 0 }}>
      <defs>
        <linearGradient id="donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={RED} />
          <stop offset="100%" stopColor={ORA} />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={inner} fill="none" stroke={BORDER} strokeWidth={sw} />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={inner} fill="none"
          stroke={s.gradient ? 'url(#donut-grad)' : s.color}
          strokeWidth={sw}
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={s.off}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      ))}
      {centerLabel && (
        <text x={cx} y={cy - 4 * scale} textAnchor="middle"
          fontSize={Math.round(14 * scale)} fontWeight="800"
          fill="#26262B" fontFamily="Poppins,sans-serif">{centerLabel}</text>
      )}
      {centerSub && (
        <text x={cx} y={cy + 11 * scale} textAnchor="middle"
          fontSize={Math.round(8 * scale)} fill={TEXT4}
          fontFamily="Poppins,sans-serif">{centerSub}</text>
      )}
    </svg>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color, width = 72, height = 24 }) {
  const max = Math.max(...data), min = Math.min(...data);
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

// ── Gauge — Velocímetro Score Crediticio ─────────────────────────────────────
// sweep=1 (horario en SVG donde Y↓) traza el semicírculo superior de izq. a der.
function Gauge({ score = 82, size = 190 }) {
  const W = 200, H = 165;
  const cx = 100, cy = 100, r = 80, sw = 16;
  const deg2rad = d => d * Math.PI / 180;
  // Ángulo en convención matemática: 180°=izq, 90°=arriba, 0°=der
  const scoreToAngle = s => 180 - (s / 100) * 180;
  const pt = a => {
    const rad = deg2rad(a);
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  };
  const zones = [
    [0,  40,  ERR  ],
    [40, 60,  ORA  ],
    [60, 75,  WARN ],
    [75, 100, GREEN],
  ];
  const needleAngle = scoreToAngle(score);
  const needleRad = deg2rad(needleAngle);
  const nx = cx + (r - sw - 2) * Math.cos(needleRad);
  const ny = cy - (r - sw - 2) * Math.sin(needleRad);
  const zoneLabel = score < 40 ? 'Crítico' : score < 60 ? 'Alto' : score < 75 ? 'Medio' : 'Bajo';
  const zoneColor = score < 40 ? ERR : score < 60 ? ORA : score < 75 ? WARN : GREEN;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: size, height: Math.round(size * H / W) }}>
      {/* Pista de fondo — semicírculo superior: sweep=1 (horario SVG) */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
        fill="none" stroke={BORDER} strokeWidth={sw} strokeLinecap="butt" />
      {/* Zonas de color sobre la pista */}
      {zones.map(([s1, s2, color]) => {
        const [x1, y1] = pt(scoreToAngle(s1));
        const [x2, y2] = pt(scoreToAngle(s2));
        return (
          <path key={s1}
            d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`}
            fill="none" stroke={color} strokeWidth={sw} strokeLinecap="butt" opacity="0.9" />
        );
      })}
      {/* Aguja */}
      <line x1={cx} y1={cy} x2={nx.toFixed(2)} y2={ny.toFixed(2)}
        stroke="#26262B" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#26262B" />
      {/* Score y etiqueta bajo el pivote */}
      
      <text x={cx} y={cy + 32} textAnchor="middle" fontSize="27" fontWeight="800"
        fill="#26262B" fontFamily="Poppins,sans-serif">{score}</text>
      <text x={cx} y={cy + 50} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={zoneColor} fontFamily="Poppins,sans-serif">Riesgo {zoneLabel}</text>
      {/* Etiquetas de escala */}
      <text x={cx - r + 2} y={cy + 15} textAnchor="start" fontSize="9"
        fill={TEXT4} fontFamily="Poppins,sans-serif">0</text>
      <text x={cx + r - 2} y={cy + 15} textAnchor="end" fontSize="9"
        fill={TEXT4} fontFamily="Poppins,sans-serif">100</text>
    </svg>
  );
}

// ── LineChart — Evolución Financiera ─────────────────────────────────────────
function LineChart({ data, series, h = 180, vbW = 560, pl = 98, pr = 16, pt = 14, pb = 28, fxSz = 11, fySz = 10, compact = false }) {
  const W = vbW, H = h, PL = pl, PR = pr, PT = pt, PB = pb;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = 250;
  const yTicks = [50, 100, 150, 200, 250];
  const xPos = i => PL + (i / (data.length - 1)) * cW;
  const yPos = v => PT + cH - (v / maxV) * cH;
  const fmtM = v => compact ? `${v}M` : new Intl.NumberFormat('de-DE').format(v * 1_000_000);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {yTicks.map(t => (
        <line key={t} x1={PL} y1={yPos(t)} x2={W - PR} y2={yPos(t)}
          stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      ))}
      {series.map((s, si) => {
        const pts = data.map((d, i) => `${xPos(i)},${yPos(d[s.key])}`).join(' ');
        return (
          <polyline key={si} points={pts} fill="none" stroke={s.color}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={xPos(i)} y={H - Math.round(pb * 0.2)} textAnchor="middle"
          fontSize={fxSz} fill={TEXT4} fontFamily="Poppins,sans-serif">{d.label}</text>
      ))}
      {yTicks.map(t => (
        <text key={t} x={PL - 5} y={yPos(t) + 3} textAnchor="end"
          fontSize={fySz} fill={TEXT4} fontFamily="Poppins,sans-serif">{fmtM(t)}</text>
      ))}
    </svg>
  );
}

// ── GroupedBarChart — Flujo Financiero ───────────────────────────────────────
function GroupedBarChart({ data, h = 180, vbW = 560, pl = 98, pr = 8, pt = 14, pb = 28, fxSz = 11, fySz = 10, compact = false }) {
  const W = vbW, H = h, PL = pl, PR = pr, PT = pt, PB = pb;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = Math.max(...data.flatMap(d => [d.inflow, d.outflow])) * 1.22;
  const slot = cW / data.length;
  const innerGap = slot * 0.08;
  const outerGap = slot * 0.14;
  const bW = (slot - outerGap * 2 - innerGap) / 2;
  const base = PT + cH;
  const fmt = v => compact
    ? (v === 0 ? '0' : `${Math.round(v / 1_000_000)}M`)
    : new Intl.NumberFormat('de-DE').format(Math.round(v));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {[0, 0.33, 0.67, 1].map(p => (
        <line key={p} x1={PL} y1={PT + cH * (1 - p)} x2={W - PR} y2={PT + cH * (1 - p)}
          stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const slotX = PL + slot * i;
        const xIn  = slotX + outerGap;
        const xOut = slotX + outerGap + bW + innerGap;
        const inH  = maxV ? (d.inflow  / maxV) * cH : 0;
        const outH = maxV ? (d.outflow / maxV) * cH : 0;
        return (
          <g key={i}>
            {d.inflow  > 0 && <rect x={xIn}  y={base - inH}  width={bW} height={inH}  rx="3" fill={ORA} />}
            {d.outflow > 0 && <rect x={xOut} y={base - outH} width={bW} height={outH} rx="3" fill={RED} opacity="0.82" />}
            <text x={slotX + slot / 2} y={H - Math.round(pb * 0.2)} textAnchor="middle" fontSize={fxSz}
              fill={TEXT4} fontFamily="Poppins,sans-serif">{d.label}</text>
          </g>
        );
      })}
      {[0, 0.33, 0.67, 1].map(p => (
        <text key={p} x={PL - 4} y={PT + cH * (1 - p) + 3} textAnchor="end"
          fontSize={fySz} fill={TEXT4} fontFamily="Poppins,sans-serif">
          {fmt(maxV * p)}
        </text>
      ))}
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

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'financiacion',   line1: 'Dashboard de', line2: 'Financiación',   Icon: TrendingUp, iconBg: '#FFF3E0', iconColor: ORA   },
  { id: 'medioambiental', line1: 'Dashboard',    line2: 'Medioambiental', Icon: TreePine,   iconBg: '#E3F4EA', iconColor: GREEN },
];

// ── Datos Financiación ────────────────────────────────────────────────────────
const DISPONIBLE           = 81_000_000;
const LIMITE               = 231_000_000;
const USADO                = 150_000_000;
const CONTRATOS_ACTIVOS    = 2;
const TREND_DIA            = '4.12%';
const SCORE                = 82;
const ALERTAS_COUNT        = 1;
const FACTURAS_TOTAL_COUNT = 42;
const FACTURAS_TOTAL_MONTO = 102_500_000;
const VENCIMIENTOS_COUNT   = 4;
const PROXIMO_MONTO        = 28_700_000;
const NUEVOS_CONTRATOS     = 6;
const NUEVOS_PROVEEDORES   = 3;
const PENDIENTE_PAGO_COUNT = 7;
const PENDIENTE_PAGO_XAF   = 32_500_000;
const SOLICITUDES_PEND     = 5;
const SOLICITUDES_XAF      = 44_000_000;


const evolucionData = [
  { label: 'Feb', aprobada: 185, utilizado:  82, disponible: 128 },
  { label: 'Mar', aprobada: 202, utilizado: 158, disponible:  62 },
  { label: 'Abr', aprobada: 218, utilizado: 112, disponible: 118 },
  { label: 'May', aprobada: 208, utilizado: 170, disponible:  52 },
  { label: 'Jun', aprobada: 226, utilizado: 138, disponible:  98 },
  { label: 'Jul', aprobada: 231, utilizado: 150, disponible:  81 },
];

const evolucionSeries = [
  { key: 'aprobada',   color: RED,   label: 'Financiación Aprobada' },
  { key: 'utilizado',  color: ORA,   label: 'Crédito Utilizado'     },
  { key: 'disponible', color: GREEN, label: 'Disponible'            },
];

const flujoData = [
  { label: 'Sem 1', inflow: 42_000_000, outflow: 18_000_000 },
  { label: 'Sem 2', inflow: 25_000_000, outflow: 33_000_000 },
  { label: 'Sem 3', inflow: 38_000_000, outflow: 14_000_000 },
  { label: 'Sem 4', inflow: 16_000_000, outflow: 29_000_000 },
  { label: 'Sem 5', inflow: 48_000_000, outflow: 21_000_000 },
  { label: 'Sem 6', inflow: 35_000_000, outflow: 12_000_000 },
];

const riesgoOps = [
  { label: 'Bajo',    pct: 64, color: GREEN },
  { label: 'Medio',   pct: 23, color: WARN  },
  { label: 'Alto',    pct: 10, color: ORA   },
  { label: 'Crítico', pct:  3, color: ERR   },
];

// ── Datos Medioambiental ──────────────────────────────────────────────────────
const envKpis = [
  { value: '8',         label: 'Proyectos registrados', sub: 'Total registrado',          Icon: TreePine,    iconBg: '#E3F4EA', iconColor: GREEN, trend: '+2',      tUp: true  },
  { value: '5',         label: 'Proyectos activos',     sub: 'En ejecución actualmente',  Icon: CheckCircle, iconBg: '#FFF3E0', iconColor: ORA,   trend: 'Estable', tUp: null  },
  { value: '3',         label: 'Proyectos financiados', sub: 'Con financiación aprobada', Icon: CreditCard,  iconBg: '#FDEEEB', iconColor: RED,   trend: '+1',      tUp: true  },
  { value: '12.450 t',  label: 'Captura potencial CO₂', sub: 'Toneladas CO₂ potencial',  Icon: Wind,        iconBg: '#E3F4EA', iconColor: GREEN, trend: '+8%',     tUp: true  },
  { value: 'Medio',     label: 'Riesgo ambiental',      sub: 'Clasificación global',      Icon: Shield,      iconBg: '#FDF6E8', iconColor: WARN,  trend: 'Estable', tUp: null  },
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
  { nombre: 'Reforestación Bata Norte', estado: 'En ejecución', riesgo: 'Bajo',  fin: '45.000.000 XAF' },
  { nombre: 'Agro Sierra Sur',          estado: 'En ejecución', riesgo: 'Medio', fin: '28.000.000 XAF' },
  { nombre: 'Energía Solar Malabo',     estado: 'Planificado',  riesgo: 'Bajo',  fin: '62.000.000 XAF' },
  { nombre: 'Gestión Residuos Bata',    estado: 'Finalizado',   riesgo: 'Bajo',  fin: '18.000.000 XAF' },
  { nombre: 'Reforestación Ebebiyín',   estado: 'Planificado',  riesgo: 'Medio', fin: '35.000.000 XAF' },
];

const estadoBadge = (e) => e === 'En ejecución' ? 'blue' : e === 'Planificado' ? 'orange' : e === 'Finalizado' ? 'green' : 'yellow';
const riesgoBadge = (r) => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';

// ── Componente principal ──────────────────────────────────────────────────────
export default function EpHome() {
  const { go } = useApp();
  const [tab, setTab] = useState('financiacion');
  const pctUsado      = Math.round((USADO  / LIMITE) * 100);
  const pctDisponible = 100 - pctUsado;

  return (
    <AppShell active="epHome" role="empresa-pequena" title="Inicio" sub="Mi Panel">
      <div className="fade-in space-y-4">

        {/* Header + Tab nav ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 self-center">
            <div className="min-w-0">
              <div className="text-[13px] text-text-4 leading-tight sm:hidden">Bienvenido,</div>
              <div className="text-[20px] font-bold text-text-1 truncate">
                <span className="hidden sm:inline">Bienvenido, </span>Construcciones Silva
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-[8px]" style={{ background: '#E3F4EA', color: GREEN, border: '1px solid #A8D5BE' }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: GREEN }} />
                Verde
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-[8px]" style={{ background: '#E3F4EA', color: GREEN, border: '1px solid #A8D5BE' }}>
                <Leaf className="w-3.5 h-3.5" />
                Verde Bonafide
              </span>
            </div>
          </div>
          <div className="hidden sm:flex gap-1 bg-page-bg p-1 rounded-xl">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  tab === t.id ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
                }`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-opacity"
                     style={{ background: t.iconBg, opacity: tab === t.id ? 1 : 0.55 }}>
                  <t.Icon className="w-4 h-4" style={{ color: t.iconColor }} />
                </div>
                {t.line1} {t.line2}
              </button>
            ))}
          </div>
        </div>

        {/* Tab nav móvil */}
        <div className="flex sm:hidden gap-1 bg-page-bg p-1 rounded-xl w-full">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer text-center ${
                tab === t.id ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
              }`}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
                   style={{ background: t.iconBg, opacity: tab === t.id ? 1 : 0.55 }}>
                <t.Icon className="w-5 h-5" style={{ color: t.iconColor }} />
              </div>
              <span className="leading-[1.25]">
                <span className="block">{t.line1}</span>
                <span className="block">{t.line2}</span>
              </span>
            </button>
          ))}
        </div>


        {/* ══ PESTAÑA FINANCIACIÓN ══════════════════════════════════════════════ */}
        {tab === 'financiacion' && (
          <div key="financiacion" className="fade-in space-y-4">

            {/* ── Fila 1: mismo grid de 4 cols que fila 2 — Hero ocupa 3, Score ocupa 1 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">

              {/* Hero — Mi Billetera (3 columnas) */}
              <div className="lg:col-span-3 card-lift bg-white rounded-[18px] border border-border p-5 pb-3 sm:p-6 sm:pb-4 flex flex-col">
                <div className="flex flex-col md:flex-row md:items-stretch gap-5 flex-1">

                  {/* Izquierda: título + cifra principal + (desktop) CTAs + indicadores */}
                  <div className="flex-1 min-w-0 flex flex-col justify-around">
                    {/* Bloque superior */}
                    <div>
                      <p className="text-[18px] font-semibold uppercase tracking-[1.2px] mb-2" style={{ color: TEXT4 }}>
                        MI BILLETERA
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-text-1 leading-none"
                              style={{ fontSize: 'clamp(26px, 3.5vw, 36px)' }}>
                          {new Intl.NumberFormat('de-DE').format(LIMITE)}
                        </span>
                        <span className="text-[13px] font-semibold" style={{ color: TEXT4 }}>XAF</span>
                      </div>
                    </div>

                    {/* Bloque inferior — CTAs + indicadores, solo desktop */}
                    <div className="hidden md:block">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] font-bold text-[12px] text-white cursor-pointer transition-opacity hover:opacity-90"
                                style={{ background: ORA }}>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Solicitar Nuevo Contrato
                        </button>
                        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] font-semibold text-[12px] text-text-3 cursor-pointer transition-colors hover:bg-page-bg border border-border">
                          <Download className="w-3.5 h-3.5" />
                          Descargar Estado de Cuenta
                        </button>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-[6px]"
                              style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORA }} />
                          {CONTRATOS_ACTIVOS} contratos activos
                        </span>
                        <span className="text-[11px] font-semibold" style={{ color: ORA }}>
                          ▲ {TREND_DIA} al día anterior
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Donut + leyenda al lado */}
                  <div className="flex flex-row items-center gap-4 shrink-0 self-center md:self-auto">
                    <DonutChart
                      data={[
                        { pct: pctUsado,      gradient: true, color: RED },
                        { pct: pctDisponible, color: DONUT_EMPTY         },
                      ]}
                      centerLabel={`${pctDisponible}%`}
                      centerSub="DISPONIBLE"
                      size={175}
                      inner={60}
                    />
                    {/* Leyenda vertical */}
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: GRAD }} />
                          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Utilizado</span>
                        </div>
                        <p className="text-[12px] font-extrabold text-text-1">
                          {new Intl.NumberFormat('de-DE').format(USADO)} XAF
                        </p>
                        <p className="text-[10px]" style={{ color: TEXT4 }}>{pctUsado}%</p>
                      </div>
                      <div className="h-px w-full bg-border" />
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: DONUT_EMPTY }} />
                          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Disponible</span>
                        </div>
                        <p className="text-[12px] font-extrabold" style={{ color: ORA }}>
                          {new Intl.NumberFormat('de-DE').format(DISPONIBLE)} XAF
                        </p>
                        <p className="text-[10px]" style={{ color: TEXT4 }}>{pctDisponible}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Móvil: botones icono + indicadores al final */}
                <div className="flex md:hidden items-center justify-between gap-3 mt-4 pt-3 border-t border-border">
                  <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-[9px] flex items-center justify-center text-white cursor-pointer transition-opacity hover:opacity-90"
                            style={{ background: ORA }}>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-[9px] flex items-center justify-center text-text-3 cursor-pointer transition-colors hover:bg-page-bg border border-border">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-[5px]"
                          style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                      <div className="w-1 h-1 rounded-full" style={{ background: ORA }} />
                      {CONTRATOS_ACTIVOS} activos
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color: ORA }}>▲ {TREND_DIA}</span>
                  </div>
                </div>
              </div>

              {/* Score Crediticio con Gauge */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-5 flex flex-col items-center justify-between gap-2">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide self-start">Score Crediticio</p>
                <Gauge score={SCORE} size={220} />
              </div>
            </div>

            {/* ── Fila 2: Nuevos Contratos + Nuevos Proveedores + Facturas Finalizadas + Pendiente de Pago ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Nuevos Contratos — naranja marca */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-4 flex flex-col">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2 min-h-[2.4rem]">Nuevos Contratos</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                    <FilePlus className="w-6 h-6" style={{ color: ORA }} />
                  </div>
                  <p className="text-[28px] font-extrabold leading-none text-text-1">{NUEVOS_CONTRATOS}</p>
                </div>
                <p className="text-[10px] flex-1" style={{ color: TEXT4 }}>firmados este mes</p>
                <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition mt-3"
                        style={{ color: ORA }}>
                  Ver contratos <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Nuevos Proveedores — gris marca */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-4 flex flex-col">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2 min-h-[2.4rem]">Nuevos Proveedores</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#ECEAE7' }}>
                    <Users className="w-6 h-6" style={{ color: '#5B5B5F' }} />
                  </div>
                  <p className="text-[28px] font-extrabold leading-none text-text-1">{NUEVOS_PROVEEDORES}</p>
                </div>
                <p className="text-[10px] flex-1" style={{ color: TEXT4 }}>incorporados este mes</p>
                <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition mt-3"
                        style={{ color: ORA }}>
                  Ver proveedores <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Facturas Finalizadas — verde éxito */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-4 flex flex-col">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2 min-h-[2.4rem]">Facturas Finalizadas</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#E3F4EA' }}>
                    <FileCheck className="w-6 h-6" style={{ color: GREEN }} />
                  </div>
                  <p className="text-[28px] font-extrabold leading-none text-text-1">{FACTURAS_TOTAL_COUNT}</p>
                </div>
                <p className="text-[10px] flex-1" style={{ color: TEXT4 }}>
                  {new Intl.NumberFormat('de-DE').format(FACTURAS_TOTAL_MONTO)} XAF
                </p>
                <button onClick={() => go('epFacturacion')}
                  className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition mt-3"
                  style={{ color: ORA }}>
                  Ver facturas <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pendiente de Pago — rojo error */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-4 flex flex-col">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2 min-h-[2.4rem]">Pendiente de Pago</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FDEEEB' }}>
                    <CreditCard className="w-6 h-6" style={{ color: ERR }} />
                  </div>
                  <p className="text-[28px] font-extrabold leading-none text-text-1">{PENDIENTE_PAGO_COUNT}</p>
                </div>
                <p className="text-[10px] flex-1" style={{ color: TEXT4 }}>
                  {new Intl.NumberFormat('de-DE').format(PENDIENTE_PAGO_XAF)} XAF por liquidar
                </p>
                <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition mt-3"
                        style={{ color: ORA }}>
                  Ver pagos <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Evolución Financiera + Flujo Financiero — 50/50 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <div className="card-lift bg-white rounded-[14px] border border-border overflow-hidden pb-3">
                <div className="flex flex-wrap justify-between items-start gap-3 px-4 pt-4 pb-2">
                  <div>
                    <p className="text-[13px] font-bold text-text-1">Evolución Financiera</p>
                    <p className="text-[11px] text-text-4">Últimos 6 meses<span className="hidden md:inline"> · XAF</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                    {evolucionSeries.map(s => (
                      <div key={s.key} className="flex items-center gap-1.5">
                        <div className="w-6 h-[2px] rounded-full" style={{ background: s.color }} />
                        <span className="text-[10px] text-text-4">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Desktop */}
                <div className="hidden md:block h-[260px] w-full">
                  <LineChart data={evolucionData} series={evolucionSeries} h={260} />
                </div>
                {/* Móvil */}
                <div className="block md:hidden h-[360px] w-full">
                  <LineChart data={evolucionData} series={evolucionSeries} h={360}
                    vbW={420} pl={50} pr={14} pt={18} pb={38} fxSz={14} fySz={13} compact />
                </div>
                <p className="block md:hidden text-[10px] text-center pb-2" style={{ color: TEXT4 }}>
                  Valores expresados en millones XAF
                </p>
              </div>

              <div className="card-lift bg-white rounded-[14px] border border-border overflow-hidden pb-3">
                <div className="flex flex-wrap justify-between items-start gap-3 px-4 pt-4 pb-2">
                  <div>
                    <p className="text-[13px] font-bold text-text-1">Flujo Financiero</p>
                    <p className="text-[11px] text-text-4">Últimas 4 semanas<span className="hidden md:inline"> · XAF</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: ORA }} />
                      <span className="text-[10px] text-text-4">Entradas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: RED, opacity: 0.82 }} />
                      <span className="text-[10px] text-text-4">Salidas</span>
                    </div>
                  </div>
                </div>
                {/* Desktop */}
                <div className="hidden md:block h-[260px] w-full">
                  <GroupedBarChart data={flujoData} h={260} />
                </div>
                {/* Móvil */}
                <div className="block md:hidden h-[360px] w-full">
                  <GroupedBarChart data={flujoData} h={360}
                    vbW={420} pl={50} pr={8} pt={18} pb={38} fxSz={14} fySz={13} compact />
                </div>
                <p className="block md:hidden text-[10px] text-center pb-2" style={{ color: TEXT4 }}>
                  Valores expresados en millones XAF
                </p>
              </div>

            </div>

            {/* ── Fila 3: Riesgo (2 cols) + Solicitudes + Próximos + Alertas ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

              {/* Riesgo de Operaciones — col-span-2, amarillo advertencia */}
              <div className="col-span-2 card-lift bg-white rounded-[14px] border border-border p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FDF6E8' }}>
                    <Shield className="w-6 h-6" style={{ color: WARN }} />
                  </div>
                  <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">Riesgo de Operaciones</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  {riesgoOps.map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-medium text-text-2">{r.label}</span>
                        <span className="text-[10px] font-bold tabular-nums" style={{ color: r.color }}>{r.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: BORDER }}>
                        <div className="h-full rounded-full transition-all"
                             style={{ background: r.color, width: `${r.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solicitudes Pendientes — naranja marca */}
              <div className="col-span-2 lg:col-span-1 card-lift bg-white rounded-[14px] border border-border p-4">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-3">Solicitudes Pendientes</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                    <Clock className="w-6 h-6" style={{ color: ORA }} />
                  </div>
                  <p className="text-[28px] font-extrabold leading-none text-text-1">{SOLICITUDES_PEND}</p>
                </div>
                <p className="text-[10px] mb-3" style={{ color: TEXT4 }}>
                  {new Intl.NumberFormat('de-DE').format(SOLICITUDES_XAF)} XAF
                </p>
                <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition self-end md:self-start"
                        style={{ color: ORA }}>
                  Ver solicitudes <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Próximos Vencimientos — amarillo proceso */}
              <div className="col-span-2 lg:col-span-1 card-lift bg-white rounded-[14px] border border-border p-4">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-3">Próximos Vencimientos</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FDF6E8' }}>
                    <Calendar className="w-6 h-6" style={{ color: WARN }} />
                  </div>
                  <p className="text-[28px] font-extrabold leading-none text-text-1">{VENCIMIENTOS_COUNT}</p>
                </div>
                <p className="text-[10px] mb-3" style={{ color: TEXT4 }}>
                  próximo en {new Intl.NumberFormat('de-DE').format(PROXIMO_MONTO)} XAF
                </p>
                <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition self-end md:self-start"
                        style={{ color: ORA }}>
                  Ver vencimientos <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Alertas — naranja marca con badge */}
              <div className="col-span-2 lg:col-span-1 card-lift bg-white rounded-[14px] border border-border p-4">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-3">Alertas</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                    <Bell className="w-6 h-6" style={{ color: ORA }} />
                  </div>
                  <p className="text-[28px] font-extrabold leading-none text-text-1">{ALERTAS_COUNT}</p>
                </div>
                <p className="text-[11px] text-text-4 mb-3">Operaciones requieren atención</p>
                <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition self-end md:self-start"
                        style={{ color: ORA }}>
                  Ver alertas <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}


        {/* ══ PESTAÑA MEDIOAMBIENTAL ════════════════════════════════════════════ */}
        {tab === 'medioambiental' && (
          <div key="medioambiental" className="fade-in space-y-5">

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {envKpis.map(({ value, label, sub, Icon, iconBg, iconColor, trend, tUp }) => (
                <div key={label} className="card-lift bg-white rounded-[14px] border border-border p-4">
                  <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-3 leading-tight">{label}</p>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                      <Icon className="w-5 h-5" style={{ color: iconColor }} />
                    </div>
                    <p className="font-extrabold leading-none text-text-1" style={{ fontSize: value.length > 4 ? '16px' : '24px' }}>{value}</p>
                  </div>
                  <p className="text-[10px] mb-2.5" style={{ color: TEXT4 }}>{sub}</p>
                  <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    tUp === true  ? 'bg-green-bg text-green-text' :
                    tUp === false ? 'bg-red-bg text-red-text'     :
                    'bg-orange-tint text-orange'
                  }`}>{trend}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 card-lift bg-white rounded-[14px] border border-border p-5 flex flex-col">
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

              <div className="lg:col-span-3 card-lift bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-4">
                  <div className="text-[14px] font-bold text-text-1">Proyectos por categoría</div>
                  <div className="text-[11px] text-text-4">Distribución por tipo de proyecto</div>
                </div>
                <div className="flex-1 min-h-[180px]">
                  <VBarChart id="pyme-env" data={catBarData} h={170} />
                </div>
              </div>
            </div>

            <div className="card-lift bg-white rounded-[14px] border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-[14px] font-bold text-text-1">Proyectos</div>
                  <div className="text-[11px] text-text-4">Todos tus proyectos medioambientales</div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-[6px]"
                     style={{ background: '#E3F4EA', color: GREEN }}>
                  <TreePine className="w-3.5 h-3.5" />
                  8 registrados
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
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-[8px]" style={{ background: '#E3F4EA', color: GREEN, border: '1px solid #A8D5BE' }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: GREEN }} />
            Verde
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-[8px]" style={{ background: '#E3F4EA', color: GREEN, border: '1px solid #A8D5BE' }}>
            <Leaf className="w-3.5 h-3.5" />
            Verde Bonafide
          </span>
        </div>

      </div>
    </AppShell>
  );
}
