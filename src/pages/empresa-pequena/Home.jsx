import { useState } from 'react';
import { TrendingUp, Leaf, Download, ChevronRight, ArrowUpRight, Bell } from 'lucide-react';
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
function DonutChart({ data, centerLabel, centerSub, size = 130 }) {
  const r = 40, cx = 55, cy = 55, circ = 2 * Math.PI * r;
  let acc = 0;
  const segs = data.map(d => {
    const dash = (d.pct / 100) * circ;
    const s = { ...d, dash, off: -acc };
    acc += dash;
    return s;
  });
  return (
    <svg viewBox="0 0 110 110" style={{ width: size, height: size, flexShrink: 0 }}>
      <defs>
        <linearGradient id="donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={RED} />
          <stop offset="100%" stopColor={ORA} />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={BORDER} strokeWidth="13" />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.gradient ? 'url(#donut-grad)' : s.color}
          strokeWidth="15"
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={s.off}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      ))}
      {centerLabel && (
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="800"
          fill="#26262B" fontFamily="Poppins,sans-serif">{centerLabel}</text>
      )}
      {centerSub && (
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize="8" fill={TEXT4}
          fontFamily="Poppins,sans-serif">{centerSub}</text>
      )}
    </svg>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color, width = 72, height = 24 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
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
const SCORE                = 82;
const ALERTAS_COUNT        = 1;
const FACTURAS_TOTAL_COUNT = 42;
const FACTURAS_TOTAL_MONTO = 102_500_000;
const VENCIMIENTOS_COUNT   = 4;
const PROXIMO_MONTO        = 28_700_000;

const scoreSparkline = [74, 76, 75, 78, 79, 80, 82];

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
  const pctUsado     = Math.round((USADO / LIMITE) * 100);
  const pctDisponible = 100 - pctUsado;

  return (
    <AppShell active="epHome" role="empresa-pequena" title="Inicio" sub="Mi Panel">
      <div className="fade-in space-y-5">

        {/* Header + Tab nav */}
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

          {/* Tabs desktop */}
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


        {/* ── PESTAÑA FINANCIACIÓN ──────────────────────────────────────────── */}
        {tab === 'financiacion' && (
          <div key="financiacion" className="fade-in space-y-4">

            {/* 1. Hero — Mi Billetera */}
            <div className="card-lift bg-white rounded-[18px] border border-border p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                {/* Izquierda: saldo */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-text-3 mb-3">Mi Billetera</p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="font-extrabold text-text-1 leading-none tracking-tight"
                          style={{ fontSize: 'clamp(32px, 5.5vw, 44px)' }}>
                      {new Intl.NumberFormat('fr-FR').format(DISPONIBLE)}
                    </span>
                    <span className="text-[18px] font-semibold" style={{ color: TEXT4 }}>XAF</span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] font-bold text-[13px] text-white cursor-pointer transition-opacity hover:opacity-90"
                            style={{ background: ORA }}>
                      <ArrowUpRight className="w-4 h-4" />
                      Solicitar Nuevo Contrato
                    </button>
                    <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] font-semibold text-[12px] text-text-3 cursor-pointer transition-colors hover:bg-page-bg border border-border">
                      <Download className="w-3.5 h-3.5" />
                      Descargar Resumen
                    </button>
                  </div>
                </div>

                {/* Derecha: donut */}
                <div className="flex items-center gap-5 shrink-0">
                  <DonutChart
                    data={[
                      { pct: pctUsado,      gradient: true, color: RED },
                      { pct: pctDisponible, color: DONUT_EMPTY },
                    ]}
                    centerLabel={`${pctDisponible}%`}
                    centerSub="DISPONIBLE"
                    size={240}
                  />
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: GRAD }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Utilizado</span>
                      </div>
                      <p className="text-[14px] font-extrabold text-text-1">
                        {new Intl.NumberFormat('fr-FR').format(USADO)} XAF
                      </p>
                      <p className="text-[10px]" style={{ color: TEXT4 }}>{pctUsado}%</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_EMPTY }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Disponible</span>
                      </div>
                      <p className="text-[14px] font-extrabold" style={{ color: ORA }}>
                        {new Intl.NumberFormat('fr-FR').format(DISPONIBLE)} XAF
                      </p>
                      <p className="text-[10px]" style={{ color: TEXT4 }}>{pctDisponible}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KPIs — 4 tarjetas en fila */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

              {/* Score Crediticio */}
              <div className="card-lift bg-white rounded-[14px] border border-border p-4">
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Score Crediticio</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <p className="text-[28px] font-extrabold leading-none text-text-1">{SCORE}</p>
                  <div className="mb-0.5">
                    <Sparkline data={scoreSparkline} color={GREEN} />
                  </div>
                </div>
                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#E3F4EA', color: GREEN }}>
                  Riesgo Bajo
                </span>
                <p className="text-[10px] mt-2" style={{ color: TEXT4 }}>+4 pts vs mes anterior</p>
              </div>

              {/* Alertas */}
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
                  <p className="text-[20px] font-extrabold text-text-1 leading-none">{ALERTAS_COUNT}</p>
                </div>
                <p className="text-[11px] text-text-4 mb-3">Operaciones requieren atención</p>
                <button className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:opacity-75 transition"
                        style={{ color: ORA }}>
                  Ver alertas <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Facturas Activas */}
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
            </div>

          </div>
        )}


        {/* ── PESTAÑA MEDIOAMBIENTAL ────────────────────────────────────────── */}
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
