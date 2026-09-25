import { useState, useEffect, useRef } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import ScoreGauge from '../../components/common/ScoreGauge';
import { TrendingUp, Leaf, ChevronRight, Shield, Clock, Users, BadgeCheck, GraduationCap, Heart, Briefcase } from 'lucide-react';
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
  { id: 'financiacion', line1: 'Dashboard de', line2: 'Financiación', Icon: TrendingUp, iconBg: '#FFF3E0', iconColor: ORA   },
  { id: 'impacto',      line1: 'Dashboard de', line2: 'Impacto',      Icon: Leaf,       iconBg: '#E3F4EA', iconColor: GREEN },
];

// ── Datos Financiación ────────────────────────────────────────────────────────
const DISPONIBLE           = 132_500_000;
const LIMITE               = 180_000_000;
const USADO                = 47_500_000;
const CONTRATOS_ACTIVOS    = 1;
const SCORE                = 820;
const scoreZone = SCORE < 400 ? { label: 'Crítico', color: RED  }
  : SCORE < 600 ? { label: 'Alto',  color: ERR  }
  : SCORE < 750 ? { label: 'Medio', color: WARN }
  : { label: 'Bajo', color: ORA };
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
  { key: 'disponible', color: WARN,  label: 'Disponible'            },
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
  { label: 'Bajo',    pct: 64, color: ORA   },
  { label: 'Medio',   pct: 23, color: WARN  },
  { label: 'Alto',    pct: 10, color: ORA   },
  { label: 'Crítico', pct:  3, color: ERR   },
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

const iniciativasSociales = [
  { nombre: 'Formación técnica Malabo',           categoria: 'Educación',     estado: 'En ejecución', beneficiarios: 120 },
  { nombre: 'Acceso agua potable Bata',            categoria: 'Salud',         estado: 'Finalizado',   beneficiarios: 450 },
  { nombre: 'Microcréditos mujeres emprendedoras', categoria: 'Empleabilidad', estado: 'En ejecución', beneficiarios: 35  },
  { nombre: 'Aulas comunitarias Mongomo',          categoria: 'Educación',     estado: 'Planificado',  beneficiarios: 200 },
  { nombre: 'Clínica móvil zonas rurales',         categoria: 'Salud',         estado: 'Planificado',  beneficiarios: 320 },
];

const estadoBadge = (e) => e === 'En ejecución' ? 'orange' : e === 'Planificado' ? 'amber' : e === 'Finalizado' ? 'green' : e === 'Suspendido' ? 'red' : 'gray';
const fmtXAF      = (n) => n.toLocaleString('de-DE').replace(/,/g, '.') + ' XAF';

// ── Datos Impacto (resumen para home) ────────────────────────────────────────
const HOME_ESG_METAS = [
  { label: 'Captura de CO₂',       pct: 45, color: GREEN },
  { label: 'Proyectos activos',     pct: 63, color: WARN  },
  { label: 'Reducción de residuos', pct: 30, color: WARN  },
];
const HOME_SOCIAL_METAS = [
  { label: 'Empleabilidad',     pct: 75, color: ORA   },
  { label: 'Educación',         pct: 68, color: WARN  },
  { label: 'Salud comunitaria', pct: 45, color: GREEN },
];
const EMPLEOS_TOTAL = 167;
const INV_SOCIAL    = 75_000_000;

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
  const animProyActivos = useCountUp(4,               900,  100);
  const animCO2         = useCountUp(12450,           1000, 200);
  const animEmpleos     = useCountUp(EMPLEOS_TOTAL,   1400, 600);
  const animInvSocial   = useCountUp(INV_SOCIAL,      1500, 700);

  // Zona del score calculada sobre el valor animado — los colores cambian
  // en tiempo real al cruzar los umbrales (Crítico → Alto → Medio → Bajo).
  const animZone = animScore < 400 ? { label: 'Crítico', color: RED  }
    : animScore < 600              ? { label: 'Alto',    color: ERR  }
    : animScore < 750              ? { label: 'Medio',   color: WARN }
    :                                { label: 'Bajo',    color: ORA  };

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

  // Trigger para barras de impacto: se reinicia al salir de la pestaña
  const [impactoBars, setImpactoBars] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setImpactoBars(tab === 'impacto'), tab === 'impacto' ? 300 : 0);
    return () => clearTimeout(id);
  }, [tab]);

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
          <div className="hidden min-[1156px]:flex gap-1 bg-white rounded-[10px]">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`bona-btn flex items-center gap-2 px-3 py-2 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  tab === t.id ? 'bg-[#EF7A2C] shadow-sm text-white' : 'text-text-3 hover:text-text-1'
                }`}>
                <t.Icon className={`w-4 h-4 shrink-0 transition-all ${tab === t.id ? '' : 'opacity-50'}`} style={{ color: tab === t.id ? 'white' : t.iconColor }} />
                {t.line1} {t.line2}
              </button>
            ))}
          </div>
        </div>

        {/* Tab nav compacto — visible por debajo de 1156px */}
        <div className="flex min-[1156px]:hidden gap-1 bg-white rounded-[10px] w-full">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`bona-btn flex-1 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer text-center ${
                tab === t.id ? 'bg-[#EF7A2C] shadow-sm text-white' : 'text-text-3 hover:text-text-1'
              }`}>
              <t.Icon className={`w-5 h-5 shrink-0 transition-all ${tab === t.id ? '' : 'opacity-50'}`} style={{ color: tab === t.id ? 'white' : t.iconColor }} />
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
                              className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-transform duration-150 hover:scale-105"
                              style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORA }} />
                        {CONTRATOS_ACTIVOS} contratos activos
                      </button>
                      <button onClick={() => go('epProveedores')}
                              className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-transform duration-150 hover:scale-105"
                              style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORA }} />
                        {NUEVOS_PROVEEDORES} proveedores
                      </button>
                      <button onClick={() => go('epFacturacion')}
                              className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-transform duration-150 hover:scale-105"
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
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: RED }} />
                        <span className="text-xs max-[765px]:text-sm font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Utilizado</span>
                      </div>
                      <p className="text-lg max-[765px]:text-xl font-extrabold tabular-nums" style={{ color: RED }}>
                        {new Intl.NumberFormat('de-DE').format(animUsado)} XAF
                      </p>
                      <p className="text-xs max-[765px]:text-sm tabular-nums" style={{ color: TEXT4 }}>{animPctUsado}%</p>
                    </div>
                    <div className="h-px w-full bg-border" />
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 max-[765px]:justify-center">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ORA }} />
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
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
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
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
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


        {/* ══ PESTAÑA IMPACTO ══════════════════════════════════════════════════ */}
        {tab === 'impacto' && (
          <div key="impacto" className="fade-in space-y-4">

            {/* KPIs combinados */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              {[
                { value: String(animProyActivos),                           label: 'Proyectos activos'  },
                { value: `${animCO2.toLocaleString('de-DE')} t`,            label: 'Captura CO₂'        },
                { value: String(animEmpleos),                               label: 'Empleos generados'  },
                { value: fmtXAF(animInvSocial),                             label: 'Inversión social'   },
              ].map(({ value, label }) => (
                <div key={label} className="card-enter bg-white rounded-[14px] shadow-sm overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] cursor-default">
                  <div className="p-4 flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-text-4 uppercase tracking-wide leading-tight">{label}</span>
                    <span className="text-[17px] font-extrabold leading-none text-text-1">{value}</span>
                  </div>
                  <div className="h-[4px]" style={{ background: 'var(--bonafide-gradient)' }} />
                </div>
              ))}
            </div>

            {/* Cards de estado: Ambiental + Social */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Ambiental */}
              <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] cursor-default">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-text-1">Impacto Ambiental</div>
                      <div className="text-[11px] text-text-4">Proyectos y certificación</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0"
                    style={{ background: '#E3F4EA', color: GREEN, border: '1px solid #A8D5BE' }}>
                    <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                    Verde Bonafide
                  </span>
                </div>
                <div className="space-y-3">
                  {HOME_ESG_METAS.map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-text-3">{label}</span>
                        <span className="text-[11px] font-extrabold text-text-1">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                        <div className="h-full rounded-full" style={{ width: impactoBars ? `${pct}%` : '0%', background: color, transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => go('epESG')}
                  className="mt-auto flex items-center gap-1 text-[12px] font-semibold hover:underline self-start cursor-pointer"
                  style={{ color: GREEN }}
                >
                  Ver detalle completo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Social */}
              <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] cursor-default">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-text-1">Impacto Social</div>
                      <div className="text-[11px] text-text-4">Iniciativas y comunidades</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0"
                    style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.35)' }}>
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    Impacto Local
                  </span>
                </div>
                <div className="space-y-3">
                  {HOME_SOCIAL_METAS.map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-text-3">{label}</span>
                        <span className="text-[11px] font-extrabold text-text-1">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                        <div className="h-full rounded-full" style={{ width: impactoBars ? `${pct}%` : '0%', background: color, transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => go('epESG')}
                  className="mt-auto flex items-center gap-1 text-[12px] font-semibold hover:underline self-start cursor-pointer"
                  style={{ color: ORA }}
                >
                  Ver detalle completo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tablas resumen: Ambiental + Social en dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Proyectos Ambientales */}
              <div className="bg-white rounded-[14px] border border-border p-5 transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[13px] font-bold text-text-1">Proyectos Ambientales</div>
                    <div className="text-[11px] text-text-4">Últimos proyectos registrados</div>
                  </div>
                  <button onClick={() => go('epESG')} className="flex items-center gap-0.5 text-[11px] font-bold cursor-pointer" style={{ color: GREEN }}>
                    Ver todos <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[260px]">
                    <thead className="bg-page-bg">
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-[10px] font-semibold text-text-4 uppercase tracking-wider text-left">Proyecto</th>
                        <th className="px-3 py-2 text-[10px] font-semibold text-text-4 uppercase tracking-wider text-center">Estado</th>
                        <th className="px-3 py-2 text-[10px] font-semibold text-text-4 uppercase tracking-wider text-right">Financiamiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyectos.slice(0, 5).map((p, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors">
                          <td className="px-3 py-2.5 text-[12px] font-medium text-text-1 max-w-[140px] truncate">{p.nombre}</td>
                          <td className="px-3 py-2.5 text-center whitespace-nowrap"><Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge></td>
                          <td className="px-3 py-2.5 text-right text-[11px] font-bold text-text-1 whitespace-nowrap">{p.fin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Iniciativas Sociales */}
              <div className="bg-white rounded-[14px] border border-border p-5 transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[13px] font-bold text-text-1">Iniciativas Sociales</div>
                    <div className="text-[11px] text-text-4">Programas de impacto social activos</div>
                  </div>
                  <button onClick={() => go('epESG')} className="flex items-center gap-0.5 text-[11px] font-bold cursor-pointer" style={{ color: ORA }}>
                    Ver todos <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[260px]">
                    <thead className="bg-page-bg">
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-[10px] font-semibold text-text-4 uppercase tracking-wider text-left">Iniciativa</th>
                        <th className="px-3 py-2 text-[10px] font-semibold text-text-4 uppercase tracking-wider text-center">Categoría</th>
                        <th className="px-3 py-2 text-[10px] font-semibold text-text-4 uppercase tracking-wider text-right">Beneficiarios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {iniciativasSociales.map((ini, i) => {
                        const catStyles = {
                          'Educación':     { bg: '#FDF6E8', color: WARN,  border: 'rgba(198,138,29,0.35)', Icon: GraduationCap },
                          'Salud':         { bg: '#E3F4EA', color: GREEN, border: '#A8D5BE',               Icon: Heart         },
                          'Empleabilidad': { bg: '#FFF3E0', color: ORA,   border: 'rgba(239,122,44,0.35)', Icon: Briefcase     },
                        };
                        const cs = catStyles[ini.categoria] ?? { bg: '#F5F4F2', color: TEXT4, border: '#ECEAE7', Icon: Shield };
                        return (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors">
                            <td className="px-3 py-2.5 text-[12px] font-medium text-text-1 max-w-[140px] truncate">{ini.nombre}</td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                                style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                                <cs.Icon className="w-3 h-3 shrink-0" />
                                {ini.categoria}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right text-[12px] font-bold text-text-1">{ini.beneficiarios.toLocaleString('de-DE')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </AppShell>
  );
}
