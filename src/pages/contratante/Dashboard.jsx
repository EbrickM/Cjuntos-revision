import { useState, useEffect } from 'react';
import { useApp } from '../../state/AppContext';
import { contratoService } from '../../services/contrato.service';
import { useCountUp } from '../../hooks/useCountUp';
import ScoreGauge from '../../components/common/ScoreGauge';
import {
  TrendingUp, Leaf, Download, ArrowUpRight,
  Shield, ChevronRight, Users, BadgeCheck, GraduationCap, Heart, Briefcase,
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
  { id: 'fondos',  line1: 'Dashboard',    line2: 'Financiero',                Icon: TrendingUp, iconBg: '#FFF3E0', iconColor: ORA   },
  { id: 'impacto', line1: 'Dashboard de', line2: 'Impacto',                   Icon: Leaf,       iconBg: '#E3F4EA', iconColor: GREEN },
];

// ── Datos Fondos ──────────────────────────────────────────────────────────────
const FONDO_TOTAL     = 180_000_000;
const FONDO_USADO     = 47_500_000;
const FONDO_DISP      = 132_500_000;
const _CHART_COLORS = [RED, ORA, WARN, GREEN, TEXT4];
const _empMap = new Map();
contratoService.listarPorVista('contratante')
  .filter(c => c.tipo !== 'marco')
  .forEach(c => {
    const nombre = c.pyme || c.pymeNombre || '';
    if (!nombre || nombre === '—') return;
    _empMap.set(nombre, (_empMap.get(nombre) ?? 0) + (c.monto ?? c.montoAsignado ?? 0));
  });

const pymeDist = [..._empMap.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([label, total], i) => ({
    label,
    value: Math.round(total / 1_000_000),
    color: _CHART_COLORS[i % _CHART_COLORS.length],
  }));

const PYMES_FINANC = pymeDist.length;
const CONTRATOS_ACTIV   = 1;
const SCORE             = 720;
const scoreZone = SCORE < 400 ? { label: 'Crítico', color: RED  }
  : SCORE < 600 ? { label: 'Alto',  color: ERR  }
  : SCORE < 750 ? { label: 'Medio', color: WARN }
  : { label: 'Bajo', color: ORA };
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
  { key: 'disponible', color: ORA,   label: 'Fondo Disponible'  },
  { key: 'ejecucion',  color: WARN,  label: 'En Ejecución'      },
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

// ── Impacto data ─────────────────────────────────────────────────────────────
const HOME_ESG_METAS = [
  { label: 'Reducción de emisiones', pct: 62, color: GREEN },
  { label: 'Energía renovable',      pct: 48, color: WARN  },
  { label: 'Gestión de residuos',    pct: 35, color: WARN  },
];
const HOME_SOCIAL_METAS = [
  { label: 'Empleabilidad cadena',  pct: 82, color: ORA   },
  { label: 'Educación y formación', pct: 71, color: WARN  },
  { label: 'Salud comunitaria',     pct: 58, color: GREEN },
];
const EMPLEOS_TOTAL = 820;
const INV_SOCIAL    = 180_000_000;

const proyectos = [
  { nombre: 'Parque Solar Malabo I',   estado: 'En ejecución', fin: 120_000_000 },
  { nombre: 'Reforestación Costa GE',  estado: 'En ejecución', fin: 85_000_000  },
  { nombre: 'Biogás Residuos Bata',    estado: 'Planificado',  fin: 65_000_000  },
  { nombre: 'Agro Sostenible Norte',   estado: 'En ejecución', fin: 42_000_000  },
  { nombre: 'Huella Cero 2027',        estado: 'Planificado',  fin: 200_000_000 },
];

const iniciativasSociales = [
  { nombre: 'Bienestar trabajadores cadena de suministro', categoria: 'Empleabilidad',   estado: 'En ejecución', beneficiarios: 850  },
  { nombre: 'Centro de formación técnica Malabo',          categoria: 'Educación',       estado: 'En ejecución', beneficiarios: 320  },
  { nombre: 'Brigadas médicas comunitarias',               categoria: 'Salud',           estado: 'Finalizado',   beneficiarios: 1200 },
  { nombre: 'Infraestructura vial acceso comunidades',     categoria: 'Infraestructura', estado: 'Planificado',  beneficiarios: 600  },
  { nombre: 'Microfinanzas para emprendedores locales',    categoria: 'Empleabilidad',   estado: 'En ejecución', beneficiarios: 120  },
];

const fmtXAF      = (n) => n.toLocaleString('de-DE').replace(/,/g, '.') + ' XAF';
const estadoBadge = e => e === 'En ejecución' ? 'orange' : e === 'Planificado' ? 'amber' : e === 'Finalizado' ? 'green' : e === 'Suspendido' ? 'red' : 'gray';

// ── Component ─────────────────────────────────────────────────────────────────
export default function EmpDash() {
  const { go } = useApp();
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

  const animZone = animScore < 400 ? { label: 'Crítico', color: RED  }
    : animScore < 600              ? { label: 'Alto',    color: ERR  }
    : animScore < 750              ? { label: 'Medio',   color: WARN }
    :                                { label: 'Bajo',    color: ORA  };

  const animPctUsado = FONDO_TOTAL > 0 ? Math.round((animUsado / FONDO_TOTAL) * 100) : 0;
  const animPctDisp  = 100 - animPctUsado;
  const scoreDone    = animScore >= SCORE;

  const animProyActivos = useCountUp(3,             900,  100);
  const animCO2         = useCountUp(12400,          1000, 200);
  const animEmpleos     = useCountUp(EMPLEOS_TOTAL,  1400, 600);
  const animInvSocial   = useCountUp(INV_SOCIAL,     1500, 700);

  const [barsVisible, setBarsVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setBarsVisible(true), 450);
    return () => clearTimeout(id);
  }, []);

  const [impactoBars, setImpactoBars] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setImpactoBars(tab === 'impacto'), tab === 'impacto' ? 300 : 0);
    return () => clearTimeout(id);
  }, [tab]);

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
                <div className={`w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 transition-all ${tab === t.id ? 'bona-gradient-bg' : 'opacity-50'}`}>
                  <t.Icon className="w-4 h-4" style={{ color: tab === t.id ? 'white' : t.iconColor }} />
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
              <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center transition-all ${tab === t.id ? 'bona-gradient-bg' : 'opacity-50'}`}>
                <t.Icon className="w-5 h-5" style={{ color: tab === t.id ? 'white' : t.iconColor }} />
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
                      <button onClick={() => go('empContratos')}
                              className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-transform duration-150 hover:scale-105"
                              style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORA }} />
                        {CONTRATOS_ACTIV} contratos activos
                      </button>
                      <button onClick={() => go('empPymes')}
                              className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-transform duration-150 hover:scale-105"
                              style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORA }} />
                        {PYMES_FINANC} Emp. Contratada{PYMES_FINANC === 1 ? '' : 's'} financiada{PYMES_FINANC === 1 ? '' : 's'}
                      </button>
                      <button onClick={() => go('empFacturas')}
                              className="inline-flex items-center gap-1.5 text-[11px] max-[765px]:text-xs font-semibold px-2.5 py-1 rounded-[6px] cursor-pointer transition-transform duration-150 hover:scale-105"
                              style={{ background: '#FFF3E0', color: ORA, border: '1px solid rgba(239,122,44,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORA }} />
                        {FACTURAS_COUNT} facturas · {new Intl.NumberFormat('de-DE').format(animFactMonto)} XAF
                      </button>
                    </div>
                  </div>

                  {/* Leyenda Utilizado/Disponible — sin gráfico, igual que PYME */}
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
                    <p className="text-[13px] font-bold text-text-1 mb-1">Distribución del Fondo por Empresa Contratada</p>
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

        {/* ══ PESTAÑA IMPACTO ══════════════════════════════════════════════════ */}
        {tab === 'impacto' && (
          <div key="impacto" className="fade-in space-y-4">

            {/* KPIs combinados */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              {[
                { value: String(animProyActivos),                label: 'Proyectos activos'  },
                { value: `${animCO2.toLocaleString('de-DE')} t`, label: 'Captura CO₂'        },
                { value: String(animEmpleos),                    label: 'Empleos generados'  },
                { value: fmtXAF(animInvSocial),                  label: 'Inversión social'   },
              ].map(({ value, label }) => (
                <div key={label} className="card-enter bg-white rounded-[14px] shadow-sm overflow-hidden transition-transform duration-200 hover:scale-[1.02] cursor-default">
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
              <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col gap-4 transition-transform duration-200 hover:scale-[1.015] cursor-default">
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
                    Verde CO₂
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
                <button onClick={() => go('empESG')}
                  className="mt-auto flex items-center gap-1 text-[12px] font-semibold hover:underline self-start cursor-pointer"
                  style={{ color: GREEN }}>
                  Ver detalle completo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Social */}
              <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col gap-4 transition-transform duration-200 hover:scale-[1.015] cursor-default">
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
                    Impacto Regional
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
                <button onClick={() => go('empESG')}
                  className="mt-auto flex items-center gap-1 text-[12px] font-semibold hover:underline self-start cursor-pointer"
                  style={{ color: ORA }}>
                  Ver detalle completo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tablas resumen: Ambiental + Social en dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Proyectos Ambientales */}
              <div className="bg-white rounded-[14px] border border-border p-5 transition-transform duration-200 hover:scale-[1.015] cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[13px] font-bold text-text-1">Proyectos Ambientales</div>
                    <div className="text-[11px] text-text-4">Últimos proyectos registrados</div>
                  </div>
                  <button onClick={() => go('empESG')} className="flex items-center gap-0.5 text-[11px] font-bold cursor-pointer" style={{ color: GREEN }}>
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
                      {proyectos.map((p, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors">
                          <td className="px-3 py-2.5 text-[12px] font-medium text-text-1 max-w-[140px] truncate">{p.nombre}</td>
                          <td className="px-3 py-2.5 text-center whitespace-nowrap"><Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge></td>
                          <td className="px-3 py-2.5 text-right text-[11px] font-bold text-text-1 whitespace-nowrap">{fmtXAF(p.fin)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Iniciativas Sociales */}
              <div className="bg-white rounded-[14px] border border-border p-5 transition-transform duration-200 hover:scale-[1.015] cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[13px] font-bold text-text-1">Iniciativas Sociales</div>
                    <div className="text-[11px] text-text-4">Programas de impacto social activos</div>
                  </div>
                  <button onClick={() => go('empESG')} className="flex items-center gap-0.5 text-[11px] font-bold cursor-pointer" style={{ color: ORA }}>
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
                          'Educación':       { bg: '#FDF6E8', color: WARN,      border: 'rgba(198,138,29,0.35)', Icon: GraduationCap },
                          'Salud':           { bg: '#E3F4EA', color: GREEN,     border: '#A8D5BE',               Icon: Heart         },
                          'Empleabilidad':   { bg: '#FFF3E0', color: ORA,       border: 'rgba(239,122,44,0.35)', Icon: Briefcase     },
                          'Infraestructura': { bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1',               Icon: Shield        },
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
