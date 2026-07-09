import { useState } from 'react';
import {
  TrendingUp, TreePine, Download, ChevronRight, ArrowUpRight,
  CheckCircle, FilePlus, Users, FileCheck, CreditCard, Shield,
  Clock, Calendar, Wind, Wallet
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';

// ── MIC Brand tokens ──────────────────────────────────────────────────────────
const RED         = '#E0201C';
const ORA         = '#EF7A2C';
const GREEN       = '#2E7D5B';
const WARN        = '#C68A1D';
const ERR         = '#B8352A';
const BORDER      = '#ECEAE7';
const TEXT4       = '#A9A6A1';
const DONUT_EMPTY = '#C4C1BC';
const BLUE        = '#3B82F6';

// ── DonutChart ────────────────────────────────────────────────────────────────
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
        <linearGradient id="donut-grad-ct" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={RED} />
          <stop offset="100%" stopColor={ORA} />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={inner} fill="none" stroke={BORDER} strokeWidth={sw} />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={inner} fill="none"
          stroke={s.gradient ? 'url(#donut-grad-ct)' : s.color}
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

// ── Gauge — Score Crediticio ──────────────────────────────────────────────────
function Gauge({ score = 82, size = 190 }) {
  const W = 200, H = 165;
  const cx = 100, cy = 100, r = 80, sw = 16;
  const deg2rad = d => d * Math.PI / 180;
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
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
        fill="none" stroke={BORDER} strokeWidth={sw} strokeLinecap="butt" />
      {zones.map(([s1, s2, color]) => {
        const [x1, y1] = pt(scoreToAngle(s1));
        const [x2, y2] = pt(scoreToAngle(s2));
        return (
          <path key={s1}
            d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`}
            fill="none" stroke={color} strokeWidth={sw} strokeLinecap="butt" opacity="0.9" />
        );
      })}
      <line x1={cx} y1={cy} x2={nx.toFixed(2)} y2={ny.toFixed(2)}
        stroke="#26262B" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#26262B" />
      <text x={cx} y={cy + 32} textAnchor="middle" fontSize="27" fontWeight="800"
        fill="#26262B" fontFamily="Poppins,sans-serif">{score}</text>
      <text x={cx} y={cy + 50} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={zoneColor} fontFamily="Poppins,sans-serif">Riesgo {zoneLabel}</text>
      <text x={cx - r + 2} y={cy + 15} textAnchor="start" fontSize="9"
        fill={TEXT4} fontFamily="Poppins,sans-serif">0</text>
      <text x={cx + r - 2} y={cy + 15} textAnchor="end" fontSize="9"
        fill={TEXT4} fontFamily="Poppins,sans-serif">100</text>
    </svg>
  );
}

// ── MultiLineChart ────────────────────────────────────────────────────────────
function MultiLineChart({ data, series, h = 180, vbW = 560, pl = 56, pr = 16, pt = 14, pb = 28, fxSz = 11, fySz = 10, compact = false }) {
  const W = vbW, H = h, PL = pl, PR = pr, PT = pt, PB = pb;
  const cW = W - PL - PR, cH = H - PT - PB;
  const allVals = data.flatMap(d => series.map(s => d[s.key] || 0));
  const maxV = Math.max(...allVals) * 1.12;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(maxV * p));
  const xPos = i => PL + (i / (data.length - 1)) * cW;
  const yPos = v => PT + cH - (v / maxV) * cH;

  function bezierPath(pts) {
    if (pts.length < 2) return '';
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i], p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1 = [p1[0] + (p2[0] - p0[0]) / 4, p1[1] + (p2[1] - p0[1]) / 4];
      const cp2 = [p2[0] - (p3[0] - p1[0]) / 4, p2[1] - (p3[1] - p1[1]) / 4];
      d += ` C${cp1[0].toFixed(1)},${cp1[1].toFixed(1)} ${cp2[0].toFixed(1)},${cp2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {yTicks.map(t => (
        <line key={t} x1={PL} y1={yPos(t)} x2={W - PR} y2={yPos(t)}
          stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      ))}
      {series.map((s, si) => {
        const pts = data.map((d, i) => [xPos(i), yPos(d[s.key] || 0)]);
        return (
          <path key={si} d={bezierPath(pts)} fill="none" stroke={s.color}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={xPos(i)} y={H - Math.round(pb * 0.2)} textAnchor="middle"
          fontSize={fxSz} fill={TEXT4} fontFamily="Poppins,sans-serif">{d.label}</text>
      ))}
      {yTicks.map(t => (
        <text key={t} x={PL - 5} y={yPos(t) + 3} textAnchor="end"
          fontSize={fySz} fill={TEXT4} fontFamily="Poppins,sans-serif">
          {compact ? `${t}M` : `${t}M`}
        </text>
      ))}
    </svg>
  );
}

// ── HBarChart ─────────────────────────────────────────────────────────────────
function HBarChart({ data, fmtVal = v => `${v}M` }) {
  const maxVal = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-3.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[12px] font-semibold text-text-2 truncate mr-2">{d.label}</span>
            <span className="text-[12px] font-bold shrink-0" style={{ color: d.color ?? RED }}>{fmtVal(d.value)}</span>
          </div>
          <div className="h-3 bg-page-bg rounded-full overflow-hidden">
            <div className="h-full rounded-full"
              style={{ width: `${(d.value / maxVal) * 100}%`, background: d.color ?? RED }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── VBarChart ─────────────────────────────────────────────────────────────────
function VBarChart({ id, data, h = 170, unit = '' }) {
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
              fill={d.color ?? ORA} fontFamily="Poppins,sans-serif">{d.value}{unit}</text>
            <text x={x + bW / 2} y={H - 10} textAnchor="middle" fontSize="9"
              fill={TEXT4} fontFamily="Poppins,sans-serif">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Tab config ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'fondos',         line1: 'Dashboard de', line2: 'Fondos y PYMEs', Icon: TrendingUp, iconBg: '#FFF3E0', iconColor: ORA   },
  { id: 'medioambiental', line1: 'Dashboard',    line2: 'Medioambiental', Icon: TreePine,   iconBg: '#E3F4EA', iconColor: GREEN },
];

// ── Datos Fondos ──────────────────────────────────────────────────────────────
const FONDO_TOTAL     = 850_000_000;
const FONDO_USADO     = 527_000_000;
const FONDO_DISP      = 323_000_000;
const PCT_USADO       = Math.round((FONDO_USADO / FONDO_TOTAL) * 100);
const PCT_DISP        = 100 - PCT_USADO;
const PYMES_FINANC    = 18;
const CONTRATOS_ACTIV = 26;
const SCORE           = 82;

const fondoDona = [
  { pct: PCT_USADO, gradient: true, color: RED },
  { pct: PCT_DISP,  color: DONUT_EMPTY         },
];

const evolucionFondoData = [
  { label: 'Ene', asignado: 200, disponible: 100, ejecucion: 50  },
  { label: 'Feb', asignado: 380, disponible: 180, ejecucion: 100 },
  { label: 'Mar', asignado: 520, disponible: 240, ejecucion: 160 },
  { label: 'Abr', asignado: 660, disponible: 290, ejecucion: 210 },
  { label: 'May', asignado: 750, disponible: 340, ejecucion: 240 },
  { label: 'Jun', asignado: 810, disponible: 360, ejecucion: 270 },
  { label: 'Jul', asignado: 850, disponible: 323, ejecucion: 290 },
];

const evolucionFondoSeries = [
  { key: 'asignado',   color: RED,   label: 'Fondo Asignado'    },
  { key: 'disponible', color: GREEN, label: 'Fondo Disponible'  },
  { key: 'ejecucion',  color: ORA,   label: 'En Ejecución'      },
];

const pymeDist = [
  { label: 'Const. Silva Ltd.',  value: 90, color: RED   },
  { label: 'TechBata PYME S.L.', value: 75, color: ORA   },
  { label: 'AgriEco PYME',       value: 65, color: WARN  },
  { label: 'LogiGE S.A.',        value: 45, color: GREEN },
  { label: 'ServLog GE',         value: 35, color: BLUE  },
  { label: 'InfraBata S.L.',     value: 25, color: TEXT4 },
];

const estadoOps = [
  { tipo: 'Aprobadas',   pct: 55, count: 14, color: GREEN },
  { tipo: 'En revisión', pct: 23, count: 6,  color: ORA   },
  { tipo: 'Rechazadas',  pct: 12, count: 3,  color: ERR   },
  { tipo: 'Pendientes',  pct: 10, count: 3,  color: TEXT4 },
];

const tipoBarData = [
  { label: 'Construcción',  value: 180, color: RED   },
  { label: 'Agroindustria', value: 120, color: GREEN },
  { label: 'Energía',       value: 90,  color: ORA   },
  { label: 'Servicios',     value: 75,  color: WARN  },
  { label: 'Logística',     value: 60,  color: TEXT4 },
];

const vencimientos = [
  { nombre: 'Const. Silva Ltd.',  fecha: '23 Abr', monto: 28_700_000, urgente: true  },
  { nombre: 'AgriEco PYME',       fecha: '15 May', monto: 14_200_000, urgente: false },
  { nombre: 'TechBata PYME S.L.', fecha: '28 May', monto: 21_500_000, urgente: false },
  { nombre: 'LogiGE S.A.',        fecha: '03 Jun', monto: 8_800_000,  urgente: false },
];

const actividad = [
  { tipo: 'contrato',  Icon: FilePlus,   text: 'Nuevo contrato firmado',         sub: 'CT-2026-0041 · Const. Silva Ltd.',          time: 'Hace 2h' },
  { tipo: 'factura',   Icon: FileCheck,  text: 'Factura FAC-2026-0911 aprobada', sub: 'TechBata PYME · 21.500.000 XAF',            time: 'Hace 4h' },
  { tipo: 'pago',      Icon: CreditCard, text: 'Pago liquidado',                 sub: 'PAG-0284 · AgriEco PYME · 14.200.000 XAF',  time: 'Ayer'    },
  { tipo: 'solicitud', Icon: Clock,      text: 'Nueva solicitud recibida',       sub: 'ServLog GE · 35.000.000 XAF solicitados',   time: 'Ayer'    },
];

const actividadCfg = {
  contrato:  { bg: '#E3F4EA', color: GREEN },
  factura:   { bg: '#EFF6FF', color: BLUE  },
  pago:      { bg: '#E3F4EA', color: GREEN },
  solicitud: { bg: '#FDF6E8', color: WARN  },
};

const bottomKpis = [
  { label: 'Garantías Net',    value: new Intl.NumberFormat('de-DE').format(125_000_000), sub: 'XAF', Icon: Shield,     bg: '#FDF6E8', color: WARN     },
  { label: 'No Proveedores',   value: '26',                                                sub: 'proveedores',            Icon: Users,      bg: '#ECEAE7', color: '#5B5B5F' },
  { label: 'No Contratos',     value: '26',                                                sub: 'contratos',              Icon: FilePlus,   bg: '#FFF3E0', color: ORA      },
  { label: 'Importe Neto',     value: new Intl.NumberFormat('de-DE').format(FONDO_USADO),  sub: 'XAF', Icon: TrendingUp, bg: '#FDEEEB', color: ERR      },
  { label: 'Fondo Disponible', value: new Intl.NumberFormat('de-DE').format(FONDO_DISP),   sub: 'XAF', Icon: Wallet,     bg: '#E3F4EA', color: GREEN    },
];

// ── Medioambiental data ───────────────────────────────────────────────────────
const envKpis = [
  { value: '8',        label: 'Proyectos registrados', sub: 'Total registrado',          Icon: TreePine,    iconBg: '#E3F4EA', iconColor: GREEN, trend: '+2',      tUp: true  },
  { value: '5',        label: 'Proyectos activos',     sub: 'En ejecución actualmente',  Icon: CheckCircle, iconBg: '#FFF3E0', iconColor: ORA,   trend: 'Estable', tUp: null  },
  { value: '3',        label: 'Proyectos financiados', sub: 'Con financiación aprobada', Icon: CreditCard,  iconBg: '#FDEEEB', iconColor: RED,   trend: '+1',      tUp: true  },
  { value: '12 450 t', label: 'Captura potencial CO₂', sub: 'Toneladas CO₂ potencial',  Icon: Wind,        iconBg: '#E3F4EA', iconColor: GREEN, trend: '+8%',     tUp: true  },
  { value: 'Medio',    label: 'Riesgo ambiental',      sub: 'Clasificación global',      Icon: Shield,      iconBg: '#FDF6E8', iconColor: WARN,  trend: 'Estable', tUp: null  },
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

const estadoBadge = e => e === 'En ejecución' ? 'blue' : e === 'Planificado' ? 'orange' : e === 'Finalizado' ? 'green' : 'yellow';
const riesgoBadge = r => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';

// ── Component ─────────────────────────────────────────────────────────────────
export default function EmpDash() {
  const { go } = useApp();
  const [tab, setTab] = useState('fondos');

  return (
    <AppShell active="empDash" role="contratante">
      <div className="fade-in space-y-4">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] text-text-4 leading-tight sm:hidden">Buenos días,</div>
            <div className="text-[20px] font-bold text-text-1 truncate">
              <span className="hidden sm:inline">Buenos días, </span>TotalEnerGE
            </div>
            <div className="text-[13px] text-text-4">Gestión de fondo y cadena de suministro · Julio 2026</div>
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

        {/* ── Tab nav móvil ────────────────────────────────────────────────────── */}
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

        {/* ══ PESTAÑA FONDOS ═══════════════════════════════════════════════════ */}
        {tab === 'fondos' && (
          <div key="fondos" className="fade-in space-y-4">

            {/* ── Hero + Score Crediticio ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
            <div className="lg:col-span-3 card-lift card-enter bg-white rounded-[18px] border border-border p-5 pb-3 sm:p-6 sm:pb-4 flex flex-col">
              <div className="flex flex-col md:flex-row md:items-stretch gap-5 flex-1">

                {/* Izquierda: título + cifra + CTAs + badges */}
                <div className="flex-1 min-w-0 flex flex-col justify-around">
                  <div>
                    <p className="text-[18px] font-semibold uppercase tracking-[1.2px] mb-2" style={{ color: TEXT4 }}>
                      FONDO DE PARTICIPACIÓN
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-text-1 leading-none"
                            style={{ fontSize: 'clamp(26px, 3.5vw, 36px)' }}>
                        {new Intl.NumberFormat('de-DE').format(FONDO_TOTAL)}
                      </span>
                      <span className="text-[13px] font-semibold" style={{ color: TEXT4 }}>XAF</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] font-bold text-[12px] text-white cursor-pointer transition-opacity hover:opacity-90"
                              style={{ background: ORA }}>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Nueva Solicitud
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
                        {CONTRATOS_ACTIV} contratos activos
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-[6px]"
                            style={{ background: '#E3F4EA', color: GREEN, border: '1px solid rgba(46,125,91,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                        {PYMES_FINANC} PYMEs financiadas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Centro: Donut + leyenda */}
                <div className="flex flex-row items-center gap-4 shrink-0 self-center md:self-auto">
                  <DonutChart
                    data={fondoDona}
                    centerLabel={`${PCT_DISP}%`}
                    centerSub="DISPONIBLE"
                    size={175}
                    inner={60}
                  />
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: RED }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Utilizado</span>
                      </div>
                      <p className="text-[12px] font-extrabold text-text-1">
                        {new Intl.NumberFormat('de-DE').format(FONDO_USADO)} XAF
                      </p>
                      <p className="text-[10px]" style={{ color: TEXT4 }}>{PCT_USADO}%</p>
                    </div>
                    <div className="h-px w-full bg-border" />
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: DONUT_EMPTY }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Disponible</span>
                      </div>
                      <p className="text-[12px] font-extrabold" style={{ color: ORA }}>
                        {new Intl.NumberFormat('de-DE').format(FONDO_DISP)} XAF
                      </p>
                      <p className="text-[10px]" style={{ color: TEXT4 }}>{PCT_DISP}%</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Móvil: botones icono + badges */}
              <div className="flex md:hidden items-center justify-between gap-3 mt-4 pt-3 border-t border-border">
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-[9px] flex items-center justify-center text-white cursor-pointer transition-opacity hover:opacity-90"
                          style={{ background: ORA }}>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-[9px] flex items-center justify-center text-text-3 cursor-pointer border border-border hover:bg-page-bg">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-[5px]"
                        style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                    <div className="w-1 h-1 rounded-full" style={{ background: ORA }} />
                    {CONTRATOS_ACTIV} contratos
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-[5px]"
                        style={{ background: '#E3F4EA', color: GREEN, border: '1px solid rgba(46,125,91,0.25)' }}>
                    <div className="w-1 h-1 rounded-full" style={{ background: GREEN }} />
                    {PYMES_FINANC} PYMEs
                  </span>
                </div>
              </div>
            </div>

              {/* Score Crediticio */}
              <div className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col items-center justify-between gap-2">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide self-start">Score Crediticio</p>
                <Gauge score={SCORE} size={220} />
              </div>
            </div>

            {/* ── Evolución del Fondo de Financiación ───────────────────────── */}
            <div className="card-lift card-enter bg-white rounded-[14px] border border-border overflow-hidden pb-3">
              <div className="flex flex-wrap justify-between items-start gap-3 px-4 pt-4 pb-2">
                <div>
                  <p className="text-[13px] font-bold text-text-1">Evolución del Fondo de Financiación</p>
                  <p className="text-[11px] text-text-4">Ene – Jul 2026<span className="hidden md:inline"> · millones XAF</span></p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {evolucionFondoSeries.map(s => (
                    <div key={s.key} className="flex items-center gap-1.5">
                      <div className="w-6 h-[2px] rounded-full" style={{ background: s.color }} />
                      <span className="text-[10px] text-text-4">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden md:block h-[240px] w-full">
                <MultiLineChart data={evolucionFondoData} series={evolucionFondoSeries} h={240} vbW={560} pl={56} />
              </div>
              <div className="block md:hidden h-[320px] w-full">
                <MultiLineChart data={evolucionFondoData} series={evolucionFondoSeries} h={320}
                  vbW={420} pl={48} pr={14} pt={18} pb={38} fxSz={14} fySz={13} compact />
              </div>
              <p className="block md:hidden text-[10px] text-center pb-2" style={{ color: TEXT4 }}>
                Valores expresados en millones XAF
              </p>
            </div>

            {/* ── Distribución por PYME + Estado de Operaciones ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              <div className="lg:col-span-2 card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-5">
                  <p className="text-[13px] font-bold text-text-1">Distribución del Fondo por PYME</p>
                  <p className="text-[11px] text-text-4">¿Quién usa los fondos? · millones XAF</p>
                </div>
                <div className="flex-1">
                  <HBarChart data={pymeDist} fmtVal={v => `${v}M XAF`} />
                </div>
                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-[11px] text-text-4">Total utilizado</span>
                  <span className="text-[12px] font-bold" style={{ color: RED }}>
                    {new Intl.NumberFormat('de-DE').format(FONDO_USADO)} XAF
                  </span>
                </div>
              </div>

              <div className="lg:col-span-3 card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-4">
                  <p className="text-[13px] font-bold text-text-1">Estado de las Operaciones</p>
                  <p className="text-[11px] text-text-4">Distribución por estado · {CONTRATOS_ACTIV} operaciones</p>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
                  <DonutChart
                    data={estadoOps}
                    centerLabel={String(CONTRATOS_ACTIV)}
                    centerSub="operaciones"
                    size={190}
                    inner={62}
                  />
                  <div className="flex flex-col gap-3 w-full max-w-[220px]">
                    {estadoOps.map(d => (
                      <div key={d.tipo}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-[12px] font-semibold text-text-2">{d.tipo}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold" style={{ color: d.color }}>{d.pct}%</span>
                            <span className="text-[10px] text-text-4">({d.count})</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: BORDER }}>
                          <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tipo de Contratante + Próximos Vencimientos ───────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              <div className="lg:col-span-3 card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-4">
                  <p className="text-[13px] font-bold text-text-1">Tipo de Contratante y Financiaciones</p>
                  <p className="text-[11px] text-text-4">Por sector de actividad · millones XAF</p>
                </div>
                <div className="flex-1 min-h-[180px]">
                  <VBarChart id="ct-tipo" data={tipoBarData} h={170} unit="M" />
                </div>
              </div>

              <div className="lg:col-span-2 card-lift card-enter bg-white rounded-[14px] border border-border flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-text-1">Próximos Vencimientos</p>
                    <p className="text-[11px] text-text-4">Próximas 6 semanas</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#FDF6E8', color: WARN }}>
                    <Calendar className="w-3 h-3" />
                    {vencimientos.length} próximos
                  </span>
                </div>
                <div className="flex-1 p-4 space-y-2">
                  {vencimientos.map((v, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-[10px] border ${
                      v.urgente ? 'border-red-text/20' : 'border-border bg-page-bg'
                    }`} style={v.urgente ? { background: '#FFF5F5' } : {}}>
                      <div className="w-10 h-10 rounded-[10px] flex flex-col items-center justify-center shrink-0"
                           style={{ background: v.urgente ? '#FDEEEB' : '#FFF3E0' }}>
                        <span className="text-[9px] font-semibold leading-none" style={{ color: v.urgente ? ERR : WARN }}>
                          {v.fecha.split(' ')[1]}
                        </span>
                        <span className="text-[14px] font-extrabold leading-none mt-0.5" style={{ color: v.urgente ? ERR : WARN }}>
                          {v.fecha.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-text-1 truncate">{v.nombre}</p>
                        <p className="text-[11px]" style={{ color: TEXT4 }}>
                          {new Intl.NumberFormat('de-DE').format(v.monto)} XAF
                        </p>
                      </div>
                      {v.urgente && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                              style={{ background: '#FDEEEB', color: ERR }}>Urgente</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <button className="w-full text-center text-[12px] font-semibold cursor-pointer hover:opacity-75 transition flex items-center justify-center gap-1"
                          style={{ color: ORA }}>
                    Ver todos los vencimientos <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Actividad Reciente ────────────────────────────────────────── */}
            <div className="card-lift card-enter bg-white rounded-[14px] border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-[13px] font-bold text-text-1">Actividad Reciente</p>
                  <p className="text-[11px] text-text-4">Últimas acciones en tu cuenta</p>
                </div>
                <button className="text-[12px] font-semibold cursor-pointer hover:opacity-75 transition flex items-center gap-0.5"
                        style={{ color: ORA }}>
                  Ver todo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actividad.map((a, i) => {
                  const cfg = actividadCfg[a.tipo];
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-[10px] border border-border hover:bg-page-bg/60 transition-colors cursor-pointer">
                      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                           style={{ background: cfg.bg }}>
                        <a.Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-text-1 leading-snug">{a.text}</p>
                        <p className="text-[11px] text-text-3 truncate">{a.sub}</p>
                      </div>
                      <span className="text-[10px] text-text-4 whitespace-nowrap shrink-0">{a.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Bottom KPI strip ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {bottomKpis.map(({ label, value, sub, Icon, bg, color }) => (
                <div key={label} className="card-enter bg-white rounded-[14px] border border-border p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: bg }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide leading-tight">{label}</p>
                  </div>
                  <p className="text-[14px] font-extrabold text-text-1 leading-none">{value}</p>
                  <p className="text-[10px]" style={{ color: TEXT4 }}>{sub}</p>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ══ PESTAÑA MEDIOAMBIENTAL ════════════════════════════════════════════ */}
        {tab === 'medioambiental' && (
          <div key="medioambiental" className="fade-in space-y-5">

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {envKpis.map(({ value, label, sub, Icon, iconBg, iconColor, trend, tUp }) => (
                <div key={label} className="card-lift card-enter bg-white rounded-[14px] border border-border p-4">
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
              <div className="lg:col-span-2 card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col">
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

              <div className="lg:col-span-3 card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-4">
                  <div className="text-[14px] font-bold text-text-1">Proyectos por categoría</div>
                  <div className="text-[11px] text-text-4">Distribución por tipo de proyecto</div>
                </div>
                <div className="flex-1 min-h-[180px]">
                  <VBarChart id="ct-env" data={catBarData} h={170} />
                </div>
              </div>
            </div>

            <div className="card-lift card-enter bg-white rounded-[14px] border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-[14px] font-bold text-text-1">Proyectos</div>
                  <div className="text-[11px] text-text-4">Todos los proyectos medioambientales</div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-[6px]"
                     style={{ background: '#E3F4EA', color: GREEN }}>
                  <TreePine className="w-3.5 h-3.5" />
                  8 registrados
                </div>
              </div>
              <div className="sm:hidden space-y-2">
                {proyectos.map((p, i) => (
                  <div key={i} onClick={() => go('empESG')}
                    className="rounded-[12px] border border-border px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-page-bg/60 transition-colors">
                    <span className="text-[12px] font-medium text-text-1 flex-1 min-w-0 truncate">{p.nombre}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge>
                      <Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge>
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
                    <tr key={i} onClick={() => go('empESG')}
                      className="border-b border-border last:border-0 hover:bg-page-bg/60 cursor-pointer transition-colors">
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

      </div>
    </AppShell>
  );
}
