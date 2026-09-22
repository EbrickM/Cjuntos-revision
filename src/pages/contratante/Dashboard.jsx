import { useState, useEffect } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import ScoreGauge from '../../components/common/ScoreGauge';
import {
  TrendingUp, TreePine, Download, ArrowUpRight,
  CheckCircle, CreditCard, Shield,
  Wind
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import { MultiLineChart, VBarChart, HBarChart } from '../../components/charts/Charts';

// ── MIC Brand tokens ──────────────────────────────────────────────────────────
const RED         = '#E0201C';
const ORA         = '#EF7A2C';
const GREEN       = '#2E7D5B';
const WARN        = '#C68A1D';
const ERR         = '#B8352A';
const TEXT4       = '#A9A6A1';
const DONUT_EMPTY = '#C4C1BC';

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
  { id: 'fondos',         line1: 'Dashboard de', line2: 'Fondos y PYMEs', Icon: TrendingUp, iconBg: '#FFF3E0', iconColor: ORA   },
  { id: 'medioambiental', line1: 'Dashboard',    line2: 'Medioambiental', Icon: TreePine,   iconBg: '#E3F4EA', iconColor: GREEN },
];

// ── Datos Fondos ──────────────────────────────────────────────────────────────
const FONDO_TOTAL     = 180_000_000;
const FONDO_USADO     = 47_500_000;
const FONDO_DISP      = 132_500_000;
const PYMES_FINANC      = 1;
const CONTRATOS_ACTIV   = 1;
const SCORE             = 720;
const scoreZone = SCORE < 400 ? { label: 'Crítico', color: ERR }
  : SCORE < 600 ? { label: 'Alto',  color: ERR }
  : SCORE < 750 ? { label: 'Medio', color: WARN }
  : { label: 'Bajo', color: GREEN };
const FACTURAS_COUNT    = 2;
const FACTURAS_MONTO    = 47_500_000;
const SOLICITUDES_TOTAL = 6;

const evolucionFondoData = [
  { label: 'Ene', asignado:  50, disponible:  50, ejecucion:  0  },
  { label: 'Feb', asignado:  80, disponible:  72, ejecucion:  8  },
  { label: 'Mar', asignado: 110, disponible:  96, ejecucion: 20  },
  { label: 'Abr', asignado: 130, disponible: 105, ejecucion: 28  },
  { label: 'May', asignado: 155, disponible: 118, ejecucion: 38  },
  { label: 'Jun', asignado: 170, disponible: 126, ejecucion: 44  },
  { label: 'Jul', asignado: 180, disponible: 132, ejecucion: 48  },
];

const evolucionFondoSeries = [
  { key: 'asignado',   color: RED,   label: 'Fondo Asignado'    },
  { key: 'disponible', color: GREEN, label: 'Fondo Disponible'  },
  { key: 'ejecucion',  color: ORA,   label: 'En Ejecución'      },
];

const pymeDist = [
  { label: 'Tradex', value: 180, color: RED },
];

const estadoOps = [
  { tipo: 'Pendientes',  pct: 50, count: 3, color: TEXT4 },
  { tipo: 'Aprobadas',   pct: 17, count: 1, color: GREEN },
  { tipo: 'En revisión', pct: 17, count: 1, color: ORA   },
  { tipo: 'Rechazadas',  pct: 16, count: 1, color: ERR   },
];

const tipoBarData = [
  { label: 'Construcción', shortLabel: 'Construcc.', value: 180, color: RED   },
  { label: 'Energía',      shortLabel: 'Energía',    value: 120, color: ORA   },
  { label: 'Transporte',   shortLabel: 'Transporte', value:  90, color: WARN  },
  { label: 'Agroindustria', shortLabel: 'Agroindust.', value: 60, color: GREEN },
];

const EVO_MAX = Math.max(...evolucionFondoData.map(d => d.asignado));

// ── Medioambiental data ───────────────────────────────────────────────────────
const envKpis = [
  { value: '8',        label: 'Proyectos registrados', Icon: TreePine,    iconColor: GREEN },
  { value: '4',        label: 'Proyectos activos',     Icon: CheckCircle, iconColor: ORA   },
  { value: '3',        label: 'Proyectos financiados', Icon: CreditCard,  iconColor: RED   },
  { value: '12 450 t', label: 'Captura potencial CO₂', Icon: Wind,        iconColor: GREEN },
  { value: 'Medio',    label: 'Riesgo ambiental',      Icon: Shield,      iconColor: WARN  },
];

const proyectos = [
  { nombre: 'Reforestación Bata Norte',    estado: 'En ejecución', riesgo: 'Bajo',  fin: '45 000 000 XAF' },
  { nombre: 'Agro Sierra Sur',             estado: 'En ejecución', riesgo: 'Medio', fin: '28 000 000 XAF' },
  { nombre: 'Energía Solar Malabo',        estado: 'Planificado',  riesgo: 'Bajo',  fin: '62 000 000 XAF' },
  { nombre: 'Gestión Residuos Bata',       estado: 'Finalizado',   riesgo: 'Bajo',  fin: '18 000 000 XAF' },
  { nombre: 'Reforestación Ebebiyín',      estado: 'Planificado',  riesgo: 'Medio', fin: '35 000 000 XAF' },
  { nombre: 'Agricultura Sostenible Bata', estado: 'En ejecución', riesgo: 'Bajo',  fin: '18 000 000 XAF' },
  { nombre: 'Energía Eólica Malabo',       estado: 'En ejecución', riesgo: 'Bajo',  fin: '32 000 000 XAF' },
  { nombre: 'Reforestación Annobon',       estado: 'Suspendido',   riesgo: 'Medio', fin: '22 000 000 XAF' },
];

const estadoBadge = e => e === 'En ejecución' ? 'orange' : e === 'Planificado' ? 'amber' : e === 'Finalizado' ? 'green' : e === 'Suspendido' ? 'red' : 'gray';
const riesgoBadge = r => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';

// ── Component ─────────────────────────────────────────────────────────────────
export default function EmpDash() {
  const [tab, setTab] = useState('fondos');
  const [activityView, setActivityView] = useState('evolucion');
  const [devToast, setDevToast] = useState(false);
  const showDevToast = () => { setDevToast(true); setTimeout(() => setDevToast(false), 3500); };

  const [evoPeriodo, setEvoPeriodo] = useState(evolucionFondoData.length);
  const [evoMonto, setEvoMonto]     = useState(0);
  const evoWindowStart = evolucionFondoData.length - evoPeriodo;
  const evolucionHasData = evolucionFondoData.some((d, i) =>
    i >= evoWindowStart && evolucionFondoSeries.some(s => d[s.key] >= evoMonto));

  // ── Contadores animados ───────────────────────────────────────────────────
  const animTotal      = useCountUp(FONDO_TOTAL,    1800, 200);
  const animUsado      = useCountUp(FONDO_USADO,    1600, 400);
  const animDisp       = useCountUp(FONDO_DISP,     1600, 400);
  const animScore      = useCountUp(SCORE,          1500, 300);
  const animFactMonto  = useCountUp(FACTURAS_MONTO, 1400, 350);

  const animZone = animScore < 400 ? { label: 'Crítico', color: ERR  }
    : animScore < 600              ? { label: 'Alto',    color: ERR  }
    : animScore < 750              ? { label: 'Medio',   color: WARN }
    :                                { label: 'Bajo',    color: GREEN };

  const animPctUsado = FONDO_TOTAL > 0 ? Math.round((animUsado / FONDO_TOTAL) * 100) : 0;
  const animPctDisp  = 100 - animPctUsado;
  const scoreDone    = animScore >= SCORE;

  const [barsVisible, setBarsVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setBarsVisible(true), 450);
    return () => clearTimeout(id);
  }, []);

  const [hoveredSeries, setHoveredSeries] = useState(null);


  return (
    <AppShell active="empDash" role="contratante" back>
      <div className="fade-in space-y-4">

        {/* ── Header ──────────────────────────────────────────────────────────────
            El nav de escritorio (pills en fila) no cabe junto al nombre desde
            que el sidebar reduce el ancho de contenido — por debajo de 1156px
            se apilan (nombre arriba, nav abajo) en vez de comprimirse uno
            contra el otro. */}
        <div className="flex flex-col min-[1156px]:flex-row min-[1156px]:items-center min-[1156px]:justify-between gap-3 max-[765px]:items-center max-[765px]:text-center">
          <div className="min-w-0">
            <div className="text-[20px] font-bold text-text-1 truncate">
              Bienvenido, Chevron
            </div>
            <div className="text-[13px] text-text-4">Gestión de fondo y cadena de suministro · Agosto 2026</div>
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
              {/* La fila fondo|score solo pasa a horizontal en lg — entre md y lg el
                  sidebar deja muy poco ancho de contenido y forzarla en fila (antes en
                  md) hacía que el texto se montara encima del panel de Score. */}
              <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">

                {/* Fondo: título + cifra + CTAs + badges + donut — por debajo de 766px
                    todas las cards quedan en una sola columna, así que aquí se centra
                    el contenido en vez de dejarlo alineado a la izquierda. */}
                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-5 max-[765px]:items-center max-[765px]:text-center">
                  <div className="flex-1 min-w-0 max-[765px]:w-full">
                    <p className="text-[11px] max-[765px]:text-xs font-semibold uppercase tracking-[1.2px] mb-2" style={{ color: TEXT4 }}>
                      FONDO DE PARTICIPACIÓN
                    </p>
                    <div className="flex items-baseline gap-2 mb-4 max-[765px]:justify-center">
                      <span className="font-extrabold text-text-1 leading-none tabular-nums"
                            style={{ fontSize: 'clamp(26px, 3.5vw, 36px)' }}>
                        {new Intl.NumberFormat('de-DE').format(animTotal)}
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
                        {PYMES_FINANC} PYMEs financiadas
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px]"
                            style={{ background: '#E3F4EA', color: GREEN, border: '1px solid rgba(46,125,91,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                        {FACTURAS_COUNT} facturas · {new Intl.NumberFormat('de-DE').format(animFactMonto)} XAF
                      </span>
                    </div>
                  </div>

                  {/* Leyenda Utilizado/Disponible — sin gráfico, igual que PYME */}
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
                        {new Intl.NumberFormat('de-DE').format(animDisp)} XAF
                      </p>
                      <p className="text-xs max-[765px]:text-sm tabular-nums" style={{ color: TEXT4 }}>{animPctDisp}%</p>
                    </div>
                  </div>
                </div>

                {/* Divisor */}
                <div className="hidden lg:block w-px bg-border" />
                <div className="lg:hidden h-px bg-border" />

                {/* Score Crediticio — gauge SVG animado */}
                <div className="lg:w-[220px] shrink-0 flex flex-col items-center justify-center text-center gap-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-4">Score Crediticio</p>
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

            {/* ── Panel 2: Actividad del fondo + Distribución/Solicitudes/Tipo, en una sola card ── */}
            <div className="card-lift card-enter bg-white rounded-[14px] border border-border overflow-hidden">

              {/* Sección: Actividad financiera — Evolución / Tipo, con selector */}
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
                          <div key={s.key}
                            className="flex items-center gap-1.5 cursor-pointer"
                            style={{ opacity: hoveredSeries && hoveredSeries !== s.key ? 0.3 : 1, transition: 'opacity 0.18s ease' }}
                            onMouseEnter={() => setHoveredSeries(s.key)}
                            onMouseLeave={() => setHoveredSeries(null)}
                          >
                            <div className="rounded-full" style={{ background: s.color, width: 20, height: hoveredSeries === s.key ? 3 : 2, transition: 'height 0.18s ease' }} />
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
                      {/* Desktop */}
                      <div className="hidden md:block h-[240px] w-full">
                        {evolucionHasData
                          ? <MultiLineChart key={`emp-evo-${activityView}`} data={evolucionFondoData} series={evolucionFondoSeries} windowStart={evoWindowStart} minValue={evoMonto} h={240} vbW={1000} pl={48} hoveredSeries={hoveredSeries} />
                          : <div className="h-full flex items-center justify-center text-[12px]" style={{ color: TEXT4 }}>Sin datos para este filtro</div>}
                      </div>
                      {/* Móvil */}
                      <div className="block md:hidden h-[280px] w-full">
                        {evolucionHasData
                          ? <MultiLineChart key={`emp-evo-m-${activityView}`} data={evolucionFondoData} series={evolucionFondoSeries} windowStart={evoWindowStart} minValue={evoMonto} h={280} vbW={380} pl={44} fxSz={13} fySz={11} hoveredSeries={hoveredSeries} />
                          : <div className="h-full flex items-center justify-center text-[12px]" style={{ color: TEXT4 }}>Sin datos para este filtro</div>}
                      </div>
                    </div>
                    {/* Filtros — en móvil debajo de la gráfica uno al lado del otro; en desktop apilados en el lateral */}
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
                    {/* Desktop */}
                    <div className="hidden sm:block h-[240px] w-full">
                      <VBarChart key={`emp-tipo-${activityView}`} id="ct-tipo" data={tipoBarData} h={240} vbW={1000} unit="M" />
                    </div>
                    {/* Móvil */}
                    <div className="block sm:hidden h-[260px] w-full">
                      <VBarChart key={`emp-tipo-m-${activityView}`} id="ct-tipo-m" data={tipoBarData} h={260} vbW={340} fxSz={12} fvSz={13} unit="M" rotateLabels labelKey="shortLabel" />
                    </div>
                  </>
                )}
                <p className="block md:hidden text-[10px] text-center pb-2 pt-1 px-4" style={{ color: TEXT4 }}>
                  Valores expresados en millones XAF
                </p>
              </div>

              {/* Divisor */}
              <div className="h-px w-full bg-border" />

              {/* Sección: Distribución por PYME + Estado de Contratos */}
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Distribución del Fondo por PYME */}
                  <div>
                    <p className="text-[13px] font-bold text-text-1 mb-1">Distribución del Fondo por PYME</p>
                    <p className="text-[11px] text-text-4 mb-4">¿Quién usa los fondos? · millones XAF</p>
                    <HBarChart data={pymeDist} fmtVal={v => `${v}M XAF`} visible={barsVisible} />
                    <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                      <span className="text-[11px] text-text-4">Total utilizado</span>
                      <span className="text-[12px] font-bold tabular-nums" style={{ color: RED }}>
                        {new Intl.NumberFormat('de-DE').format(animUsado)} XAF
                      </span>
                    </div>
                  </div>

                  {/* Estado de Contratos */}
                  <div className="md:border-l md:border-border md:pl-5 pt-4 md:pt-0 border-t md:border-t-0 border-border flex flex-col items-center md:justify-center text-center">
                    <p className="text-[14px] font-bold text-text-1 mb-1">Estado de Contratos</p>
                    <p className="text-[11px] text-text-4 mb-4">{SOLICITUDES_TOTAL} solicitudes</p>
                    <div className="flex flex-col gap-2 w-full">
                      {estadoOps.map(d => (
                        <div key={d.tipo} className="slide-up flex items-center justify-between rounded-[10px] border border-border bg-page-bg px-4 py-3">
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

            {/* Proyectos */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-[14px] font-bold text-text-1">Proyectos</div>
                  <div className="text-[11px] text-text-4">Todos los proyectos medioambientales</div>
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
                    style={{
                      animation: `cardSpotlight 14.4s ease-in-out ${-((proyectos.length - i) * 1.8).toFixed(1)}s infinite`,
                    }}
                  >
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
