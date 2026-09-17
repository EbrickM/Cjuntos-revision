import { useState } from 'react';
import { BarChart2, ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import { LineChart, DonutChart, VBarChart, HBarChart } from '../../components/charts/Charts';

const fmt = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general', line1: 'Dashboard', line2: 'General',  Icon: BarChart2   },
  { id: 'riesgo',  line1: 'Dashboard de', line2: 'Riesgo', Icon: ShieldAlert },
];

// ── General tab data ──────────────────────────────────────────────────────────
const generalKpis = [
  { value: 'XAF 180M',  label: 'Monto total financiado', sub: 'Total acumulado 2026',    cls: 'text-orange-dark', trend: 'Activo',   tUp: null },
  { value: '1',          label: 'Operaciones activas',    sub: 'Operaciones vigentes',     cls: 'text-green-text',  trend: 'Estable',  tUp: null },
  { value: '1',          label: 'Empresas contratantes',  sub: 'Contratantes activos',     cls: 'text-blue-text',   trend: 'Estable',  tUp: null },
  { value: '1',          label: 'PYMEs activas',          sub: 'PYMEs con financiación',   cls: 'text-green-text',  trend: 'Estable',  tUp: null },
  { value: 'XAF 47.5M', label: 'Fondos Fact. Directo',   sub: 'Capital en factoring dir.', cls: 'text-orange-dark', trend: 'Estable',  tUp: null },
  { value: '870/1000',  label: 'Riesgo promedio',         sub: 'Score global cartera',     cls: 'text-green-text',  trend: 'Bajo',     tUp: null },
];

const generalLineData = [
  { mes: 'Mar', monto: 0  },
  { mes: 'Abr', monto: 0  },
  { mes: 'May', monto: 0  },
  { mes: 'Jun', monto: 22 },
  { mes: 'Jul', monto: 48 },
  { mes: 'Ago', monto: 48 },
];

const carteraDona = [
  { tipo: 'Factoring Directo', pct: 100, color: '#ef7a2c' },
];

const opsBarData = [
  { label: 'Solicitadas', value: 3, color: '#9CA3AF' },
  { label: 'En revisión', value: 1, color: '#ef7a2c' },
  { label: 'Aprobadas',  value: 1, color: '#3B82F6' },
  { label: 'Activas',    value: 1, color: '#059669' },
  { label: 'Rechazadas', value: 1, color: '#e0201c' },
];

const ultimasOps = [
  { empresa: 'Const. Silva Ltd.', tipo: 'Fact. Directo', estado: 'Activa', monto: 180_000_000 },
];

// ── Riesgo tab data ───────────────────────────────────────────────────────────
const riesgoKpis = [
  { value: '0',      label: 'Empresas alto riesgo',  sub: 'Requieren atención',     cls: 'text-red-text',    trend: 'Ninguna', tUp: null },
  { value: '0',      label: 'Operaciones en riesgo', sub: 'Bajo vigilancia',         cls: 'text-red-text',    trend: 'Ninguna', tUp: null },
  { value: '0',      label: 'Documentos vencidos',   sub: 'Necesitan renovación',    cls: 'text-yellow-text', trend: 'Ninguna', tUp: null },
  { value: '0',      label: 'KYC pendientes',         sub: 'Verificación requerida',  cls: 'text-yellow-text', trend: 'Ninguna', tUp: null },
  { value: '0',      label: 'Alertas abiertas',       sub: 'Sin resolver',            cls: 'text-orange-dark', trend: 'Ninguna', tUp: null },
  { value: 'XAF 0', label: 'Exposición total',        sub: 'Capital en riesgo',       cls: 'text-green-text',  trend: 'Bajo',    tUp: null },
];

const riesgoDona = [
  { tipo: 'Bajo riesgo', pct: 100, color: '#00C853' },
];

const exposicionBars = [
  { label: 'Const. Silva Ltd.',   value: 48, color: '#059669' },
  { label: 'TransGE S.L.',        value: 32, color: '#059669' },
  { label: 'ServTec GE',          value: 25, color: '#059669' },
  { label: 'AgroGE Holdings',     value: 18, color: '#059669' },
  { label: 'LogiRapid GE',        value: 14, color: '#059669' },
  { label: 'Pinturas Bata SL',    value: 9,  color: '#059669' },
];

const alertasAbiertas = [];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminDash() {
  const { go } = useApp();
  const [tab, setTab] = useState('general');

  return (
    <AppShell active="adminDash" role="admin" title="Inicio" sub="Vista general Bonafide">
      <div className="fade-in space-y-5">

        {/* Header */}
        <div>
          <div className="text-[20px] font-bold text-text-1">Bienvenida, Ana 👋</div>
          <div className="text-[13px] text-text-4">Panel de dirección Bonafide Microbank · Agosto 2026</div>
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

        {/* ── GENERAL TAB ─────────────────────────────────────────────────── */}
        {tab === 'general' && (
          <div key="general" className="fade-in space-y-5">

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              {generalKpis.map(({ value, label, sub, cls, trend, tUp }) => (
                <div key={label} className="bg-white rounded-[14px] border border-border p-4 flex flex-col gap-1.5">
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide leading-tight">{label}</div>
                  <div className={`text-[17px] font-extrabold leading-none ${cls}`}>{value}</div>
                  <div className="text-[10px] text-text-5 leading-snug">{sub}</div>
                  <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tUp === true ? 'bg-green-bg text-green-text' :
                    tUp === false ? 'bg-red-bg text-red-text' :
                    'bg-orange-tint text-orange-dark'
                  }`}>{trend}</span>
                </div>
              ))}
            </div>

            {/* Row 1: LineChart + DonutChart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* LineChart 3/5 */}
              <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div>
                    <div className="text-[14px] font-bold text-text-1">Evolución de financiación</div>
                    <div className="text-[11px] text-text-4">Enero – Junio 2026 · millones XAF</div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-bg px-2.5 py-1 rounded-[6px]">
                    <TrendingUp className="w-3 h-3 text-green-text" />
                    <span className="text-[11px] font-bold text-green-text">+217% en 6 meses</span>
                  </div>
                </div>
                <div className="flex-1 min-h-[200px]">
                  <LineChart id="admin-general" data={generalLineData} color="#ef7a2c" xKey="mes" yKey="monto" unit="M" h={180} />
                </div>
              </div>

              {/* DonutChart 2/5 */}
              <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-3">
                  <div className="text-[14px] font-bold text-text-1">Distribución del financiado</div>
                  <div className="text-[11px] text-text-4">¿Dónde está el negocio?</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-2">
                  <DonutChart data={carteraDona} centerLabel="4.2B" centerSub="XAF total" size={190} />
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 w-full">
                    {carteraDona.map(d => (
                      <div key={d.tipo} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-[11px] text-text-2 font-medium">{d.tipo}</span>
                        <span className="text-[11px] font-bold" style={{ color: d.color }}>{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: VBarChart + Table */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* VBarChart 2/5 */}
              <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5 flex flex-col">
                <div className="mb-4">
                  <div className="text-[14px] font-bold text-text-1">Estado de operaciones</div>
                  <div className="text-[11px] text-text-4">¿Hay cuellos de botella?</div>
                </div>
                <div className="flex-1 min-h-[180px]">
                  <VBarChart id="admin-ops" data={opsBarData} h={170} />
                </div>
              </div>

              {/* Table 3/5 */}
              <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-[14px] font-bold text-text-1">Operaciones recientes</div>
                    <div className="text-[11px] text-text-4">Actividad reciente de la plataforma</div>
                  </div>
                  <button onClick={() => go('adminConf')}
                    className="text-[12px] text-orange-dark font-semibold hover:opacity-75 transition cursor-pointer">
                    Ver todas →
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {['Empresa', 'Tipo', 'Estado', 'Monto'].map((h, i) => (
                        <th key={h} className={`text-[10px] font-semibold text-text-4 uppercase tracking-wide pb-2.5 ${i === 3 ? 'text-right' : 'text-left'} ${i > 0 ? 'pl-2' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasOps.map((op, i) => (
                      <tr key={i} onClick={() => go('adminConf')}
                        className="border-b border-border last:border-0 hover:bg-page-bg/60 cursor-pointer transition-colors">
                        <td className="py-2.5 text-[12px] font-medium text-text-1 pr-2">{op.empresa}</td>
                        <td className="py-2.5 pl-2 pr-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-tint text-orange-dark whitespace-nowrap">
                            {op.tipo}
                          </span>
                        </td>
                        <td className="py-2.5 pl-2 pr-2">
                          <Badge variant={op.estado === 'Activa' ? 'green' : 'yellow'}>{op.estado}</Badge>
                        </td>
                        <td className="py-2.5 text-right text-[12px] font-extrabold text-text-1 whitespace-nowrap">{fmt(op.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── RIESGO TAB ──────────────────────────────────────────────────── */}
        {tab === 'riesgo' && (
          <div key="riesgo" className="fade-in space-y-5">

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              {riesgoKpis.map(({ value, label, sub, cls, trend, tUp }) => (
                <div key={label} className="bg-white rounded-[14px] border border-border p-4 flex flex-col gap-1.5">
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide leading-tight">{label}</div>
                  <div className={`text-[17px] font-extrabold leading-none ${cls}`}>{value}</div>
                  <div className="text-[10px] text-text-5 leading-snug">{sub}</div>
                  <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tUp === true ? 'bg-green-bg text-green-text' :
                    tUp === false ? 'bg-red-bg text-red-text' :
                    'bg-orange-tint text-orange-dark'
                  }`}>{trend}</span>
                </div>
              ))}
            </div>

            {/* Riesgo de cartera + Exposición por empresa, en una sola card */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Exposición por empresa — 2/3 */}
                <div className="md:col-span-2">
                  <div className="mb-5">
                    <div className="text-[14px] font-bold text-text-1">Exposición por empresa</div>
                    <div className="text-[11px] text-text-4">Ordenadas de mayor a menor</div>
                  </div>
                  <div className="max-h-[260px] overflow-y-auto pr-2">
                    <HBarChart data={exposicionBars} fmtVal={v => `XAF ${v}M`} />
                  </div>
                </div>

                {/* Riesgo de cartera — 1/3, en texto plano igual que Score Crediticio en /pyme */}
                <div className="md:border-l md:border-border md:pl-5 pt-4 md:pt-0 border-t md:border-t-0 border-border flex flex-col items-center justify-center text-center gap-2">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-text-4">Riesgo de cartera</p>
                  <p className="text-[64px] sm:text-[72px] font-extrabold leading-none" style={{ color: riesgoDona[0].color }}>89</p>
                  <p className="text-[15px] text-text-4">
                    operaciones · <span className="font-semibold" style={{ color: riesgoDona[0].color }}>{riesgoDona[0].tipo}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Alerts table full width */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-[14px] font-bold text-text-1">Alertas abiertas</div>
                  <div className="text-[11px] text-text-4">Requieren acción inmediata</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-green-text" />
                  <span className="text-[11px] font-bold text-green-text">Sin alertas abiertas</span>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Empresa', 'Tipo de alerta', 'Prioridad'].map((h, i) => (
                      <th key={h} className={`text-[10px] font-semibold text-text-4 uppercase tracking-wide pb-2.5 text-left ${i > 0 ? 'pl-3' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alertasAbiertas.length === 0 && (
                    <tr><td colSpan={3} className="py-4 text-center text-[12px] text-text-4">No hay alertas abiertas</td></tr>
                  )}
                  {alertasAbiertas.map((a, i) => (
                    <tr key={i} onClick={() => go('adminKYC')}
                      className="border-b border-border last:border-0 hover:bg-page-bg/60 cursor-pointer transition-colors">
                      <td className="py-2.5 text-[12px] font-medium text-text-1 pr-3">{a.empresa}</td>
                      <td className="py-2.5 pl-3 pr-3 text-[12px] text-text-2">{a.alerta}</td>
                      <td className="py-2.5 pl-3">
                        <Badge variant={a.prioridad === 'Alta' ? 'red' : a.prioridad === 'Media' ? 'yellow' : 'green'}>
                          {a.prioridad}
                        </Badge>
                      </td>
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
