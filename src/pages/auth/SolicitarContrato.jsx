import { Fragment, useState, useRef } from 'react';
import { useApp } from '../../state/AppContext';
import logo from '../../assets/logo-color.webp';
import {
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Search, X, Check,
  Building2, User, FileText, DollarSign, Clock,
  Briefcase, CheckSquare, Plus, ArrowRight,
  Bell, AlertCircle, MapPin, Send, LogOut, CheckCircle, CheckCircle2, Download,
} from 'lucide-react';

// ── Brand ─────────────────────────────────────────────────────────────────────
const RED  = '#e0201c';
const ORA  = '#ef7a2c';
const GRAD = `linear-gradient(135deg, ${RED} 0%, ${ORA} 100%)`;
const SHADOW = '0 4px 12px -2px rgba(198,40,40,0.2), 0 8px 16px -4px rgba(245,124,0,0.15)';

// ── Stepper ───────────────────────────────────────────────────────────────────
const STEPS_CONT = ['Identificación', 'Operación', 'PYME(s)',              'Confirmación'];
const STEPS_PYME = ['Identificación', 'Operación', 'Empresa Contratante',  'Confirmación'];

// step index: -1 = stepper hidden
const PHASE_STEP = {
  who_initiates:   -1,
  is_client:        0, nif_search: 0, confirm_company: 0,
  authorize:        0, register:   0, contact:         0,
  operation:        1,
  select_parties:   2,
  confirmation:     3,
  sent:            -1,
  inv_p_landing:   -1,
  inv_c_landing:   -1,
  inv_final:       -1,
};

// step icon per index
const STEP_ICONS = [Building2, Briefcase, User, CheckSquare];

function Stepper({ steps, step }) {
  if (step < 0) return null;
  return (
    <div className="w-full py-4 sm:py-6">
      {/* Mobile */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-sm font-semibold text-text-1">{steps[step]}</span>
          <span className="text-xs text-text-4">{step + 1} / {steps.length}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%`, background: GRAD }} />
        </div>
      </div>
      {/* Desktop */}
      <div className="hidden sm:flex items-start w-full">
        {steps.map((label, i) => {
          const done = i < step, active = i === step;
          const Icon = STEP_ICONS[i] ?? CheckSquare;
          return (
            <Fragment key={i}>
              {i > 0 && (
                <div className="flex-1 h-1 mt-5 mx-2 rounded transition-all"
                  style={done ? { background: GRAD } : { background: '#e5e7eb' }} />
              )}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                  ${!done && !active ? 'bg-gray-200 text-gray-500' : 'text-white'}`}
                  style={done || active ? { background: GRAD } : {}}>
                  {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className="mt-2 text-xs font-medium text-center w-24 leading-tight"
                  style={active ? { color: RED } : { color: done ? '#6b6b6b' : '#9CA3AF' }}>
                  {label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Atoms ─────────────────────────────────────────────────────────────────────
const iCls = 'w-full px-4 py-2.5 text-sm bg-gray-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e0201c] focus:border-transparent transition-all';
const sCls = iCls + ' cursor-pointer';

function Field({ label, required, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-text-1 mb-1.5">
        {label}{required && <span className="text-[#e0201c] ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-text-4 mt-1">{hint}</p>}
    </div>
  );
}

function SectionLabel({ children }) {
  return <h4 className="text-xs font-bold text-text-4 uppercase tracking-wider mb-4">{children}</h4>;
}

function CompanyCard({ company, onConfirm, onReject, confirmLabel = 'Sí, continuar', rejectLabel = 'No, es otro NIF' }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ boxShadow: SHADOW }}>
      {/* Header con degradado de marca */}
      <div className="relative overflow-hidden p-6" style={{ background: GRAD }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-8 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-xl leading-tight truncate">{company.razonSocial}</div>
            <div className="text-white/70 text-sm mt-0.5">{company.nif}</div>
          </div>
          <span className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30">
            {company.estadoKyc ?? 'KYC Vigente'}
          </span>
        </div>
      </div>
      {/* Datos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-border bg-white">
        {[
          ['Forma jurídica',        company.formaJuridica ?? 'S.A.'],
          ['País',                  company.pais          ?? 'Guinea Ecuatorial'],
          ['NIF',                   company.nif],
          ['Correo electrónico',    company.email         ?? 'contacto@empresa.gq'],
          ['Teléfono',              company.telefono      ?? '+240 222 000 000'],
          ['Última actualización',  company.ultimaAct     ?? 'Dic. 2025'],
        ].map(([k, v]) => (
          <div key={k} className="p-4">
            <div className="text-[10px] text-text-4 uppercase tracking-wider mb-1">{k}</div>
            <div className="font-semibold text-text-1 text-sm">{v}</div>
          </div>
        ))}
      </div>
      {(onConfirm || onReject) && (
        <div className="flex gap-3 p-5 border-t border-border bg-gray-50">
          <BtnPrimary onClick={onConfirm}><Check className="w-4 h-4" /> {confirmLabel}</BtnPrimary>
          <BtnSecondary onClick={onReject}>{rejectLabel}</BtnSecondary>
        </div>
      )}
    </div>
  );
}

function NotFoundCard({ message, onBack }) {
  return (
    <div className="rounded-xl border border-yellow-text/30 bg-yellow-bg p-5 flex items-start gap-4">
      <AlertCircle className="w-5 h-5 text-yellow-text shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-semibold text-text-1 mb-1">Empresa no encontrada</div>
        <p className="text-sm text-text-3">{message}</p>
      </div>
      {onBack && <BtnSecondary onClick={onBack}><ChevronLeft className="w-4 h-4" /> Atrás</BtnSecondary>}
    </div>
  );
}

function BtnPrimary({ onClick, children, disabled, className = '' }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`h-11 px-6 flex items-center gap-2 text-white text-sm font-semibold rounded-xl cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${className}`}
      style={{ background: GRAD, boxShadow: '0 4px 14px rgba(224,32,28,0.2)' }}>
      {children}
    </button>
  );
}

function BtnSecondary({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="h-11 px-6 flex items-center gap-2 text-sm font-semibold rounded-xl cursor-pointer transition-all border border-border text-text-2 hover:bg-gray-50 disabled:opacity-40 shrink-0">
      {children}
    </button>
  );
}

function NavRow({ onBack, onNext, nextLabel = 'Continuar', backLabel = 'Atrás', nextDisabled = false, hideNext = false }) {
  return (
    <div className="pt-6 border-t border-border flex items-center justify-between gap-4 mt-10">
      <button onClick={onBack} disabled={!onBack}
        className="h-11 px-6 flex items-center gap-2 text-sm font-semibold rounded-xl cursor-pointer transition-all border border-border text-text-2 hover:bg-gray-50 disabled:opacity-0 disabled:pointer-events-none">
        <ChevronLeft className="w-4 h-4" /> {backLabel}
      </button>
      {!hideNext && (
        <button onClick={onNext} disabled={nextDisabled}
          className="h-11 px-8 flex items-center gap-2 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{ background: GRAD, boxShadow: '0 4px 14px rgba(224,32,28,0.25)' }}>
          {nextLabel} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function ChoiceBtn({ selected, onClick, Icon, title, desc, tags }) {
  return (
    <button onClick={onClick}
      className={`p-6 lg:px-8 rounded-2xl border-2 text-left transition-all cursor-pointer w-full
        ${selected ? 'border-[#e0201c] bg-red-50' : 'border-border hover:border-[#e0201c] hover:bg-red-50/30'}`}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GRAD }}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="font-bold text-text-1 text-base">{title}</div>
      {desc && <div className="text-sm text-text-3 leading-relaxed mt-1.5">{desc}</div>}
      {tags && (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map(t => <span key={t} className="text-xs bg-white border border-border px-2.5 py-0.5 rounded-full text-text-3">{t}</span>)}
        </div>
      )}
    </button>
  );
}

function ChoiceBtnH({ selected, onClick, Icon, title }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer w-full
        ${selected ? 'border-[#e0201c] bg-red-50' : 'border-border hover:border-[#e0201c] hover:bg-red-50/30'}`}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: GRAD }}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className={`font-semibold text-sm ${selected ? 'text-[#e0201c]' : 'text-text-1'}`}>{title}</span>
    </button>
  );
}

// ── Contract upload ───────────────────────────────────────────────────────────
function ContractUpload({ label = 'Subir contrato', hint = 'PDF, DOC · máx 10 MB' }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const handleFile = (f) => { if (f) setFile(f); };
  return (
    <>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
        onChange={e => handleFile(e.target.files[0])} />
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 rounded-[12px] p-5 text-center cursor-pointer transition-all
          ${file
            ? 'border-solid border-green-border bg-green-bg'
            : 'border-dashed border-input-border bg-page-bg hover:border-orange hover:bg-orange-tint'
          }`}
      >
        {file ? (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-text shrink-0" />
            <div className="text-left min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-green-text truncate">{file.name}</div>
              <div className="text-[11px] text-text-4">
                {(file.size / 1024 / 1024).toFixed(2)} MB ·{' '}
                <span className="underline cursor-pointer" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>Cambiar</span>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setFile(null); if (inputRef.current) inputRef.current.value = ''; }}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-text-4 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <FileText className="w-7 h-7 text-text-4 mx-auto mb-2" />
            <div className="text-[13px] font-semibold text-text-1 mb-1">{label}</div>
            <div className="text-[11px] text-text-4">{hint}</div>
          </>
        )}
      </div>
    </>
  );
}

// ── Summary box (reusable) ────────────────────────────────────────────────────
function SummaryBox({ label, value, highlight = false }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-[#e0201c]/20 bg-red-50' : 'border-border bg-gray-50'}`}>
      <div className="text-[10px] text-text-4 uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-semibold text-sm ${highlight ? 'text-[#e0201c]' : 'text-text-1'}`}>{value || '—'}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function SolicitarContrato() {
  const { go } = useApp();

  // ── Navigation state ────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('who_initiates');
  const [actor, setActor] = useState(null);       // 'contratante' | 'pyme'
  const [returnPhase, setReturnPhase] = useState('operation');
  const [showExitModal, setShowExitModal] = useState(false);

  // ── Identification state ────────────────────────────────────────────────────
  const [isClient, setIsClient] = useState(null);
  const [nif, setNif] = useState('');
  const [foundCompany, setFoundCompany] = useState(null);
  const [nifSearched, setNifSearched] = useState(false);
  const [contactData, setContactData] = useState({ nombre: '', cargo: '', email: '', telefono: '' });
  const [regData, setRegData] = useState({
    razonSocial: '', nombreComercial: '', nif: '', fechaConst: '', formaJuridica: '', numEmpleados: '',
    email: '', telefono: '', web: '',
    pais: 'Guinea Ecuatorial', provincia: '', municipio: '', barrio: '', direccion: '', cp: 'GQ-240',
  });

  // ── Operation state ─────────────────────────────────────────────────────────
  const [operation, setOperation] = useState({ tipo: 'factoring', monto: '', plazo: '30', observaciones: '' });

  // ── Party selection state ───────────────────────────────────────────────────
  const [pymeData, setPymeData] = useState({ razonSocial: '', nombreComercial: '', nif: '', email: '', tel: '', contrato: '' });
  const [pymeSearched, setPymeSearched] = useState(false);
  const [pymeFound, setPymeFound] = useState(null);   // null | 'found' | 'not_found'

  const [pymesInverso, setPymesInverso] = useState([{ razonSocial: '', nombreComercial: '', nif: '', email: '', tel: '', monto: '' }]);

  const [contData, setContData] = useState({ razonSocial: '', nombreComercial: '', nif: '', email: '', tel: '' });
  const [contSearched, setContSearched] = useState(false);
  const [contFound, setContFound] = useState(null);

  const [refNumber] = useState(() => Math.floor(10000 + Math.random() * 90000));

  // ── Invitation flow state ─────────────────────────────────────────────────────
  const [inviterCompany, setInviterCompany]   = useState(null);
  const [invLandingPhase, setInvLandingPhase] = useState(null);
  const [invConfirmOpen, setInvConfirmOpen]   = useState(['empresa', 'operacion', 'contraparte']);
  const [sentFromInv, setSentFromInv]         = useState(false);
  const toggleInvConfirm = (id) => setInvConfirmOpen(prev =>
    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
  );

  // ── Confirmation accordion state ─────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(['empresa', 'operacion', 'contraparte']);
  const toggleConfirm = (id) => setConfirmOpen(prev =>
    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
  );

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isCont = actor === 'contratante';
  const steps  = isCont ? STEPS_CONT : STEPS_PYME;
  const step   = PHASE_STEP[phase] ?? 0;

  // ── Identification helpers ──────────────────────────────────────────────────
  const startFlow = (chosenActor) => {
    setActor(chosenActor);
    setReturnPhase('operation');
    setIsClient(null);
    setNif(''); setFoundCompany(null); setNifSearched(false);
    setPhase('is_client');
  };

  const startInvFlow = (chosenActor, landingPhase) => {
    setInviterCompany(foundCompany);
    setInvLandingPhase(landingPhase);
    setActor(chosenActor);
    setReturnPhase('inv_final');
    setIsClient(null);
    setNif(''); setFoundCompany(null); setNifSearched(false);
    setPhase('is_client');
  };

  const mockNifSearch = (v) => {
    setFoundCompany({
      razonSocial:   'TotalEnerGE S.A.',
      nif:           v,
      estadoKyc:     'KYC Vigente',
      formaJuridica: 'Sociedad Anónima (S.A.)',
      ultimaAct:     'Dic. 2025',
      pais:          'Guinea Ecuatorial',
      email:         'contacto@totalenerge.gq',
      telefono:      '+240 222 100 200',
    });
    setNifSearched(true);
  };

  const mockPymeVerify = () => {
    setPymeSearched(true);
    // 70% chance found for demo
    setPymeFound(pymeData.nif ? 'found' : 'not_found');
  };

  const mockContVerify = () => {
    setContSearched(true);
    setContFound(contData.nif ? 'found' : 'not_found');
  };

  // ── Step header meta ────────────────────────────────────────────────────────
  const HEADER = {
    who_initiates:   { Icon: FileText,    title: 'Nueva Solicitud de Contrato',         sub: 'Seleccione quién inicia el proceso' },
    is_client:       { Icon: Building2,   title: 'Identificación',                      sub: `¿${isCont ? 'Tu empresa' : 'Tu empresa'} ya tiene relación comercial con Bonafide?` },
    nif_search:      { Icon: Search,      title: 'Identificación',                      sub: 'Localiza tu empresa en nuestra base de datos' },
    confirm_company: { Icon: Building2,   title: 'Confirmar empresa',                   sub: 'Verifica que los datos corresponden a tu empresa' },
    authorize:       { Icon: CheckSquare, title: 'Autorización de datos',               sub: '¿Autorizas a Bonafide a usar la información registrada?' },
    register:        { Icon: Building2,   title: 'Registro de empresa',                 sub: 'Completa los datos de tu empresa' },
    contact:         { Icon: User,        title: 'Contacto responsable',                sub: '¿Quién gestiona esta solicitud?' },
    operation:       { Icon: Briefcase,   title: 'Información de la operación',         sub: 'Monto y plazo son una propuesta — las condiciones definitivas las establece Bonafide' },
    select_parties:  { Icon: User,        title: isCont ? (operation.tipo === 'factoring_inverso' ? 'PYMEs beneficiarias' : 'Empresa PYME') : 'Empresa Contratante', sub: isCont ? 'Datos de la PYME con la que deseas operar' : 'Identifica la empresa contratante' },
    confirmation:    { Icon: CheckSquare, title: 'Confirmación de solicitud',           sub: 'Revisa el resumen antes de enviar' },
    sent:            { Icon: Send,        title: 'Solicitud enviada',                   sub: 'En espera de respuesta de la otra parte' },
    inv_p_landing:   { Icon: Bell,        title: 'Solicitud recibida',                  sub: 'Una empresa contratante desea realizar una operación contigo' },
    inv_c_landing:   { Icon: Bell,        title: 'Solicitud recibida',                  sub: 'Una PYME desea realizar una operación con tu empresa' },
    inv_final:       { Icon: CheckSquare, title: 'Confirmación de participación',       sub: 'Revisa la operación y decide si deseas participar' },
  };
  const hdr = HEADER[phase] ?? HEADER.is_client;

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE CONTENT
  // ══════════════════════════════════════════════════════════════════════════
  const content = {

    /* ── WHO INITIATES + IS CLIENT (unified) ──────────────────────────────── */
    who_initiates: (
      <>
        <div className="space-y-8 mb-10">
          <div>
            <SectionLabel>¿Quién solicita el contrato?</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ChoiceBtnH selected={actor === 'contratante'} onClick={() => setActor('contratante')} Icon={Building2} title="Empresa Contratante" />
              <ChoiceBtnH selected={actor === 'pyme'}        onClick={() => setActor('pyme')}        Icon={User}      title="Empresa PYME" />
            </div>
          </div>
          <div>
            <SectionLabel>¿Ya tiene relación con Bonafide?</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ChoiceBtnH selected={isClient === true}  onClick={() => setIsClient(true)}  Icon={Check}     title="Sí, somos clientes de Bonafide" />
              <ChoiceBtnH selected={isClient === false} onClick={() => setIsClient(false)} Icon={Building2} title="No, es nuestra primera vez" />
            </div>
          </div>
        </div>
        <NavRow
          onBack={null}
          onNext={() => {
            setActor(actor);
            setReturnPhase('operation');
            setNif(''); setFoundCompany(null); setNifSearched(false);
            setPhase(isClient ? 'nif_search' : 'register');
          }}
          nextLabel="Iniciar solicitud"
          nextDisabled={!actor || isClient === null}
        />
      </>
    ),

    /* ── IS CLIENT (usado por flujo de invitación) ─────────────────────────── */
    is_client: (
      <>
        <div className="space-y-4 mb-10">
          <SectionLabel>¿Ya tiene relación con Bonafide?</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ChoiceBtnH selected={isClient === true}  onClick={() => setIsClient(true)}  Icon={Check}     title="Sí, somos clientes de Bonafide" />
            <ChoiceBtnH selected={isClient === false} onClick={() => setIsClient(false)} Icon={Building2} title="No, es nuestra primera vez" />
          </div>
        </div>
        <NavRow
          onBack={() => setPhase(invLandingPhase || 'who_initiates')}
          onNext={() => { setNif(''); setFoundCompany(null); setNifSearched(false); setPhase(isClient ? 'nif_search' : 'register'); }}
          nextDisabled={isClient === null}
        />
      </>
    ),

    /* ── NIF SEARCH ────────────────────────────────────────────────────────── */
    nif_search: (
      <>
        <div className="space-y-6 mb-10">
          <Field label="Número de Identificación Fiscal (NIF)" required hint="Ej: GQ-2024-00234">
            <div className="flex gap-3 max-w-sm">
              <input className={iCls + ' flex-1'} value={nif}
                onChange={e => { setNif(e.target.value); setNifSearched(false); setFoundCompany(null); }}
                placeholder="GQ-2024-00234"
                onKeyDown={e => e.key === 'Enter' && nif.trim() && mockNifSearch(nif)} />
              <button onClick={() => mockNifSearch(nif)} disabled={!nif.trim()}
                className="h-[42px] px-5 rounded-lg text-white flex items-center gap-2 text-sm font-semibold disabled:opacity-40 cursor-pointer shrink-0"
                style={{ background: GRAD }}>
                <Search className="w-4 h-4" /> Buscar
              </button>
            </div>
          </Field>

          {foundCompany && <CompanyCard company={foundCompany} />}

          {nifSearched && !foundCompany && (
            <NotFoundCard message="No encontramos ninguna empresa con ese NIF en Bonafide. Prueba con otro identificador." />
          )}
        </div>
        {foundCompany ? (
          <div className="pt-6 border-t border-border flex items-center justify-between gap-4 mt-10">
            <button onClick={() => setPhase(returnPhase === 'inv_final' ? 'is_client' : 'who_initiates')}
              className="h-11 px-6 flex items-center gap-2 text-sm font-semibold rounded-xl cursor-pointer border border-border text-text-2 hover:bg-gray-50 transition-all shrink-0">
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <div className="flex gap-3">
              <BtnSecondary onClick={() => { setNif(''); setFoundCompany(null); setNifSearched(false); }}>
                No, intentar otro NIF
              </BtnSecondary>
              <BtnPrimary onClick={() => setPhase(returnPhase || 'operation')}>
                <Check className="w-4 h-4" /> Sí, usar estos datos
              </BtnPrimary>
            </div>
          </div>
        ) : (
          <NavRow onBack={() => setPhase(returnPhase === 'inv_final' ? 'is_client' : 'who_initiates')} onNext={() => {}} nextDisabled />
        )}
      </>
    ),

    /* ── REGISTER ──────────────────────────────────────────────────────────── */
    register: (
      <>
        <div className="space-y-8 mb-10">
          <div>
            <SectionLabel>Datos de la empresa</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Razón social" required>
                <input className={iCls} value={regData.razonSocial} onChange={e => setRegData(p => ({ ...p, razonSocial: e.target.value }))} placeholder="Nombre legal de la empresa" />
              </Field>
              <Field label="Nombre comercial">
                <input className={iCls} value={regData.nombreComercial} onChange={e => setRegData(p => ({ ...p, nombreComercial: e.target.value }))} placeholder="Nombre con el que opera" />
              </Field>
              <Field label="NIF / RUC" required>
                <input className={iCls + ' uppercase'} value={regData.nif} onChange={e => setRegData(p => ({ ...p, nif: e.target.value }))} placeholder="GQ-2024-00234" />
              </Field>
              <Field label="Fecha de constitución" required>
                <input className={iCls} type="date" value={regData.fechaConst} onChange={e => setRegData(p => ({ ...p, fechaConst: e.target.value }))} />
              </Field>
              <Field label="Forma jurídica" required>
                <select className={sCls} value={regData.formaJuridica} onChange={e => setRegData(p => ({ ...p, formaJuridica: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  <option>Sociedad Anónima (S.A.)</option>
                  <option>Sociedad de Responsabilidad Limitada (S.R.L.)</option>
                  <option>Empresa Individual</option>
                  <option>Cooperativa</option>
                  <option>Fundación</option>
                  <option>ONG</option>
                </select>
              </Field>
              <Field label="Número de empleados">
                <input className={iCls} type="number" min="1" value={regData.numEmpleados} onChange={e => setRegData(p => ({ ...p, numEmpleados: e.target.value }))} placeholder="Ej. 25" />
              </Field>
            </div>
          </div>

          <div>
            <SectionLabel>Datos de contacto</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Correo electrónico corporativo" required>
                <input className={iCls} type="email" value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} placeholder="contacto@empresa.gq" />
              </Field>
              <Field label="Teléfono corporativo" required>
                <input className={iCls} type="tel" value={regData.telefono} onChange={e => setRegData(p => ({ ...p, telefono: e.target.value }))} placeholder="+240 222 000 000" />
              </Field>
              <Field label="Página web">
                <input className={iCls} type="url" value={regData.web} onChange={e => setRegData(p => ({ ...p, web: e.target.value }))} placeholder="www.empresa.gq" />
              </Field>
            </div>
          </div>

          <div>
            <SectionLabel>Dirección fiscal</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="País" required>
                <input className={iCls} value={regData.pais} onChange={e => setRegData(p => ({ ...p, pais: e.target.value }))} />
              </Field>
              <Field label="Provincia" required>
                <select className={sCls} value={regData.provincia} onChange={e => setRegData(p => ({ ...p, provincia: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  <option>Bioko Norte</option><option>Bioko Sur</option>
                  <option>Centro Sur</option><option>Djibloho</option>
                  <option>Kié-Ntem</option><option>Litoral</option><option>Wele-Nzas</option>
                </select>
              </Field>
              <Field label="Municipio" required>
                <input className={iCls} value={regData.municipio} onChange={e => setRegData(p => ({ ...p, municipio: e.target.value }))} placeholder="Ej. Malabo" />
              </Field>
              <Field label="Barrio">
                <input className={iCls} value={regData.barrio} onChange={e => setRegData(p => ({ ...p, barrio: e.target.value }))} placeholder="Ej. Santa Isabel" />
              </Field>
              <Field label="Dirección fiscal" required>
                <input className={iCls} value={regData.direccion} onChange={e => setRegData(p => ({ ...p, direccion: e.target.value }))} placeholder="Calle, número, edificio..." />
              </Field>
              <Field label="Código postal">
                <input className={iCls} value={regData.cp} onChange={e => setRegData(p => ({ ...p, cp: e.target.value }))} placeholder="Ej. GQ-240" />
              </Field>
            </div>
          </div>
        </div>
        <NavRow
          onBack={() => setPhase(returnPhase === 'inv_final' ? 'is_client' : isClient ? 'nif_search' : 'who_initiates')}
          onNext={() => setPhase(returnPhase || 'operation')}
          nextDisabled={false}
        />
      </>
    ),

    /* ── OPERATION ─────────────────────────────────────────────────────────── */
    operation: (
      <>
        <div className="space-y-8 mb-10">
          <div>
            <SectionLabel>Tipo de operación</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ChoiceBtnH selected={operation.tipo === 'factoring'} onClick={() => setOperation(p => ({ ...p, tipo: 'factoring' }))}
                Icon={FileText} title="Factoring"
              />
              {isCont && (
                <ChoiceBtnH selected={operation.tipo === 'factoring_inverso'} onClick={() => setOperation(p => ({ ...p, tipo: 'factoring_inverso' }))}
                  Icon={DollarSign} title="Factoring Inverso"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Monto solicitado" required>
              <div className="relative">
                <input
                  className={iCls + ' pr-14'}
                  inputMode="numeric"
                  value={operation.monto ? operation.monto.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setOperation(p => ({ ...p, monto: digits }));
                  }}
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-4">XAF</span>
              </div>
            </Field>
            {operation.tipo !== 'factoring_inverso' && (
              <Field label="Plazo solicitado" required>
                <select className={sCls} value={operation.plazo} onChange={e => setOperation(p => ({ ...p, plazo: e.target.value }))}>
                  <option value="30">30 días</option>
                  <option value="60">60 días</option>
                  <option value="90">90 días</option>
                  <option value="120">120 días</option>
                </select>
              </Field>
            )}
          </div>

          <Field label="Observaciones">
            <textarea className={iCls + ' resize-none'} rows={3} value={operation.observaciones}
              onChange={e => setOperation(p => ({ ...p, observaciones: e.target.value }))}
              placeholder="Información adicional relevante para la solicitud..." />
          </Field>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-text/30 bg-yellow-bg">
            <AlertCircle className="w-4 h-4 text-yellow-text shrink-0 mt-0.5" />
            <p className="text-sm text-text-3">
              <strong className="text-text-1">Nota importante:</strong> El monto indicado es únicamente una <strong>propuesta del solicitante</strong>. Las <strong>condiciones definitivas</strong> (monto aprobado{operation.tipo !== 'factoring_inverso' ? ', plazo' : ''}, tasa de interés y comisiones) las establece Bonafide tras el análisis de riesgo.
            </p>
          </div>
        </div>
        <NavRow
          onBack={() => setPhase(isClient ? 'nif_search' : 'register')}
          onNext={() => setPhase('select_parties')}
          nextDisabled={false}
        />
      </>
    ),

    /* ── SELECT PARTIES ────────────────────────────────────────────────────── */
    select_parties: (
      <>
        {/* ── CONTRATANTE: Factoring – single PYME ─── */}
        {isCont && operation.tipo === 'factoring' && (
          <>
            <div className="space-y-6 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="Razón social" className="md:col-span-2">
                  <input className={iCls} value={pymeData.razonSocial} onChange={e => setPymeData(p => ({ ...p, razonSocial: e.target.value }))} placeholder="Nombre legal de la PYME" />
                </Field>
                <Field label="NIF / RUC" required>
                  <input className={iCls + ' uppercase'} value={pymeData.nif} onChange={e => { setPymeData(p => ({ ...p, nif: e.target.value })); setPymeSearched(false); setPymeFound(null); }} placeholder="GQ-2024-00XXX" />
                </Field>
                <Field label="Nombre comercial">
                  <input className={iCls} value={pymeData.nombreComercial} onChange={e => setPymeData(p => ({ ...p, nombreComercial: e.target.value }))} placeholder="Nombre comercial" />
                </Field>
                <Field label="Correo electrónico" required>
                  <input className={iCls} type="email" value={pymeData.email} onChange={e => setPymeData(p => ({ ...p, email: e.target.value }))} placeholder="pyme@empresa.com" />
                </Field>
                <Field label="Teléfono" required>
                  <input className={iCls} type="tel" value={pymeData.tel} onChange={e => setPymeData(p => ({ ...p, tel: e.target.value }))} placeholder="+240 222 000 000" />
                </Field>
                <Field label="Contrato con esta PYME" required className="md:col-span-3">
                  <ContractUpload />
                </Field>
              </div>

            </div>
            <NavRow
              onBack={() => setPhase('operation')}
              onNext={() => setPhase('confirmation')}
              nextDisabled={false}
            />
          </>
        )}

        {/* ── CONTRATANTE: Factoring Inverso – multiple PYMEs ─── */}
        {isCont && operation.tipo === 'factoring_inverso' && (
          <>
            <div className="space-y-4 mb-10">
              {pymesInverso.map((p, i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-border">
                    <span className="text-sm font-semibold text-text-1">PYME {i + 1}</span>
                    {pymesInverso.length > 1 && (
                      <button onClick={() => setPymesInverso(ps => ps.filter((_, j) => j !== i))}
                        className="text-text-4 hover:text-red-500 cursor-pointer p-1">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Razón social">
                      <input className={iCls} value={p.razonSocial}
                        onChange={e => setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, razonSocial: e.target.value } : x))}
                        placeholder="Nombre legal de la PYME" />
                    </Field>
                    <Field label="Nombre comercial">
                      <input className={iCls} value={p.nombreComercial}
                        onChange={e => setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, nombreComercial: e.target.value } : x))}
                        placeholder="Nombre comercial" />
                    </Field>
                    <Field label="NIF / RUC" required>
                      <input className={iCls + ' uppercase'} value={p.nif}
                        onChange={e => setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, nif: e.target.value } : x))}
                        placeholder="GQ-2024-00XXX" />
                    </Field>
                    <Field label="Monto a asignar" required>
                      <div className="relative">
                        <input className={iCls + ' pr-14'} inputMode="numeric"
                          value={p.monto ? p.monto.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''}
                          onChange={e => {
                            const digits = e.target.value.replace(/\D/g, '');
                            setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, monto: digits } : x));
                          }}
                          placeholder="0" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-4">XAF</span>
                      </div>
                    </Field>
                    <Field label="Correo electrónico" required>
                      <input className={iCls} type="email" value={p.email}
                        onChange={e => setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, email: e.target.value } : x))}
                        placeholder="pyme@empresa.com" />
                    </Field>
                    <Field label="Teléfono">
                      <input className={iCls} type="tel" value={p.tel}
                        onChange={e => setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, tel: e.target.value } : x))}
                        placeholder="+240 222 000 000" />
                    </Field>
                    <Field label="Contrato con esta PYME" required className="md:col-span-3">
                      <ContractUpload />
                    </Field>
                  </div>
                </div>
              ))}
              <button onClick={() => setPymesInverso(p => [...p, { razonSocial: '', nombreComercial: '', nif: '', email: '', tel: '', monto: '' }])}
                className="flex items-center gap-2 text-sm font-semibold cursor-pointer transition-colors hover:opacity-75"
                style={{ color: RED }}>
                <Plus className="w-4 h-4" /> Agregar otra PYME
              </button>
            </div>
            <NavRow onBack={() => setPhase('operation')} onNext={() => setPhase('confirmation')} />
          </>
        )}

        {/* ── PYME: Identificar Empresa Contratante ─── */}
        {!isCont && (
          <>
            <div className="space-y-6 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="Razón social" className="md:col-span-2">
                  <input className={iCls} value={contData.razonSocial}
                    onChange={e => setContData(p => ({ ...p, razonSocial: e.target.value }))}
                    placeholder="Nombre legal de la empresa" />
                </Field>
                <Field label="NIF / RUC" required>
                  <input className={iCls + ' uppercase'} value={contData.nif}
                    onChange={e => setContData(p => ({ ...p, nif: e.target.value }))}
                    placeholder="GQ-2024-00XXX" />
                </Field>
                <Field label="Nombre comercial">
                  <input className={iCls} value={contData.nombreComercial}
                    onChange={e => setContData(p => ({ ...p, nombreComercial: e.target.value }))}
                    placeholder="Nombre comercial" />
                </Field>
                <Field label="Correo electrónico" required>
                  <input className={iCls} type="email" value={contData.email}
                    onChange={e => setContData(p => ({ ...p, email: e.target.value }))}
                    placeholder="contacto@empresa.gq" />
                </Field>
                <Field label="Teléfono" required>
                  <input className={iCls} type="tel" value={contData.tel}
                    onChange={e => setContData(p => ({ ...p, tel: e.target.value }))}
                    placeholder="+240 222 000 000" />
                </Field>
                <Field label="Contrato con la Empresa Contratante" required className="md:col-span-3">
                  <ContractUpload />
                </Field>
              </div>
            </div>
            <NavRow
              onBack={() => setPhase('operation')}
              onNext={() => setPhase('confirmation')}
              nextDisabled={false}
            />
          </>
        )}
      </>
    ),

    /* ── CONFIRMATION ──────────────────────────────────────────────────────── */
    confirmation: (() => {
      const solicitante = foundCompany?.razonSocial || regData.razonSocial || '—';
      const montoFmt = operation.monto
        ? `${operation.monto.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} XAF`
        : '—';

      const contraparteTitle = isCont && operation.tipo === 'factoring_inverso'
        ? `${pymesInverso.length} PYME${pymesInverso.length > 1 ? 's' : ''} beneficiaria${pymesInverso.length > 1 ? 's' : ''}`
        : isCont ? 'PYME beneficiaria' : 'Empresa Contratante';

      const empresaItems = foundCompany ? [
        { label: 'Razón social',          value: foundCompany.razonSocial },
        { label: 'NIF',                   value: foundCompany.nif },
        { label: 'Forma jurídica',        value: foundCompany.formaJuridica },
        { label: 'País',                  value: foundCompany.pais },
        { label: 'Correo electrónico',    value: foundCompany.email },
        { label: 'Teléfono',              value: foundCompany.telefono },
        { label: 'Última actualización',  value: foundCompany.ultimaAct },
      ] : [
        { label: 'Razón social',          value: regData.razonSocial },
        { label: 'Nombre comercial',      value: regData.nombreComercial },
        { label: 'NIF',                   value: regData.nif },
        { label: 'Fecha de constitución', value: regData.fechaConst },
        { label: 'Forma jurídica',        value: regData.formaJuridica },
        { label: 'Número de empleados',   value: regData.numEmpleados },
        { label: 'Correo electrónico',    value: regData.email },
        { label: 'Teléfono',              value: regData.telefono },
        { label: 'Página web',            value: regData.web },
        { label: 'País',                  value: regData.pais },
        { label: 'Provincia',             value: regData.provincia },
        { label: 'Municipio',             value: regData.municipio },
        { label: 'Barrio',                value: regData.barrio },
        { label: 'Dirección fiscal',      value: regData.direccion },
        { label: 'Código postal',         value: regData.cp },
      ];

      const sections = [
        {
          id: 'empresa',
          title: isCont ? 'Empresa Contratante' : 'PYME',
          items: empresaItems,
        },
        {
          id: 'operacion',
          title: 'Operación',
          items: [
            { label: 'Tipo de operación', value: operation.tipo === 'factoring' ? 'Factoring' : 'Factoring Inverso' },
            { label: 'Monto propuesto',   value: montoFmt },
            ...(operation.tipo === 'factoring' ? [{ label: 'Plazo propuesto', value: operation.plazo ? `${operation.plazo} días` : '—' }] : []),
            ...(operation.observaciones ? [{ label: 'Observaciones', value: operation.observaciones }] : []),
          ],
        },
      ];

      return (
        <>
          <div className="space-y-3 mb-10">

            {/* Secciones accordion */}
            {sections.map((section) => {
              const isExp = confirmOpen.includes(section.id);
              return (
                <div key={section.id} className="border border-border rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => toggleConfirm(section.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" style={{ color: RED }} />
                      <span className="font-semibold text-text-1 text-sm">{section.title}</span>
                    </div>
                    {isExp
                      ? <ChevronUp className="w-5 h-5 text-text-4" />
                      : <ChevronDown className="w-5 h-5 text-text-4" />
                    }
                  </button>
                  {isExp && (
                    <div className="border-t border-border p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.items.map((item, i) => (
                          <div key={i}>
                            <p className="text-xs text-text-4 mb-1">{item.label}</p>
                            <p className="text-sm font-medium text-text-1">{item.value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Sección contraparte */}
            <div className="border border-border rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => toggleConfirm('contraparte')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" style={{ color: RED }} />
                  <span className="font-semibold text-text-1 text-sm">{contraparteTitle}</span>
                </div>
                {confirmOpen.includes('contraparte')
                  ? <ChevronUp className="w-5 h-5 text-text-4" />
                  : <ChevronDown className="w-5 h-5 text-text-4" />
                }
              </button>
              {confirmOpen.includes('contraparte') && (
                <div className="border-t border-border p-4 bg-gray-50">
                  {/* Factoring simple — una PYME */}
                  {isCont && operation.tipo === 'factoring' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Razón social',       value: pymeData.razonSocial || '—' },
                        { label: 'Nombre comercial',   value: pymeData.nombreComercial || '—' },
                        { label: 'NIF',                value: pymeData.nif || '—' },
                        { label: 'Correo electrónico', value: pymeData.email || '—' },
                        { label: 'Teléfono',           value: pymeData.tel || '—' },
                        { label: 'Estado en Bonafide', value: pymeFound === 'found' ? 'Cliente Bonafide' : 'Pendiente vinculación' },
                      ].map((it, i) => (
                        <div key={i}>
                          <p className="text-xs text-text-4 mb-1">{it.label}</p>
                          <p className="text-sm font-medium text-text-1">{it.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Factoring inverso — múltiples PYMEs */}
                  {isCont && operation.tipo === 'factoring_inverso' && (
                    <div className="space-y-4">
                      {pymesInverso.map((p, i) => (
                        <div key={i} className={i > 0 ? 'pt-4 border-t border-border' : ''}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: GRAD }}>{i + 1}</span>
                            <span className="text-[12px] font-semibold text-text-2">{p.razonSocial || p.nombreComercial || `PYME ${i + 1}`}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { label: 'Razón social',     value: p.razonSocial || '—' },
                              { label: 'Nombre comercial', value: p.nombreComercial || '—' },
                              { label: 'NIF',              value: p.nif || '—' },
                              { label: 'Correo electrónico', value: p.email || '—' },
                              { label: 'Teléfono',         value: p.tel || '—' },
                              { label: 'Monto asignado',   value: p.monto ? `${p.monto.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} XAF` : '—' },
                            ].map((it, j) => (
                              <div key={j}>
                                <p className="text-xs text-text-4 mb-1">{it.label}</p>
                                <p className="text-sm font-medium text-text-1">{it.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* PYME ve la Empresa Contratante */}
                  {!isCont && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Razón social',       value: contData.razonSocial },
                        { label: 'Nombre comercial',   value: contData.nombreComercial },
                        { label: 'NIF',                value: contData.nif },
                        { label: 'Correo electrónico', value: contData.email },
                        { label: 'Teléfono',           value: contData.tel },
                      ].map((it, i) => (
                        <div key={i}>
                          <p className="text-xs text-text-4 mb-1">{it.label}</p>
                          <p className="text-sm font-medium text-text-1">{it.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-text/30 bg-yellow-bg">
              <AlertCircle className="w-4 h-4 text-yellow-text mt-0.5 shrink-0" />
              <p className="text-[13px] text-text-3 leading-relaxed">
                El monto y plazo indicados son una <strong>propuesta del solicitante</strong>. Tras el análisis de riesgo, Bonafide comunicará las <strong>condiciones definitivas</strong> a ambas partes para su aceptación.
              </p>
            </div>
          </div>
          <NavRow onBack={() => setPhase('select_parties')} onNext={() => setPhase('sent')} nextLabel="Enviar solicitud" />
        </>
      );
    })(),

    /* ── SENT ──────────────────────────────────────────────────────────────── */
    sent: (
      <div className="space-y-8">
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: GRAD }}>
            <Send className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-1 mb-2">
            {sentFromInv ? 'Confirmación enviada a Bonafide' : 'Solicitud enviada con éxito'}
          </h2>
          <p className="text-text-3 max-w-md mx-auto">
            {sentFromInv
              ? 'Tu confirmación de participación ha sido enviada a Bonafide. No es necesario realizar ninguna acción adicional hasta recibir respuesta.'
              : isCont
                ? 'Hemos enviado una invitación a la PYME para que confirme su participación en la operación.'
                : 'Hemos enviado una invitación a la Empresa Contratante para que confirme la operación.'}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-100 rounded-full">
            <span className="text-xs text-text-4">Referencia</span>
            <span className="font-mono font-bold text-text-1">SOL-2026-{refNumber}</span>
          </div>
        </div>

        <div className="flex gap-4 p-4 rounded-xl border bg-yellow-bg border-yellow-text/30">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GRAD }}>
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-semibold text-text-1 text-sm">
                {sentFromInv ? 'Pendiente de respuesta de Bonafide' : 'Pendiente de respuesta'}
              </span>
              <span className="text-xs bg-orange-tint text-orange px-2 py-0.5 rounded-full font-semibold">Estado actual</span>
            </div>
            <p className="text-sm text-text-3 leading-relaxed">
              {sentFromInv
                ? 'Bonafide revisará tu confirmación y te notificará cuando haya novedades sobre la operación.'
                : `En espera de que la ${isCont ? 'PYME' : 'Empresa Contratante'} confirme su participación.`}
            </p>
          </div>
        </div>

        {/* Demo: show invitation screens */}
        <div className="rounded-xl border border-blue-text/20 bg-blue-bg p-5">
          <div className="font-semibold text-blue-text mb-2 text-sm">Vista previa de pantallas (demo)</div>
          <p className="text-xs text-text-3 mb-3">Así verá la otra parte la invitación recibida por email:</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setPhase(isCont ? 'inv_p_landing' : 'inv_c_landing')}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-white border border-blue-text/20 rounded-lg cursor-pointer hover:border-blue-text transition-colors"
              style={{ color: '#3B82F6' }}>
              <Bell className="w-4 h-4" />
              Ver pantalla de invitación {isCont ? 'PYME' : 'Empresa Contratante'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={() => go('login')}
            className="h-11 px-8 flex items-center gap-2 text-white text-sm font-semibold rounded-xl cursor-pointer"
            style={{ background: GRAD, boxShadow: '0 4px 14px rgba(224,32,28,0.25)' }}>
            Volver al inicio
          </button>
        </div>
      </div>
    ),

    /* ── INVITATION LANDING (PYME receives from Contratante) ───────────────── */
    inv_p_landing: (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="p-6 lg:p-8 bg-gray-50 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GRAD }}>
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-text-4">Solicitud de</p>
                <p className="font-bold text-text-1">{foundCompany?.razonSocial || 'TotalEnerGE S.A.'}</p>
              </div>
            </div>
            <p className="text-sm text-text-3 mt-2">
              La empresa contratante <strong className="text-text-1">{foundCompany?.razonSocial || 'TotalEnerGE S.A.'}</strong> desea realizar una operación de financiación con tu empresa a través de Bonafide.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-border">
            {[
              ['Empresa Contratante', foundCompany?.razonSocial || 'TotalEnerGE S.A.'],
              ['Tipo de operación',   operation.tipo === 'factoring_inverso' ? 'Factoring Inverso' : 'Factoring'],
              ['Monto propuesto',     operation.monto ? `${operation.monto.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} XAF` : '25 000 000 XAF'],
              ['Plazo propuesto',     `${operation.plazo || 60} días`],
              ['Contrato asociado',   pymeData.contrato || 'CTR-2026-001'],
              ['Fecha de solicitud',  new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })],
            ].map(([k, v]) => (
              <div key={k} className="p-4">
                <div className="text-[10px] text-text-4 uppercase tracking-wider mb-1">{k}</div>
                <div className="font-semibold text-text-1 text-sm">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-text/30 bg-yellow-bg">
          <AlertCircle className="w-4 h-4 text-yellow-text mt-0.5 shrink-0" />
          <p className="text-sm text-text-3">El monto y plazo son una propuesta. Las <strong>condiciones definitivas</strong> las establecerá Bonafide tras el análisis de riesgo.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <BtnPrimary onClick={() => startInvFlow('pyme', 'inv_p_landing')}>Aceptar invitación <ChevronRight className="w-4 h-4" /></BtnPrimary>
          <BtnSecondary onClick={() => setPhase('sent')}><X className="w-4 h-4" /> Rechazar</BtnSecondary>
        </div>
      </div>
    ),

    /* ── INVITATION LANDING (Contratante receives from PYME) ───────────────── */
    inv_c_landing: (() => {
      const pyme       = foundCompany?.razonSocial || regData.razonSocial || 'Construcciones Silva S.R.L.';
      const pymeNif    = foundCompany?.nif || regData.nif || 'GQ-2021-00234';
      const initials   = pyme.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
      const montoFmt   = operation.monto
        ? `${operation.monto.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} XAF`
        : '8 500 000 XAF';
      const fechaHoy   = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

      return (
        <div className="space-y-4">

          {/* Tarjeta principal */}
          <div className="rounded-2xl border border-border bg-white overflow-hidden" style={{ boxShadow: SHADOW }}>

            {/* Franja de marca */}
            <div className="h-1.5" style={{ background: GRAD }} />

            {/* Cabecera: tipo de solicitud + referencia */}
            <div className="px-6 pt-5 pb-4 border-b border-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold text-text-4 uppercase tracking-wider mb-1">Solicitud de operación financiera</p>
                <h2 className="text-[20px] font-bold text-text-1">Factoring</h2>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-[12px] font-bold text-text-1">SOL-2026-{refNumber}</div>
                <div className="text-[11px] text-text-4 mt-0.5">{fechaHoy}</div>
              </div>
            </div>

            {/* Empresa solicitante */}
            <div className="px-6 py-4 border-b border-border">
              <p className="text-[11px] text-text-4 uppercase tracking-wider mb-3">Solicitante</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: GRAD }}>
                  {initials}
                </div>
                <p className="font-bold text-text-1 text-[15px]">{pyme}</p>
              </div>
            </div>

            {/* Detalles de la operación */}
            <div className="px-6 py-4 border-b border-border">
              <p className="text-[11px] text-text-4 uppercase tracking-wider mb-3">Detalles de la operación</p>
              {[
                { label: 'Monto propuesto',    value: montoFmt },
                { label: 'Plazo propuesto',    value: `${operation.plazo || 30} días` },
                { label: 'Fecha de solicitud', value: fechaHoy },
              ].map(({ label, value }, i, arr) => (
                <div key={label} className={`flex items-center justify-between py-2.5 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                  <span className="text-[13px] text-text-4">{label}</span>
                  <span className="text-[13px] font-semibold text-text-1">{value}</span>
                </div>
              ))}
            </div>

            {/* Contrato adjunto */}
            <div className="px-6 py-4">
              <p className="text-[11px] text-text-4 uppercase tracking-wider mb-3">Documentación adjunta</p>
              <div className="flex items-center gap-3 p-3 rounded-[10px] border border-green-border bg-green-bg">
                <CheckCircle2 className="w-5 h-5 text-green-text shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-green-text truncate">
                    {contData.razonSocial ? `Contrato_${contData.razonSocial.replace(/\s+/g, '_')}.pdf` : 'Contrato_adjunto.pdf'}
                  </p>
                  <p className="text-[11px] text-text-4">Contrato con la Empresa Contratante</p>
                </div>
                <Download className="w-4 h-4 text-text-4 shrink-0 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-text/30 bg-yellow-bg">
            <AlertCircle className="w-4 h-4 text-yellow-text mt-0.5 shrink-0" />
            <p className="text-[13px] text-text-3">
              El monto y plazo son una propuesta. Las <strong>condiciones definitivas</strong> las establecerá Bonafide tras el análisis de riesgo.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-between pt-1">
            <BtnSecondary onClick={() => setPhase('sent')}><X className="w-4 h-4" /> Rechazar</BtnSecondary>
            <BtnPrimary onClick={() => startInvFlow('contratante', 'inv_c_landing')}>Aceptar invitación <ChevronRight className="w-4 h-4" /></BtnPrimary>
          </div>
        </div>
      );
    })(),

    /* ── INVITATION FINAL (both parties) ───────────────────────────────────── */
    inv_final: (() => {
      const miEmpresa  = foundCompany?.razonSocial || regData.razonSocial || '—';
      const miNif      = foundCompany?.nif || regData.nif || '—';
      const contraparte = inviterCompany?.razonSocial || (isCont ? 'PYME solicitante' : 'Empresa Contratante');
      const montoFmt   = operation.monto
        ? `${operation.monto.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} XAF`
        : '—';

      const invSections = [
        {
          id: 'empresa',
          title: isCont ? 'Empresa Contratante (mi empresa)' : 'PYME (mi empresa)',
          items: foundCompany ? [
            { label: 'Razón social',       value: foundCompany.razonSocial },
            { label: 'NIF',                value: foundCompany.nif },
            { label: 'Forma jurídica',     value: foundCompany.formaJuridica },
            { label: 'Correo electrónico', value: foundCompany.email },
            { label: 'Teléfono',           value: foundCompany.telefono },
          ] : [
            { label: 'Razón social',       value: regData.razonSocial },
            { label: 'NIF',                value: regData.nif },
            { label: 'Forma jurídica',     value: regData.formaJuridica },
            { label: 'Correo electrónico', value: regData.email },
            { label: 'Teléfono',           value: regData.telefono },
          ],
        },
        {
          id: 'operacion',
          title: 'Operación',
          items: [
            { label: 'Tipo de operación', value: operation.tipo === 'factoring' ? 'Factoring' : 'Factoring Inverso' },
            { label: 'Monto propuesto',   value: montoFmt },
            ...(operation.tipo !== 'factoring_inverso' ? [{ label: 'Plazo propuesto', value: operation.plazo ? `${operation.plazo} días` : '—' }] : []),
            { label: 'Referencia',        value: `SOL-2026-${refNumber}` },
          ],
        },
        {
          id: 'contraparte',
          title: isCont ? 'PYME solicitante' : 'Empresa Contratante',
          items: [
            { label: 'Razón social', value: inviterCompany?.razonSocial || contraparte },
            { label: 'NIF',          value: inviterCompany?.nif || '—' },
            { label: 'Correo',       value: inviterCompany?.email || '—' },
            { label: 'Teléfono',     value: inviterCompany?.telefono || '—' },
          ],
        },
      ];

      return (
        <div className="space-y-3 mb-10">
          {invSections.map((section) => {
            const isExp = invConfirmOpen.includes(section.id);
            return (
              <div key={section.id} className="border border-border rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => toggleInvConfirm(section.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" style={{ color: RED }} />
                    <span className="font-semibold text-text-1 text-sm">{section.title}</span>
                  </div>
                  {isExp ? <ChevronUp className="w-5 h-5 text-text-4" /> : <ChevronDown className="w-5 h-5 text-text-4" />}
                </button>
                {isExp && (
                  <div className="border-t border-border p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.items.map((item, i) => (
                        <div key={i}>
                          <p className="text-xs text-text-4 mb-1">{item.label}</p>
                          <p className="text-sm font-medium text-text-1">{item.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-text/30 bg-yellow-bg">
            <AlertCircle className="w-4 h-4 text-yellow-text mt-0.5 shrink-0" />
            <p className="text-[13px] text-text-3">Las condiciones definitivas las establecerá <strong>Bonafide</strong> tras el análisis de riesgo. Ambas partes deberán aceptarlas.</p>
          </div>

          <div className="pt-2 flex justify-end">
            <BtnPrimary onClick={() => { setSentFromInv(true); setPhase('sent'); }}>
              <Send className="w-4 h-4" /> Enviar confirmación a Bonafide
            </BtnPrimary>
          </div>
        </div>
      );
    })(),
  };

  // ── TOPBAR ─────────────────────────────────────────────────────────────────
  const showStepper = step >= 0 && !['who_initiates', 'sent', 'inv_p_landing', 'inv_c_landing', 'inv_final', 'is_client'].includes(phase);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: GRAD }}>
              <LogOut className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-1 text-center mb-2">¿Abandonar el proceso?</h3>
            <p className="text-sm text-text-3 text-center mb-6">Perderás el progreso de tu solicitud. Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => go('login')}
                className="flex-1 h-11 flex items-center justify-center gap-2 text-white text-sm font-semibold rounded-xl cursor-pointer"
                style={{ background: GRAD }}>
                <LogOut className="w-4 h-4" /> Salir
              </button>
              <button onClick={() => setShowExitModal(false)}
                className="flex-1 h-11 flex items-center justify-center text-sm font-semibold rounded-xl border border-border text-text-2 hover:bg-gray-50 cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky topbar */}
      <nav className="bg-white sticky top-0 z-50 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8" style={{ boxShadow: SHADOW }}>
        <img src={logo} alt="Bonafide" className="h-14 w-auto object-contain" />
        <button onClick={() => setShowExitModal(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white rounded-xl px-4 py-2 cursor-pointer transition-opacity hover:opacity-90"
          style={{ background: GRAD, boxShadow: '0 4px 12px rgba(224,32,28,0.25)' }}
        >
          Salir <LogOut className="w-4 h-4" />
        </button>
      </nav>

      {/* Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {showStepper && <Stepper steps={steps} step={step} />}

          <div className={`bg-white rounded-2xl shadow-sm border border-border p-8 lg:p-12 ${showStepper ? 'mt-6' : 'mt-2'}`}>

            {/* Step header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: GRAD }}>
                  <hdr.Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-1 leading-tight">{hdr.title}</h2>
                  <p className="text-sm text-text-3 mt-0.5">{hdr.sub}</p>
                </div>
              </div>
              <div className="h-1 w-16 rounded-full mt-3" style={{ background: GRAD }} />
            </div>

            {content[phase] ?? null}
          </div>

        </div>
      </main>
    </div>
  );
}
