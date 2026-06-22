import { useState } from 'react';
import { Wallet, Leaf, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const fmt = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;

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

function LineChart({ id, data, color = '#C62828', xKey = 'mes', yKey = 'monto', unit = 'M', h = 180 }) {
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
        <text key={i} x={PL + (i / (data.length - 1)) * cW} y={H - 10} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Poppins,sans-serif">{d[xKey]}</text>
      ))}
      {[0, 0.5, 1].map(p => (
        <text key={p} x={PL - 5} y={PT + cH * (1 - p) + 4} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="Poppins,sans-serif">{Math.round(maxV * p)}{unit}</text>
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
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F0F0" strokeWidth="13" />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="13"
          strokeDasharray={`${s.dash} ${circ - s.dash}`} strokeDashoffset={s.off} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      ))}
      {centerLabel && <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="800" fill="#1a1a1a" fontFamily="Poppins,sans-serif">{centerLabel}</text>}
      {centerSub && <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="Poppins,sans-serif">{centerSub}</text>}
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
          <stop offset="0%" stopColor="#C62828" />
          <stop offset="100%" stopColor="#C62828" stopOpacity="0.55" />
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
            <text x={x + bW / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill={d.color ?? '#C62828'} fontFamily="Poppins,sans-serif">{d.value}</text>
            <text x={x + bW / 2} y={H - 10} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="Poppins,sans-serif">{d.label}</text>
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
            <span className="text-[12px] font-bold shrink-0" style={{ color: d.color ?? '#C62828' }}>{fmtVal(d.value)}</span>
          </div>
          <div className="h-3 bg-page-bg rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(d.value / maxVal) * 100}%`, background: d.color ?? '#C62828' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'fondos',         label: 'Dashboard de Fondos y PYMEs', Icon: Wallet },
  { id: 'medioambiental', label: 'Dashboard Medioambiental',    Icon: Leaf   },
];

// ── Fondos tab data ───────────────────────────────────────────────────────────
const fondosKpis = [
  { value: 'XAF 500M', label: 'Fondo aportado',       sub: 'Capital comprometido',      cls: 'text-orange',     trend: 'Activo',   tUp: null  },
  { value: 'XAF 200M', label: 'Fondo disponible',     sub: '40% del fondo sin asignar', cls: 'text-green-text', trend: '40% libre', tUp: true  },
  { value: 'XAF 300M', label: 'Fondo utilizado',      sub: 'Ya desembolsado',           cls: 'text-orange',     trend: '60% usado', tUp: null  },
  { value: '5',         label: 'PYMEs beneficiarias', sub: 'Beneficiarias activas',      cls: 'text-green-text', trend: '+1',        tUp: true  },
  { value: '4',         label: 'Operaciones activas', sub: 'Operaciones abiertas',       cls: 'text-blue-text',  trend: 'estable',   tUp: null  },
  { value: '2',         label: 'Proy. ambientales',   sub: 'Proyectos activos',          cls: 'text-green-text', trend: '+1',        tUp: true  },
];

const fondoDona = [
  { tipo: 'Utilizado',  pct: 60, color: '#C62828' },
  { tipo: 'Disponible', pct: 40, color: '#059669' },
];

const pymeDist = [
  { label: 'Const. Silva Ltd.',  value: 90 },
  { label: 'TechBata PYME S.L.', value: 75 },
  { label: 'AgriEco PYME',       value: 65 },
  { label: 'LogiGE S.A.',         value: 45 },
  { label: 'ServLog GE',         value: 25 },
];

const factoringAlertas = [
  { tipo: 'error',   Icon: AlertTriangle, titulo: 'Factura FAC-2026-0819 vencida',
    detalle: 'Const. Silva · XAF 8,200,000 · Venció 10/05/26' },
  { tipo: 'error',   Icon: AlertTriangle, titulo: 'Factura FAC-2026-0774 vencida',
    detalle: 'AgriEco PYME · XAF 3,400,000 · Venció 08/05/26' },
  { tipo: 'warning', Icon: Clock,         titulo: 'FAC-2026-0911 vence en 3 días',
    detalle: 'LogiGE S.A. · XAF 12,100,000 · Vence 15/05/26' },
];

const tipoCfg = {
  error:   { bg: 'bg-red-bg',    border: 'border-red-text/20',    icon: 'text-red-text'    },
  warning: { bg: 'bg-yellow-bg', border: 'border-yellow-text/20', icon: 'text-yellow-text' },
  info:    { bg: 'bg-blue-bg',   border: 'border-blue-text/20',   icon: 'text-blue-text'   },
};

const riesgos = [
  { color: '#00C853', lbl: 'Verde — Bajo Riesgo', pct: '67%', tc: '#059669', cnt: '12 prov.', dash: '184 92',  offset: 0    },
  { color: '#FFB300', lbl: 'Amarillo — Medio',    pct: '22%', tc: '#D97706', cnt: '4 prov.',  dash: '61 215',  offset: -184 },
  { color: '#E53935', lbl: 'Rojo — Alto Riesgo',  pct: '11%', tc: '#E53935', cnt: '2 prov.',  dash: '31 245',  offset: -245 },
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
  { nombre: 'LogiGE S.A.',         asignado: 45000000, utilizado: 28000000, disponible: 17000000 },
  { nombre: 'ServLog GE',         asignado: 25000000, utilizado: 12000000, disponible: 13000000 },
];

// ── Medioambiental tab data ───────────────────────────────────────────────────
const envKpis = [
  { value: '8',        label: 'Proyectos registrados', sub: 'Total registrado',          cls: 'text-green-text',  trend: '+2',      tUp: true  },
  { value: '5',        label: 'Proyectos activos',     sub: 'En ejecución actualmente',  cls: 'text-blue-text',   trend: 'estable', tUp: null  },
  { value: '3',        label: 'Proyectos financiados', sub: 'Con financiación aprobada', cls: 'text-orange',      trend: '+1',      tUp: true  },
  { value: '12,450 t', label: 'Captura potencial CO₂', sub: 'Toneladas CO₂ potencial',  cls: 'text-green-text',  trend: '+8%',     tUp: true  },
  { value: 'Medio',    label: 'Riesgo ambiental',      sub: 'Clasificación global',      cls: 'text-yellow-text', trend: 'Estable', tUp: null  },
];

const proyectoDona = [
  { tipo: 'En ejecución', pct: 45, color: '#059669' },
  { tipo: 'Planificado',  pct: 18, color: '#3B82F6' },
  { tipo: 'Finalizado',   pct: 27, color: '#C62828' },
  { tipo: 'Suspendido',   pct: 10, color: '#9CA3AF' },
];

const catBarData = [
  { label: 'Reforestación', value: 3, color: '#059669' },
  { label: 'Agricultura',   value: 2, color: '#F57C00' },
  { label: 'Energía',       value: 2, color: '#3B82F6' },
  { label: 'Residuos',      value: 1, color: '#9CA3AF' },
];

const proyectos = [
  { nombre: 'Reforestación Bata Norte', estado: 'En ejecución', riesgo: 'Bajo',  fin: 'XAF 45M' },
  { nombre: 'Agro Sierra Sur',          estado: 'En ejecución', riesgo: 'Medio', fin: 'XAF 28M' },
  { nombre: 'Energía Solar Malabo',     estado: 'Planificado',  riesgo: 'Bajo',  fin: 'XAF 62M' },
  { nombre: 'Gestión Residuos Bata',    estado: 'Finalizado',   riesgo: 'Bajo',  fin: 'XAF 18M' },
  { nombre: 'Reforestación Ebebiyín',   estado: 'Planificado',  riesgo: 'Medio', fin: 'XAF 35M' },
];

const estadoBadge = (e) => e === 'En ejecución' ? 'blue' : e === 'Planificado' ? 'orange' : e === 'Finalizado' ? 'green' : 'yellow';
const riesgoBadge = (r) => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';

const CERT_LABELS = [
  { icon: '🌿', label: 'Verde',            desc: 'Proyectos ambientales registrados en Bonafide',    bg: 'bg-green-bg',    text: 'text-green-text',  border: 'border-green-border'   },
  { icon: '⭐', label: 'Verde Bonafide',    desc: 'Certificación completa verificada por Bonafide',   bg: 'bg-green-bg',    text: 'text-green-text',  border: 'border-green-border'   },
  { icon: '💨', label: 'Verde CO₂',         desc: 'Captura activa de carbono certificada',            bg: 'bg-blue-bg',     text: 'text-blue-text',   border: 'border-blue-text/20'   },
  { icon: '♻️', label: 'Verde Neutro',      desc: 'Balance de carbono neutro certificado',            bg: 'bg-green-bg',    text: 'text-green-text',  border: 'border-green-border'   },
  { icon: '🏆', label: 'Verde ESG',         desc: 'Cumplimiento Ambiental + Social + Gobernanza',     bg: 'bg-orange-tint', text: 'text-orange',      border: 'border-orange-border'  },
  { icon: '🌱', label: 'Eco en Proceso',    desc: 'Proceso de certificación ambiental en curso',      bg: 'bg-yellow-bg',   text: 'text-yellow-text', border: 'border-yellow-text/20' },
  { icon: '○',  label: 'Sin certificación', desc: 'Sin proyectos medioambientales registrados',       bg: 'bg-page-bg',     text: 'text-text-3',      border: 'border-border'         },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function EmpDash() {
  const { go } = useApp();
  const [tab, setTab] = useState('fondos');

  return (
    <AppShell active="empDash" role="contratante">
      <div className="fade-in space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="text-[20px] font-bold text-text-1">Buenos días, TotalEnerGE 👋</div>
            <div className="text-[13px] text-text-4">Gestión de fondo y cadena de suministro · Junio 2026</div>
          </div>
          <Button variant="primary" size="sm" onClick={() => go('empConf')}>
            + Nueva Solicitud
          </Button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-page-bg p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all cursor-pointer ${
                tab === t.id ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
              }`}>
              <t.Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── FONDOS TAB ──────────────────────────────────────────────────── */}
        {tab === 'fondos' && (
          <div key="fondos" className="fade-in space-y-5">

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
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

            {/* Row 1: DonutChart + HBarChart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* DonutChart 2/5 */}
              <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-3">
                  <div className="text-[14px] font-bold text-text-1">Uso del fondo</div>
                  <div className="text-[11px] text-text-4">¿Cuánto he utilizado?</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-2">
                  <DonutChart data={fondoDona} centerLabel="60%" centerSub="utilizado" size={190} />
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 w-full">
                    {fondoDona.map(d => (
                      <div key={d.tipo} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-[11px] text-text-2 font-medium">{d.tipo}</span>
                        <span className="text-[11px] font-bold" style={{ color: d.color }}>{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* HBarChart 3/5 */}
              <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-5">
                  <div className="text-[14px] font-bold text-text-1">Distribución por PYME</div>
                  <div className="text-[11px] text-text-4">¿Quién usa los fondos?</div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <HBarChart data={pymeDist} fmtVal={v => `XAF ${v}M`} />
                </div>
              </div>
            </div>

            {/* Row 2: Alertas Factoring Inverso + Semáforo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Alertas Factoring Inverso */}
              <div className="bg-white rounded-[14px] border border-border flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-bold text-text-1">Alertas de Factoring Inverso</div>
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

              {/* Semáforo de Riesgos */}
              <div className="bg-white rounded-[14px] border border-border flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-bold text-text-1">🚦 Semáforo de Riesgos</div>
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
                      <circle cx="55" cy="55" r="44" fill="none" stroke="#F0F2F5" strokeWidth="12" />
                      {riesgos.map(r => (
                        <circle key={r.color} cx="55" cy="55" r="44" fill="none"
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
            </div>

            {/* Row 3: LineChart + Table */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* LineChart 3/5 */}
              <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-4">
                  <div className="text-[14px] font-bold text-text-1">Evolución del consumo</div>
                  <div className="text-[11px] text-text-4">Velocidad de uso del fondo · millones XAF</div>
                </div>
                <div className="flex-1 min-h-[200px]">
                  <LineChart id="emp-fondos" data={fondoEvol} color="#C62828" xKey="mes" yKey="util" unit="M" h={180} />
                </div>
              </div>

              {/* Table 2/5 */}
              <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5">
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
                <div className="overflow-x-auto">
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

            {/* Certification Taxonomy */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Leaf className="w-4 h-4 text-green-text" />
                  <div className="text-[14px] font-bold text-text-1">Certificaciones Ambientales B-Morï</div>
                </div>
                <div className="text-[11px] text-text-4">Sistema de etiquetas para proyectos medioambientales registrados en la plataforma</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {CERT_LABELS.map(c => (
                  <div key={c.label} className={`flex flex-col gap-1.5 p-3 rounded-[10px] border ${c.bg} ${c.border}`}>
                    <div className={`inline-flex items-center gap-1.5 text-[12px] font-bold ${c.text}`}>
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </div>
                    <div className="text-[10px] text-text-3 leading-snug">{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Table full width */}
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
              <table className="w-full">
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
