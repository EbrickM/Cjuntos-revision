import { useState, useEffect, useRef } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import ScoreGauge from '../../components/common/ScoreGauge';
import { TrendingUp, Leaf, ChevronRight, CheckCircle, CreditCard, Shield, Clock, TreePine, Wind } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import { ChartTooltip } from '../../components/charts/Charts';

// ── MIC Brand tokens ─────────────────────────────────────────────────────────
const RED         = '#E0201C';
const ORA         = '#EF7A2C';
const GREEN       = '#2E7D5B';
const WARN        = '#C68A1D';
const ERR         = '#B8352A';
const BORDER      = '#ECEAE7';
const TEXT4       = '#A9A6A1';
const DONUT_EMPTY = '#C4C1BC';

// ── LineChart — Evolución Financiera ─────────────────────────────────────────
// El filtro se resuelve por serie y por punto: `windowStart` aplica el
// filtro de Periodo (igual para las 3 series), pero `minValue` se compara
// contra el valor de CADA serie en cada punto — así, si "Monto mínimo" está
// en 65M, un punto de "Crédito Utilizado" en 20M se oculta igual que uno de
// "Disponible" en 20M, en vez de solo mirar una serie de referencia y dejar
// pasar a las otras con valores por debajo del mínimo.
// Las posiciones X se calculan siempre sobre el total de `data` (no sobre los
// puntos incluidos) para que excluir un punto deje un hueco visible en la
// línea en vez de simplemente re-espaciar el resto.
function LineChart({ data, series, windowStart = 0, minValue = 0, h = 180, vbW = 560, pl = 98, pr = 16, pt = 14, pb = 28, fxSz = 11, fySz = 10, compact = false, hoveredSeries = null }) {
  const W = vbW, H = h, PL = pl, PR = pr, PT = pt, PB = pb;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = 300;
  const yTicks = [60, 120, 180, 240, 300];
  const xPos = i => data.length > 1 ? PL + (i / (data.length - 1)) * cW : PL + cW / 2;
  const yPos = v => PT + cH - (v / maxV) * cH;
  const fmtM = v => compact ? `${v}M` : new Intl.NumberFormat('de-DE').format(v * 1_000_000);
  const isIn = (key, i) => i >= windowStart && data[i][key] >= minValue;
  const inWindow = i => i >= windowStart;

  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  const handleMouseMove = (e) => {
    const bbox = ref.current ? ref.current.getBoundingClientRect() : null;
    if (!bbox) return;
    const relX = (e.clientX - bbox.left) / bbox.width;
    const svgX = relX * W;
    const rawCol = ((svgX - PL) / cW) * (data.length - 1);
    const col = Math.max(0, Math.min(data.length - 1, Math.round(rawCol)));
    setTip({ col, mouseX: e.clientX - bbox.left, mouseY: e.clientY - bbox.top });
  };

  const handleMouseLeave = () => setTip(null);
  const tipCol = tip !== null ? tip.col : null;

  return (
    <div ref={ref} className="relative w-full h-full">
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
              current.push([xPos(i), yPos(d[s.key])]);
            } else if (current.length) {
              segments.push(current);
              current = [];
            }
          });
          if (current.length) segments.push(current);
          const isHov = hoveredSeries === s.key;
          const isDim = hoveredSeries !== null && !isHov;
          return (
            <g key={si} style={{ opacity: isDim ? 0.12 : 1, transition: 'opacity 0.2s ease' }}>
              {segments.map((seg, segI) => (
                <polyline key={segI} points={seg.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={s.color}
                  strokeWidth={isHov ? 3 : 2} strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 6000, animation: `lineDrawOn 1.1s ease-out ${si * 180}ms both` }} />
              ))}
              {data.map((d, i) => isIn(s.key, i) && (
                <circle key={i} cx={xPos(i)} cy={yPos(d[s.key])} r={isHov ? 4 : 3} fill={s.color}
                  style={{ animation: `dotFadeIn 0.3s ease ${si * 180 + i * 35}ms both`, transformOrigin: 'center' }} />
              ))}
            </g>
          );
        })}
        {tipCol !== null && (
          <line
            x1={xPos(tipCol)} y1={PT}
            x2={xPos(tipCol)} y2={PT + cH}
            stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="4 3"
          />
        )}
        {data.map((d, i) => (
          <text key={i} x={xPos(i)} y={H - Math.round(pb * 0.2)} textAnchor="middle"
            fontSize={fxSz} fill={inWindow(i) ? TEXT4 : '#D8D5D0'} fontFamily="Poppins,sans-serif">{d.label}</text>
        ))}
        {yTicks.map(t => (
          <text key={t} x={PL - 5} y={yPos(t) + 3} textAnchor="end"
            fontSize={fySz} fill={TEXT4} fontFamily="Poppins,sans-serif">{fmtM(t)}</text>
        ))}
        <rect x={0} y={0} width={W} height={H} fill="transparent"
          onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
      </svg>
      {tip !== null && tipCol !== null && (
        <ChartTooltip
          x={tip.mouseX}
          y={tip.mouseY}
          title={data[tipCol].label}
          lines={series
            .filter(s => isIn(s.key, tipCol))
            .map(s => ({ label: s.label, value: `${data[tipCol][s.key]}M`, color: s.color }))}
        />
      )}
    </div>
  );
}

// ── GroupedBarChart — Flujo Financiero ───────────────────────────────────────
// Igual que en LineChart: el filtro de Monto mínimo se evalúa por separado
// para entradas y salidas (una barra puede ocultarse y la otra no, dentro de
// la misma semana), y la ventana de Periodo aplica a ambas por igual. Las
// posiciones X se calculan siempre sobre el total de `data`, así que ocultar
// una barra no reacomoda a las demás.
function GroupedBarChart({ data, windowStart = 0, minValue = 0, h = 180, vbW = 560, pl = 98, pr = 8, pt = 14, pb = 28, fxSz = 11, fySz = 10, compact = false, hoveredGroup = null }) {
  const W = vbW, H = h, PL = pl, PR = pr, PT = pt, PB = pb;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = Math.max(...data.flatMap(d => [d.inflow, d.outflow])) * 1.22;
  const slot = cW / data.length;
  const innerGap = slot * 0.08;
  const outerGap = slot * 0.14;
  const bW = (slot - outerGap * 2 - innerGap) / 2;
  const base = PT + cH;
  const inWindow = i => i >= windowStart;
  const isIn = (key, i) => inWindow(i) && data[i][key] >= minValue;
  const fmt = v => compact
    ? (v === 0 ? '0' : `${Math.round(v / 1_000_000)}M`)
    : new Intl.NumberFormat('de-DE').format(Math.round(v));

  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  return (
    <div ref={ref} className="relative w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
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
            <g key={i} opacity={inWindow(i) ? 1 : 0.15}
              onMouseEnter={(e) => {
                const bbox = ref.current ? ref.current.getBoundingClientRect() : null;
                if (!bbox) return;
                setTip({ barIdx: i, mouseX: e.clientX - bbox.left, mouseY: e.clientY - bbox.top });
              }}
              onMouseLeave={() => setTip(null)}>
              {d.inflow  > 0 && isIn('inflow', i)  && (
                <rect x={xIn}  y={base - inH}  width={bW} height={inH}  rx="3" fill={ORA}
                  style={{ transformOrigin: `${xIn + bW / 2}px ${base}px`, animation: `barGrowUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms both`, opacity: hoveredGroup && hoveredGroup !== 'inflow' ? 0.12 : 1, transition: 'opacity 0.2s ease' }} />
              )}
              {d.outflow > 0 && isIn('outflow', i) && (
                <rect x={xOut} y={base - outH} width={bW} height={outH} rx="3" fill={RED}
                  style={{ transformOrigin: `${xOut + bW / 2}px ${base}px`, animation: `barGrowUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms both`, opacity: hoveredGroup && hoveredGroup !== 'outflow' ? 0.12 : 0.82, transition: 'opacity 0.2s ease' }} />
              )}
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
      {tip !== null && (
        <ChartTooltip
          x={tip.mouseX}
          y={tip.mouseY}
          title={data[tip.barIdx].label}
          lines={[
            { label: 'Entradas', value: `${Math.round(data[tip.barIdx].inflow / 1_000_000)}M XAF`, color: ORA },
            { label: 'Salidas',  value: `${Math.round(data[tip.barIdx].outflow / 1_000_000)}M XAF`, color: RED },
          ]}
        />
      )}
    </div>
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

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'financiacion',   line1: 'Dashboard de', line2: 'Financiación',   Icon: TrendingUp, iconBg: '#FFF3E0', iconColor: ORA   },
  { id: 'medioambiental', line1: 'Dashboard',    line2: 'Medioambiental', Icon: TreePine,   iconBg: '#E3F4EA', iconColor: GREEN },
];

// ── Datos Financiación ────────────────────────────────────────────────────────
const DISPONIBLE           = 132_500_000;
const LIMITE               = 180_000_000;
const USADO                = 47_500_000;
const CONTRATOS_ACTIVOS    = 1;
const SCORE                = 820;
const scoreZone = SCORE < 400 ? { label: 'Crítico', color: ERR }
  : SCORE < 600 ? { label: 'Alto',  color: ORA }
  : SCORE < 750 ? { label: 'Medio', color: WARN }
  : { label: 'Bajo', color: GREEN };
const FACTURAS_TOTAL_COUNT = 2;
const FACTURAS_TOTAL_MONTO = 47_500_000;
const NUEVOS_PROVEEDORES   = 3;
const SOLICITUDES_PEND     = 1;
const SOLICITUDES_XAF      = 50_000_000;


// "disponible" fluctúa a propósito (no crece de forma constante) para que el
// filtro de Monto mínimo excluya meses salteados a lo largo del año, en vez
// de coincidir siempre con los meses más antiguos — así se distingue
// claramente del filtro de Periodo.
const evolucionData = [
  { label: 'Ene', aprobada: 60,  utilizado: 5,   disponible: 55  },
  { label: 'Feb', aprobada: 60,  utilizado: 12,  disponible: 48  },
  { label: 'Mar', aprobada: 100, utilizado: 20,  disponible: 80  },
  { label: 'Abr', aprobada: 100, utilizado: 30,  disponible: 70  },
  { label: 'May', aprobada: 100, utilizado: 42,  disponible: 58  },
  { label: 'Jun', aprobada: 150, utilizado: 50,  disponible: 100 },
  { label: 'Jul', aprobada: 150, utilizado: 65,  disponible: 85  },
  { label: 'Ago', aprobada: 150, utilizado: 80,  disponible: 70  },
  { label: 'Sep', aprobada: 200, utilizado: 90,  disponible: 110 },
  { label: 'Oct', aprobada: 200, utilizado: 105, disponible: 95  },
  { label: 'Nov', aprobada: 200, utilizado: 118, disponible: 82  },
  { label: 'Dic', aprobada: 260, utilizado: 130, disponible: 130 },
];

const evolucionSeries = [
  { key: 'aprobada',   color: RED,   label: 'Financiación Aprobada' },
  { key: 'utilizado',  color: ORA,   label: 'Crédito Utilizado'     },
  { key: 'disponible', color: GREEN, label: 'Disponible'            },
];

const flujoData = [
  { label: 'Sem 1',  inflow: 12_000_000, outflow: 8_000_000  },
  { label: 'Sem 2',  inflow: 28_000_000, outflow: 15_000_000 },
  { label: 'Sem 3',  inflow: 45_000_000, outflow: 22_000_000 },
  { label: 'Sem 4',  inflow: 18_000_000, outflow: 35_000_000 },
  { label: 'Sem 5',  inflow: 60_000_000, outflow: 28_000_000 },
  { label: 'Sem 6',  inflow: 35_000_000, outflow: 42_000_000 },
  { label: 'Sem 7',  inflow: 72_000_000, outflow: 30_000_000 },
  { label: 'Sem 8',  inflow: 48_000_000, outflow: 55_000_000 },
  { label: 'Sem 9',  inflow: 85_000_000, outflow: 38_000_000 },
  { label: 'Sem 10', inflow: 52_000_000, outflow: 60_000_000 },
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
  { value: '4',         label: 'Proyectos activos',     sub: 'En ejecución actualmente',  Icon: CheckCircle, iconBg: '#FFF3E0', iconColor: ORA,   trend: 'Estable', tUp: null  },
  { value: '3',         label: 'Proyectos financiados', sub: 'Con financiación aprobada', Icon: CreditCard,  iconBg: '#FDEEEB', iconColor: RED,   trend: '+1',      tUp: true  },
  { value: '12.450 t',  label: 'Captura potencial CO₂', sub: 'Toneladas CO₂ potencial',  Icon: Wind,        iconBg: '#E3F4EA', iconColor: GREEN, trend: '+8%',     tUp: true  },
  { value: 'Medio',     label: 'Riesgo ambiental',      sub: 'Clasificación global',      Icon: Shield,      iconBg: '#FDF6E8', iconColor: WARN,  trend: 'Estable', tUp: null  },
];

const proyectos = [
  { nombre: 'Reforestación Bata Norte',     estado: 'En ejecución', riesgo: 'Bajo',  fin: '45.000.000 XAF' },
  { nombre: 'Agro Sierra Sur',              estado: 'En ejecución', riesgo: 'Medio', fin: '28.000.000 XAF' },
  { nombre: 'Agricultura Sostenible Bata',  estado: 'En ejecución', riesgo: 'Bajo',  fin: '18.000.000 XAF' },
  { nombre: 'Energía Eólica Malabo',        estado: 'En ejecución', riesgo: 'Bajo',  fin: '32.000.000 XAF' },
  { nombre: 'Energía Solar Malabo',         estado: 'Planificado',  riesgo: 'Bajo',  fin: '62.000.000 XAF' },
  { nombre: 'Reforestación Ebebiyín',       estado: 'Planificado',  riesgo: 'Medio', fin: '35.000.000 XAF' },
  { nombre: 'Gestión Residuos Bata',        estado: 'Finalizado',   riesgo: 'Bajo',  fin: '18.000.000 XAF' },
  { nombre: 'Reforestación Annobon',        estado: 'Suspendido',   riesgo: 'Medio', fin: '22.000.000 XAF' },
];

const estadoBadge = (e) => e === 'En ejecución' ? 'orange' : e === 'Planificado' ? 'amber' : e === 'Finalizado' ? 'green' : e === 'Suspendido' ? 'red' : 'gray';
const riesgoBadge = (r) => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';

// ── Componente principal ──────────────────────────────────────────────────────
export default function EpHome() {
  const { go } = useApp();
  const [tab, setTab]                   = useState('financiacion');
  const [activityView, setActivityView] = useState('evolucion');
  const [hoveredSeries, setHoveredSeries] = useState(null);
  const [hoveredGroup, setHoveredGroup]   = useState(null);
  const [evoPeriodo, setEvoPeriodo]     = useState(evolucionData.length);
  const [evoMonto, setEvoMonto]         = useState(0);
  const [flujoPeriodo, setFlujoPeriodo] = useState(flujoData.length);
  const [flujoMonto, setFlujoMonto]     = useState(0);

  // ── Contadores animados ───────────────────────────────────────────────────
  const animLimite      = useCountUp(LIMITE,                1800, 200);
  const animUsado       = useCountUp(USADO,                 1600, 400);
  const animDisponible  = useCountUp(DISPONIBLE,            1600, 400);
  const animScore       = useCountUp(SCORE,                 1500, 300);
  const animSolXaf      = useCountUp(SOLICITUDES_XAF,      1400, 500);
  const animFactMonto   = useCountUp(FACTURAS_TOTAL_MONTO, 1400, 350);

  // Zona del score calculada sobre el valor animado — los colores cambian
  // en tiempo real al cruzar los umbrales (Crítico → Alto → Medio → Bajo).
  const animZone = animScore < 400 ? { label: 'Crítico', color: ERR  }
    : animScore < 600              ? { label: 'Alto',    color: ORA  }
    : animScore < 750              ? { label: 'Medio',   color: WARN }
    :                                { label: 'Bajo',    color: GREEN };

  const animPctUsado      = LIMITE > 0 ? Math.round((animUsado / LIMITE) * 100) : 0;
  const animPctDisponible = 100 - animPctUsado;

  // Clase de destello — derivada directamente; se activa al cruzar el umbral final
  const scoreDone = animScore >= SCORE;

  // Trigger para barras de riesgo: arranca en 0 y se anima al valor real
  const [barsVisible, setBarsVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setBarsVisible(true), 450);
    return () => clearTimeout(id);
  }, []);

  const evoWindowStart = evolucionData.length - evoPeriodo;
  const evolucionHasData = evolucionData.some((d, i) =>
    i >= evoWindowStart && evolucionSeries.some(s => d[s.key] >= evoMonto));

  const flujoWindowStart = flujoData.length - flujoPeriodo;
  const flujoHasData = flujoData.some((d, i) =>
    i >= flujoWindowStart && (d.inflow >= flujoMonto || d.outflow >= flujoMonto));

  return (
    <AppShell active="epHome" role="empresa-pequena" back>
      <div className="fade-in space-y-4">

        {/* Header + Tab nav ───────────────────────────────────────────────────
            El nav de escritorio (pills en fila) no cabe junto al nombre desde
            que el sidebar reduce el ancho de contenido — por debajo de 1156px
            se apilan (nombre arriba, nav abajo) en vez de comprimirse uno
            contra el otro. */}
        <div className="flex flex-col min-[1156px]:flex-row min-[1156px]:items-center min-[1156px]:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 self-center">
            <div className="min-w-0">
              <div className="text-[20px] font-bold text-text-1 truncate">
                Bienvenido, Tradex
              </div>
            </div>
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

        {/* Tab nav compacto — visible por debajo de 1156px */}
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


        {/* ══ PESTAÑA FINANCIACIÓN ══════════════════════════════════════════════ */}
        {tab === 'financiacion' && (
          <div key="financiacion" className="fade-in space-y-4">

            {/* ── Panel 1: Resumen financiero — billetera + score + KPIs integrados ── */}
            <div className="card-lift card-enter bg-white rounded-[18px] border border-border p-5 sm:p-6">
              {/* La fila billetera|score solo pasa a horizontal en lg — entre md y lg el
                  sidebar deja muy poco ancho de contenido y forzarla en fila (antes en
                  md) hacía que el texto se montara encima del panel de Score. */}
              <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">

                {/* Billetera — por debajo de 766px todas las cards quedan en una sola
                    columna, así que aquí se centra el contenido (en vez de dejarlo
                    alineado a la izquierda) y se agranda un poco el texto. */}
                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-5 max-[765px]:items-center max-[765px]:text-center">
                  <div className="flex-1 min-w-0 max-[765px]:w-full">
                    <p className="text-[11px] max-[765px]:text-xs font-semibold uppercase tracking-[1.2px] mb-2" style={{ color: TEXT4 }}>
                      MI BILLETERA
                    </p>
                    <div className="flex items-baseline gap-2 mb-4 max-[765px]:justify-center">
                      <span className="font-extrabold text-text-1 leading-none tabular-nums"
                            style={{ fontSize: 'clamp(26px, 3.5vw, 36px)' }}>
                        {new Intl.NumberFormat('de-DE').format(animLimite)}
                      </span>
                      <span className="text-[13px] max-[765px]:text-sm font-semibold" style={{ color: TEXT4 }}>XAF</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 max-[765px]:justify-center">
                      <button onClick={() => go('epCreditos')}
                              className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-opacity hover:opacity-75"
                              style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORA }} />
                        {CONTRATOS_ACTIVOS} contratos activos
                      </button>
                      <button onClick={() => go('epProveedores')}
                              className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-opacity hover:opacity-75"
                              style={{ background: '#F2F2F3', color: '#5B5B5F', border: '1px solid rgba(91,91,95,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#5B5B5F' }} />
                        {NUEVOS_PROVEEDORES} proveedores
                      </button>
                      <button onClick={() => go('epFacturacion')}
                              className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-opacity hover:opacity-75"
                              style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORA }} />
                        {FACTURAS_TOTAL_COUNT} facturas · {new Intl.NumberFormat('de-DE').format(animFactMonto)} XAF
                      </button>
                    </div>
                  </div>

                  {/* Leyenda Utilizado/Disponible — sin gráfico */}
                  <div className="flex flex-col gap-3.5 shrink-0 self-center md:self-auto max-[765px]:w-full max-[765px]:items-center">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 max-[765px]:justify-center">
                        <div className="bona-gradient-bg w-2.5 h-2.5 rounded-full shrink-0" />
                        <span className="text-xs max-[765px]:text-sm font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Utilizado</span>
                      </div>
                      <p className="text-lg max-[765px]:text-xl font-extrabold text-text-1 tabular-nums">
                        {new Intl.NumberFormat('de-DE').format(animUsado)} XAF
                      </p>
                      <p className="text-xs max-[765px]:text-sm tabular-nums" style={{ color: TEXT4 }}>{animPctUsado}%</p>
                    </div>
                    <div className="h-px w-full bg-border" />
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 max-[765px]:justify-center">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_EMPTY }} />
                        <span className="text-xs max-[765px]:text-sm font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Disponible</span>
                      </div>
                      <p className="text-lg max-[765px]:text-xl font-extrabold tabular-nums" style={{ color: ORA }}>
                        {new Intl.NumberFormat('de-DE').format(animDisponible)} XAF
                      </p>
                      <p className="text-xs max-[765px]:text-sm tabular-nums" style={{ color: TEXT4 }}>{animPctDisponible}%</p>
                    </div>
                  </div>
                </div>

                {/* Divisor */}
                <div className="hidden lg:block w-px bg-border" />
                <div className="lg:hidden h-px bg-border" />

                {/* Score Crediticio — gauge SVG animado */}
                <div className="lg:w-[220px] shrink-0 flex flex-col items-center justify-center text-center gap-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-4">Score Crediticio</p>
                  {/* Gauge: el arco y el número cuentan juntos; el color cambia al cruzar umbrales */}
                  <div className="relative w-[130px] h-[130px]">
                    <ScoreGauge score={animScore} color={animZone.color} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-[40px] font-extrabold leading-none tabular-nums ${scoreDone ? 'score-settled' : ''}`}
                            style={{ color: animZone.color }}>
                        {animScore}
                      </span>
                    </div>
                  </div>
                  <p className="text-[12px] text-text-4">
                    / 1000 · <span className="font-semibold" style={{ color: scoreZone.color }}>Riesgo {scoreZone.label}</span>
                  </p>
                </div>
              </div>

            </div>

            {/* ── Panel 2: Actividad financiera + Riesgo y solicitudes, en una sola card ── */}
            <div className="card-lift card-enter bg-white rounded-[14px] border border-border overflow-hidden">

            {/* Sección: Actividad financiera */}
            <div className="pb-3">
              <div className="flex flex-wrap justify-between items-start gap-3 px-4 pt-4 pb-2">
                <div>
                  <p className="text-[13px] font-bold text-text-1">
                    {activityView === 'evolucion' ? 'Evolución Financiera' : 'Flujo Financiero'}
                  </p>
                  <p className="text-[11px] text-text-4">
                    {activityView === 'evolucion' ? 'Últimos 6 meses' : 'Últimas 4 semanas'}
                    <span className="hidden md:inline"> · XAF</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex items-center gap-4">
                    {activityView === 'evolucion' ? (
                      evolucionSeries.map(s => (
                        <div key={s.key}
                          className="flex items-center gap-1.5 cursor-pointer"
                          style={{ opacity: hoveredSeries && hoveredSeries !== s.key ? 0.3 : 1, transition: 'opacity 0.18s ease' }}
                          onMouseEnter={() => setHoveredSeries(s.key)}
                          onMouseLeave={() => setHoveredSeries(null)}
                        >
                          <div className="rounded-full" style={{ background: s.color, width: 24, height: hoveredSeries === s.key ? 3 : 2, transition: 'height 0.18s ease' }} />
                          <span className="text-[10px] text-text-4">{s.label}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 cursor-pointer"
                          style={{ opacity: hoveredGroup && hoveredGroup !== 'inflow' ? 0.3 : 1, transition: 'opacity 0.18s ease' }}
                          onMouseEnter={() => setHoveredGroup('inflow')}
                          onMouseLeave={() => setHoveredGroup(null)}
                        >
                          <div className="w-3 h-3 rounded-sm" style={{ background: ORA }} />
                          <span className="text-[10px] text-text-4">Entradas</span>
                        </div>
                        <div className="flex items-center gap-1.5 cursor-pointer"
                          style={{ opacity: hoveredGroup && hoveredGroup !== 'outflow' ? 0.3 : 1, transition: 'opacity 0.18s ease' }}
                          onMouseEnter={() => setHoveredGroup('outflow')}
                          onMouseLeave={() => setHoveredGroup(null)}
                        >
                          <div className="w-3 h-3 rounded-sm" style={{ background: RED, opacity: 0.82 }} />
                          <span className="text-[10px] text-text-4">Salidas</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1 bg-page-bg p-1 rounded-[8px] shrink-0">
                    <button onClick={() => setActivityView('evolucion')}
                      className={`px-3 py-1.5 rounded-[6px] text-[11px] font-semibold transition-all cursor-pointer ${
                        activityView === 'evolucion' ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
                      }`}>
                      Evolución
                    </button>
                    <button onClick={() => setActivityView('flujo')}
                      className={`px-3 py-1.5 rounded-[6px] text-[11px] font-semibold transition-all cursor-pointer ${
                        activityView === 'flujo' ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
                      }`}>
                      Flujo
                    </button>
                  </div>
                </div>
              </div>
              {activityView === 'evolucion' ? (
                <div key={`evo-${activityView}`} className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-3 px-4">
                  <div className="w-full md:flex-1 md:min-w-0">
                    {/* Desktop */}
                    <div className="hidden md:block h-[240px] w-full">
                      {evolucionHasData
                        ? <LineChart data={evolucionData} series={evolucionSeries} windowStart={evoWindowStart} minValue={evoMonto} h={240} vbW={860} hoveredSeries={hoveredSeries} />
                        : <div className="h-full flex items-center justify-center text-[12px]" style={{ color: TEXT4 }}>Sin datos para este filtro</div>}
                    </div>
                    {/* Móvil */}
                    <div className="block md:hidden h-[300px] w-full">
                      {evolucionHasData
                        ? <LineChart data={evolucionData} series={evolucionSeries} windowStart={evoWindowStart} minValue={evoMonto} h={300}
                            vbW={420} pl={50} pr={14} pt={18} pb={38} fxSz={14} fySz={13} compact hoveredSeries={hoveredSeries} />
                        : <div className="h-full flex items-center justify-center text-[12px]" style={{ color: TEXT4 }}>Sin datos para este filtro</div>}
                    </div>
                  </div>
                  {/* Filtros — en móvil debajo de la gráfica uno al lado del otro; en desktop apilados en el lateral */}
                  <div className="flex flex-row gap-4 md:flex-col md:justify-center md:gap-6 md:w-44 lg:w-56 md:shrink-0">
                    <div className="flex-1 min-w-0 md:flex-none">
                      <MiniRangeInput label="Periodo" min={2} max={evolucionData.length} value={evoPeriodo}
                        onChange={setEvoPeriodo} format={v => `${v} meses`} />
                    </div>
                    <div className="flex-1 min-w-0 md:flex-none">
                      <MiniRangeInput label="Monto mín." min={0} max={130} step={5} value={evoMonto}
                        onChange={setEvoMonto} format={v => `${v}M`} />
                    </div>
                  </div>
                </div>
              ) : (
                <div key={`flujo-${activityView}`} className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-3 px-4">
                  <div className="w-full md:flex-1 md:min-w-0">
                    {/* Desktop */}
                    <div className="hidden md:block h-[240px] w-full">
                      {flujoHasData
                        ? <GroupedBarChart data={flujoData} windowStart={flujoWindowStart} minValue={flujoMonto} h={240} vbW={860} hoveredGroup={hoveredGroup} />
                        : <div className="h-full flex items-center justify-center text-[12px]" style={{ color: TEXT4 }}>Sin datos para este filtro</div>}
                    </div>
                    {/* Móvil */}
                    <div className="block md:hidden h-[300px] w-full">
                      {flujoHasData
                        ? <GroupedBarChart data={flujoData} windowStart={flujoWindowStart} minValue={flujoMonto} h={300}
                            vbW={420} pl={50} pr={8} pt={18} pb={38} fxSz={14} fySz={13} compact hoveredGroup={hoveredGroup} />
                        : <div className="h-full flex items-center justify-center text-[12px]" style={{ color: TEXT4 }}>Sin datos para este filtro</div>}
                    </div>
                  </div>
                  {/* Filtros — en móvil debajo de la gráfica uno al lado del otro; en desktop apilados en el lateral */}
                  <div className="flex flex-row gap-4 md:flex-col md:justify-center md:gap-6 md:w-44 lg:w-56 md:shrink-0">
                    <div className="flex-1 min-w-0 md:flex-none">
                      <MiniRangeInput label="Periodo" min={2} max={flujoData.length} value={flujoPeriodo}
                        onChange={setFlujoPeriodo} format={v => `${v} sem.`} />
                    </div>
                    <div className="flex-1 min-w-0 md:flex-none">
                      <MiniRangeInput label="Monto mín." min={0} max={90_000_000} step={5_000_000} value={flujoMonto}
                        onChange={setFlujoMonto} format={v => `${Math.round(v / 1_000_000)}M`} />
                    </div>
                  </div>
                </div>
              )}

              <p className="block md:hidden text-[10px] text-center pb-2 pt-1 px-4" style={{ color: TEXT4 }}>
                Valores expresados en millones XAF
              </p>
            </div>

            {/* Divisor */}
            <div className="h-px w-full bg-border" />

            {/* Sección: Riesgo y solicitudes */}
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Riesgo de Operaciones */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FDF6E8' }}>
                      <Shield className="w-6 h-6" style={{ color: WARN }} />
                    </div>
                    <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">Riesgo de Operaciones</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {riesgoOps.map((r, i) => (
                      <div key={r.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-medium text-text-2">{r.label}</span>
                          <span className="text-[10px] font-bold tabular-nums" style={{ color: r.color }}>{r.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: BORDER }}>
                          <div className="h-full rounded-full"
                               style={{
                                 background: r.color,
                                 width: barsVisible ? `${r.pct}%` : '0%',
                                 transition: `width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 160}ms`,
                               }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Solicitudes Pendientes */}
                <div className="md:border-l md:border-border md:pl-5 pt-4 md:pt-0 border-t md:border-t-0 border-border flex flex-col items-center md:justify-center text-center">
                  <p className="text-[11px] font-semibold text-text-4 uppercase tracking-widest mb-4">Solicitudes Pendientes</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                      <Clock className="w-7 h-7" style={{ color: ORA }} />
                    </div>
                    <p className="text-[40px] font-extrabold leading-none text-text-1 tabular-nums">{SOLICITUDES_PEND}</p>
                  </div>
                  <p className="text-xs mb-3 font-medium tabular-nums" style={{ color: TEXT4 }}>
                    {new Intl.NumberFormat('de-DE').format(animSolXaf)} XAF
                  </p>
                  <button onClick={() => go('epSolicitudes')} className="text-[12px] font-semibold flex items-center gap-1 cursor-pointer hover:opacity-75 transition"
                          style={{ color: ORA }}>
                    Ver solicitudes <ChevronRight className="w-4 h-4" />
                  </button>
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
              {envKpis.map(({ value, label }) => (
                <div key={label} className="card-enter bg-white rounded-[14px] shadow-sm overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
                  <div className="p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-semibold text-text-4 uppercase tracking-wide leading-tight">{label}</span>
                    <span className="text-[17px] font-extrabold leading-none text-text-1">{value}</span>
                  </div>
                  <div className="h-[4px]" style={{ background: 'var(--bonafide-gradient)' }} />
                </div>
              ))}
            </div>

            {/* Proyectos — misma estructura de tabla que el panel admin de kappa */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-[14px] font-bold text-text-1">Proyectos</div>
                  <div className="text-[11px] text-text-4">Todos tus proyectos medioambientales</div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-[6px]"
                     style={{ background: '#E3F4EA', color: GREEN }}>
                  <TreePine className="w-3.5 h-3.5" style={{ animation: 'treeSway 0.85s ease-in-out 0.25s 1 both', transformOrigin: 'bottom center' }} />
                  8 registrados
                </div>
              </div>
              <div className="sm:hidden space-y-2">
                {proyectos.map((p, i) => (
                  <div key={i} className="rounded-[12px] border p-3"
                    style={{ animation: `cardSpotlight 14.4s ease-in-out ${-((proyectos.length - i) * 1.8).toFixed(1)}s infinite` }}>
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
                <div className="min-w-[420px]">
                  <div className="grid bg-page-bg border-b border-border mb-1" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr' }}>
                    <div className="px-3 py-2.5 text-xs font-semibold text-text-4 uppercase tracking-wider">Proyecto</div>
                    <div className="px-3 py-2.5 text-xs font-semibold text-text-4 uppercase tracking-wider text-center">Estado</div>
                    <div className="px-3 py-2.5 text-xs font-semibold text-text-4 uppercase tracking-wider text-center">Riesgo</div>
                    <div className="px-3 py-2.5 text-xs font-semibold text-text-4 uppercase tracking-wider text-right">Financiamiento</div>
                  </div>
                  <div className="space-y-0.5">
                    {proyectos.map((p, i) => (
                      <div key={i} className="grid items-center rounded-[8px]"
                        style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr', animation: `rowSpotlight 14.4s ease-in-out ${-((proyectos.length - i) * 1.8).toFixed(1)}s infinite` }}>
                        <div className="px-3 py-3 text-sm font-semibold min-w-0 truncate"
                          style={{ animation: `rowTextSpotlight 14.4s ease-in-out ${-((proyectos.length - i) * 1.8).toFixed(1)}s infinite` }}>
                          {p.nombre}
                        </div>
                        <div className="px-3 py-3 text-center whitespace-nowrap"><Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge></div>
                        <div className="px-3 py-3 text-center whitespace-nowrap"><Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge></div>
                        <div className="px-3 py-3 text-sm font-bold text-text-1 text-right whitespace-nowrap">{p.fin}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
