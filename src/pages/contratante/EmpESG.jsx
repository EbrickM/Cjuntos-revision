import { Leaf, Sprout, BadgeCheck, Wind, Recycle, Trophy, CircleDashed, ChevronRight } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';

// ── Shared certification path ─────────────────────────────────────────────────
const CERT_PATH = [
  {
    Icon: CircleDashed,
    label: 'Sin certificación',
    desc: 'Sin proyectos medioambientales registrados',
    color: '#9CA3AF',
    status: 'done',
    date: 'Antes de 2023',
  },
  {
    Icon: Sprout,
    label: 'Eco en Proceso',
    desc: 'Proceso de certificación ambiental en curso',
    color: '#D97706',
    status: 'done',
    date: 'Marzo 2023',
  },
  {
    Icon: Leaf,
    label: 'Verde',
    desc: 'Proyectos ambientales registrados en Bonafide',
    color: '#059669',
    status: 'done',
    date: 'Septiembre 2023',
  },
  {
    Icon: BadgeCheck,
    label: 'Verde Bonafide',
    desc: 'Certificación completa verificada por Bonafide',
    color: '#059669',
    status: 'done',
    date: 'Febrero 2024',
  },
  {
    Icon: Wind,
    label: 'Verde CO₂',
    desc: 'Captura activa de carbono certificada',
    color: '#3B82F6',
    status: 'active',
    date: 'Enero 2025',
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

// ── ESG / PROYECTOS AMBIENTALES ──────────────────────────────────────────────
const empKpis = [
  { value: '5',        label: 'Proyectos registrados', cls: 'text-green-text', trend: '+2',     tUp: true },
  { value: '3',        label: 'Proyectos activos',     cls: 'text-blue-text',  trend: 'Estable', tUp: null },
  { value: '3',        label: 'Proyectos financiados', cls: 'text-orange',     trend: '+1',     tUp: true },
  { value: '12,400 t', label: 'Captura CO₂ potencial', cls: 'text-green-text', trend: '+12%',  tUp: true },
  { value: 'Bajo',     label: 'Riesgo ambiental',      cls: 'text-green-text', trend: 'Óptimo', tUp: true },
];

const pymeCerts = [
  { nombre: 'Const. Silva Ltd.', cert: 'Verde Bonafide', Icon: BadgeCheck, color: '#059669' },
];

const empProyectos = [
  { nombre: 'Parque Solar Malabo I',    estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde CO₂',      fin: 'XAF 120M' },
  { nombre: 'Reforestación Costa GE',  estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde Bonafide', fin: 'XAF 85M'  },
  { nombre: 'Biogás Residuos Bata',    estado: 'Planificado',  riesgo: 'Medio', cert: 'Verde CO₂',      fin: 'XAF 65M'  },
  { nombre: 'Agro Sostenible Norte',   estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde',          fin: 'XAF 42M'  },
  { nombre: 'Huella Cero 2027',        estado: 'Planificado',  riesgo: 'Bajo',  cert: 'Verde Neutro',   fin: 'XAF 200M' },
];

const estadoBadge = (e) => e === 'En ejecución' ? 'blue' : e === 'Planificado' ? 'orange' : e === 'Finalizado' ? 'green' : 'yellow';
const riesgoBadge = (r) => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';

export default function EmpESG() {
  const activeIdx  = CERT_PATH.findIndex(c => c.status === 'active');
  const activeCert = CERT_PATH[activeIdx];
  const nextCert   = CERT_PATH[activeIdx + 1];

  return (
    <AppShell active="empESG" role="contratante" title="Proyectos Ambientales" sub="Certificación y proyectos medioambientales">
      <div className="fade-in space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {empKpis.map(({ value, label, cls, trend, tUp }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4 flex flex-col gap-1.5">
              <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide leading-tight">{label}</div>
              <div className={`text-[17px] font-extrabold leading-none ${cls}`}>{value}</div>
              <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full ${
                tUp === true ? 'bg-green-bg text-green-text' : 'bg-orange-tint text-orange'
              }`}>{trend}</span>
            </div>
          ))}
        </div>

        {/* Timeline + right panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Certification Journey — 2/5 */}
          <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="w-4 h-4 text-green-text" />
                <div className="text-[14px] font-bold text-text-1">Camino de Certificación</div>
              </div>
              <div className="text-[11px] text-text-4">Progresión de tu empresa</div>
            </div>

            <div className="relative">
              {CERT_PATH.map((cert, i) => {
                const isLast    = i === CERT_PATH.length - 1;
                const isDone    = cert.status === 'done';
                const isActive  = cert.status === 'active';
                const isPending = cert.status === 'pending';
                return (
                  <div key={cert.label} className="relative flex gap-3.5 pb-5 last:pb-0">
                    {!isLast && (
                      <div className={`absolute left-[19px] top-10 bottom-0 w-0.5
                        ${isDone    ? 'bg-green-border' : ''}
                        ${isActive  ? 'bg-blue-text/30' : ''}
                        ${isPending ? 'bg-border' : ''}
                      `} />
                    )}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2
                        ${isDone    ? 'bg-green-bg border-green-border' : ''}
                        ${isActive  ? 'bg-blue-bg border-blue-text/40' : ''}
                        ${isPending ? 'bg-page-bg border-border' : ''}
                      `}
                      style={isActive ? { boxShadow: '0 0 0 4px rgba(59,130,246,0.12)' } : {}}
                    >
                      <cert.Icon
                        className="w-[18px] h-[18px]"
                        style={{ color: isPending ? '#D1D5DB' : cert.color }}
                      />
                    </div>
                    <div className={`flex-1 pt-1.5 ${isPending ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[13px] font-bold
                          ${isActive  ? 'text-blue-text' : ''}
                          ${isDone    ? 'text-text-1' : ''}
                          ${isPending ? 'text-text-4' : ''}
                        `}>{cert.label}</span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-bg text-blue-text border border-blue-text/20">
                            Nivel actual
                          </span>
                        )}
                        {isDone && <span className="text-[10px] font-semibold text-green-text">✓</span>}
                      </div>
                      <div className="text-[10px] text-text-4 mt-0.5 leading-snug">{cert.desc}</div>
                      {cert.date && <div className="text-[10px] text-text-5 mt-0.5">{cert.date}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel — 3/5 */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Current cert */}
            <div className="bg-blue-bg rounded-[14px] border border-blue-text/20 p-5">
              <div className="text-[11px] font-semibold text-blue-text uppercase tracking-wide mb-3">Certificación actual</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-[12px] bg-white border border-blue-text/20 flex items-center justify-center shrink-0">
                  <activeCert.Icon className="w-6 h-6 text-blue-text" />
                </div>
                <div>
                  <div className="text-[20px] font-extrabold text-blue-text leading-none">{activeCert.label}</div>
                  <div className="text-[11px] text-blue-text/80 mt-0.5">{activeCert.desc}</div>
                </div>
              </div>
              <div className="text-[11px] text-text-3">Obtenida el 20 de Enero, 2025 · Válida hasta Enero 2027</div>
            </div>

            {/* Next cert */}
            {nextCert && (
              <div className="bg-white rounded-[14px] border border-border p-5">
                <div className="text-[11px] font-semibold text-text-4 uppercase tracking-wide mb-3">Siguiente nivel — {nextCert.label}</div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[10px] bg-green-bg border border-green-border flex items-center justify-center shrink-0">
                    <nextCert.Icon className="w-5 h-5 text-green-text" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-text-1 mb-0.5">{nextCert.label}</div>
                    <div className="text-[11px] text-text-4 leading-snug">{nextCert.desc}</div>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-text-3 mb-2">Requisitos para avanzar:</div>
                <div className="space-y-2">
                  {['Auditoría de huella de carbono completa de la cadena de suministro', 'Compensación del 100% de emisiones generadas en el año fiscal', 'Reporte de sostenibilidad verificado por tercero acreditado'].map(req => (
                    <div key={req} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-green-text shrink-0 mt-0.5" />
                      <span className="text-[11px] text-text-4 leading-snug">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PYME cert distribution */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold text-text-1 mb-3">Certificación de proveedores PYME</div>
              <div className="space-y-2.5">
                {pymeCerts.map(p => (
                  <div key={p.nombre} className="flex items-center gap-3">
                    <p.Icon className="w-4 h-4 shrink-0" style={{ color: p.color }} />
                    <span className="text-[12px] font-medium text-text-2 flex-1">{p.nombre}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-page-bg text-text-3 border border-border whitespace-nowrap">
                      {p.cert}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Projects table */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <div>
              <div className="text-[14px] font-bold text-text-1">Proyectos Registrados</div>
              <div className="text-[11px] text-text-4">Todos los proyectos medioambientales registrados</div>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-green-text" />
              <span className="text-[11px] font-bold text-green-text">5 registrados</span>
            </div>
          </div>
          {/* Móvil: cards */}
          <div className="sm:hidden space-y-3">
            {empProyectos.map((p, i) => (
              <div key={i} className="rounded-[14px] border border-border p-4 flex flex-col gap-3">
                {/* Nombre + estado */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-bold text-text-1 leading-snug flex-1">{p.nombre}</p>
                  <Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge>
                </div>
                <div className="h-px bg-border" />
                {/* Datos etiquetados */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#A9A6A1' }}>Riesgo</p>
                    <Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#A9A6A1' }}>Financiamiento</p>
                    <p className="text-[13px] font-bold text-text-1">{p.fin}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#A9A6A1' }}>Certificación</p>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-bg text-green-text border border-green-border">
                      {p.cert}
                    </span>
                  </div>
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
                {empProyectos.map((p, i) => (
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
