import { useState } from 'react';
import { TrendingUp, Leaf, Download, ChevronRight, ArrowUpRight, Bell, CheckCircle } from 'lucide-react';
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

// ── LineChart — Evolución Financiera ─────────────────────────────────────────
function LineChart({ data, series, h = 180 }) {
  const W = 560, H = h, PL = 44, PR = 16, PT = 14, PB = 28;
  const cW = W - PL - PR, cH = H - PT - PB;
  const allV = data.flatMap(d => series.map(s => d[s.key]));
  const maxV = Math.max(...allV) * 1.15;
  const xPos = i => PL + (i / (data.length - 1)) * cW;
  const yPos = v => PT + cH - (v / maxV) * cH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        {series.map((s, si) => (
          <linearGradient key={si} id={`lg-area-${si}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.14" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.01" />
          </linearGradient>
        ))}
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <line key={p} x1={PL} y1={PT + cH * (1 - p)} x2={W - PR} y2={PT + cH * (1 - p)}
          stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      ))}
      {series.map((s, si) => {
        const areaD = `M ${xPos(0)},${yPos(data[0][s.key])} ` +
          data.map((d, i) => `L ${xPos(i)},${yPos(d[s.key])}`).join(' ') +
          ` L ${xPos(data.length - 1)},${PT + cH} L ${xPos(0)},${PT + cH} Z`;
        const pts = data.map((d, i) => `${xPos(i)},${yPos(d[s.key])}`).join(' ');
        return (
          <g key={si}>
            <path d={areaD} fill={`url(#lg-area-${si})`} />
            <polyline points={pts} fill="none" stroke={s.color}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      {data.map((d, i) => (
        i % 2 === 0 && (
          <text key={i} x={xPos(i)} y={H - 4} textAnchor="middle"
            fontSize="9" fill={TEXT4} fontFamily="Poppins,sans-serif">{d.label}</text>
        )
      ))}
      {[0, 0.5, 1].map(p => (
        <text key={p} x={PL - 5} y={PT + cH * (1 - p) + 4} textAnchor="end"
          fontSize="9" fill={TEXT4} fontFamily="Poppins,sans-serif">
          {Math.round(maxV * p)}M
        </text>
      ))}
    </svg>
  );
}

// ── StackedBarChart — Flujo Financiero ───────────────────────────────────────
function StackedBarChart({ data, h = 180 }) {
  const W = 420, H = h, PL = 40, PR = 12, PT = 14, PB = 28;
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
        const x = PL + slot * i + (slot - bW) / 2;
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
            <text x={x + bW / 2} y={H - 4} textAnchor="middle" fontSize="9"
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
  { id: 'financiacion',   line1: 'Dashboard de', line2: 'Financiación',   Icon: TrendingUp },
  { id: 'medioambiental', line1: 'Dashboard',    line2: 'Medioambiental', Icon: Leaf },
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
const SOLICITUDES_PEND     = 5;
const SOLICITUDES_XAF      = 44_000_000;
const DESEMBOLSOS_MES      = 18;
const DESEMBOLSOS_XAF      = 86_000_000;
const TIEMPO_APROBACION    = 2.4;

const scoreSparkline = [74, 76, 75, 78, 79, 80, 82];

const evolucionData = [
  { label: 'Jun',  prestamos: 165, facturas:  75 },
  { label: 'Jul',  prestamos: 178, facturas:  88 },
  { label: 'Ago',  prestamos: 172, facturas:  82 },
  { label: 'Sep',  prestamos: 198, facturas: 108 },
  { label: 'Oct',  prestamos: 190, facturas: 102 },
  { label: 'Nov',  prestamos: 215, facturas: 125 },
  { label: 'Dic',  prestamos: 208, facturas: 118 },
  { label: 'Ene',  prestamos: 202, facturas: 115 },
  { label: 'Feb',  prestamos: 218, facturas: 128 },
  { label: 'Mar',  prestamos: 225, facturas: 138 },
  { label: 'Abr',  prestamos: 222, facturas: 133 },
  { label: 'May',  prestamos: 231, facturas: 150 },
];

const evolucionSeries = [
  { key: 'prestamos', color: RED, label: 'Préstamos otorgados' },
  { key: 'facturas',  color: ORA, label: 'Facturas utilizadas' },
];

const flujoData = [
  { label: 'Sem 1', inflow: 42_000_000, outflow: 18_000_000 },
  { label: 'Sem 2', inflow: 25_000_000, outflow: 30_000_000 },
  { label: 'Sem 3', inflow:           0, outflow: 15_000_000 },
  { label: 'Sem 4', inflow: 35_000_000, outflow: 12_000_000 },
];

const riesgoOps = [
  { label: 'Bajo',    pct: 64, color: GREEN },
  { label: 'Medio',   pct: 23, color: WARN  },
  { label: 'Alto',    pct: 10, color: ORA   },
  { label: 'Crítico', pct:  3, color: ERR   },
];

// ── Datos Medioambiental ──────────────────────────────────────────────────────
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


        {/* ══ PESTAÑA FINANCIACIÓN ══════════════════════════════════════════════ */}
        {tab === 'financiacion' && (
          <div key="financiacion" className="fade-in space-y-4">

            {/* ── Fila 1: Hero (izq.) + Score/Alertas (der.) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_236px] gap-4 items-start">

              {/* Columna izquierda */}
              <div className="space-y-4">

                {/* Hero — Mi Billetera */}
                <div className="card-lift bg-white rounded-[18px] border border-border p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-5">

                    {/* Balance info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[1.2px] mb-3"
                         style={{ color: TEXT4 }}>
                        MI BILLETERA · CORTE JUN 2026
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                         style={{ color: TEXT4 }}>
                        Financiación Aprobada
                      </p>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-extrabold text-text-1 leading-none"
                              style={{ fontSize: 'clamp(26px, 4vw, 36px)' }}>
                          {new Intl.NumberFormat('fr-FR').format(DISPONIBLE)}
                        </span>
                        <span className="text-[15px] font-semibold" style={{ color: TEXT4 }}>XAF</span>
                      </div>
                      <p className="text-[11px] mb-4" style={{ color: TEXT4 }}>
                        de {new Intl.NumberFormat('fr-FR').format(LIMITE)} XAF aprobados
                      </p>

                      {/* CTAs */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] font-bold text-[12px] text-white cursor-pointer transition-opacity hover:opacity-90"
                                style={{ background: ORA }}>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Solicitar Financiación
                        </button>
                        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] font-semibold text-[12px] text-text-3 cursor-pointer transition-colors hover:bg-page-bg border border-border">
                          <Download className="w-3.5 h-3.5" />
                          Extracto
                        </button>
                        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] font-semibold text-[12px] text-text-3 cursor-pointer transition-colors hover:bg-page-bg border border-border">
                          Retirar fondos
                        </button>
                      </div>

                      {/* Indicadores */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-[6px]"
                              style={{ background: '#E3F4EA', color: GREEN }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                          {CONTRATOS_ACTIVOS} contratos activos
                        </span>
                        <span className="text-[11px] font-semibold" style={{ color: GREEN }}>
                          ▲ {TREND_DIA} al día anterior
                        </span>
                      </div>
                    </div>

                    {/* Donut + leyenda */}
                    <div className="flex items-center gap-4 shrink-0">
                      <DonutChart
                        data={[
                          { pct: pctUsado,      gradient: true, color: RED },
                          { pct: pctDisponible, color: DONUT_EMPTY         },
                        ]}
                        centerLabel={`${pctDisponible}%`}
                        centerSub="DISPONIBLE"
                        size={190}
                        inner={82}
                      />
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: GRAD }} />
                            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Utilizado</span>
                          </div>
                          <p className="text-[13px] font-extrabold text-text-1">
                            {new Intl.NumberFormat('fr-FR').format(USADO)} XAF
                          </p>
                          <p className="text-[10px]" style={{ color: TEXT4 }}>{pctUsado}%</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_EMPTY }} />
                            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Disponible</span>
                          </div>
                          <p className="text-[13px] font-extrabold" style={{ color: ORA }}>
                            {new Intl.NumberFormat('fr-FR').format(DISPONIBLE)} XAF
                          </p>
                          <p className="text-[10px]" style={{ color: TEXT4 }}>{pctDisponible}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Facturas Activas + Próximos Vencimientos */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-lift bg-white rounded-[14px] border border-border p-4">
                    <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Facturas Activas</p>
                    <p className="text-[28px] font-extrabold leading-none text-text-1 mb-1">{FACTURAS_TOTAL_COUNT}</p>
                    <p className="text-[10px] mb-3" style={{ color: TEXT4 }}>
                      por un total de {new Intl.NumberFormat('fr-FR').format(FACTURAS_TOTAL_MONTO)} XAF
                    </p>
                    <button onClick={() => go('epFacturacion')}
                      className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition"
                      style={{ color: ORA }}>
                      Ver facturas <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="card-lift bg-white rounded-[14px] border border-border p-4">
                    <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Próximos Vencimientos</p>
                    <p className="text-[28px] font-extrabold leading-none text-text-1 mb-1">{VENCIMIENTOS_COUNT}</p>
                    <p className="text-[10px] mb-3" style={{ color: TEXT4 }}>
                      próximo en {new Intl.NumberFormat('fr-FR').format(PROXIMO_MONTO)} XAF
                    </p>
                    <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition"
                            style={{ color: ORA }}>
                      Ver vencimientos <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Columna derecha: Score + Alertas */}
              <div className="space-y-4">
                <div className="card-lift bg-white rounded-[14px] border border-border p-4">
                  <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Score Crediticio</p>
                  <div className="flex items-end gap-2 mb-2">
                    <p className="text-[36px] font-extrabold leading-none text-text-1">{SCORE}</p>
                    <div className="mb-1">
                      <Sparkline data={scoreSparkline} color={GREEN} />
                    </div>
                  </div>
                  <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
                        style={{ background: '#E3F4EA', color: GREEN }}>
                    Riesgo Bajo
                  </span>
                  <p className="text-[10px]" style={{ color: TEXT4 }}>+4 pts vs mes anterior</p>
                </div>

                <div className="card-lift bg-white rounded-[14px] border border-border p-4">
                  <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Alertas</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                      <Bell className="w-6 h-6 text-text-3" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center"
                            style={{ background: ORA }}>
                        {ALERTAS_COUNT}
                      </span>
                    </div>
                    <p className="text-[24px] font-extrabold text-text-1 leading-none">{ALERTAS_COUNT}</p>
                  </div>
                  <p className="text-[11px] text-text-4 mb-3">Operaciones requieren atención</p>
                  <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition"
                          style={{ color: ORA }}>
                    Ver alertas <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Fila 2: Evolución Financiera + Flujo Financiero ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">

              <div className="card-lift bg-white rounded-[14px] border border-border p-5">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <div>
                    <p className="text-[13px] font-bold text-text-1">Evolución Financiera</p>
                    <p className="text-[11px] text-text-4">Últimos 12 meses · millones XAF</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {evolucionSeries.map(s => (
                      <div key={s.key} className="flex items-center gap-1.5">
                        <div className="w-5 h-1.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-[10px] text-text-4">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="min-h-[180px]">
                  <LineChart data={evolucionData} series={evolucionSeries} h={180} />
                </div>
              </div>

              <div className="card-lift bg-white rounded-[14px] border border-border p-5">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <div>
                    <p className="text-[13px] font-bold text-text-1">Flujo Financiero</p>
                    <p className="text-[11px] text-text-4">Últimas 4 semanas · millones XAF</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: ORA }} />
                      <span className="text-[10px] text-text-4">Entradas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: '#FDEEEB', border: `1px solid ${ERR}` }} />
                      <span className="text-[10px] text-text-4">Salidas</span>
                    </div>
                  </div>
                </div>
                <div className="min-h-[180px]">
                  <StackedBarChart data={flujoData} h={180} />
                </div>
              </div>
            </div>

            {/* ── Fila 3: 5 KPIs inferiores ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

              {/* Riesgo de Operaciones */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-4">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-3">Riesgo de Operaciones</p>
                <div className="space-y-2.5">
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

              {/* Solicitudes Pendientes */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-4">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Solicitudes Pendientes</p>
                <p className="text-[28px] font-extrabold leading-none text-text-1 mb-1">{SOLICITUDES_PEND}</p>
                <p className="text-[10px] mb-3" style={{ color: TEXT4 }}>
                  {new Intl.NumberFormat('fr-FR').format(SOLICITUDES_XAF)} XAF
                </p>
                <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition"
                        style={{ color: ORA }}>
                  Ver solicitudes <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Desembolsos del Mes */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-4">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Desembolsos del Mes</p>
                <p className="text-[28px] font-extrabold leading-none text-text-1 mb-1">{DESEMBOLSOS_MES}</p>
                <p className="text-[10px] mb-3" style={{ color: TEXT4 }}>
                  {new Intl.NumberFormat('fr-FR').format(DESEMBOLSOS_XAF)} XAF
                </p>
                <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition"
                        style={{ color: ORA }}>
                  Ver desembolsos <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Próximos Vencimientos */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-4">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Próximos Vencimientos</p>
                <p className="text-[28px] font-extrabold leading-none text-text-1 mb-1">{VENCIMIENTOS_COUNT}</p>
                <p className="text-[10px] mb-3" style={{ color: TEXT4 }}>
                  próximo en {new Intl.NumberFormat('fr-FR').format(PROXIMO_MONTO)} XAF
                </p>
                <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition"
                        style={{ color: ORA }}>
                  Ver vencimientos <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tiempo Promedio Aprobación */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-4">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Tiempo Prom. Aprobación</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <p className="text-[28px] font-extrabold leading-none text-text-1">{TIEMPO_APROBACION}</p>
                  <span className="text-[12px] font-semibold" style={{ color: TEXT4 }}>días</span>
                </div>
                <p className="text-[10px] mb-3" style={{ color: GREEN }}>▲ 0.3 días mejor vs anterior</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: '#E3F4EA', color: GREEN }}>
                  3 indicadores activos
                </span>
              </div>
            </div>

            {/* ── Barra de estado ── */}
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

          </div>
        )}


        {/* ══ PESTAÑA MEDIOAMBIENTAL ════════════════════════════════════════════ */}
        {tab === 'medioambiental' && (
          <div key="medioambiental" className="fade-in space-y-5">

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
