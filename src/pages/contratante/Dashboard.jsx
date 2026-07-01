import { useState } from 'react';
import { Wallet, Leaf, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

// ── MIC v1.0 Color palette ────────────────────────────────────────────────────
const GRAD  = 'linear-gradient(135deg, #E0201C 0%, #EF7A2C 100%)';
const RED   = '#E0201C';
const ORA   = '#EF7A2C';
const GREEN = '#2E7D5B';
const WARN  = '#C68A1D';
const ERR   = '#B8352A';
const BORDER = '#ECEAE7';
const TEXT4  = '#A9A6A1';
const WALLET_SHADOW = '0 8px 24px -4px rgba(224,32,28,0.35), 0 4px 12px rgba(239,122,44,0.2)';

const fmt = (v) => `${new Intl.NumberFormat('fr-FR').format(Number(v) || 0)} XAF`;

// ── Shared chart helpers ──────────────────────────────────────────────────────
function bezierLine(pts) {
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

function LineChart({ id, data, color = ORA, xKey = 'mes', yKey = 'monto', unit = 'M', h = 180 }) {
  const W = 500, H = h, PL = 48, PR = 20, PT = 24, PB = 34;
  const cW = W - PL - PR, cH = H - PT - PB;
  const vals = data.map(d => d[yKey]);
  const maxV = Math.max(...vals) * 1.18;
  const pts = data.map((d, i) => [PL + (i / (data.length - 1)) * cW, PT + cH - (d[yKey] / maxV) * cH]);
  const linePath = bezierLine(pts);
  const areaPath = `${linePath} L${pts[pts.length - 1][0]},${PT + cH} L${pts[0][0]},${PT + cH}Z`;
  const gId = `lg-${id}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <line key={p} x1={PL} y1={PT + cH * (1 - p)} x2={W - PR} y2={PT + cH * (1 - p)} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill={`url(#${gId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill={color} stroke="white" strokeWidth="2.5" />
          <text x={x} y={y - 12} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={color} fontFamily="Poppins,sans-serif">{data[i][yKey]}{unit}</text>
        </g>
      ))}
      {data.map((d, i) => (
        <text key={i} x={PL + (i / (data.length - 1)) * cW} y={H - 10} textAnchor="middle" fontSize="10" fill={TEXT4} fontFamily="Poppins,sans-serif">{d[xKey]}</text>
      ))}
      {[0, 0.5, 1].map(p => (
        <text key={p} x={PL - 5} y={PT + cH * (1 - p) + 4} textAnchor="end" fontSize="9" fill={TEXT4} fontFamily="Poppins,sans-serif">{Math.round(maxV * p)}{unit}</text>
      ))}
    </svg>
  );
}

function DonutChart({ data, centerLabel, centerSub, size = 130 }) {
  const r = 40, cx = 55, cy = 55, circ = 2 * Math.PI * r;
  let acc = 0;
  const segs = data.map(d => {
    const dash = (d.pct / 100) * circ; const s = { ...d, dash, off: -acc }; acc += dash; return s;
  });
  return (
    <svg viewBox="0 0 110 110" style={{ width: size, height: size, flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={BORDER} strokeWidth="13" />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="13"
          strokeDasharray={`${s.dash} ${circ - s.dash}`} strokeDashoffset={s.off} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      ))}
      {centerLabel && <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="800" fill="#26262B" fontFamily="Poppins,sans-serif">{centerLabel}</text>}
      {centerSub && <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9" fill={TEXT4} fontFamily="Poppins,sans-serif">{centerSub}</text>}
    </svg>
  );
}

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
        <line key={p} x1={PL} y1={PT + cH * (1 - p)} x2={W - PR} y2={PT + cH * (1 - p)} stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const x = PL + slot * i + (slot - bW) / 2;
        const bH = (d.value / maxV) * cH;
        const y = PT + cH - bH;
        const fill = d.color ?? `url(#${gId})`;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bW} height={bH} rx="5" fill={fill} opacity="0.88" />
            <text x={x + bW / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill={d.color ?? ORA} fontFamily="Poppins,sans-serif">{d.value}</text>
            <text x={x + bW / 2} y={H - 10} textAnchor="middle" fontSize="9" fill={TEXT4} fontFamily="Poppins,sans-serif">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

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
            <div className="h-full rounded-full" style={{ width: `${(d.value / maxVal) * 100}%`, background: d.color ?? RED }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'fondos',         line1: 'Dashboard de', line2: 'Fondos y PYMEs', Icon: Wallet },
  { id: 'medioambiental', line1: 'Dashboard',    line2: 'Medioambiental', Icon: Leaf   },
];

// ── Fondos tab data ───────────────────────────────────────────────────────────
const fondosKpis = [
  { value: '5',      label: 'PYMEs activas',      sub: 'Beneficiarias activas',   cls: 'text-green-text', trend: '+1',      tUp: true  },
  { value: '4',      label: 'Operaciones activas', sub: 'Operaciones abiertas',    cls: 'text-text-1',     trend: 'Estable', tUp: null  },
  { value: '3 días', label: 'Próx. vencimiento',  sub: 'FAC-2026-0911',           cls: 'text-yellow-text',trend: 'Urgente', tUp: false },
  { value: '2',      label: 'Proy. ambientales',  sub: 'Proyectos activos',       cls: 'text-green-text', trend: '+1',      tUp: true  },
];

const fondoDona = [
  { tipo: 'Utilizado',  pct: 60, color: RED,   monto: '300 000 000 XAF' },
  { tipo: 'Disponible', pct: 40, color: GREEN,  monto: '200 000 000 XAF' },
];

const pymeDist = [
  { label: 'Const. Silva Ltd.',  value: 90 },
  { label: 'TechBata PYME S.L.', value: 75 },
  { label: 'AgriEco PYME',       value: 65 },
  { label: 'LogiGE S.A.',        value: 45 },
  { label: 'ServLog GE',         value: 25 },
];

const factoringAlertas = [
  { tipo: 'error',   Icon: AlertTriangle, titulo: 'Factura FAC-2026-0819 vencida',
    detalle: 'Const. Silva · 8 200 000 XAF · Venció 10/05/26' },
  { tipo: 'error',   Icon: AlertTriangle, titulo: 'Factura FAC-2026-0774 vencida',
    detalle: 'AgriEco PYME · 3 400 000 XAF · Venció 08/05/26' },
  { tipo: 'warning', Icon: Clock,         titulo: 'FAC-2026-0911 vence en 3 días',
    detalle: 'LogiGE S.A. · 12 100 000 XAF · Vence 15/05/26' },
];

const tipoCfg = {
  error:   { bg: 'bg-red-bg',    border: 'border-red-text/20',    icon: 'text-red-text'    },
  warning: { bg: 'bg-yellow-bg', border: 'border-yellow-text/20', icon: 'text-yellow-text' },
  info:    { bg: 'bg-blue-bg',   border: 'border-blue-text/20',   icon: 'text-blue-text'   },
};

const riesgos = [
  { color: GREEN, lbl: 'Verde — Bajo Riesgo', pct: '67%', tc: GREEN, cnt: '12 prov.', dash: '184 92',  offset: 0    },
  { color: WARN,  lbl: 'Amarillo — Medio',    pct: '22%', tc: WARN,  cnt: '4 prov.',  dash: '61 215',  offset: -184 },
  { color: ERR,   lbl: 'Rojo — Alto Riesgo',  pct: '11%', tc: ERR,   cnt: '2 prov.',  dash: '31 245',  offset: -245 },
];

const fondoEvol = [
  { mes: 'Ene', util: 0   },
  { mes: 'Feb', util: 20  },
  { mes: 'Mar', util: 50  },
  { mes: 'Abr', util: 90  },
  { mes: 'May', util: 130 },
  { mes: 'Jun', util: 160 },
];

const pymeTable = [
  { nombre: 'Const. Silva Ltd.',  asignado: 90000000, utilizado: 45000000, disponible: 45000000 },
  { nombre: 'TechBata PYME S.L.', asignado: 75000000, utilizado: 31000000, disponible: 44000000 },
  { nombre: 'AgriEco PYME',       asignado: 65000000, utilizado: 56000000, disponible: 9000000  },
  { nombre: 'LogiGE S.A.',        asignado: 45000000, utilizado: 28000000, disponible: 17000000 },
  { nombre: 'ServLog GE',         asignado: 25000000, utilizado: 12000000, disponible: 13000000 },
];

// ── Medioambiental tab data ───────────────────────────────────────────────────
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


// ── Component ─────────────────────────────────────────────────────────────────
export default function EmpDash() {
  const { go } = useApp();
  const [tab, setTab] = useState('fondos');

  return (
    <AppShell active="empDash" role="contratante">
      <div className="fade-in space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
          <div className="min-w-0">
            <div className="text-[13px] text-text-4 leading-tight sm:hidden">Buenos días,</div>
            <div className="text-[20px] font-bold text-text-1 truncate">
              <span className="hidden sm:inline">Buenos días, </span>TotalEnerGE 👋
            </div>
            <div className="text-[13px] text-text-4">Gestión de fondo y cadena de suministro · Junio 2026</div>
          </div>
          <Button variant="primary" size="sm" onClick={() => go('empConf')}>
            + Nueva Solicitud
          </Button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-page-bg p-1 rounded-xl w-full sm:w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 sm:flex-none flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer text-center ${
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

        {/* ── FONDOS TAB ──────────────────────────────────────────────────── */}
        {tab === 'fondos' && (
          <div key="fondos" className="fade-in space-y-5">

            {/* Mi Billetera */}
            <div className="rounded-2xl overflow-hidden relative" style={{ background: GRAD, boxShadow: WALLET_SHADOW }}>
              <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute right-10 -bottom-8 w-28 h-28 rounded-full bg-white/[0.08] pointer-events-none" />
              <div className="relative px-6 py-5 sm:py-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider">Mi Billetera</p>
                    <p className="text-white text-[14px] font-semibold mt-0.5">TotalEnerGE S.A.</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 border border-white/30 rounded-xl px-3 py-1.5 inline-block">
                      <span className="text-white font-extrabold text-[20px] leading-none">720</span>
                      <span className="text-white/70 text-[12px] font-medium ml-1">/ 1000</span>
                    </div>
                    <p className="text-white/60 text-[10px] mt-1">Score Bonafide · Bueno</p>
                  </div>
                </div>
                <div className="mb-1">
                  <p className="text-white/60 text-[11px] mb-1">Fondo comprometido total</p>
                  <p className="text-white font-extrabold leading-none tracking-tight" style={{ fontSize: 'clamp(22px, 5vw, 36px)' }}>
                    500 000 000 <span className="font-bold opacity-75" style={{ fontSize: 'clamp(16px, 3vw, 22px)' }}>XAF</span>
                  </p>
                </div>
                <p className="text-white/40 text-[11px] mt-2">Junio 2026</p>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {fondosKpis.map(({ value, label, sub, cls, trend, tUp }) => (
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

            {/* Row 1: Score Crediticio + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* Score Crediticio 2/5 */}
              <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5">
                <div className="text-[14px] font-bold text-text-1 mb-1">Score Crediticio</div>
                <div className="text-[11px] text-text-4 mb-5">Calificación Bonafide</div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-[140px] h-[72px] overflow-hidden">
                    <svg viewBox="0 0 140 72" className="w-full h-full">
                      <path d="M 12 70 A 58 58 0 0 1 128 70" fill="none" stroke={BORDER} strokeWidth="11" strokeLinecap="round" />
                      <path d="M 12 70 A 58 58 0 0 1 128 70" fill="none" stroke={GREEN} strokeWidth="11" strokeLinecap="round"
                        strokeDasharray="186 258" strokeDashoffset="0" />
                    </svg>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                      <span className="text-[26px] font-extrabold text-text-1 leading-none">720</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-bg text-green-text">Bueno</span>
                    <span className="text-[11px] text-text-4">/ 1 000 pts</span>
                  </div>
                  <div className="w-full grid grid-cols-3 text-center mt-3 border-t border-border pt-3 gap-1">
                    <div>
                      <div className="text-[9px] text-text-4 uppercase tracking-wide mb-0.5">Regular</div>
                      <div className="text-[10px] font-semibold" style={{ color: WARN }}>400–649</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-text-4 uppercase tracking-wide mb-0.5">Bueno</div>
                      <div className="text-[10px] font-semibold" style={{ color: GREEN }}>650–799</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-text-4 uppercase tracking-wide mb-0.5">Excelente</div>
                      <div className="text-[10px] font-semibold" style={{ color: GREEN }}>800+</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donut 3/5 */}
              <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-3">
                  <div className="text-[14px] font-bold text-text-1">Uso del fondo</div>
                  <div className="text-[11px] text-text-4">¿Cuánto he utilizado?</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
                  <DonutChart data={fondoDona} centerLabel="60%" centerSub="utilizado" size={190} />
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 w-full">
                    {fondoDona.map(d => (
                      <div key={d.tipo} className="flex items-start gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: d.color }} />
                        <div>
                          <div className="text-[11px] text-text-2 font-medium">
                            {d.tipo} <span className="font-bold" style={{ color: d.color }}>{d.pct}%</span>
                          </div>
                          <div className="text-[10px] text-text-4">{d.monto}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: HBarChart + Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* HBarChart 3/5 */}
              <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-5">
                  <div className="text-[14px] font-bold text-text-1">Distribución por PYME</div>
                  <div className="text-[11px] text-text-4">¿Quién usa los fondos? · millones XAF</div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <HBarChart data={pymeDist} fmtVal={v => `${v}M XAF`} />
                </div>
              </div>

              {/* Alertas 2/5 */}
              <div className="lg:col-span-2 bg-white rounded-[14px] border border-border flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-bold text-text-1">Alertas de Factoring</div>
                    <div className="text-[11px] text-text-4">Facturas de tus proveedores PYME</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-bg text-red-text shrink-0">2 vencidas</span>
                </div>
                <div className="p-4 flex flex-col gap-2.5 flex-1">
                  {factoringAlertas.map((a, i) => {
                    const cfg = tipoCfg[a.tipo];
                    return (
                      <div key={i} onClick={() => go('empFactEP')}
                        className={`flex items-start gap-3 p-3 rounded-[10px] border cursor-pointer transition-opacity hover:opacity-80 ${cfg.bg} ${cfg.border}`}>
                        <a.Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.icon}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-bold text-text-1 leading-snug">{a.titulo}</div>
                          <div className="text-[11px] text-text-3 mt-0.5 leading-snug">{a.detalle}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-text-5 mt-0.5" />
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 pb-4">
                  <button onClick={() => go('empFactEP')}
                    className="w-full text-center text-[12px] text-orange font-semibold hover:underline cursor-pointer">
                    Ver todas las facturas →
                  </button>
                </div>
              </div>
            </div>

            {/* Row 3: Semáforo + LineChart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Semáforo de Riesgos */}
              <div className="bg-white rounded-[14px] border border-border flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-bold text-text-1">Semáforo de Riesgos</div>
                    <div className="text-[11px] text-text-4">Clasificación de proveedores</div>
                  </div>
                  <button onClick={() => go('empRisk')}
                    className="text-[12px] text-orange font-semibold hover:underline cursor-pointer shrink-0">
                    Ver detalle →
                  </button>
                </div>
                <div className="flex flex-col items-center pt-5 pb-2">
                  <div className="relative w-[120px] h-[120px]">
                    <svg width="120" height="120" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="55" cy="55" r="44" fill="none" stroke={BORDER} strokeWidth="12" />
                      {riesgos.map(r => (
                        <circle key={r.lbl} cx="55" cy="55" r="44" fill="none"
                          stroke={r.color} strokeWidth="12"
                          strokeDasharray={r.dash} strokeDashoffset={r.offset} strokeLinecap="round" />
                      ))}
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <span className="block text-[24px] font-extrabold text-text-1">18</span>
                      <span className="block text-[10px] text-text-4">proveed.</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 flex flex-col gap-0.5">
                  {riesgos.map(r => (
                    <div key={r.lbl} onClick={() => go('empRisk')}
                      className="flex items-center justify-between py-2 px-2 rounded-[8px] hover:bg-page-bg cursor-pointer">
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-text-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: r.color }} />
                        {r.lbl}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold" style={{ color: r.tc }}>{r.pct}</span>
                        <span className="text-[11px] text-text-4">{r.cnt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LineChart */}
              <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-4">
                  <div className="text-[14px] font-bold text-text-1">Evolución del consumo</div>
                  <div className="text-[11px] text-text-4">Velocidad de uso del fondo · millones XAF</div>
                </div>
                <div className="flex-1 min-h-[200px]">
                  <LineChart id="emp-fondos" data={fondoEvol} color={ORA} xKey="mes" yKey="util" unit="M" h={180} />
                </div>
              </div>
            </div>

            {/* Row 4: Tabla PYMEs */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-[14px] font-bold text-text-1">PYMEs beneficiarias</div>
                  <div className="text-[11px] text-text-4">Asignación y disponibilidad</div>
                </div>
                <button onClick={() => go('empRisk')}
                  className="text-[12px] text-orange font-semibold hover:opacity-75 transition cursor-pointer">
                  Ver análisis →
                </button>
              </div>
              {/* Móvil: cards */}
              <div className="sm:hidden space-y-2">
                {pymeTable.map(p => (
                  <div key={p.nombre} onClick={() => go('empRisk')}
                    className="rounded-[12px] border border-border p-3 cursor-pointer hover:bg-page-bg/60 transition-colors">
                    <div className="text-[12px] font-semibold text-text-1 mb-2">{p.nombre}</div>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div>
                        <div className="text-[9px] text-text-4 uppercase tracking-wide mb-0.5">Asignado</div>
                        <div className="text-[10px] font-medium text-text-2">{fmt(p.asignado)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-text-4 uppercase tracking-wide mb-0.5">Utilizado</div>
                        <div className="text-[10px] font-bold text-orange">{fmt(p.utilizado)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-text-4 uppercase tracking-wide mb-0.5">Disponible</div>
                        <div className="text-[10px] font-bold text-green-text">{fmt(p.disponible)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: tabla */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[340px]">
                  <thead>
                    <tr className="border-b border-border">
                      {['PYME', 'Asignado', 'Utilizado', 'Disponible'].map((h, i) => (
                        <th key={h} className={`text-[10px] font-semibold text-text-4 uppercase tracking-wide pb-2.5 ${i === 0 ? 'text-left' : 'text-right'} ${i > 0 ? 'pl-3' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pymeTable.map((p) => (
                      <tr key={p.nombre} onClick={() => go('empRisk')}
                        className="border-b border-border last:border-0 hover:bg-page-bg/60 cursor-pointer transition-colors">
                        <td className="py-2.5 text-[11px] font-semibold text-text-1 pr-2">{p.nombre}</td>
                        <td className="py-2.5 pl-3 text-right text-[11px] text-text-2 font-medium whitespace-nowrap">{fmt(p.asignado)}</td>
                        <td className="py-2.5 pl-3 text-right text-[11px] font-bold text-orange whitespace-nowrap">{fmt(p.utilizado)}</td>
                        <td className="py-2.5 pl-3 text-right text-[11px] font-bold text-green-text whitespace-nowrap">{fmt(p.disponible)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── MEDIOAMBIENTAL TAB ───────────────────────────────────────────── */}
        {tab === 'medioambiental' && (
          <div key="medioambiental" className="fade-in space-y-5">

            <div className="text-[13px] text-text-4 font-medium">Vista de tu empresa</div>

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

            {/* Row 1: DonutChart + VBarChart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* DonutChart 2/5 */}
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

              {/* VBarChart 3/5 */}
              <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-4">
                  <div className="text-[14px] font-bold text-text-1">Proyectos por categoría</div>
                  <div className="text-[11px] text-text-4">Distribución por tipo de proyecto</div>
                </div>
                <div className="flex-1 min-h-[180px]">
                  <VBarChart id="emp-env" data={catBarData} h={170} />
                </div>
              </div>
            </div>

            {/* Row 2: Tabla proyectos */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-[14px] font-bold text-text-1">Proyectos</div>
                  <div className="text-[11px] text-text-4">Todos los proyectos medioambientales</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-green-text" />
                  <span className="text-[11px] font-bold text-green-text">8 registrados</span>
                </div>
              </div>
              {/* Móvil: cards */}
              <div className="sm:hidden space-y-2">
                {proyectos.map((p, i) => (
                  <div key={i} onClick={() => go('empESG')}
                    className="rounded-[12px] border border-border p-3 cursor-pointer hover:bg-page-bg/60 transition-colors">
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
              {/* Desktop: tabla */}
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
                      <td className="py-2.5 pl-3 pr-3">
                        <Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge>
                      </td>
                      <td className="py-2.5 pl-3 pr-3">
                        <Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge>
                      </td>
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
