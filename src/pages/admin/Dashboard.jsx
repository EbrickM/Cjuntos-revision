import { useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import { LineChart, DonutChart, VBarChart, HBarChart } from '../../components/charts/Charts';
import { useCountUp } from '../../hooks/useCountUp';

const fmt = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general', lbl: 'Dashboard General' },
  { id: 'riesgo',  lbl: 'Dashboard de Riesgo' },
];

// ── General tab data ──────────────────────────────────────────────────────────

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
  { empresa: 'Tradex', tipo: 'Fact. Directo', estado: 'Activa', monto: 180_000_000 },
];

// ── Riesgo tab data ───────────────────────────────────────────────────────────

const riesgoDona = [
  { tipo: 'Bajo riesgo', pct: 100, color: '#059669' },
];

const exposicionBars = [
  { label: 'Tradex',   value: 48, color: '#059669' },
  { label: 'APEX',        value: 32, color: '#059669' },
  { label: 'APEX Tech',          value: 25, color: '#059669' },
  { label: 'GEOMS',     value: 18, color: '#059669' },
  { label: 'Conexxia Log',        value: 14, color: '#059669' },
  { label: 'MH Pinturas',    value: 9,  color: '#059669' },
];

const alertasAbiertas = [];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminDash() {
  const { go } = useApp();
  const [tab, setTab] = useState('general');

  // General KPI animated values (numeric only; formatted strings stay as-is)
  const animOpsActivas    = useCountUp(1, 900, 100);
  const animContratantes  = useCountUp(1, 900, 200);
  const animPymes         = useCountUp(1, 900, 300);

  // Riesgo KPI animated values (all are 0 currently)
  const animAltoRiesgo    = useCountUp(0, 900, 100);
  const animOpsRiesgo     = useCountUp(0, 900, 200);
  const animDocsVencidos  = useCountUp(0, 900, 300);
  const animKycPend       = useCountUp(0, 900, 400);
  const animAlertas       = useCountUp(0, 900, 500);

  const generalKpis = [
    { value: 'XAF 180M',             label: 'Monto total financiado', sub: 'Total acumulado 2026',     cls: 'text-orange-dark', trend: 'Activo',  tUp: null },
    { value: String(animOpsActivas),  label: 'Operaciones activas',    sub: 'Operaciones vigentes',     cls: 'text-orange-dark', trend: 'Estable', tUp: null },
    { value: String(animContratantes),label: 'Empresas contratantes',  sub: 'Contratantes activos',     cls: 'text-blue-text',   trend: 'Estable', tUp: null },
    { value: String(animPymes),       label: 'PYMEs activas',          sub: 'PYMEs con financiación',   cls: 'text-orange-dark', trend: 'Estable', tUp: null },
    { value: 'XAF 47.5M',            label: 'Fondos Fact. Directo',   sub: 'Capital en factoring dir.', cls: 'text-orange-dark', trend: 'Estable', tUp: null },
    { value: '870/1000',             label: 'Riesgo promedio',         sub: 'Score global cartera',     cls: 'text-orange-dark', trend: 'Bajo',    tUp: null },
  ];

  const riesgoKpis = [
    { value: String(animAltoRiesgo),  label: 'Empresas alto riesgo',  sub: 'Requieren atención',    cls: 'text-red-text',    trend: 'Ninguna', tUp: null },
    { value: String(animOpsRiesgo),   label: 'Operaciones en riesgo', sub: 'Bajo vigilancia',        cls: 'text-red-text',    trend: 'Ninguna', tUp: null },
    { value: String(animDocsVencidos),label: 'Documentos vencidos',   sub: 'Necesitan renovación',   cls: 'text-yellow-text', trend: 'Ninguna', tUp: null },
    { value: String(animKycPend),     label: 'KYC pendientes',        sub: 'Verificación requerida', cls: 'text-yellow-text', trend: 'Ninguna', tUp: null },
    { value: String(animAlertas),     label: 'Alertas abiertas',      sub: 'Sin resolver',           cls: 'text-orange-dark', trend: 'Ninguna', tUp: null },
    { value: 'XAF 0',                label: 'Exposición total',       sub: 'Capital en riesgo',      cls: 'text-orange-dark', trend: 'Bajo',    tUp: null },
  ];

  return (
    <AppShell active="adminDash" role="admin">
      <div className="fade-in space-y-5">

        {/* Header */}
        <div>
          <div className="text-[20px] font-bold text-text-1">Bienvenida, Ana</div>
          <div className="text-[13px] text-text-4">Panel de dirección Bonafide Microbank · Agosto 2026</div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-white rounded-[10px] w-full sm:w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`bona-btn flex-1 py-2 px-4 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap text-center ${
                tab === t.id ? 'bg-[#EF7A2C] shadow-sm text-white' : 'text-text-3 hover:text-text-1'
              }`}>
              {t.lbl}
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
                    tUp === true ? 'bg-orange-tint text-orange-dark' :
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
                  <div className="flex items-center gap-1.5 bg-orange-tint px-2.5 py-1 rounded-[6px]">
                    <TrendingUp className="w-3 h-3 text-orange-dark" />
                    <span className="text-[11px] font-bold text-orange-dark">+217% en 6 meses</span>
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
                          <Badge variant={op.estado === 'Activa' ? 'orange' : 'yellow'}>{op.estado}</Badge>
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
                    tUp === true ? 'bg-orange-tint text-orange-dark' :
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
                  <AlertTriangle className="w-4 h-4 text-orange-dark" />
                  <span className="text-[11px] font-bold text-orange-dark">Sin alertas abiertas</span>
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
                        <Badge variant={a.prioridad === 'Alta' ? 'red' : a.prioridad === 'Media' ? 'yellow' : 'orange'}>
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
