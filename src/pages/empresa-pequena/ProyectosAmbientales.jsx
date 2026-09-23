import { useState, useRef } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import {
  Leaf, Sprout, BadgeCheck, Wind, Recycle, Trophy, CircleDashed, ChevronRight,
  Plus, FolderOpen, Target,
  Upload, X as XIcon, FileText,
  Users, Heart, GraduationCap, Star, Briefcase,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';

// ── Environmental certification path ─────────────────────────────────────────
const CERT_PATH = [
  { Icon: CircleDashed, label: 'Sin certificación', desc: 'Sin proyectos medioambientales registrados',        color: '#9CA3AF', status: 'done',   date: 'Antes de 2024' },
  { Icon: Sprout,       label: 'Eco en Proceso',    desc: 'Proceso de certificación ambiental en curso',       color: '#D97706', status: 'done',   date: 'Enero 2024'    },
  { Icon: Leaf,         label: 'Verde',             desc: 'Proyectos ambientales registrados en Bonafide',     color: '#059669', status: 'done',   date: 'Marzo 2024'    },
  { Icon: BadgeCheck,   label: 'Verde Bonafide',    desc: 'Certificación completa verificada por Bonafide',    color: '#059669', status: 'active', date: 'Junio 2025'    },
  { Icon: Wind,         label: 'Verde CO₂',         desc: 'Captura activa de carbono certificada',             color: '#3B82F6', status: 'pending' },
  { Icon: Recycle,      label: 'Verde Neutro',      desc: 'Balance de carbono neutro certificado',             color: '#059669', status: 'pending' },
  { Icon: Trophy,       label: 'Verde ESG',         desc: 'Cumplimiento Ambiental + Social + Gobernanza',      color: '#EF7A2C', status: 'pending' },
];

const NEXT_REQS = {
  'Verde CO₂': [
    'Registro de captura de CO₂ verificado por auditor externo',
    'Mínimo 2 proyectos de captura de carbono activos',
    'Informe anual de huella de carbono presentado',
  ],
};

const ESG_METAS = [
  { label: 'Captura de CO₂',       pct: 45, color: '#2E7D5B' },
  { label: 'Proyectos activos',     pct: 63, color: '#3B82F6' },
  { label: 'Reducción de residuos', pct: 30, color: '#C68A1D' },
];

const proyectos = [
  { nombre: 'Reforestación Bata Norte', estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde Bonafide', fin: 45000000 },
  { nombre: 'Agro Sierra Sur',          estado: 'En ejecución', riesgo: 'Medio', cert: 'Verde',          fin: 28000000 },
  { nombre: 'Energía Solar Malabo',     estado: 'Planificado',  riesgo: 'Bajo',  cert: 'Eco en Proceso', fin: 62000000 },
  { nombre: 'Gestión Residuos Bata',    estado: 'Finalizado',   riesgo: 'Bajo',  cert: 'Verde Bonafide', fin: 18000000 },
  { nombre: 'Reforestación Ebebiyín',   estado: 'Planificado',  riesgo: 'Medio', cert: 'Eco en Proceso', fin: 35000000 },
];

// ── Social impact data ────────────────────────────────────────────────────────
const SOCIAL_PATH = [
  { Icon: CircleDashed,  label: 'Sin iniciativas',      desc: 'Sin programas sociales registrados',               color: '#9CA3AF', status: 'done',   date: 'Antes de 2024' },
  { Icon: Briefcase,     label: 'Empresa Responsable',  desc: 'Primeras iniciativas de responsabilidad social',    color: '#C68A1D', status: 'done',   date: 'Mayo 2024'     },
  { Icon: Users,         label: 'Impacto Local',        desc: 'Programas activos que benefician comunidades',      color: '#3B82F6', status: 'active', date: 'Enero 2025'    },
  { Icon: Heart,         label: 'Impacto Regional',     desc: 'Iniciativas de alcance regional verificadas',       color: '#8B5CF6', status: 'pending' },
  { Icon: GraduationCap, label: 'Liderazgo Educativo',  desc: 'Reconocido por formación y desarrollo de talento',  color: '#059669', status: 'pending' },
  { Icon: Star,          label: 'Liderazgo Social ESG', desc: 'Cumplimiento Social + Ambiental + Gobernanza',      color: '#EF7A2C', status: 'pending' },
];

const SOCIAL_METAS = [
  { label: 'Empleabilidad',     pct: 75, color: '#EF7A2C' },
  { label: 'Educación',         pct: 68, color: '#3B82F6' },
  { label: 'Salud comunitaria', pct: 45, color: '#2E7D5B' },
  { label: 'Infraestructura',   pct: 30, color: '#C68A1D' },
];

const iniciativasSociales = [
  { nombre: 'Formación técnica Malabo',           categoria: 'Educación',     estado: 'En ejecución', beneficiarios: 120, inversion: 15_000_000 },
  { nombre: 'Acceso agua potable Bata',            categoria: 'Salud',         estado: 'Finalizado',   beneficiarios: 450, inversion: 22_000_000 },
  { nombre: 'Microcréditos mujeres emprendedoras', categoria: 'Empleabilidad', estado: 'En ejecución', beneficiarios: 35,  inversion: 8_000_000  },
  { nombre: 'Aulas comunitarias Mongomo',          categoria: 'Educación',     estado: 'Planificado',  beneficiarios: 200, inversion: 18_000_000 },
  { nombre: 'Clínica móvil zonas rurales',         categoria: 'Salud',         estado: 'Planificado',  beneficiarios: 320, inversion: 12_000_000 },
];

const categoriaBadge = (cat) =>
  cat === 'Educación'     ? 'brand' :
  cat === 'Salud'         ? 'green' :
  cat === 'Empleabilidad' ? 'orange' : 'amber';

// ── Shared helpers ────────────────────────────────────────────────────────────
const fmtXAF       = (n) => n.toLocaleString('de-DE').replace(/,/g, '.') + ' XAF';
const estadoBadge  = (e) => e === 'En ejecución' ? 'orange' : e === 'Planificado' ? 'amber' : e === 'Finalizado' ? 'green' : e === 'Suspendido' ? 'red' : 'gray';
const riesgoBadge  = (r) => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';
const formatSize   = (b) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

const EMPTY_FORM = { nombre: '', tipo: '', ubicacion: '', descripcion: '', fechaInicio: '', fechaFin: '', financiamiento: '', estado: 'Planificado' };

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

// ── Component ─────────────────────────────────────────────────────────────────
export default function EpProyectosAmbientales() {
  const [tab, setTab]         = useState('ambiental');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [files, setFiles]         = useState([]);
  const fileRef                   = useRef(null);

  // ── Ambiental countups ──
  const activeIdx      = CERT_PATH.findIndex(c => c.status === 'active');
  const activeCert     = CERT_PATH[activeIdx];
  const nextCert       = CERT_PATH[activeIdx + 1];
  const animRegistrados = useCountUp(5,  900, 100);
  const animActivos     = useCountUp(2,  900, 200);
  const animFinanciados = useCountUp(2,  900, 300);

  // ── Social countups ──
  const socialActiveIdx  = SOCIAL_PATH.findIndex(c => c.status === 'active');
  const socialActiveCert = SOCIAL_PATH[socialActiveIdx];
  const socialNextCert   = SOCIAL_PATH[socialActiveIdx + 1];
  const animEmpleosDir   = useCountUp(47,         900,  100);
  const animEmpleosInd   = useCountUp(120,        900,  150);
  const animComunidades  = useCountUp(8,          900,  200);
  const animHoras        = useCountUp(1240,       900,  250);
  const animInvSocial    = useCountUp(75_000_000, 1500, 200);

  const set      = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const onFiles  = (e) => { setFiles(prev => [...prev, ...Array.from(e.target.files)]); e.target.value = ''; };
  const onDrop   = (e) => { e.preventDefault(); setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setFiles([]); };

  return (
    <AppShell active="epESG" role="empresa-pequena" title="Impacto" sub="Impacto Ambiental y Social de tu empresa" back>
      <div className="fade-in space-y-5">

        {/* Tabs */}
        <div className="flex bg-white rounded-[10px] gap-1 w-fit">
          {[
            { id: 'ambiental', lbl: 'Impacto Ambiental', Icon: Leaf  },
            { id: 'social',    lbl: 'Impacto Social',    Icon: Users },
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

        {/* ═══════════════════ AMBIENTAL TAB ═══════════════════ */}
        {tab === 'ambiental' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { value: String(animRegistrados), label: 'Proyectos registrados', tone: 'gradient' },
                { value: String(animActivos),     label: 'Proyectos activos',     tone: 'gradient' },
                { value: String(animFinanciados), label: 'Proyectos financiados', tone: 'gradient' },
                { value: '7.800 t',               label: 'Captura CO₂ potencial', tone: 'gradient' },
                { value: 'Bajo',                  label: 'Riesgo ambiental',      tone: 'gradient' },
              ].map(({ value, label, tone }) => (
                <StatCard key={label} label={label} value={value} tone={tone} />
              ))}
            </div>

            {/* Timeline + Right cards */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Certification Journey — 2/5 */}
              <div className="card-enter lg:col-span-2 bg-white rounded-[14px] border border-border p-5">
                <CardHeader title="Camino de Certificación" sub="Progresión de tu empresa" Icon={Leaf} />
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

              {/* Right column — 3/5 */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                {/* Current cert */}
                <div className="card-enter bg-green-bg rounded-[14px] border border-green-border p-5">
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

                {/* Next cert */}
                {nextCert && (
                  <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '70ms' }}>
                    <div className="text-[11px] font-semibold text-text-4 uppercase tracking-wide mb-3">
                      Siguiente nivel — {nextCert.label}
                    </div>
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

                {/* Metas ESG 2026 */}
                <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '140ms' }}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                         style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-text-1">Metas ESG 2026</div>
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
              </div>
            </div>

            {/* Projects table */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '210ms' }}>
              <CardHeader
                title="Proyectos Registrados"
                sub="Todos tus proyectos medioambientales"
                Icon={FolderOpen}
                right={
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-green-text" />
                      <span className="text-[11px] font-bold text-green-text whitespace-nowrap">5 registrados</span>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
                      <Plus className="w-3.5 h-3.5" />
                      Registrar Proyecto
                    </Button>
                  </div>
                }
              />

              {/* Móvil: cards */}
              <div className="sm:hidden space-y-2">
                {proyectos.map((p, i) => (
                  <div key={i} className="rounded-[12px] border border-border px-3 py-2.5 flex items-center gap-2">
                    <span className="text-[12px] font-medium text-text-1 flex-1 min-w-0 truncate">{p.nombre}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge>
                      <Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge>
                      <span className="text-[12px] font-bold text-text-1 whitespace-nowrap ml-1">{fmtXAF(p.fin)}</span>
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
                        <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                          ${i === 0 ? 'text-left' : i === 4 ? 'text-right' : 'text-center'}
                        `}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {proyectos.map((p, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors">
                        <td className="px-4 py-3 text-[12px] font-medium text-text-1">{p.nombre}</td>
                        <td className="px-4 py-3 text-center"><Badge variant={estadoBadge(p.estado)}>{p.estado}</Badge></td>
                        <td className="px-4 py-3 text-center"><Badge variant={riesgoBadge(p.riesgo)}>{p.riesgo}</Badge></td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-bg text-green-text border border-green-border whitespace-nowrap">
                            {p.cert}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmtXAF(p.fin)}</td>
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
                { value: String(animEmpleosDir),                                        label: 'Empleos directos',   tone: 'gradient' },
                { value: String(animEmpleosInd),                                        label: 'Empleos indirectos', tone: 'gradient' },
                { value: String(animComunidades),                                       label: 'Comunidades',        tone: 'gradient' },
                { value: `${animHoras.toLocaleString('de-DE')} h`,                     label: 'Horas de formación', tone: 'gradient' },
                { value: fmtXAF(animInvSocial),                                        label: 'Inversión social',   tone: 'gradient' },
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
                            <span
                              className="text-[13px] font-bold"
                              style={{ color: isActive ? '#3B82F6' : isDone ? '#1E293B' : '#9CA3AF' }}
                            >
                              {cert.label}
                            </span>
                            {isActive && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE' }}
                              >
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
                      <socialActiveCert.Icon className="w-6 h-6" style={{ color: '#3B82F6' }} />
                    </div>
                    <div>
                      <div className="text-[20px] font-extrabold leading-none" style={{ color: '#3B82F6' }}>
                        {socialActiveCert.label}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'rgba(59,130,246,0.8)' }}>
                        {socialActiveCert.desc}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-text-3">Registrado desde Enero 2025 · Revisión anual en Enero 2026</div>
                </div>

                {/* Next social level */}
                {socialNextCert && (
                  <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '70ms' }}>
                    <div className="text-[11px] font-semibold text-text-4 uppercase tracking-wide mb-3">
                      Siguiente nivel — {socialNextCert.label}
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                        <socialNextCert.Icon className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-text-1 mb-0.5">{socialNextCert.label}</div>
                        <div className="text-[11px] text-text-4 leading-snug">{socialNextCert.desc}</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-text-3 mb-2">Requisitos para avanzar:</div>
                    <div className="space-y-2">
                      {[
                        'Mínimo 3 iniciativas activas con impacto documentado',
                        'Alcance en al menos 2 provincias de Guinea Ecuatorial',
                        'Informe de impacto social verificado por auditor externo',
                      ].map(req => (
                        <div key={req} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#8B5CF6' }} />
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
                      <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: '#3B82F6' }}>1.125 beneficiarios</span>
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
                        <td className="px-4 py-3 text-center text-[12px] font-semibold text-text-1">
                          {ini.beneficiarios.toLocaleString('de-DE')}
                        </td>
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

      {/* ── Modal Registrar Proyecto ── */}
      {showModal && (
        <Modal
          title="Registrar Nuevo Proyecto"
          onClose={closeModal}
          wide
          footer={
            <>
              <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
              <Button variant="primary" onClick={closeModal}>
                <Plus className="w-4 h-4" />
                Registrar Proyecto
              </Button>
            </>
          }
        >
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[12px] font-bold text-text-1 uppercase tracking-wide">Información del proyecto</span>
            </div>
            <div className="mb-0">
              <FormGroup label="Nombre del proyecto" required>
                <Input
                  placeholder="Ej. Reforestación Sierra Norte"
                  value={form.nombre}
                  onChange={set('nombre')}
                />
              </FormGroup>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <FormGroup label="Tipo de proyecto" required>
                <Select value={form.tipo} onChange={set('tipo')}>
                  <option value="">Seleccionar tipo…</option>
                  <option>Reforestación</option>
                  <option>Energía Solar</option>
                  <option>Gestión de Residuos</option>
                  <option>Agroecológico</option>
                  <option>Captura de CO₂</option>
                  <option>Conservación de Biodiversidad</option>
                  <option>Otro</option>
                </Select>
              </FormGroup>
              <FormGroup label="Ubicación" required>
                <Input placeholder="Ciudad o región" value={form.ubicacion} onChange={set('ubicacion')} />
              </FormGroup>
              <FormGroup label="Fecha de inicio" required>
                <Input type="date" value={form.fechaInicio} onChange={set('fechaInicio')} />
              </FormGroup>
              <FormGroup label="Fecha estimada de fin">
                <Input type="date" value={form.fechaFin} onChange={set('fechaFin')} />
              </FormGroup>
              <FormGroup label="Financiamiento solicitado (XAF)">
                <Input placeholder="Ej. 45000000" value={form.financiamiento} onChange={set('financiamiento')} />
              </FormGroup>
              <FormGroup label="Estado inicial">
                <Select value={form.estado} onChange={set('estado')}>
                  <option>Planificado</option>
                  <option>En ejecución</option>
                </Select>
              </FormGroup>
            </div>
          </div>

          <div className="border-t border-border mb-5" />

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[12px] font-bold text-text-1 uppercase tracking-wide">Descripción</span>
            </div>
            <FormGroup label="Descripción del proyecto">
              <Textarea
                placeholder="Describe los objetivos, alcance e impacto esperado del proyecto…"
                value={form.descripcion}
                onChange={set('descripcion')}
                className="h-28"
              />
            </FormGroup>
          </div>

          <div className="border-t border-border mb-5" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-bold text-text-1 uppercase tracking-wide">Documentos adjuntos</span>
              {files.length > 0 && (
                <span className="text-[10px] font-semibold text-text-4">
                  {files.length} archivo{files.length > 1 ? 's' : ''} añadido{files.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div
              className="border-2 border-dashed border-input-border bg-page-bg rounded-[12px] p-6 text-center cursor-pointer hover:border-orange hover:bg-orange-tint transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-7 h-7 text-text-4 mx-auto mb-2" />
              <div className="text-[13px] font-semibold text-text-1 mb-1">Arrastra archivos aquí o haz clic para seleccionar</div>
              <div className="text-[11px] text-text-4">PDF, JPG, PNG, DOCX · Máx. 10 MB por archivo · Múltiples archivos permitidos</div>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx"
                onChange={onFiles}
              />
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-[10px] bg-page-bg border border-border">
                    <FileText className="w-4 h-4 text-text-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-text-1 truncate">{file.name}</div>
                      <div className="text-[10px] text-text-4">{formatSize(file.size)}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-bg transition shrink-0"
                    >
                      <XIcon className="w-3.5 h-3.5 text-text-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

    </AppShell>
  );
}
