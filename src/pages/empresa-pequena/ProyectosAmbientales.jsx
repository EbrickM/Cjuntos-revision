import { Leaf, Sprout, BadgeCheck, Wind, Recycle, Trophy, CircleDashed, ChevronRight } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';

// ── Certification path ────────────────────────────────────────────────────────
const CERT_PATH = [
  {
    Icon: CircleDashed,
    label: 'Sin certificación',
    desc: 'Sin proyectos medioambientales registrados',
    color: '#9CA3AF',
    status: 'done',
    date: 'Antes de 2024',
  },
  {
    Icon: Sprout,
    label: 'Eco en Proceso',
    desc: 'Proceso de certificación ambiental en curso',
    color: '#D97706',
    status: 'done',
    date: 'Enero 2024',
  },
  {
    Icon: Leaf,
    label: 'Verde',
    desc: 'Proyectos ambientales registrados en Bonafide',
    color: '#059669',
    status: 'done',
    date: 'Marzo 2024',
  },
  {
    Icon: BadgeCheck,
    label: 'Verde Bonafide',
    desc: 'Certificación completa verificada por Bonafide',
    color: '#059669',
    status: 'active',
    date: 'Junio 2025',
  },
  {
    Icon: Wind,
    label: 'Verde CO₂',
    desc: 'Captura activa de carbono certificada',
    color: '#3B82F6',
    status: 'pending',
  },
  {
    Icon: Recycle,
    label: 'Verde Neutro',
    desc: 'Balance de carbono neutro certificado',
    color: '#059669',
    status: 'pending',
  },
  {
    Icon: Trophy,
    label: 'Verde ESG',
    desc: 'Cumplimiento Ambiental + Social + Gobernanza verificado',
    color: '#F57C00',
    status: 'pending',
  },
];

const NEXT_REQS = {
  'Verde CO₂': [
    'Registro de captura de CO₂ verificado por auditor externo',
    'Mínimo 2 proyectos de captura de carbono activos',
    'Informe anual de huella de carbono presentado',
  ],
};

// ── Data ──────────────────────────────────────────────────────────────────────
const kpis = [
  { value: '8',        label: 'Proyectos registrados', mobileLabel: 'Proyectos', cls: 'text-green-text',  trend: '+2',     tUp: true  },
  { value: '5',        label: 'Proyectos activos',     cls: 'text-blue-text',   trend: 'estable', tUp: null  },
  { value: '3',        label: 'Proyectos financiados', cls: 'text-orange',      trend: '+1',     tUp: true  },
  { value: '12,450 t', label: 'Captura CO₂ potencial', cls: 'text-green-text', trend: '+8%',    tUp: true  },
  { value: 'Medio',    label: 'Riesgo ambiental',      cls: 'text-yellow-text', trend: 'Estable', tUp: null  },
];

const proyectos = [
  { nombre: 'Reforestación Bata Norte', estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde Bonafide', fin: 'XAF 45M' },
  { nombre: 'Agro Sierra Sur',          estado: 'En ejecución', riesgo: 'Medio', cert: 'Verde',          fin: 'XAF 28M' },
  { nombre: 'Energía Solar Malabo',     estado: 'Planificado',  riesgo: 'Bajo',  cert: 'Eco en Proceso', fin: 'XAF 62M' },
  { nombre: 'Gestión Residuos Bata',    estado: 'Finalizado',   riesgo: 'Bajo',  cert: 'Verde Bonafide', fin: 'XAF 18M' },
  { nombre: 'Reforestación Ebebiyín',   estado: 'Planificado',  riesgo: 'Medio', cert: 'Eco en Proceso', fin: 'XAF 35M' },
];

const estadoBadge = (e) => e === 'En ejecución' ? 'blue' : e === 'Planificado' ? 'orange' : e === 'Finalizado' ? 'green' : 'yellow';
const riesgoBadge = (r) => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';

// ── Component ─────────────────────────────────────────────────────────────────
export default function EpProyectosAmbientales() {
  const activeIdx  = CERT_PATH.findIndex(c => c.status === 'active');
  const activeCert = CERT_PATH[activeIdx];
  const nextCert   = CERT_PATH[activeIdx + 1];

  return (
    <AppShell active="epESG" role="empresa-pequena" title="Proyectos Ambientales" sub="Mi certificación y proyectos">
      <div className="fade-in space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {kpis.map(({ value, label, mobileLabel, cls, trend, tUp }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4 flex flex-col gap-1.5">
              <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide leading-tight">
                <span className="sm:hidden">{mobileLabel ?? label}</span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              <div className={`text-[17px] font-extrabold leading-none ${cls}`}>{value}</div>
              <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full ${
                tUp === true ? 'bg-green-bg text-green-text' : 'bg-orange-tint text-orange'
              }`}>{trend}</span>
            </div>
          ))}
        </div>

        {/* Timeline + Right cards */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Certification Journey — 2/5 */}
          <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="w-4 h-4 text-green-text" />
                <div className="text-[14px] font-bold text-text-1">Camino de Certificación</div>
              </div>
              <div className="text-[11px] text-text-4">Progresión de Construcciones Silva</div>
            </div>

            <div className="relative">
              {CERT_PATH.map((cert, i) => {
                const isLast    = i === CERT_PATH.length - 1;
                const isDone    = cert.status === 'done';
                const isActive  = cert.status === 'active';
                const isPending = cert.status === 'pending';
                return (
                  <div key={cert.label} className="relative flex gap-3.5 pb-5 last:pb-0">
                    {/* Connector line */}
                    {!isLast && (
                      <div className={`absolute left-[19px] top-10 bottom-0 w-0.5
                        ${isDone    ? 'bg-green-border' : ''}
                        ${isActive  ? 'bg-green-border/50' : ''}
                        ${isPending ? 'bg-border' : ''}
                      `} />
                    )}
                    {/* Icon bubble */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2
                        ${isDone    ? 'bg-green-bg border-green-border' : ''}
                        ${isActive  ? 'bg-green-bg border-green-border' : ''}
                        ${isPending ? 'bg-page-bg border-border' : ''}
                      `}
                      style={isActive ? { boxShadow: '0 0 0 4px rgba(0,200,83,0.12)' } : {}}
                    >
                      <cert.Icon
                        className="w-[18px] h-[18px]"
                        style={{ color: isPending ? '#D1D5DB' : cert.color }}
                      />
                    </div>
                    {/* Text */}
                    <div className={`flex-1 pt-1.5 ${isPending ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[13px] font-bold
                          ${isActive  ? 'text-green-text' : ''}
                          ${isDone    ? 'text-text-1' : ''}
                          ${isPending ? 'text-text-4' : ''}
                        `}>{cert.label}</span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-bg text-green-text border border-green-border">
                            Nivel actual
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[10px] font-semibold text-green-text">✓</span>
                        )}
                      </div>
                      <div className="text-[10px] text-text-4 mt-0.5 leading-snug">{cert.desc}</div>
                      {cert.date && (
                        <div className="text-[10px] text-text-5 mt-0.5">{cert.date}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column — 3/5 */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Current cert card */}
            <div className="bg-green-bg rounded-[14px] border border-green-border p-5">
              <div className="text-[11px] font-semibold text-green-text uppercase tracking-wide mb-3">Certificación actual</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-[12px] bg-white border border-green-border flex items-center justify-center shrink-0">
                  <activeCert.Icon className="w-6 h-6 text-green-text" />
                </div>
                <div>
                  <div className="text-[20px] font-extrabold text-green-text leading-none">{activeCert.label}</div>
                  <div className="text-[11px] text-green-text/80 mt-0.5">{activeCert.desc}</div>
                </div>
              </div>
              <div className="text-[11px] text-text-3">Obtenida el 15 de Junio, 2025 · Válida hasta Junio 2027</div>
            </div>

            {/* Next cert card */}
            {nextCert && (
              <div className="bg-white rounded-[14px] border border-border p-5 flex-1">
                <div className="text-[11px] font-semibold text-text-4 uppercase tracking-wide mb-3">Siguiente nivel — {nextCert.label}</div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[10px] bg-blue-bg border border-blue-text/20 flex items-center justify-center shrink-0">
                    <nextCert.Icon className="w-5 h-5 text-blue-text" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-text-1 mb-0.5">{nextCert.label}</div>
                    <div className="text-[11px] text-text-4 leading-snug">{nextCert.desc}</div>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-text-3 mb-2">Requisitos para avanzar:</div>
                <div className="space-y-2">
                  {(NEXT_REQS[nextCert.label] ?? [
                    'Completar los requisitos documentales requeridos',
                    'Validación por parte del equipo Bonafide',
                    'Auditoría ambiental externa aprobada',
                  ]).map(req => (
                    <div key={req} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-blue-text shrink-0 mt-0.5" />
                      <span className="text-[11px] text-text-4 leading-snug">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projects table */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-[14px] font-bold text-text-1">Proyectos Registrados</div>
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
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-bg text-green-text border border-green-border">{p.cert}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-text-4">Financiamiento</span>
                  <span className="font-bold text-text-1">{p.fin}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: tabla */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-border">
                  {['Proyecto', 'Estado', 'Riesgo', 'Certificación', 'Financiamiento'].map((h, i) => (
                    <th key={h} className={`text-[10px] font-semibold text-text-4 uppercase tracking-wide pb-2.5 ${i === 4 ? 'text-right' : 'text-left'} ${i > 0 ? 'pl-3' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-page-bg/60 transition-colors">
                    <td className="py-2.5 text-[12px] font-medium text-text-1 pr-3">{p.nombre}</td>
                    <td className="py-2.5 pl-3 pr-3"><Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge></td>
                    <td className="py-2.5 pl-3 pr-3"><Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge></td>
                    <td className="py-2.5 pl-3 pr-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-bg text-green-text border border-green-border whitespace-nowrap">
                        {p.cert}
                      </span>
                    </td>
                    <td className="py-2.5 pl-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{p.fin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
