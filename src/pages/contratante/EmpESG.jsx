import { useState } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import {
  Leaf, Sprout, BadgeCheck, Wind, Recycle, Trophy, CircleDashed, ChevronRight,
  Users, Heart, GraduationCap, Star, Briefcase, Target, Plus, BarChart2,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

// ── Environmental certification path ─────────────────────────────────────────
const CERT_PATH = [
  { Icon: CircleDashed, label: 'Sin certificación', desc: 'Sin proyectos medioambientales registrados',        color: '#9CA3AF', status: 'done',   date: 'Antes de 2023'   },
  { Icon: Sprout,       label: 'Eco en Proceso',    desc: 'Proceso de certificación ambiental en curso',       color: '#D97706', status: 'done',   date: 'Marzo 2023'      },
  { Icon: Leaf,         label: 'Verde',             desc: 'Proyectos ambientales registrados en Bonafide',     color: '#059669', status: 'done',   date: 'Septiembre 2023' },
  { Icon: BadgeCheck,   label: 'Verde Bonafide',    desc: 'Certificación completa verificada por Bonafide',    color: '#059669', status: 'done',   date: 'Febrero 2024'    },
  { Icon: Wind,         label: 'Verde CO₂',         desc: 'Captura activa de carbono certificada',             color: '#3B82F6', status: 'active', date: 'Enero 2025'      },
  { Icon: Recycle,      label: 'Verde Neutro',      desc: 'Balance de carbono neutro certificado',             color: '#059669', status: 'pending' },
  { Icon: Trophy,       label: 'Verde ESG',         desc: 'Cumplimiento Ambiental + Social + Gobernanza',      color: '#EF7A2C', status: 'pending' },
];

const pymeCerts = [
  { nombre: 'Tradex', cert: 'Verde Bonafide', Icon: BadgeCheck, color: '#059669' },
];

const empProyectos = [
  { nombre: 'Parque Solar Malabo I',   estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde CO₂',      fin: 'XAF 120M' },
  { nombre: 'Reforestación Costa GE',  estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde Bonafide', fin: 'XAF 85M'  },
  { nombre: 'Biogás Residuos Bata',    estado: 'Planificado',  riesgo: 'Medio', cert: 'Verde CO₂',      fin: 'XAF 65M'  },
  { nombre: 'Agro Sostenible Norte',   estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde',          fin: 'XAF 42M'  },
  { nombre: 'Huella Cero 2027',        estado: 'Planificado',  riesgo: 'Bajo',  cert: 'Verde Neutro',   fin: 'XAF 200M' },
];

const ESG_METAS = [
  { label: 'Reducción de emisiones',    pct: 62, color: '#2E7D5B' },
  { label: 'Energía renovable',         pct: 48, color: '#3B82F6' },
  { label: 'Gestión de residuos',       pct: 35, color: '#C68A1D' },
];

// ── Social impact data ────────────────────────────────────────────────────────
const SOCIAL_PATH = [
  { Icon: CircleDashed,  label: 'Sin iniciativas',      desc: 'Sin programas sociales registrados',               color: '#9CA3AF', status: 'done',   date: 'Antes de 2023' },
  { Icon: Briefcase,     label: 'Empresa Responsable',  desc: 'Primeras iniciativas de responsabilidad social',    color: '#C68A1D', status: 'done',   date: 'Abril 2023'    },
  { Icon: Users,         label: 'Impacto Local',        desc: 'Programas activos que benefician comunidades',      color: '#3B82F6', status: 'done',   date: 'Octubre 2023'  },
  { Icon: Heart,         label: 'Impacto Regional',     desc: 'Iniciativas de alcance regional verificadas',       color: '#8B5CF6', status: 'active', date: 'Enero 2025'    },
  { Icon: GraduationCap, label: 'Liderazgo Educativo',  desc: 'Reconocido por formación y desarrollo de talento',  color: '#059669', status: 'pending' },
  { Icon: Star,          label: 'Liderazgo Social ESG', desc: 'Cumplimiento Social + Ambiental + Gobernanza',      color: '#EF7A2C', status: 'pending' },
];

const SOCIAL_METAS = [
  { label: 'Empleabilidad cadena',   pct: 82, color: '#EF7A2C' },
  { label: 'Educación y formación',  pct: 71, color: '#3B82F6' },
  { label: 'Salud comunitaria',      pct: 58, color: '#2E7D5B' },
  { label: 'Infraestructura social', pct: 44, color: '#C68A1D' },
];

const iniciativasSociales = [
  { nombre: 'Bienestar trabajadores cadena de suministro', categoria: 'Empleabilidad', estado: 'En ejecución', beneficiarios: 850,  inversion: 45_000_000 },
  { nombre: 'Centro de formación técnica Malabo',          categoria: 'Educación',     estado: 'En ejecución', beneficiarios: 320,  inversion: 38_000_000 },
  { nombre: 'Brigadas médicas comunitarias',               categoria: 'Salud',         estado: 'Finalizado',   beneficiarios: 1200, inversion: 22_000_000 },
  { nombre: 'Infraestructura vial acceso comunidades',     categoria: 'Infraestructura', estado: 'Planificado', beneficiarios: 600, inversion: 55_000_000 },
  { nombre: 'Microfinanzas para emprendedores locales',    categoria: 'Empleabilidad', estado: 'En ejecución', beneficiarios: 120,  inversion: 20_000_000 },
];

// ── Shared helpers ────────────────────────────────────────────────────────────
const fmtXAF       = (n) => n.toLocaleString('de-DE').replace(/,/g, '.') + ' XAF';
const estadoBadge  = (e) => e === 'En ejecución' ? 'orange' : e === 'Planificado' ? 'amber' : e === 'Finalizado' ? 'green' : e === 'Suspendido' ? 'red' : 'gray';
const riesgoBadge  = (r) => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';
const categoriaBadge = (cat) =>
  cat === 'Educación'       ? 'brand' :
  cat === 'Salud'           ? 'green' :
  cat === 'Empleabilidad'   ? 'orange' : 'amber';

const CardHeader = ({ title, sub, Icon, right }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
    <div className="flex items-center gap-3">
      <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-[14px] font-bold text-text-1">{title}</div>
        {sub && <div className="text-[11px] text-text-4">{sub}</div>}
      </div>
    </div>
    {right}
  </div>
);

export default function EmpESG() {
  const [tab, setTab] = useState('resumen');

  // ── Ambiental countups ──
  const activeIdx      = CERT_PATH.findIndex(c => c.status === 'active');
  const activeCert     = CERT_PATH[activeIdx];
  const nextCert       = CERT_PATH[activeIdx + 1];
  const animRegistrados = useCountUp(5, 900, 100);
  const animActivos     = useCountUp(3, 900, 200);
  const animFinanciados = useCountUp(3, 900, 300);

  // ── Social countups ──
  const socialActiveIdx  = SOCIAL_PATH.findIndex(c => c.status === 'active');
  const socialActiveCert = SOCIAL_PATH[socialActiveIdx];
  const socialNextCert   = SOCIAL_PATH[socialActiveIdx + 1];
  const animEmpleosDir   = useCountUp(240,         900,  100);
  const animEmpleosInd   = useCountUp(580,         900,  150);
  const animComunidades  = useCountUp(15,          900,  200);
  const animHoras        = useCountUp(4800,        900,  250);
  const animInvSocial    = useCountUp(180_000_000, 1500, 200);

  return (
    <AppShell active="empESG" role="contratante" title="Impacto" sub="Impacto Ambiental y Social de tu empresa" back>
      <div className="fade-in space-y-5">

        {/* Tabs */}
        <div className="flex bg-white rounded-[10px] gap-1 w-fit">
          {[
            { id: 'resumen',   lbl: 'Resumen',   Icon: BarChart2 },
            { id: 'ambiental', lbl: 'Ambiental', Icon: Leaf      },
            { id: 'social',    lbl: 'Social',    Icon: Users     },
          ].map(({ id, lbl, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`bona-btn py-1.5 px-4 font-medium rounded-[8px] text-[12px] transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5
                ${tab === id ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold' : 'text-text-3 hover:text-text-1 cursor-pointer'}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {lbl}
            </button>
          ))}
        </div>

        {/* ═══════════════════ RESUMEN TAB ═══════════════════ */}
        {tab === 'resumen' && (
          <>
            {/* Headline KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: String(animActivos),                     label: 'Proyectos activos', tone: 'gradient' },
                { value: '12.400 t',                              label: 'Captura CO₂',       tone: 'gradient' },
                { value: String(animEmpleosDir + animEmpleosInd), label: 'Empleos generados', tone: 'gradient' },
                { value: fmtXAF(animInvSocial),                   label: 'Inversión social',  tone: 'gradient' },
              ].map(({ value, label, tone }) => (
                <StatCard key={label} label={label} value={value} tone={tone} />
              ))}
            </div>

            {/* Status cards side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Ambiental */}
              <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[10px] bg-green-bg border border-green-border flex items-center justify-center shrink-0">
                      <Leaf className="w-5 h-5 text-green-text" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-text-1">Impacto Ambiental</div>
                      <div className="text-[11px] text-text-4">Proyectos y certificación</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-bg text-green-text border border-green-border whitespace-nowrap shrink-0">
                    {activeCert.label}
                  </span>
                </div>
                <div className="space-y-3">
                  {ESG_METAS.map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-text-3">{label}</span>
                        <span className="text-[11px] font-extrabold" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setTab('ambiental')}
                  className="mt-auto flex items-center gap-1 text-[12px] font-semibold text-green-text hover:underline self-start"
                >
                  Ver detalle completo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Social */}
              <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                      <Users className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-text-1">Impacto Social</div>
                      <div className="text-[11px] text-text-4">Iniciativas y comunidades</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shrink-0"
                    style={{ background: '#F5F3FF', color: '#8B5CF6', border: '1px solid #DDD6FE' }}>
                    {socialActiveCert.label}
                  </span>
                </div>
                <div className="space-y-3">
                  {SOCIAL_METAS.map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-text-3">{label}</span>
                        <span className="text-[11px] font-extrabold" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setTab('social')}
                  className="mt-auto flex items-center gap-1 text-[12px] font-semibold hover:underline self-start"
                  style={{ color: '#8B5CF6' }}
                >
                  Ver detalle completo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════ AMBIENTAL TAB ═══════════════════ */}
        {tab === 'ambiental' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { value: String(animRegistrados), label: 'Proyectos registrados', tone: 'gradient' },
                { value: String(animActivos),     label: 'Proyectos activos',     tone: 'gradient' },
                { value: String(animFinanciados), label: 'Proyectos financiados', tone: 'gradient' },
                { value: '12.400 t',              label: 'Captura CO₂ potencial', tone: 'gradient' },
                { value: 'Bajo',                  label: 'Riesgo ambiental',      tone: 'gradient' },
              ].map(({ value, label, tone }) => (
                <StatCard key={label} label={label} value={value} tone={tone} />
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
                            ${isDone ? 'bg-green-border' : isActive ? 'bg-green-border/50' : 'bg-border'}
                          `} />
                        )}
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2
                            ${isDone || isActive ? 'bg-green-bg border-green-border' : 'bg-page-bg border-border'}
                          `}
                          style={isActive ? { boxShadow: '0 0 0 4px rgba(0,200,83,0.12)' } : {}}
                        >
                          <cert.Icon className="w-[18px] h-[18px]" style={{ color: isPending ? '#D1D5DB' : cert.color }} />
                        </div>
                        <div className={`flex-1 pt-1.5 ${isPending ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[13px] font-bold
                              ${isActive ? 'text-green-text' : isDone ? 'text-text-1' : 'text-text-4'}
                            `}>{cert.label}</span>
                            {isActive && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-bg text-green-text border border-green-border">
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

                {/* Metas ambientales */}
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                         style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-text-1">Metas Ambientales 2026</div>
                      <div className="text-[11px] text-text-4">Progreso hacia los objetivos del año</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {ESG_METAS.map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-text-3">{label}</span>
                          <span className="text-[11px] font-extrabold" style={{ color }}>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold text-text-1 leading-snug flex-1">{p.nombre}</p>
                      <Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge>
                    </div>
                    <div className="h-px bg-border" />
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
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-bg text-green-text border border-green-border">{p.cert}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: tabla */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-page-bg">
                    <tr className="border-b border-border">
                      {['Proyecto', 'Estado', 'Riesgo', 'Certificación', 'Financiamiento'].map((h, i) => (
                        <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {empProyectos.map((p, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors">
                        <td className="px-4 py-3 text-[12px] font-medium text-text-1">{p.nombre}</td>
                        <td className="px-4 py-3"><Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge></td>
                        <td className="px-4 py-3"><Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge></td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-bg text-green-text border border-green-border whitespace-nowrap">{p.cert}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{p.fin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════ SOCIAL TAB ═══════════════════ */}
        {tab === 'social' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { value: String(animEmpleosDir),                 label: 'Empleos directos',   tone: 'gradient' },
                { value: String(animEmpleosInd),                 label: 'Empleos indirectos', tone: 'gradient' },
                { value: String(animComunidades),                label: 'Comunidades',        tone: 'gradient' },
                { value: `${animHoras.toLocaleString('de-DE')} h`, label: 'Horas de formación', tone: 'gradient' },
                { value: fmtXAF(animInvSocial),                  label: 'Inversión social',   tone: 'gradient' },
              ].map(({ value, label, tone }) => (
                <StatCard key={label} label={label} value={value} tone={tone} />
              ))}
            </div>

            {/* Social path + cards */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Social certification path — 2/5 */}
              <div className="card-enter lg:col-span-2 bg-white rounded-[14px] border border-border p-5">
                <CardHeader title="Nivel de Impacto Social" sub="Progresión hacia el liderazgo social" Icon={Users} />
                <div className="relative">
                  {SOCIAL_PATH.map((cert, i) => {
                    const isLast    = i === SOCIAL_PATH.length - 1;
                    const isDone    = cert.status === 'done';
                    const isActive  = cert.status === 'active';
                    const isPending = cert.status === 'pending';
                    return (
                      <div key={cert.label} className="relative flex gap-3.5 pb-5 last:pb-0">
                        {!isLast && (
                          <div
                            className="absolute left-[19px] top-10 bottom-0 w-0.5"
                            style={{ background: isDone ? '#BFDBFE' : isActive ? 'rgba(191,219,254,0.5)' : '#ECEAE7' }}
                          />
                        )}
                        <div
                          className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2"
                          style={
                            isActive  ? { background: '#EFF6FF', borderColor: '#3B82F6', boxShadow: '0 0 0 4px rgba(59,130,246,0.12)' } :
                            isDone    ? { background: '#EFF6FF', borderColor: '#BFDBFE' } :
                                        { background: '#F9F8F6', borderColor: '#ECEAE7' }
                          }
                        >
                          <cert.Icon className="w-[18px] h-[18px]" style={{ color: isPending ? '#D1D5DB' : cert.color }} />
                        </div>
                        <div className={`flex-1 pt-1.5 ${isPending ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-bold"
                              style={{ color: isActive ? '#3B82F6' : isDone ? '#1E293B' : '#9CA3AF' }}>
                              {cert.label}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE' }}>
                                Nivel actual
                              </span>
                            )}
                            {isDone && <span className="text-[10px] font-semibold" style={{ color: '#3B82F6' }}>✓</span>}
                          </div>
                          <div className="text-[10px] text-text-4 mt-0.5 leading-snug">{cert.desc}</div>
                          {cert.date && <div className="text-[10px] text-text-5 mt-0.5">{cert.date}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right column — 3/5 */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                {/* Current social level */}
                <div className="card-enter rounded-[14px] border p-5" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
                  <div className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: '#3B82F6' }}>
                    Nivel de impacto actual
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-[12px] bg-white flex items-center justify-center shrink-0" style={{ border: '1px solid #BFDBFE' }}>
                      <socialActiveCert.Icon className="w-6 h-6" style={{ color: '#8B5CF6' }} />
                    </div>
                    <div>
                      <div className="text-[20px] font-extrabold leading-none" style={{ color: '#8B5CF6' }}>
                        {socialActiveCert.label}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'rgba(139,92,246,0.8)' }}>
                        {socialActiveCert.desc}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-text-3">Verificado desde Enero 2025 · Revisión anual en Enero 2026</div>
                </div>

                {/* Next social level */}
                {socialNextCert && (
                  <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '70ms' }}>
                    <div className="text-[11px] font-semibold text-text-4 uppercase tracking-wide mb-3">
                      Siguiente nivel — {socialNextCert.label}
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                        <socialNextCert.Icon className="w-5 h-5" style={{ color: '#059669' }} />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-text-1 mb-0.5">{socialNextCert.label}</div>
                        <div className="text-[11px] text-text-4 leading-snug">{socialNextCert.desc}</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-text-3 mb-2">Requisitos para avanzar:</div>
                    <div className="space-y-2">
                      {[
                        'Programa de formación técnica con al menos 200 beneficiarios anuales',
                        'Alianza con institución educativa pública verificada',
                        'Informe de impacto educativo auditado por tercero',
                      ].map(req => (
                        <div key={req} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#059669' }} />
                          <span className="text-[11px] text-text-4 leading-snug">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metas sociales 2026 */}
                <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '140ms' }}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                         style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}>
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-text-1">Metas de Impacto Social 2026</div>
                      <div className="text-[11px] text-text-4">Progreso hacia los objetivos sociales del año</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {SOCIAL_METAS.map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-text-3">{label}</span>
                          <span className="text-[11px] font-extrabold" style={{ color }}>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social initiatives table */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '210ms' }}>
              <CardHeader
                title="Iniciativas Sociales"
                sub="Programas e inversiones de impacto social"
                Icon={Heart}
                right={
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" style={{ color: '#3B82F6' }} />
                      <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: '#3B82F6' }}>3.090 beneficiarios</span>
                    </div>
                    <Button variant="primary" size="sm">
                      <Plus className="w-3.5 h-3.5" />
                      Nueva iniciativa
                    </Button>
                  </div>
                }
              />
              {/* Móvil: cards */}
              <div className="sm:hidden space-y-2">
                {iniciativasSociales.map((ini, i) => (
                  <div key={i} className="rounded-[12px] border border-border px-3 py-2.5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-text-1 truncate">{ini.nombre}</span>
                      <Badge variant={estadoBadge(ini.estado)}>{ini.estado}</Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={categoriaBadge(ini.categoria)}>{ini.categoria}</Badge>
                      <span className="text-[11px] text-text-4">{ini.beneficiarios} beneficiarios</span>
                      <span className="text-[12px] font-bold text-text-1 ml-auto whitespace-nowrap">{fmtXAF(ini.inversion)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: tabla */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-page-bg">
                    <tr className="border-b border-border">
                      {['Iniciativa', 'Categoría', 'Estado', 'Beneficiarios', 'Inversión'].map((h, i) => (
                        <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                          ${i === 0 ? 'text-left' : i === 4 ? 'text-right' : 'text-center'}
                        `}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {iniciativasSociales.map((ini, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors">
                        <td className="px-4 py-3 text-[12px] font-medium text-text-1">{ini.nombre}</td>
                        <td className="px-4 py-3 text-center"><Badge variant={categoriaBadge(ini.categoria)}>{ini.categoria}</Badge></td>
                        <td className="px-4 py-3 text-center"><Badge variant={estadoBadge(ini.estado)}>{ini.estado}</Badge></td>
                        <td className="px-4 py-3 text-center text-[12px] font-semibold text-text-1">{ini.beneficiarios.toLocaleString('de-DE')}</td>
                        <td className="px-4 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmtXAF(ini.inversion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </AppShell>
  );
}
