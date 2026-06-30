import { Fragment, useState } from 'react';
import { useApp } from '../../state/AppContext';
import logo from '../../assets/logo-color.webp';
import {
  ChevronRight, ChevronLeft, Search, X, Check,
  Building2, User, FileText, DollarSign, Clock,
  Briefcase, CheckSquare, Plus, ArrowRight,
  Bell, AlertCircle, MapPin, Send,
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
  inv_final:        3,
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
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center gap-5 p-6 bg-gray-50 border-b border-border">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: GRAD }}>
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="font-bold text-text-1 text-lg">{company.razonSocial}</div>
          <div className="text-sm text-text-4">{company.nif}</div>
        </div>
        <div className="ml-auto">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-bg text-green-text border border-green-border">
            {company.estadoKyc ?? 'KYC Vigente'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-border">
        {[
          ['Estado KYC', company.estadoKyc ?? 'Vigente'],
          ['Última actualización', company.ultimaAct ?? 'Dic. 2025'],
          ['País', company.pais ?? 'Guinea Ecuatorial'],
          ['NIF', company.nif],
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

function NavRow({ onBack, onNext, nextLabel = 'Continuar', nextDisabled = false, hideNext = false }) {
  return (
    <div className="pt-6 border-t border-border flex items-center justify-between gap-4 mt-10">
      <button onClick={onBack} disabled={!onBack}
        className="h-11 px-6 flex items-center gap-2 text-sm font-semibold rounded-xl cursor-pointer transition-all border border-border text-text-2 hover:bg-gray-50 disabled:opacity-0 disabled:pointer-events-none">
        <ChevronLeft className="w-4 h-4" /> Atrás
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
      className={`p-6 lg:p-8 rounded-2xl border-2 text-left transition-all cursor-pointer w-full
        ${selected ? 'border-[#e0201c] bg-red-50' : 'border-border hover:border-[#e0201c] hover:bg-red-50/30'}`}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GRAD }}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="font-bold text-text-1 text-base mb-1.5">{title}</div>
      <div className="text-sm text-text-3 leading-relaxed mb-4">{desc}</div>
      {tags && (
        <div className="flex flex-wrap gap-2">
          {tags.map(t => <span key={t} className="text-xs bg-white border border-border px-2.5 py-0.5 rounded-full text-text-3">{t}</span>)}
        </div>
      )}
    </button>
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

  // ── Identification state ────────────────────────────────────────────────────
  const [isClient, setIsClient] = useState(null);
  const [nif, setNif] = useState('');
  const [foundCompany, setFoundCompany] = useState(null);
  const [nifSearched, setNifSearched] = useState(false);
  const [contactData, setContactData] = useState({ nombre: '', cargo: '', email: '', telefono: '' });
  const [regData, setRegData] = useState({
    razonSocial: '', nombreComercial: '', nif: '', fechaConst: '', formaJuridica: '',
    email: '', telefono: '', pais: 'Guinea Ecuatorial', provincia: '', ciudad: '', direccion: '', cp: '',
  });

  // ── Operation state ─────────────────────────────────────────────────────────
  const [operation, setOperation] = useState({ tipo: '', monto: '', plazo: '30', observaciones: '' });

  // ── Party selection state ───────────────────────────────────────────────────
  const [pymeData, setPymeData] = useState({ razonSocial: '', nombreComercial: '', nif: '', email: '', tel: '', contrato: '' });
  const [pymeSearched, setPymeSearched] = useState(false);
  const [pymeFound, setPymeFound] = useState(null);   // null | 'found' | 'not_found'

  const [pymesInverso, setPymesInverso] = useState([{ nif: '', email: '', tel: '', contrato: '', monto: '' }]);

  const [contData, setContData] = useState({ nif: '', email: '', tel: '', contrato: '' });
  const [contSearched, setContSearched] = useState(false);
  const [contFound, setContFound] = useState(null);

  const [refNumber] = useState(() => Math.floor(10000 + Math.random() * 90000));

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

  const startInvFlow = (chosenActor) => {
    setActor(chosenActor);
    setReturnPhase(chosenActor === 'pyme' ? 'inv_final' : 'inv_final');
    setIsClient(null);
    setNif(''); setFoundCompany(null); setNifSearched(false);
    setPhase('is_client');
  };

  const mockNifSearch = (v) => {
    setFoundCompany({
      razonSocial: 'TotalEnerGE S.A.',
      nif: v,
      estadoKyc: 'KYC Vigente',
      ultimaAct: 'Dic. 2025',
      pais: 'Guinea Ecuatorial',
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
    who_initiates:   { Icon: FileText,    title: 'Nueva solicitud de financiación',     sub: 'Seleccione quién inicia el proceso' },
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

    /* ── WHO INITIATES ─────────────────────────────────────────────────────── */
    who_initiates: (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <ChoiceBtn
            selected={actor === 'contratante'}
            onClick={() => setActor('contratante')}
            Icon={Building2}
            title="Empresa Contratante"
            desc="Soy una empresa contratante que desea financiar a sus PYMEs proveedoras a través de Bonafide."
            tags={['Factoring', 'Factoring Inverso', 'Múltiples PYMEs']}
          />
          <ChoiceBtn
            selected={actor === 'pyme'}
            onClick={() => setActor('pyme')}
            Icon={User}
            title="Empresa PYME"
            desc="Soy una PYME y deseo solicitar financiación anticipada de mis facturas con una empresa contratante."
            tags={['Factoring', 'Anticipo de facturas']}
          />
        </div>
        <NavRow
          onBack={null}
          onNext={() => startFlow(actor)}
          nextLabel="Iniciar solicitud"
          nextDisabled={!actor}
        />
      </>
    ),

    /* ── IS CLIENT ─────────────────────────────────────────────────────────── */
    is_client: (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <ChoiceBtn selected={isClient === true}  onClick={() => setIsClient(true)}
            Icon={Check}    title="Sí, somos clientes de Bonafide"
            desc="Tenemos un expediente activo, contrato o historial de operaciones con Bonafide."
            tags={['Identificación rápida', 'Sin rellenar formularios']}
          />
          <ChoiceBtn selected={isClient === false} onClick={() => setIsClient(false)}
            Icon={Building2} title="No, es nuestra primera vez"
            desc="No tenemos relación previa con Bonafide. Necesitamos registrar nuestra empresa."
            tags={['Alta en el sistema', 'Proceso guiado']}
          />
        </div>
        <NavRow
          onBack={() => setPhase('who_initiates')}
          onNext={() => isClient ? setPhase('nif_search') : setPhase('register')}
          nextDisabled={isClient === null}
        />
      </>
    ),

    /* ── NIF SEARCH ────────────────────────────────────────────────────────── */
    nif_search: (
      <>
        <div className="max-w-2xl space-y-6 mb-10">
          <Field label="NIF / RUC / Identificador fiscal" required
            hint="Introduce el identificador fiscal registrado en Bonafide. Ej: GQ-2024-00234">
            <div className="flex gap-3">
              <input className={iCls + ' flex-1'} value={nif}
                onChange={e => { setNif(e.target.value); setNifSearched(false); setFoundCompany(null); }}
                placeholder="Ej. GQ-2024-00234"
                onKeyDown={e => e.key === 'Enter' && nif.trim() && mockNifSearch(nif)} />
              <button onClick={() => mockNifSearch(nif)} disabled={!nif.trim()}
                className="h-[42px] px-5 rounded-lg text-white flex items-center gap-2 text-sm font-semibold disabled:opacity-40 cursor-pointer shrink-0"
                style={{ background: GRAD }}>
                <Search className="w-4 h-4" /> Buscar
              </button>
            </div>
          </Field>

          {foundCompany && (
            <div className="rounded-xl border border-green-border bg-green-bg p-4">
              <div className="flex items-center gap-2 text-green-text font-semibold text-sm mb-3">
                <Check className="w-4 h-4" /> Empresa encontrada en el sistema Bonafide
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[['Razón social', foundCompany.razonSocial], ['NIF', foundCompany.nif], ['Estado KYC', foundCompany.estadoKyc], ['Última actualización', foundCompany.ultimaAct]].map(([k, v]) => (
                  <div key={k} className="bg-white rounded-lg p-3 border border-green-border">
                    <div className="text-[10px] text-text-4 uppercase tracking-wider mb-1">{k}</div>
                    <div className="font-semibold text-text-1 text-sm">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nifSearched && !foundCompany && (
            <NotFoundCard message="No encontramos ninguna empresa con ese NIF en Bonafide. Prueba con otro identificador o completa el registro." />
          )}
        </div>
        <NavRow onBack={() => setPhase('is_client')} onNext={() => setPhase('confirm_company')} nextDisabled={!foundCompany} />
      </>
    ),

    /* ── CONFIRM COMPANY ───────────────────────────────────────────────────── */
    confirm_company: foundCompany ? (
      <>
        <div className="space-y-4 mb-10">
          <CompanyCard company={foundCompany}
            onConfirm={() => setPhase('authorize')}
            onReject={() => { setNif(''); setFoundCompany(null); setNifSearched(false); setPhase('nif_search'); }}
            confirmLabel="Sí, esta es mi empresa"
            rejectLabel="No, buscar otro NIF"
          />
        </div>
        <NavRow onBack={() => setPhase('nif_search')} hideNext />
      </>
    ) : null,

    /* ── AUTHORIZE ─────────────────────────────────────────────────────────── */
    authorize: (
      <>
        <div className="space-y-5 mb-10">
          <div className="rounded-xl border border-green-border bg-green-bg p-5">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-text mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-green-text mb-1">Información KYC disponible</div>
                <p className="text-sm text-text-3">Disponemos de la información corporativa de <strong>{foundCompany?.razonSocial}</strong> actualizada a {foundCompany?.ultimaAct}. Puedes continuar sin volver a rellenar formularios.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ChoiceBtn selected={false} onClick={() => setPhase('contact')}
              Icon={Check} title="Sí, autorizo usar mis datos"
              desc="Bonafide utilizará la información registrada en el sistema para procesar esta solicitud."
              tags={['Más rápido', 'Sin formularios adicionales']}
            />
            <ChoiceBtn selected={false} onClick={() => setPhase('register')}
              Icon={Building2} title="No, quiero actualizar mis datos"
              desc="Actualizaré mi información antes de continuar con la solicitud."
              tags={['Datos actualizados', 'Control total']}
            />
          </div>
        </div>
        <NavRow onBack={() => setPhase('confirm_company')} hideNext />
      </>
    ),

    /* ── REGISTER ──────────────────────────────────────────────────────────── */
    register: (
      <>
        <div className="space-y-8 mb-10">
          <div>
            <SectionLabel>Datos de la empresa</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Razón social" required className="md:col-span-2">
                <input className={iCls} value={regData.razonSocial} onChange={e => setRegData(p => ({ ...p, razonSocial: e.target.value }))} placeholder="Nombre legal de la empresa" />
              </Field>
              <Field label="NIF / RUC" required>
                <input className={iCls + ' uppercase'} value={regData.nif} onChange={e => setRegData(p => ({ ...p, nif: e.target.value }))} placeholder="GQ-2024-00234" />
              </Field>
              <Field label="Nombre comercial">
                <input className={iCls} value={regData.nombreComercial} onChange={e => setRegData(p => ({ ...p, nombreComercial: e.target.value }))} placeholder="Nombre con el que opera" />
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
            </div>
          </div>

          <div>
            <SectionLabel>Datos de contacto</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Correo electrónico corporativo" required>
                <input className={iCls} type="email" value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} placeholder="contacto@empresa.com" />
              </Field>
              <Field label="Teléfono corporativo" required>
                <input className={iCls} type="tel" value={regData.telefono} onChange={e => setRegData(p => ({ ...p, telefono: e.target.value }))} placeholder="+240 222 000 000" />
              </Field>
            </div>
          </div>

          <div>
            <SectionLabel>Dirección</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="País" required>
                <input className={iCls} value={regData.pais} onChange={e => setRegData(p => ({ ...p, pais: e.target.value }))} />
              </Field>
              <Field label="Provincia / Región" required>
                <select className={sCls} value={regData.provincia} onChange={e => setRegData(p => ({ ...p, provincia: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  <option>Bioko Norte</option><option>Bioko Sur</option>
                  <option>Centro Sur</option><option>Djibloho</option>
                  <option>Kié-Ntem</option><option>Litoral</option><option>Wele-Nzas</option>
                </select>
              </Field>
              <Field label="Ciudad" required>
                <input className={iCls} value={regData.ciudad} onChange={e => setRegData(p => ({ ...p, ciudad: e.target.value }))} placeholder="Ej. Malabo" />
              </Field>
              <Field label="Dirección completa" required className="md:col-span-2">
                <input className={iCls} value={regData.direccion} onChange={e => setRegData(p => ({ ...p, direccion: e.target.value }))} placeholder="Calle, número, edificio..." />
              </Field>
              <Field label="Código postal">
                <input className={iCls} value={regData.cp} onChange={e => setRegData(p => ({ ...p, cp: e.target.value }))} placeholder="Ej. 240" />
              </Field>
            </div>
          </div>
        </div>
        <NavRow
          onBack={() => isClient ? setPhase('authorize') : setPhase('is_client')}
          onNext={() => setPhase('contact')}
          nextDisabled={!regData.razonSocial || !regData.nif}
        />
      </>
    ),

    /* ── CONTACT ───────────────────────────────────────────────────────────── */
    contact: (
      <>
        <div className="space-y-5 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Nombre completo" required>
              <input className={iCls} value={contactData.nombre} onChange={e => setContactData(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej. María García" />
            </Field>
            <Field label="Cargo en la empresa" required>
              <input className={iCls} value={contactData.cargo} onChange={e => setContactData(p => ({ ...p, cargo: e.target.value }))} placeholder="Ej. Director Financiero" />
            </Field>
            <Field label="Correo electrónico" required hint="Recibirás las notificaciones de la solicitud en este correo">
              <input className={iCls} type="email" value={contactData.email} onChange={e => setContactData(p => ({ ...p, email: e.target.value }))} placeholder="maria.garcia@empresa.com" />
            </Field>
            <Field label="Teléfono de contacto" required>
              <input className={iCls} type="tel" value={contactData.telefono} onChange={e => setContactData(p => ({ ...p, telefono: e.target.value }))} placeholder="+240 222 000 000" />
            </Field>
          </div>
        </div>
        <NavRow
          onBack={() => setPhase(isClient ? 'authorize' : 'register')}
          onNext={() => setPhase(returnPhase)}
          nextDisabled={!contactData.nombre || !contactData.email}
        />
      </>
    ),

    /* ── OPERATION ─────────────────────────────────────────────────────────── */
    operation: (
      <>
        <div className="space-y-8 mb-10">
          <div>
            <SectionLabel>Tipo de operación</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ChoiceBtn selected={operation.tipo === 'factoring'} onClick={() => setOperation(p => ({ ...p, tipo: 'factoring' }))}
                Icon={FileText} title="Factoring"
                desc="Anticipo del cobro de facturas pendientes cediendo el crédito comercial a Bonafide."
                tags={isCont ? ['Empresa Contratante → PYME', 'Una PYME'] : ['Anticipo de facturas', 'Liquidez inmediata']}
              />
              {isCont && (
                <ChoiceBtn selected={operation.tipo === 'factoring_inverso'} onClick={() => setOperation(p => ({ ...p, tipo: 'factoring_inverso' }))}
                  Icon={DollarSign} title="Factoring Inverso"
                  desc="Defines un fondo de participación y designas las PYMEs proveedoras que acceden a financiación."
                  tags={['Fondo de participación', 'Múltiples PYMEs']}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Monto solicitado" required hint="Propuesta del solicitante — monto definitivo lo aprueba Bonafide">
              <div className="relative">
                <input className={iCls + ' pr-14'} type="number" value={operation.monto}
                  onChange={e => setOperation(p => ({ ...p, monto: e.target.value }))} placeholder="0" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-4">XAF</span>
              </div>
            </Field>
            <Field label="Plazo solicitado" required hint="Plazo orientativo — el plazo definitivo lo determina Bonafide">
              <select className={sCls} value={operation.plazo} onChange={e => setOperation(p => ({ ...p, plazo: e.target.value }))}>
                <option value="30">30 días</option>
                <option value="60">60 días</option>
                <option value="90">90 días</option>
                <option value="120">120 días</option>
              </select>
            </Field>
          </div>

          <Field label="Observaciones">
            <textarea className={iCls + ' resize-none'} rows={3} value={operation.observaciones}
              onChange={e => setOperation(p => ({ ...p, observaciones: e.target.value }))}
              placeholder="Información adicional relevante para la solicitud..." />
          </Field>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-text/30 bg-yellow-bg">
            <AlertCircle className="w-4 h-4 text-yellow-text shrink-0 mt-0.5" />
            <p className="text-sm text-text-3">
              <strong className="text-text-1">Nota importante:</strong> El monto y el plazo indicados son únicamente una <strong>propuesta del solicitante</strong>. Las <strong>condiciones definitivas</strong> (monto aprobado, plazo, tasa de interés y comisiones) las establece Bonafide tras el análisis de riesgo.
            </p>
          </div>
        </div>
        <NavRow
          onBack={() => setPhase('contact')}
          onNext={() => setPhase('select_parties')}
          nextDisabled={!operation.tipo || !operation.monto}
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
                <Field label="Nº contrato con esta PYME" required className="md:col-span-3">
                  <input className={iCls} value={pymeData.contrato} onChange={e => setPymeData(p => ({ ...p, contrato: e.target.value }))} placeholder="Ej. CTR-2026-001" />
                </Field>
              </div>

              <button onClick={mockPymeVerify} disabled={!pymeData.nif || !pymeData.email}
                className="h-11 px-6 flex items-center gap-2 text-white text-sm font-semibold rounded-xl disabled:opacity-40 cursor-pointer"
                style={{ background: GRAD }}>
                <Search className="w-4 h-4" /> Verificar empresa
              </button>

              {pymeSearched && pymeFound === 'found' && (
                <div className="rounded-xl border border-green-border bg-green-bg p-5">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-text shrink-0" />
                    <div>
                      <div className="font-semibold text-green-text">Empresa verificada en Bonafide</div>
                      <div className="text-sm text-text-3 mt-0.5">
                        <span className="font-semibold text-text-1">{pymeData.razonSocial || 'Empresa PYME'}</span> · Estado: <span className="text-green-text font-medium">Cliente activo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pymeSearched && pymeFound === 'not_found' && (
                <div className="rounded-xl border border-blue-text/20 bg-blue-bg p-5 flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-text shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-text-1 mb-1">La empresa no está registrada en Bonafide</div>
                    <p className="text-sm text-text-3">Se enviará una <strong>invitación</strong> al correo <strong>{pymeData.email}</strong> para que la PYME complete su vinculación con Bonafide y pueda participar en esta operación.</p>
                  </div>
                </div>
              )}
            </div>
            <NavRow
              onBack={() => setPhase('operation')}
              onNext={() => setPhase('confirmation')}
              nextDisabled={!pymeSearched}
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
                    <Field label="NIF / RUC" required>
                      <input className={iCls + ' uppercase'} value={p.nif}
                        onChange={e => setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, nif: e.target.value } : x))}
                        placeholder="GQ-2024-00XXX" />
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
                    <Field label="Nº de contrato" required>
                      <input className={iCls} value={p.contrato}
                        onChange={e => setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, contrato: e.target.value } : x))}
                        placeholder="CTR-2026-00X" />
                    </Field>
                    <Field label="Monto asignado (XAF)" required>
                      <input className={iCls} type="number" value={p.monto}
                        onChange={e => setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, monto: e.target.value } : x))}
                        placeholder="0" />
                    </Field>
                  </div>
                </div>
              ))}
              <button onClick={() => setPymesInverso(p => [...p, { nif: '', email: '', tel: '', contrato: '', monto: '' }])}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="NIF de la Empresa Contratante" required>
                  <input className={iCls + ' uppercase'} value={contData.nif}
                    onChange={e => { setContData(p => ({ ...p, nif: e.target.value })); setContSearched(false); setContFound(null); }}
                    placeholder="GQ-2024-00XXX" />
                </Field>
                <Field label="Correo electrónico" required>
                  <input className={iCls} type="email" value={contData.email}
                    onChange={e => setContData(p => ({ ...p, email: e.target.value }))}
                    placeholder="contacto@contratante.com" />
                </Field>
                <Field label="Teléfono">
                  <input className={iCls} type="tel" value={contData.tel}
                    onChange={e => setContData(p => ({ ...p, tel: e.target.value }))}
                    placeholder="+240 222 000 000" />
                </Field>
                <Field label="Nº contrato con la Empresa Contratante" required>
                  <input className={iCls} value={contData.contrato}
                    onChange={e => setContData(p => ({ ...p, contrato: e.target.value }))}
                    placeholder="Ej. CTR-2026-001" />
                </Field>
              </div>
              <button onClick={mockContVerify} disabled={!contData.nif || !contData.email}
                className="h-11 px-6 flex items-center gap-2 text-white text-sm font-semibold rounded-xl disabled:opacity-40 cursor-pointer"
                style={{ background: GRAD }}>
                <Search className="w-4 h-4" /> Verificar empresa
              </button>

              {contSearched && contFound === 'found' && (
                <div className="rounded-xl border border-green-border bg-green-bg p-5">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-text shrink-0" />
                    <div>
                      <div className="font-semibold text-green-text">Empresa contratante verificada</div>
                      <div className="text-sm text-text-3 mt-0.5">NIF <strong>{contData.nif}</strong> · Estado: <span className="text-green-text font-medium">Cliente activo</span></div>
                    </div>
                  </div>
                </div>
              )}
              {contSearched && contFound === 'not_found' && (
                <NotFoundCard message="No encontramos esta empresa en Bonafide. Verifica el NIF o el correo e inténtalo de nuevo." />
              )}
            </div>
            <NavRow
              onBack={() => setPhase('operation')}
              onNext={() => setPhase('confirmation')}
              nextDisabled={!contSearched || contFound !== 'found'}
            />
          </>
        )}
      </>
    ),

    /* ── CONFIRMATION ──────────────────────────────────────────────────────── */
    confirmation: (
      <>
        <div className="space-y-6 mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryBox label="Empresa solicitante" value={isCont ? (foundCompany?.razonSocial ?? regData.razonSocial) : (foundCompany?.razonSocial ?? regData.razonSocial)} />
            <SummaryBox label="Tipo de operación" value={operation.tipo === 'factoring' ? 'Factoring' : 'Factoring Inverso'} highlight />
            <SummaryBox label="Monto propuesto" value={operation.monto ? `XAF ${Number(operation.monto).toLocaleString()}` : '—'} />
            <SummaryBox label="Plazo propuesto" value={`${operation.plazo} días`} />
          </div>

          {isCont && operation.tipo === 'factoring' && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-border font-semibold text-sm text-text-1">PYME seleccionada</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-border">
                {[['NIF', pymeData.nif || '—'], ['Correo', pymeData.email || '—'], ['Estado', pymeFound === 'found' ? 'Cliente Bonafide' : 'Pendiente vinculación'], ['Contrato', pymeData.contrato || '—']].map(([k, v]) => (
                  <div key={k} className="p-4">
                    <div className="text-[10px] text-text-4 uppercase tracking-wider mb-1">{k}</div>
                    <div className="font-semibold text-text-1 text-sm">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCont && operation.tipo === 'factoring_inverso' && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-border font-semibold text-sm text-text-1">{pymesInverso.length} PYME{pymesInverso.length > 1 ? 's' : ''} beneficiaria{pymesInverso.length > 1 ? 's' : ''}</div>
              <div className="divide-y divide-border">
                {pymesInverso.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3 text-sm">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: GRAD }}>{i + 1}</span>
                    <span className="font-medium text-text-1 flex-1 min-w-0 truncate">{p.nif || '—'}</span>
                    <span className="text-text-3">{p.monto ? `XAF ${Number(p.monto).toLocaleString()}` : '—'}</span>
                    <span className="text-text-4 text-xs">{p.contrato || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isCont && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-border font-semibold text-sm text-text-1">Empresa Contratante</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-border">
                {[['NIF', contData.nif || '—'], ['Correo', contData.email || '—'], ['Estado', 'Cliente activo'], ['Contrato', contData.contrato || '—']].map(([k, v]) => (
                  <div key={k} className="p-4">
                    <div className="text-[10px] text-text-4 uppercase tracking-wider mb-1">{k}</div>
                    <div className="font-semibold text-text-1 text-sm">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {operation.observaciones && (
            <div className="p-4 bg-gray-50 rounded-xl border border-border">
              <div className="text-xs text-text-4 uppercase tracking-wider mb-1.5">Observaciones</div>
              <p className="text-sm text-text-2">{operation.observaciones}</p>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-text/30 bg-yellow-bg">
            <AlertCircle className="w-4 h-4 text-yellow-text mt-0.5 shrink-0" />
            <p className="text-sm text-text-3">
              El monto y plazo indicados son una <strong>propuesta del solicitante</strong>. Tras el análisis de riesgo, Bonafide comunicará las <strong>condiciones definitivas</strong> a ambas partes para su aceptación.
            </p>
          </div>
        </div>
        <NavRow onBack={() => setPhase('select_parties')} onNext={() => setPhase('sent')} nextLabel="Enviar solicitud" />
      </>
    ),

    /* ── SENT ──────────────────────────────────────────────────────────────── */
    sent: (
      <div className="space-y-8">
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: GRAD }}>
            <Send className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-1 mb-2">Solicitud enviada con éxito</h2>
          <p className="text-text-3 max-w-md mx-auto">
            {isCont
              ? 'Hemos enviado una invitación a la PYME para que confirme su participación en la operación.'
              : 'Hemos enviado una invitación a la Empresa Contratante para que confirme la operación.'}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-100 rounded-full">
            <span className="text-xs text-text-4">Referencia</span>
            <span className="font-mono font-bold text-text-1">SOL-2026-{refNumber}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { label: 'Pendiente de respuesta',    desc: `En espera de que la ${isCont ? 'PYME' : 'Empresa Contratante'} confirme su participación.`, active: true,  Icon: Bell },
            { label: 'Pendiente de Documentación',desc: 'Una vez aceptada la operación por ambas partes, Bonafide solicitará la documentación necesaria.', active: false, Icon: FileText },
            { label: 'Pendiente de Compliance',   desc: 'Validación KYC, revisión de documentos e historial de las empresas participantes.', active: false, Icon: CheckSquare },
            { label: 'Pendiente de Riesgo',       desc: 'Análisis de riesgo país, scoring de empresas, exposición acumulada y capacidad financiera.', active: false, Icon: Briefcase },
            { label: 'Pendiente de Aprobación',   desc: 'Bonafide generará una propuesta con las condiciones definitivas para aceptación de ambas partes.', active: false, Icon: Clock },
          ].map(({ label, desc, active, Icon }, i) => (
            <div key={i} className={`flex gap-4 p-4 rounded-xl border ${active ? 'bg-yellow-bg border-yellow-text/30' : 'bg-gray-50 border-border'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? '' : 'bg-white border border-border'}`}
                style={active ? { background: GRAD } : {}}>
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-text-4'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-text-1 text-sm">{label}</span>
                  {active && <span className="text-xs bg-orange-tint text-orange px-2 py-0.5 rounded-full font-semibold">Activo</span>}
                </div>
                <p className="text-sm text-text-3 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
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
              ['Monto propuesto',     operation.monto ? `XAF ${Number(operation.monto).toLocaleString()}` : 'XAF 25,000,000'],
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
          <BtnPrimary onClick={() => startInvFlow('pyme')}>Continuar <ChevronRight className="w-4 h-4" /></BtnPrimary>
          <BtnSecondary onClick={() => setPhase('sent')}><X className="w-4 h-4" /> Rechazar</BtnSecondary>
        </div>
      </div>
    ),

    /* ── INVITATION LANDING (Contratante receives from PYME) ───────────────── */
    inv_c_landing: (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="p-6 lg:p-8 bg-gray-50 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GRAD }}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-text-4">Solicitud de</p>
                <p className="font-bold text-text-1">{foundCompany?.razonSocial || 'Construcciones Silva S.R.L.'}</p>
              </div>
            </div>
            <p className="text-sm text-text-3 mt-2">
              La PYME <strong className="text-text-1">{foundCompany?.razonSocial || 'Construcciones Silva S.R.L.'}</strong> desea realizar una operación de factoring con tu empresa como empresa contratante.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-border">
            {[
              ['PYME solicitante',    foundCompany?.razonSocial || 'Construcciones Silva S.R.L.'],
              ['Tipo de operación',   'Factoring'],
              ['Monto propuesto',     operation.monto ? `XAF ${Number(operation.monto).toLocaleString()}` : 'XAF 8,500,000'],
              ['Plazo propuesto',     `${operation.plazo || 30} días`],
              ['Contrato asociado',   contData.contrato || 'CTR-2026-004'],
              ['Fecha de solicitud',  new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })],
            ].map(([k, v]) => (
              <div key={k} className="p-4">
                <div className="text-[10px] text-text-4 uppercase tracking-wider mb-1">{k}</div>
                <div className="font-semibold text-text-1 text-sm">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <BtnPrimary onClick={() => startInvFlow('contratante')}>Continuar <ChevronRight className="w-4 h-4" /></BtnPrimary>
          <BtnSecondary onClick={() => setPhase('sent')}><X className="w-4 h-4" /> Rechazar</BtnSecondary>
        </div>
      </div>
    ),

    /* ── INVITATION FINAL (both parties) ───────────────────────────────────── */
    inv_final: (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-gray-50 p-5">
          <SectionLabel>Resumen de la operación</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <SummaryBox label="Empresa Contratante" value={isCont ? (foundCompany?.razonSocial ?? regData.razonSocial) : 'TotalEnerGE S.A.'} />
            <SummaryBox label="PYME" value={isCont ? (pymeData.razonSocial || pymeData.nif || '—') : (foundCompany?.razonSocial ?? regData.razonSocial)} />
            <SummaryBox label="Tipo" value={operation.tipo === 'factoring_inverso' ? 'Factoring Inverso' : 'Factoring'} highlight />
            <SummaryBox label="Monto propuesto" value={operation.monto ? `XAF ${Number(operation.monto).toLocaleString()}` : 'XAF 25,000,000'} />
            <SummaryBox label="Plazo propuesto" value={`${operation.plazo || 60} días`} />
            <SummaryBox label="Referencia" value={`SOL-2026-${refNumber}`} />
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-text/30 bg-yellow-bg">
          <AlertCircle className="w-4 h-4 text-yellow-text mt-0.5 shrink-0" />
          <p className="text-sm text-text-3">Las condiciones definitivas (tasa, comisiones, monto y plazo aprobados) las establecerá <strong>Bonafide</strong> tras el análisis de riesgo. Ambas partes deberán aceptarlas.</p>
        </div>

        <div>
          <p className="font-semibold text-text-1 mb-4">¿Deseas participar en esta operación?</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <BtnPrimary onClick={() => setPhase('sent')} className="sm:flex-1 justify-center">
              <Check className="w-4 h-4" /> Aceptar solicitud
            </BtnPrimary>
            <BtnSecondary onClick={() => setPhase('sent')} disabled={false}>
              <X className="w-4 h-4" /> Rechazar solicitud
            </BtnSecondary>
          </div>
        </div>

        <NavRow onBack={() => setPhase('contact')} hideNext />
      </div>
    ),
  };

  // ── TOPBAR ─────────────────────────────────────────────────────────────────
  const showStepper = step >= 0 && !['who_initiates', 'sent', 'inv_p_landing', 'inv_c_landing', 'inv_final'].includes(phase);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Sticky topbar */}
      <nav className="bg-white sticky top-0 z-50" style={{ boxShadow: SHADOW }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src={logo} alt="Bonafide" className="h-14 w-auto object-contain" />
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-text-4 font-medium">Solicitar Contrato</span>
              <button onClick={() => go('login')}
                className="flex items-center gap-1.5 text-sm text-text-3 hover:text-text-1 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" /> Salir
              </button>
            </div>
          </div>
        </div>
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

          <p className="text-center text-sm text-text-4 mt-6">
            ¿Necesitas ayuda?{' '}
            <span className="font-medium cursor-pointer hover:underline" style={{ color: RED }}>soporte@bonafide.gq</span>
          </p>
        </div>
      </main>
    </div>
  );
}
