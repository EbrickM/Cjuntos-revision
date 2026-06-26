import { useState } from 'react';
import { TrendingUp, Leaf } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
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

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'financiacion',   line1: 'Dashboard de', line2: 'Financiación',   Icon: TrendingUp },
  { id: 'medioambiental', line1: 'Dashboard',    line2: 'Medioambiental', Icon: Leaf },
];

// ── Financiación tab data ─────────────────────────────────────────────────────
const finKpis = [
  { value: 'XAF 231M',  label: 'Línea aprobada',   sub: 'Crédito disponible total',  cls: 'text-orange',     trend: 'Activa',     tUp: null  },
  { value: 'XAF 80.8M', label: 'Disponible',        sub: 'Dinero aún utilizable',     cls: 'text-green-text', trend: '35% libre',  tUp: true  },
  { value: 'XAF 150M',  label: 'Utilizado',          sub: 'Capital consumido',         cls: 'text-orange',     trend: '65% usado',  tUp: null  },
  { value: 'XAF 12.5M', label: 'Pendiente pago',    sub: 'Deuda vigente',             cls: 'text-yellow-text', trend: '-3%',       tUp: true  },
  { value: '18',         label: 'Facturas finan.',   sub: 'Total en el periodo',       cls: 'text-blue-text',  trend: '+3',         tUp: true  },
  { value: 'Verde',      label: 'Nivel de riesgo',   sub: 'Semáforo Bonafide',         cls: 'text-green-text', trend: 'Excelente',  tUp: true  },
];

const lineaDona = [
  { tipo: 'Utilizado',  pct: 65, color: '#C62828' },
  { tipo: 'Disponible', pct: 35, color: '#059669' },
];

const finLineData = [
  { mes: 'Ene', monto: 18 },
  { mes: 'Feb', monto: 25 },
  { mes: 'Mar', monto: 22 },
  { mes: 'Abr', monto: 30 },
  { mes: 'May', monto: 27 },
  { mes: 'Jun', monto: 35 },
];

const payBarData = [
  { label: 'Pago directo',     value: 93, color: '#C62828' },
  { label: 'Pago proveedores', value: 57, color: '#F57C00' },
];

const operaciones = [
  { id: 'CTR-2026-002',  estado: 'Activa',    monto: 42000000, venc: '31/12/26' },
  { id: 'CTR-2026-005',  estado: 'Activa',    monto: 25000000, venc: '31/12/26' },
  { id: 'FAC-2026-1031', estado: 'Pagada',    monto: 18000000, venc: '01/06/26' },
  { id: 'FAC-2026-1025', estado: 'Enviada',   monto: 4500000,  venc: '15/06/26' },
  { id: 'FAC-2026-1036', estado: 'Pendiente', monto: 6500000,  venc: '20/06/26' },
];

// ── Medioambiental tab data ───────────────────────────────────────────────────
const envKpis = [
  { value: '8',        label: 'Proyectos registrados', sub: 'Total registrado',           cls: 'text-green-text',  trend: '+2',     tUp: true  },
  { value: '5',        label: 'Proyectos activos',     sub: 'En ejecución actualmente',   cls: 'text-blue-text',   trend: 'estable', tUp: null },
  { value: '3',        label: 'Proyectos financiados', sub: 'Con financiación aprobada',  cls: 'text-orange',      trend: '+1',     tUp: true  },
  { value: '12,450 t', label: 'Captura potencial CO₂', sub: 'Toneladas CO₂ potencial',   cls: 'text-green-text',  trend: '+8%',    tUp: true  },
  { value: 'Medio',    label: 'Riesgo ambiental',      sub: 'Clasificación global',       cls: 'text-yellow-text', trend: 'Estable', tUp: null },
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


// ── Component ─────────────────────────────────────────────────────────────────
export default function EpHome() {
  const { go } = useApp();
  const [tab, setTab] = useState('financiacion');

  return (
    <AppShell active="epHome" role="empresa-pequena" title="Inicio" sub="Mi Panel">
      <div className="fade-in space-y-5">

        {/* Header + Tab nav */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

          {/* Título */}
          <div className="min-w-0">
            <div className="text-[13px] text-text-4 leading-tight sm:hidden">Bienvenido,</div>
            <div className="text-[20px] font-bold text-text-1 truncate">
              <span className="hidden sm:inline">Bienvenido, </span>Construcciones Silva
            </div>
          </div>

          {/* Tabs + Badges desktop — columna alineada a la derecha */}
          <div className="hidden sm:flex flex-col items-end gap-2">
            <div className="flex gap-1 bg-page-bg p-1 rounded-xl">
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
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 bg-green-bg text-green-text text-[11px] font-bold px-3 py-1.5 rounded-[8px] border border-green-border">
                <div className="w-2 h-2 rounded-full bg-[#00C853] shrink-0" />
                Verde
              </span>
              <span className="inline-flex items-center gap-1.5 bg-green-bg text-green-text text-[11px] font-bold px-3 py-1.5 rounded-[8px] border border-green-border">
                <Leaf className="w-3.5 h-3.5" />
                Verde Bonafide
              </span>
            </div>
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

        {/* Etiquetas Verde — solo móvil, solo tab medioambiental */}
        {tab === 'medioambiental' && (
          <div className="flex sm:hidden gap-2 justify-center">
            <span className="inline-flex items-center gap-1.5 bg-green-bg text-green-text text-[11px] font-bold px-3 py-1.5 rounded-[8px] border border-green-border">
              <div className="w-2 h-2 rounded-full bg-[#00C853] shrink-0" />
              Verde
            </span>
            <span className="inline-flex items-center gap-1.5 bg-green-bg text-green-text text-[11px] font-bold px-3 py-1.5 rounded-[8px] border border-green-border">
              <Leaf className="w-3.5 h-3.5" />
              Verde Bonafide
            </span>
          </div>
        )}

        {/* ── FINANCIACIÓN TAB ─────────────────────────────────────────────── */}
        {tab === 'financiacion' && (
          <div key="financiacion" className="fade-in space-y-5">

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              {finKpis.map(({ value, label, sub, cls, trend, tUp }) => (
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

            {/* Row 1: DonutChart + LineChart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* DonutChart 2/5 */}
              <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-3">
                  <div className="text-[14px] font-bold text-text-1">Estado de la línea</div>
                  <div className="text-[11px] text-text-4">¿Cuánto dinero tengo disponible?</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-2">
                  <DonutChart data={lineaDona} centerLabel="65%" centerSub="utilizado" size={190} />
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 w-full">
                    {lineaDona.map(d => (
                      <div key={d.tipo} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-[11px] text-text-2 font-medium">{d.tipo}</span>
                        <span className="text-[11px] font-bold" style={{ color: d.color }}>{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* LineChart 3/5 */}
              <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div>
                    <div className="text-[14px] font-bold text-text-1">Evolución de financiación</div>
                    <div className="text-[11px] text-text-4">Dinero recibido mensual · millones XAF</div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-bg px-2.5 py-1 rounded-[6px]">
                    <TrendingUp className="w-3 h-3 text-green-text" />
                    <span className="text-[11px] font-bold text-green-text">+94% en 6 meses</span>
                  </div>
                </div>
                <div className="flex-1 min-h-[200px]">
                  <LineChart id="pyme-fin" data={finLineData} color="#C62828" xKey="mes" yKey="monto" unit="M" h={180} />
                </div>
              </div>
            </div>

            {/* Row 2: VBarChart + Table */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* VBarChart 2/5 */}
              <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-4">
                  <div className="text-[14px] font-bold text-text-1">Uso de los fondos</div>
                  <div className="text-[11px] text-text-4">¿Cómo se usa la financiación? · millones XAF</div>
                </div>
                <div className="flex-1 min-h-[180px]">
                  <VBarChart id="pyme-pay" data={payBarData} h={170} />
                </div>
              </div>

              {/* Table 3/5 */}
              <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-[14px] font-bold text-text-1">Operaciones activas</div>
                    <div className="text-[11px] text-text-4">Contratos y facturas vigentes</div>
                  </div>
                  <button onClick={() => go('epFacturacion')}
                    className="text-[12px] text-orange font-semibold hover:opacity-75 transition cursor-pointer">
                    Ver todas →
                  </button>
                </div>
                {/* Móvil: cards */}
                <div className="sm:hidden space-y-2">
                  {operaciones.map(op => (
                    <div key={op.id} onClick={() => go('epFacturacion')}
                      className="rounded-[12px] border border-border p-3 cursor-pointer hover:bg-page-bg/60 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] font-bold text-text-1">{op.id}</span>
                        <Badge variant={op.estado === 'Activa' || op.estado === 'Pagada' ? 'green' : op.estado === 'Enviada' ? 'blue' : 'yellow'}>{op.estado}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-[12px] mb-1">
                        <span className="text-text-4">Monto</span>
                        <span className="font-extrabold text-text-1">{fmt(op.monto)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-4">Vencimiento</span>
                        <span className="text-text-4">{op.venc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop: tabla */}
                <table className="hidden sm:table w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {['Operación', 'Estado', 'Monto', 'Vencimiento'].map((h, i) => (
                        <th key={h} className={`text-[10px] font-semibold text-text-4 uppercase tracking-wide pb-2.5 ${i >= 2 ? 'text-right' : 'text-left'} ${i > 0 ? 'pl-2' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {operaciones.map((op) => (
                      <tr key={op.id} onClick={() => go('epFacturacion')}
                        className="border-b border-border last:border-0 hover:bg-page-bg/60 cursor-pointer transition-colors">
                        <td className="py-2.5 pr-2 font-mono text-[11px] font-bold text-text-1">{op.id}</td>
                        <td className="py-2.5 pl-2 pr-2">
                          <Badge variant={op.estado === 'Activa' || op.estado === 'Pagada' ? 'green' : op.estado === 'Enviada' ? 'blue' : 'yellow'}>
                            {op.estado}
                          </Badge>
                        </td>
                        <td className="py-2.5 pl-2 text-right text-[12px] font-extrabold text-text-1 whitespace-nowrap">{fmt(op.monto)}</td>
                        <td className="py-2.5 pl-2 text-right text-[11px] text-text-4 whitespace-nowrap">{op.venc}</td>
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
                  <VBarChart id="pyme-env" data={catBarData} h={170} />
                </div>
              </div>
            </div>

            {/* Row 2: Table full width */}
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
              {/* Móvil: cards */}
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
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-page-bg/60 transition-colors">
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
