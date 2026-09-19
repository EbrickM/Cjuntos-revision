import { useState } from 'react';
import {
  TrendingUp, TreePine, Download, ArrowUpRight,
  CheckCircle, CreditCard, Shield,
  Wind
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const RED         = '#E0201C';
const ORA         = '#EF7A2C';
const GREEN       = '#2E7D5B';
const WARN        = '#C68A1D';
const ERR         = '#B8352A';
const TEXT4       = '#A9A6A1';
const DONUT_EMPTY = '#C4C1BC';

// ── MultiLineChart ────────────────────────────────────────────────────────────
function MultiLineChart({ data, series, windowStart = 0, minValue = 0, h = 180, vbW = 560, pl = 56, pr = 16, pt = 14, pb = 28, fxSz = 11, fySz = 10, compact = false }) {
  const W = vbW, H = h, PL = pl, PR = pr, PT = pt, PB = pb;
  const cW = W - PL - PR, cH = H - PT - PB;
  const allVals = data.flatMap(d => series.map(s => d[s.key] || 0));
  const maxV = Math.max(...allVals) * 1.12;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(maxV * p));
  const isIn = (key, i) => i >= windowStart && (data[i][key] || 0) >= minValue;
  const inWindow = i => i >= windowStart;
  const xPos = i => data.length > 1 ? PL + (i / (data.length - 1)) * cW : PL + cW / 2;
  const yPos = v => PT + cH - (v / maxV) * cH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      {yTicks.map(t => (
        <line key={t} x1={PL} y1={yPos(t)} x2={W - PR} y2={yPos(t)}
          stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      ))}
      {series.map((s, si) => {
        const segments = [];
        let current = [];
        data.forEach((d, i) => {
          if (isIn(s.key, i)) {
            current.push([xPos(i), yPos(d[s.key] || 0)]);
          } else if (current.length) {
            segments.push(current);
            current = [];
          }
        });
        if (current.length) segments.push(current);
        return segments.map((seg, segI) => (
          <polyline key={`${si}-${segI}`} points={seg.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={s.color}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ));
      })}
      {series.map((s, si) => data.map((d, i) => isIn(s.key, i) && (
        <circle key={`${si}-${i}`} cx={xPos(i)} cy={yPos(d[s.key] || 0)} r="3" fill={s.color} />
      )))}
      {data.map((d, i) => (
        <text key={i} x={xPos(i)} y={H - Math.round(pb * 0.2)} textAnchor="middle"
          fontSize={fxSz} fill={inWindow(i) ? TEXT4 : '#D8D5D0'} fontFamily="Poppins,sans-serif">{d.label}</text>
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
function VBarChart({ id, data, windowStart = 0, minValue = 0, h = 170, unit = '', vbW = 420, fxSz = 9, fvSz = 10, rotateLabels = false, labelKey = 'label' }) {
  const W = vbW, H = h, PL = 32, PR = 12, PT = 28;
  const PB = rotateLabels ? 62 : 32;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = Math.max(...data.map(d => d.value)) * 1.12;
  const slot = cW / data.length, bW = slot * 0.52;
  const gId = `vb-${id}`;
  const inWindow = i => i >= windowStart;
  const isIn = (d, i) => inWindow(i) && d.value >= minValue;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
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
        const lx = PL + slot * i + slot / 2;
        const ly = PT + cH + (rotateLabels ? 32 : 14);
        const x = PL + slot * i + (slot - bW) / 2;
        const bH = (d.value / maxV) * cH;
        const y = PT + cH - bH;
        const fill = d.color ?? `url(#${gId})`;
        return (
          <g key={i} opacity={inWindow(i) ? 1 : 0.15}>
            {d.value > 0 && isIn(d, i) && <rect x={x} y={y} width={bW} height={bH} rx="5" fill={fill} opacity="0.88" />}
            <text x={x + bW / 2} y={y - 6} textAnchor="middle" fontSize={fvSz} fontWeight="700"
              fill={isIn(d, i) ? (d.color ?? ORA) : '#D8D5D0'} fontFamily="Poppins,sans-serif">{d.value}{unit}</text>
            <text x={lx} y={ly}
              textAnchor="middle"
              fontSize={fxSz} fill={TEXT4} fontFamily="Poppins,sans-serif"
              transform={rotateLabels ? `rotate(-40, ${lx}, ${ly})` : undefined}>
              {d[labelKey]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── MiniRangeInput — slider horizontal de una sola esfera, apilado en el
// lateral de cada gráfica, con etiqueta arriba y valor actual debajo ─────────
function MiniRangeInput({ label, min, max, step = 1, value, onChange, format }) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div>
      <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-1">{label}</p>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="rng-clean w-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--bonafide-orange) ${pct}%, var(--rng-track, #D3D0CA) ${pct}%)`,
        }}
      />
      <p className="text-[10px] font-bold text-text-1 mt-0.5">{format ? format(value) : value}</p>
    </div>
  );
}

// ── Tab config ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'fondos',         line1: 'Dashboard de', line2: 'Fondos y Suministradores', Icon: TrendingUp, iconBg: '#FFF3E0', iconColor: ORA   },
  { id: 'medioambiental', line1: 'Dashboard',    line2: 'Medioambiental',           Icon: TreePine,   iconBg: '#E3F4EA', iconColor: GREEN },
];

// ── Datos Fondos ──────────────────────────────────────────────────────────────
const FONDO_TOTAL     = 31_000_000;
const FONDO_USADO     = 14_000_000;
const FONDO_DISP      = 17_000_000;
const PCT_USADO       = Math.round((FONDO_USADO / FONDO_TOTAL) * 100);
const PCT_DISP        = 100 - PCT_USADO;
const SUMINISTRADORES_ASIGNADOS = 2;
const CONTRATOS_ACTIV   = 2;
const SCORE             = 690;
const scoreZone = SCORE < 400 ? { label: 'Crítico', color: ERR }
  : SCORE < 600 ? { label: 'Alto',  color: ERR }
  : SCORE < 750 ? { label: 'Medio', color: WARN }
  : { label: 'Bajo', color: GREEN };
const FACTURAS_COUNT    = 2;
const FACTURAS_MONTO    = 14_000_000;
const SOLICITUDES_TOTAL = 4;

const evolucionFondoData = [
  { label: 'Ene', asignado:  5, disponible:  5, ejecucion:  0 },
  { label: 'Feb', asignado: 10, disponible:  8, ejecucion:  2 },
  { label: 'Mar', asignado: 16, disponible: 12, ejecucion:  4 },
  { label: 'Abr', asignado: 20, disponible: 14, ejecucion:  6 },
  { label: 'May', asignado: 24, disponible: 15, ejecucion:  9 },
  { label: 'Jun', asignado: 28, disponible: 16, ejecucion: 12 },
  { label: 'Jul', asignado: 31, disponible: 17, ejecucion: 14 },
];

const evolucionFondoSeries = [
  { key: 'asignado',   color: RED,   label: 'Fondo Asignado'    },
  { key: 'disponible', color: GREEN, label: 'Fondo Disponible'  },
  { key: 'ejecucion',  color: ORA,   label: 'En Ejecución'      },
];

const suministradorDist = [
  { label: 'Combustibles Bata S.L.', value: 9.5, color: RED },
  { label: 'Repuestos Malabo GE',    value: 4.5, color: ORA },
];

const estadoOps = [
  { tipo: 'Pendientes',  pct: 25, count: 1, color: TEXT4 },
  { tipo: 'Aprobadas',   pct: 25, count: 1, color: GREEN },
  { tipo: 'En revisión', pct: 25, count: 1, color: ORA   },
  { tipo: 'Rechazadas',  pct: 25, count: 1, color: ERR   },
];

const tipoBarData = [
  { label: 'Transporte',   shortLabel: 'Transporte', value: 31, color: RED  },
  { label: 'Repuestos',    shortLabel: 'Repuestos',   value: 12, color: ORA  },
  { label: 'Mantenimiento', shortLabel: 'Mantenim.',  value:  8, color: WARN },
  { label: 'Combustibles', shortLabel: 'Combust.',    value:  6, color: GREEN},
];

const EVO_MAX = Math.max(...evolucionFondoData.map(d => d.asignado));

// ── Medioambiental data ───────────────────────────────────────────────────────
const envKpis = [
  { value: '5',        label: 'Proyectos registrados', Icon: TreePine,    iconColor: GREEN },
  { value: '2',        label: 'Proyectos activos',     Icon: CheckCircle, iconColor: ORA   },
  { value: '1',        label: 'Proyectos financiados', Icon: CreditCard,  iconColor: RED   },
  { value: '3 200 t',  label: 'Captura potencial CO₂', Icon: Wind,        iconColor: GREEN },
  { value: 'Bajo',     label: 'Riesgo ambiental',      Icon: Shield,      iconColor: GREEN },
];

const proyectos = [
  { nombre: 'Flota de Transporte Bajo Emisiones', estado: 'En ejecución', riesgo: 'Bajo',  fin: '12 000 000 XAF' },
  { nombre: 'Optimización de Rutas Logísticas',   estado: 'En ejecución', riesgo: 'Bajo',  fin: '6 000 000 XAF'  },
  { nombre: 'Reciclaje de Repuestos',             estado: 'Planificado',  riesgo: 'Medio', fin: '4 500 000 XAF'  },
  { nombre: 'Capacitación en Manejo Defensivo',   estado: 'Finalizado',   riesgo: 'Bajo',  fin: '1 800 000 XAF'  },
  { nombre: 'Mantenimiento Preventivo de Flota',  estado: 'En ejecución', riesgo: 'Bajo',  fin: '3 200 000 XAF'  },
];

const estadoBadge = e => e === 'En ejecución' ? 'blue' : e === 'Planificado' ? 'orange' : e === 'Finalizado' ? 'green' : 'yellow';
const riesgoBadge = r => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProvDash() {
  const [tab, setTab] = useState('fondos');
  const [activityView, setActivityView] = useState('evolucion');
  const [devToast, setDevToast] = useState(false);
  const showDevToast = () => { setDevToast(true); setTimeout(() => setDevToast(false), 3500); };

  const [evoPeriodo, setEvoPeriodo] = useState(evolucionFondoData.length);
  const [evoMonto, setEvoMonto]     = useState(0);
  const evoWindowStart = evolucionFondoData.length - evoPeriodo;
  const evolucionHasData = evolucionFondoData.some((d, i) =>
    i >= evoWindowStart && evolucionFondoSeries.some(s => d[s.key] >= evoMonto));

  return (
    <AppShell active="provDash" role="proveedor" back>
      <div className="fade-in space-y-4">

        {/* ── Header ── */}
        <div className="flex flex-col min-[1156px]:flex-row min-[1156px]:items-center min-[1156px]:justify-between gap-3 max-[765px]:items-center max-[765px]:text-center">
          <div className="min-w-0">
            <div className="text-[20px] font-bold text-text-1 truncate">
              Bienvenido, TransGE
            </div>
            <div className="text-[13px] text-text-4">Gestión de fondo y suministradores · Agosto 2026</div>
          </div>
          <div className="hidden min-[1156px]:flex gap-1 bg-page-bg p-1 rounded-xl">
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

        {/* ── Tab nav compacto — visible por debajo de 1156px ─────────────────── */}
        <div className="flex min-[1156px]:hidden gap-1 bg-page-bg p-1 rounded-xl w-full">
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

            {/* ── Panel 1: Fondo + Score + KPIs integrados, en una sola card ─── */}
            <div className="card-lift card-enter bg-white rounded-[18px] border border-border p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">

                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-5 max-[765px]:items-center max-[765px]:text-center">
                  <div className="flex-1 min-w-0 max-[765px]:w-full">
                    <p className="text-[11px] max-[765px]:text-xs font-semibold uppercase tracking-[1.2px] mb-2" style={{ color: TEXT4 }}>
                      FONDO DE PARTICIPACIÓN
                    </p>
                    <div className="flex items-baseline gap-2 mb-4 max-[765px]:justify-center">
                      <span className="font-extrabold text-text-1 leading-none"
                            style={{ fontSize: 'clamp(26px, 3.5vw, 36px)' }}>
                        {new Intl.NumberFormat('de-DE').format(FONDO_TOTAL)}
                      </span>
                      <span className="text-[13px] max-[765px]:text-sm font-semibold" style={{ color: TEXT4 }}>XAF</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3 max-[765px]:justify-center">
                      <button onClick={showDevToast}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] font-semibold text-[12px] text-text-3 cursor-pointer transition-colors hover:bg-page-bg border border-border">
                        <Download className="w-3.5 h-3.5" />
                        Descargar Estado de Cuenta
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap max-[765px]:justify-center">
                      <span className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px]"
                            style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORA }} />
                        {CONTRATOS_ACTIV} contratos activos
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px]"
                            style={{ background: '#E3F4EA', color: GREEN, border: '1px solid rgba(46,125,91,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                        {SUMINISTRADORES_ASIGNADOS} Suministradores asignados
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px]"
                            style={{ background: '#E3F4EA', color: GREEN, border: '1px solid rgba(46,125,91,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                        {FACTURAS_COUNT} facturas · {new Intl.NumberFormat('de-DE').format(FACTURAS_MONTO)} XAF
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5 shrink-0 self-center md:self-auto max-[765px]:w-full max-[765px]:items-center">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 max-[765px]:justify-center">
                        <div className="bona-gradient-bg w-2.5 h-2.5 rounded-full shrink-0" />
                        <span className="text-xs max-[765px]:text-sm font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Utilizado</span>
                      </div>
                      <p className="text-lg max-[765px]:text-xl font-extrabold text-text-1">
                        {new Intl.NumberFormat('de-DE').format(FONDO_USADO)} XAF
                      </p>
                      <p className="text-xs max-[765px]:text-sm" style={{ color: TEXT4 }}>{PCT_USADO}%</p>
                    </div>
                    <div className="h-px w-full bg-border" />
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 max-[765px]:justify-center">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_EMPTY }} />
                        <span className="text-xs max-[765px]:text-sm font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Disponible</span>
                      </div>
                      <p className="text-lg max-[765px]:text-xl font-extrabold" style={{ color: ORA }}>
                        {new Intl.NumberFormat('de-DE').format(FONDO_DISP)} XAF
                      </p>
                      <p className="text-xs max-[765px]:text-sm" style={{ color: TEXT4 }}>{PCT_DISP}%</p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block w-px bg-border" />
                <div className="lg:hidden h-px bg-border" />

                <div className="lg:w-[220px] shrink-0 flex flex-col items-center justify-center text-center gap-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-4">Score Crediticio</p>
                  <p className="text-[48px] sm:text-[56px] font-extrabold leading-none" style={{ color: scoreZone.color }}>{SCORE}</p>
                  <p className="text-[12px] text-text-4">
                    / 1000 · <span className="font-semibold" style={{ color: scoreZone.color }}>Riesgo {scoreZone.label}</span>
                  </p>
                </div>
              </div>

            </div>

            {/* ── Panel 2: Actividad del fondo + Distribución/Solicitudes/Tipo ── */}
            <div className="card-lift card-enter bg-white rounded-[14px] border border-border overflow-hidden">

              <div className="pb-3">
                <div className="flex flex-wrap justify-between items-start gap-3 px-4 pt-4 pb-2">
                  <div>
                    <p className="text-[13px] font-bold text-text-1">
                      {activityView === 'evolucion' ? 'Evolución del Fondo de Financiación' : 'Tipo de Financiaciones'}
                    </p>
                    <p className="text-[11px] text-text-4">
                      {activityView === 'evolucion' ? 'Ene – Jul 2026' : 'Por sector de actividad'}
                      <span className="hidden md:inline"> · millones XAF</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {activityView === 'evolucion' && (
                      <div className="hidden lg:flex items-center gap-4">
                        {evolucionFondoSeries.map(s => (
                          <div key={s.key} className="flex items-center gap-1.5">
                            <div className="w-5 h-[2px] rounded-full" style={{ background: s.color }} />
                            <span className="text-[10px] text-text-4">{s.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1 bg-page-bg p-1 rounded-[8px] shrink-0">
                      <button onClick={() => setActivityView('evolucion')}
                        className={`px-3 py-1.5 rounded-[6px] text-[11px] font-semibold transition-all cursor-pointer ${
                          activityView === 'evolucion' ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
                        }`}>
                        Evolución
                      </button>
                      <button onClick={() => setActivityView('tipo')}
                        className={`px-3 py-1.5 rounded-[6px] text-[11px] font-semibold transition-all cursor-pointer ${
                          activityView === 'tipo' ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
                        }`}>
                        Tipo
                      </button>
                    </div>
                  </div>
                </div>
                {activityView === 'evolucion' ? (
                  <div className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-3 px-4">
                    <div className="w-full md:flex-1 md:min-w-0">
                      <div className="hidden md:block h-[240px] w-full">
                        {evolucionHasData
                          ? <MultiLineChart data={evolucionFondoData} series={evolucionFondoSeries} windowStart={evoWindowStart} minValue={evoMonto} h={240} vbW={1000} pl={48} />
                          : <div className="h-full flex items-center justify-center text-[12px]" style={{ color: TEXT4 }}>Sin datos para este filtro</div>}
                      </div>
                      <div className="block md:hidden h-[280px] w-full">
                        {evolucionHasData
                          ? <MultiLineChart data={evolucionFondoData} series={evolucionFondoSeries} windowStart={evoWindowStart} minValue={evoMonto} h={280} vbW={380} pl={44} fxSz={13} fySz={11} />
                          : <div className="h-full flex items-center justify-center text-[12px]" style={{ color: TEXT4 }}>Sin datos para este filtro</div>}
                      </div>
                    </div>
                    <div className="flex flex-row gap-4 md:flex-col md:justify-center md:gap-6 md:w-44 lg:w-56 md:shrink-0">
                      <div className="flex-1 min-w-0 md:flex-none">
                        <MiniRangeInput label="Periodo" min={2} max={evolucionFondoData.length} value={evoPeriodo}
                          onChange={setEvoPeriodo} format={v => `${v} meses`} />
                      </div>
                      <div className="flex-1 min-w-0 md:flex-none">
                        <MiniRangeInput label="Monto mín." min={0} max={EVO_MAX} step={5} value={evoMonto}
                          onChange={setEvoMonto} format={v => `${v}M`} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="hidden sm:block h-[240px] w-full">
                      <VBarChart id="ct-tipo" data={tipoBarData} h={240} vbW={1000} unit="M" />
                    </div>
                    <div className="block sm:hidden h-[260px] w-full">
                      <VBarChart id="ct-tipo-m" data={tipoBarData} h={260} vbW={340} fxSz={12} fvSz={13} unit="M" rotateLabels labelKey="shortLabel" />
                    </div>
                  </>
                )}
                <p className="block md:hidden text-[10px] text-center pb-2 pt-1 px-4" style={{ color: TEXT4 }}>
                  Valores expresados en millones XAF
                </p>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>
                    <p className="text-[13px] font-bold text-text-1 mb-1">Distribución del Fondo por Suministrador</p>
                    <p className="text-[11px] text-text-4 mb-4">¿Quién usa los fondos? · millones XAF</p>
                    <HBarChart data={suministradorDist} fmtVal={v => `${v}M XAF`} />
                    <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                      <span className="text-[11px] text-text-4">Total utilizado</span>
                      <span className="text-[12px] font-bold" style={{ color: RED }}>
                        {new Intl.NumberFormat('de-DE').format(FONDO_USADO)} XAF
                      </span>
                    </div>
                  </div>

                  <div className="md:border-l md:border-border md:pl-5 pt-4 md:pt-0 border-t md:border-t-0 border-border flex flex-col items-center md:justify-center text-center">
                    <p className="text-[14px] font-bold text-text-1 mb-1">Estado de Contratos</p>
                    <p className="text-[11px] text-text-4 mb-4">{SOLICITUDES_TOTAL} solicitudes</p>
                    <div className="flex flex-col gap-2 w-full">
                      {estadoOps.map(d => (
                        <div key={d.tipo} className="flex items-center justify-between rounded-[10px] border border-border bg-page-bg px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-[13px] font-semibold text-text-1 truncate">{d.tipo}</span>
                          </div>
                          <span className="text-[12px] font-bold shrink-0" style={{ color: d.color }}>
                            {d.count} · {d.pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* ══ PESTAÑA MEDIOAMBIENTAL ════════════════════════════════════════════ */}
        {tab === 'medioambiental' && (
          <div key="medioambiental" className="fade-in space-y-5">

            {/* KPIs — cards blancas */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-2">
              {envKpis.map(({ value, label, sub, Icon, iconColor, trend, tUp }) => (
                <div key={label} className="bg-white rounded-[14px] border border-border p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" style={{ color: iconColor }} />
                    <span className="text-[10px] font-semibold text-text-4 uppercase tracking-wide leading-tight">{label}</span>
                  </div>
                  <span className="text-[17px] font-extrabold leading-none text-text-1">{value}</span>
                  {sub && <span className="text-[10px] text-text-5 leading-snug">{sub}</span>}
                  {trend && (
                    <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tUp === true ? 'bg-green-bg text-green-text' :
                      tUp === false ? 'bg-red-bg text-red-text' :
                      'bg-orange-tint text-orange-dark'
                    }`}>{trend}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-[14px] font-bold text-text-1">Proyectos</div>
                  <div className="text-[11px] text-text-4">Todos los proyectos medioambientales</div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-[6px]"
                     style={{ background: '#E3F4EA', color: GREEN }}>
                  <TreePine className="w-3.5 h-3.5" />
                  5 registrados
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
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['Proyecto', 'Estado', 'Riesgo', 'Financiamiento'].map((h) => (
                        <th key={h} className="text-center whitespace-nowrap px-4 py-2.5 text-xs font-semibold text-text-4 uppercase tracking-wider bg-page-bg border-b border-border">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {proyectos.map((p, i) => (
                      <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-text-1 text-center whitespace-nowrap">{p.nombre}</td>
                        <td className="px-4 py-3 text-center whitespace-nowrap"><Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge></td>
                        <td className="px-4 py-3 text-center whitespace-nowrap"><Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge></td>
                        <td className="px-4 py-3 text-sm font-bold text-text-1 text-center whitespace-nowrap">{p.fin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className={`fixed bottom-6 right-6 z-50 w-[320px] bg-white rounded-[14px] shadow-xl border border-border p-4 flex items-start gap-3 transition-all duration-300 ease-out
        ${devToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FFF3E0' }}>
          <ArrowUpRight className="w-4 h-4" style={{ color: ORA }} />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-text-1 mb-0.5">Funcionalidad en desarrollo</div>
          <div className="text-[12px] text-text-4 leading-snug">Esta sección estará disponible próximamente.</div>
        </div>
      </div>
    </AppShell>
  );
}
