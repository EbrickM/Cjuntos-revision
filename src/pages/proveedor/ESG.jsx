import { useState, useRef } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import {
  Leaf, Sprout, BadgeCheck, Wind, Recycle, Trophy, CircleDashed, ChevronRight,
  Users, Heart, GraduationCap, Star, Briefcase, Target, Plus,
  Upload, X as XIcon, FileText,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';

// ── Environmental certification path ─────────────────────────────────────────
const CERT_PATH = [
  { Icon: CircleDashed, label: 'Sin certificación', desc: 'Sin proyectos medioambientales registrados',        color: '#9CA3AF', status: 'done',   date: 'Antes de 2023'   },
  { Icon: Sprout,       label: 'Eco en Proceso',    desc: 'Proceso de certificación ambiental en curso',       color: '#D97706', status: 'done',   date: 'Marzo 2023'      },
  { Icon: Leaf,         label: 'Verde',             desc: 'Proyectos ambientales registrados en Bonafide',     color: '#059669', status: 'done',   date: 'Septiembre 2023' },
  { Icon: BadgeCheck,   label: 'Verde Bonafide',    desc: 'Certificación completa verificada por Bonafide',    color: '#059669', status: 'active', date: 'Junio 2025'      },
  { Icon: Wind,         label: 'Verde CO₂',         desc: 'Captura activa de carbono certificada',             color: '#3B82F6', status: 'pending' },
  { Icon: Recycle,      label: 'Verde Neutro',      desc: 'Balance de carbono neutro certificado',             color: '#059669', status: 'pending' },
  { Icon: Trophy,       label: 'Verde ESG',         desc: 'Cumplimiento Ambiental + Social + Gobernanza',      color: '#EF7A2C', status: 'pending' },
];

const suministradorCerts = [
  { nombre: 'SAP',       cert: 'Eco en Proceso', Icon: Sprout, color: '#D97706' },
  { nombre: 'Lideshore', cert: 'Verde',          Icon: Leaf,   color: '#059669' },
];

const provProyectos = [
  { nombre: 'Flota de Transporte Bajo Emisiones', estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde Bonafide', fin: 'XAF 12M'  },
  { nombre: 'Optimización de Rutas Logísticas',   estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde',          fin: 'XAF 6M'   },
  { nombre: 'Reciclaje de Repuestos',             estado: 'Planificado',  riesgo: 'Medio', cert: 'Eco en Proceso', fin: 'XAF 4.5M' },
  { nombre: 'Capacitación en Manejo Defensivo',   estado: 'Finalizado',   riesgo: 'Bajo',  cert: 'Verde',          fin: 'XAF 1.8M' },
  { nombre: 'Mantenimiento Preventivo de Flota',  estado: 'En ejecución', riesgo: 'Bajo',  cert: 'Verde Bonafide', fin: 'XAF 3.2M' },
];

const ESG_METAS = [
  { label: 'Reducción emisiones flota', pct: 42, color: '#2E7D5B' },
  { label: 'Optimización combustible',  pct: 55, color: '#3B82F6' },
  { label: 'Reciclaje de materiales',   pct: 28, color: '#C68A1D' },
];

// ── Social impact data ────────────────────────────────────────────────────────
const SOCIAL_PATH = [
  { Icon: CircleDashed,  label: 'Sin iniciativas',      desc: 'Sin programas sociales registrados',               color: '#9CA3AF', status: 'done',   date: 'Antes de 2024' },
  { Icon: Briefcase,     label: 'Empresa Responsable',  desc: 'Primeras iniciativas de responsabilidad social',    color: '#C68A1D', status: 'active', date: 'Marzo 2025'    },
  { Icon: Users,         label: 'Impacto Local',        desc: 'Programas activos que benefician comunidades',      color: '#3B82F6', status: 'pending' },
  { Icon: Heart,         label: 'Impacto Regional',     desc: 'Iniciativas de alcance regional verificadas',       color: '#8B5CF6', status: 'pending' },
  { Icon: GraduationCap, label: 'Liderazgo Educativo',  desc: 'Reconocido por formación y desarrollo de talento',  color: '#059669', status: 'pending' },
  { Icon: Star,          label: 'Liderazgo Social ESG', desc: 'Cumplimiento Social + Ambiental + Gobernanza',      color: '#EF7A2C', status: 'pending' },
];

const SOCIAL_METAS = [
  { label: 'Seguridad laboral',     pct: 60, color: '#EF7A2C' },
  { label: 'Formación continua',    pct: 45, color: '#3B82F6' },
  { label: 'Bienestar familiar',    pct: 38, color: '#2E7D5B' },
  { label: 'Compromiso comunidad',  pct: 22, color: '#C68A1D' },
];

const iniciativasSociales = [
  { nombre: 'Seguridad vial para conductores',      categoria: 'Seguridad',     estado: 'Finalizado',   beneficiarios: 62,  inversion: 8_000_000  },
  { nombre: 'Formación técnica en mecánica',        categoria: 'Educación',     estado: 'En ejecución', beneficiarios: 45,  inversion: 6_000_000  },
  { nombre: 'Apoyo escolar hijos de empleados',     categoria: 'Educación',     estado: 'Planificado',  beneficiarios: 80,  inversion: 4_000_000  },
  { nombre: 'Fondo de emergencias médicas',         categoria: 'Salud',         estado: 'En ejecución', beneficiarios: 85,  inversion: 10_000_000 },
];

// ── Shared helpers ────────────────────────────────────────────────────────────
const fmtXAF       = (n) => n.toLocaleString('de-DE').replace(/,/g, '.') + ' XAF';
const estadoBadge  = (e) => e === 'En ejecución' ? 'orange' : e === 'Planificado' ? 'amber' : e === 'Finalizado' ? 'green' : e === 'Suspendido' ? 'red' : 'gray';
const riesgoBadge  = (r) => r === 'Bajo' ? 'green' : r === 'Medio' ? 'yellow' : 'red';
const categoriaBadge = (cat) =>
  cat === 'Educación'   ? 'brand' :
  cat === 'Salud'       ? 'green' :
  cat === 'Seguridad'   ? 'orange' : 'amber';

const formatSize = (b) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
const EMPTY_FORM        = { nombre: '', tipo: '', ubicacion: '', descripcion: '', fechaInicio: '', fechaFin: '', financiamiento: '', estado: 'Planificado' };
const EMPTY_SOCIAL_FORM = { nombre: '', categoria: '', ubicacion: '', descripcion: '', fechaInicio: '', fechaFin: '', beneficiarios: '', inversion: '', estado: 'Planificado' };

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

export default function ProvESG() {
  const [tab, setTab] = useState('ambiental');
  const [showModal, setShowModal]             = useState(false);
  const [form, setForm]                       = useState(EMPTY_FORM);
  const [files, setFiles]                     = useState([]);
  const fileRef                               = useRef(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialForm, setSocialForm]           = useState(EMPTY_SOCIAL_FORM);
  const [socialFiles, setSocialFiles]         = useState([]);
  const socialFileRef                         = useRef(null);

  const set          = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const onFiles      = (e) => { setFiles(prev => [...prev, ...Array.from(e.target.files)]); e.target.value = ''; };
  const onDrop       = (e) => { e.preventDefault(); setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); };
  const closeModal   = () => { setShowModal(false); setForm(EMPTY_FORM); setFiles([]); };
  const setSocial        = (k) => (e) => setSocialForm(f => ({ ...f, [k]: e.target.value }));
  const onSocialFiles    = (e) => { setSocialFiles(prev => [...prev, ...Array.from(e.target.files)]); e.target.value = ''; };
  const onSocialDrop     = (e) => { e.preventDefault(); setSocialFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); };
  const closeSocialModal = () => { setShowSocialModal(false); setSocialForm(EMPTY_SOCIAL_FORM); setSocialFiles([]); };

  // ── Ambiental countups ──
  const activeIdx      = CERT_PATH.findIndex(c => c.status === 'active');
  const activeCert     = CERT_PATH[activeIdx];
  const nextCert       = CERT_PATH[activeIdx + 1];
  const animRegistrados = useCountUp(5, 900, 100);
  const animActivos     = useCountUp(2, 900, 200);
  const animFinanciados = useCountUp(1, 900, 300);

  // ── Social countups ──
  const socialActiveIdx  = SOCIAL_PATH.findIndex(c => c.status === 'active');
  const socialActiveCert = SOCIAL_PATH[socialActiveIdx];
  const socialNextCert   = SOCIAL_PATH[socialActiveIdx + 1];
  const animEmpleosDir   = useCountUp(62,         900,  100);
  const animEmpleosInd   = useCountUp(85,         900,  150);
  const animComunidades  = useCountUp(4,          900,  200);
  const animHoras        = useCountUp(920,        900,  250);
  const animInvSocial    = useCountUp(28_000_000, 1500, 200);

  return (
    <AppShell active="provESG" role="proveedor" title="Impacto" sub="Impacto Ambiental y Social de tu empresa" back>
      <div className="fade-in space-y-5">

        {/* Tabs */}
        <div className="flex bg-white rounded-[10px] gap-1 w-fit">
          {[
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

        {/* ═══════════════════ AMBIENTAL TAB ═══════════════════ */}
        {tab === 'ambiental' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { value: String(animRegistrados), label: 'Proyectos registrados', tone: 'gradient' },
                { value: String(animActivos),     label: 'Proyectos activos',     tone: 'gradient' },
                { value: String(animFinanciados), label: 'Proyectos financiados', tone: 'gradient' },
                { value: '3.200 t',               label: 'Captura CO₂ potencial', tone: 'gradient' },
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
                  <div className="text-[11px] text-text-3">Obtenida el 15 de Junio, 2025 · Válida hasta Junio 2027</div>
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
                      {['Auditoría de huella de carbono completa de la flota de transporte', 'Compensación del 100% de emisiones generadas en el año fiscal', 'Reporte de sostenibilidad verificado por tercero acreditado'].map(req => (
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

                {/* Suministrador cert distribution */}
                <div className="bg-white rounded-[14px] border border-border p-5">
                  <div className="text-[13px] font-bold text-text-1 mb-3">Certificación de Suministradores</div>
                  <div className="space-y-2.5">
                    {suministradorCerts.map(p => (
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
              <CardHeader
                title="Proyectos Registrados"
                sub="Todos los proyectos medioambientales registrados"
                Icon={Leaf}
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
              <div className="sm:hidden space-y-3">
                {provProyectos.map((p, i) => (
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
                    {provProyectos.map((p, i) => (
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
                { value: String(animEmpleosDir),                   label: 'Empleos directos',   tone: 'gradient' },
                { value: String(animEmpleosInd),                   label: 'Empleos indirectos', tone: 'gradient' },
                { value: String(animComunidades),                  label: 'Comunidades',        tone: 'gradient' },
                { value: `${animHoras.toLocaleString('de-DE')} h`, label: 'Horas de formación', tone: 'gradient' },
                { value: fmtXAF(animInvSocial),                    label: 'Inversión social',   tone: 'gradient' },
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
                      <socialActiveCert.Icon className="w-6 h-6" style={{ color: '#C68A1D' }} />
                    </div>
                    <div>
                      <div className="text-[20px] font-extrabold leading-none" style={{ color: '#C68A1D' }}>
                        {socialActiveCert.label}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'rgba(198,138,29,0.8)' }}>
                        {socialActiveCert.desc}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-text-3">Registrado desde Marzo 2025 · Revisión anual en Marzo 2026</div>
                </div>

                {/* Next social level */}
                {socialNextCert && (
                  <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '70ms' }}>
                    <div className="text-[11px] font-semibold text-text-4 uppercase tracking-wide mb-3">
                      Siguiente nivel — {socialNextCert.label}
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                        <socialNextCert.Icon className="w-5 h-5" style={{ color: '#3B82F6' }} />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-text-1 mb-0.5">{socialNextCert.label}</div>
                        <div className="text-[11px] text-text-4 leading-snug">{socialNextCert.desc}</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-text-3 mb-2">Requisitos para avanzar:</div>
                    <div className="space-y-2">
                      {[
                        'Al menos 2 iniciativas sociales activas con impacto documentado',
                        'Programa de formación interno con certificación reconocida',
                        'Informe anual de responsabilidad social validado',
                      ].map(req => (
                        <div key={req} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#3B82F6' }} />
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
                      <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: '#3B82F6' }}>272 beneficiarios</span>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setShowSocialModal(true)}>
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
      {/* ── Modal Registrar Proyecto Ambiental ── */}
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
            <FormGroup label="Nombre del proyecto" required>
              <Input
                placeholder="Ej. Flota de Transporte Bajo Emisiones II"
                value={form.nombre}
                onChange={set('nombre')}
              />
            </FormGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <FormGroup label="Tipo de proyecto" required>
                <Select value={form.tipo} onChange={set('tipo')}>
                  <option value="">Seleccionar tipo…</option>
                  <option>Reducción de Emisiones de Flota</option>
                  <option>Optimización Energética</option>
                  <option>Gestión de Residuos</option>
                  <option>Eficiencia de Combustible</option>
                  <option>Compensación de Carbono</option>
                  <option>Reciclaje de Materiales</option>
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
              <FormGroup label="Financiamiento (XAF)">
                <Input placeholder="Ej. 12000000" value={form.financiamiento} onChange={set('financiamiento')} />
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

      {/* ── Modal Nueva Iniciativa Social ── */}
      {showSocialModal && (
        <Modal
          title="Registrar Nueva Iniciativa Social"
          onClose={closeSocialModal}
          wide
          footer={
            <>
              <Button variant="ghost" onClick={closeSocialModal}>Cancelar</Button>
              <Button variant="primary" onClick={closeSocialModal}>
                <Plus className="w-4 h-4" />
                Registrar Iniciativa
              </Button>
            </>
          }
        >
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[12px] font-bold text-text-1 uppercase tracking-wide">Información de la iniciativa</span>
            </div>
            <FormGroup label="Nombre de la iniciativa" required>
              <Input
                placeholder="Ej. Seguridad vial para conductores"
                value={socialForm.nombre}
                onChange={setSocial('nombre')}
              />
            </FormGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <FormGroup label="Categoría" required>
                <Select value={socialForm.categoria} onChange={setSocial('categoria')}>
                  <option value="">Seleccionar categoría…</option>
                  <option>Seguridad</option>
                  <option>Educación</option>
                  <option>Salud</option>
                  <option>Empleabilidad</option>
                  <option>Otro</option>
                </Select>
              </FormGroup>
              <FormGroup label="Ubicación" required>
                <Input placeholder="Ciudad o región" value={socialForm.ubicacion} onChange={setSocial('ubicacion')} />
              </FormGroup>
              <FormGroup label="Fecha de inicio" required>
                <Input type="date" value={socialForm.fechaInicio} onChange={setSocial('fechaInicio')} />
              </FormGroup>
              <FormGroup label="Fecha estimada de fin">
                <Input type="date" value={socialForm.fechaFin} onChange={setSocial('fechaFin')} />
              </FormGroup>
              <FormGroup label="Beneficiarios estimados">
                <Input placeholder="Ej. 80" value={socialForm.beneficiarios} onChange={setSocial('beneficiarios')} />
              </FormGroup>
              <FormGroup label="Inversión (XAF)">
                <Input placeholder="Ej. 8000000" value={socialForm.inversion} onChange={setSocial('inversion')} />
              </FormGroup>
              <FormGroup label="Estado inicial">
                <Select value={socialForm.estado} onChange={setSocial('estado')}>
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
            <FormGroup label="Descripción de la iniciativa">
              <Textarea
                placeholder="Describe los objetivos, alcance e impacto social esperado…"
                value={socialForm.descripcion}
                onChange={setSocial('descripcion')}
                className="h-28"
              />
            </FormGroup>
          </div>

          <div className="border-t border-border mb-5" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-bold text-text-1 uppercase tracking-wide">Documentos adjuntos</span>
              {socialFiles.length > 0 && (
                <span className="text-[10px] font-semibold text-text-4">
                  {socialFiles.length} archivo{socialFiles.length > 1 ? 's' : ''} añadido{socialFiles.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div
              className="border-2 border-dashed border-input-border bg-page-bg rounded-[12px] p-6 text-center cursor-pointer hover:border-orange hover:bg-orange-tint transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onSocialDrop}
              onClick={() => socialFileRef.current?.click()}
            >
              <Upload className="w-7 h-7 text-text-4 mx-auto mb-2" />
              <div className="text-[13px] font-semibold text-text-1 mb-1">Arrastra archivos aquí o haz clic para seleccionar</div>
              <div className="text-[11px] text-text-4">PDF, JPG, PNG, DOCX · Máx. 10 MB por archivo · Múltiples archivos permitidos</div>
              <input
                ref={socialFileRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx"
                onChange={onSocialFiles}
              />
            </div>
            {socialFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {socialFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-[10px] bg-page-bg border border-border">
                    <FileText className="w-4 h-4 text-text-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-text-1 truncate">{file.name}</div>
                      <div className="text-[10px] text-text-4">{formatSize(file.size)}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSocialFiles(prev => prev.filter((_, idx) => idx !== i)); }}
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
