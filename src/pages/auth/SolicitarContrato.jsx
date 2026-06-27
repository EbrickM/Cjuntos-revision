import { Fragment, useState } from 'react';
import { useApp } from '../../state/AppContext';
import logo from '../../assets/logo.png';
import {
  ChevronRight, ChevronLeft, Search, X, Check,
  Building2, User, FileText, DollarSign, Upload,
  Clock, Briefcase, CheckSquare, Plus, ArrowLeft,
} from 'lucide-react';

// ── Brand ─────────────────────────────────────────────────────────────────────
const RED  = '#e0201c';
const ORA  = '#ef7a2c';
const GRAD = `linear-gradient(135deg, ${RED} 0%, ${ORA} 100%)`;

// ── Stepper steps ─────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Identificación' },
  { label: 'Tipo de solicitud' },
  { label: 'Operación' },
  { label: 'Contrato' },
  { label: 'Documentos' },
  { label: 'Revisión' },
];

// Phase → stepper index + header meta
const PHASE_META = {
  client_check:    { step: 0, title: 'Identificación inicial',      sub: '¿Es actualmente cliente de Bonafide?',          Icon: Building2 },
  nif_search:      { step: 0, title: 'Búsqueda por NIF',            sub: 'Localice su empresa en nuestra base de datos',   Icon: Building2 },
  confirm_company: { step: 0, title: 'Confirmar empresa',            sub: 'Verifique que los datos corresponden a su empresa', Icon: Building2 },
  contact_form:    { step: 0, title: 'Contacto de la solicitud',    sub: '¿Quién realiza esta solicitud?',                 Icon: User },
  use_existing:    { step: 0, title: 'Datos en Bonafide',           sub: '¿Desea utilizar la información registrada?',     Icon: Building2 },
  kyc_empresa:     { step: 0, title: 'Información de la empresa',   sub: 'Datos corporativos de su organización',          Icon: Building2 },
  kyc_contacto:    { step: 0, title: 'Contacto corporativo',        sub: 'Datos de contacto y persona de referencia',      Icon: User },
  tipo_solicitud:  { step: 1, title: 'Tipo de solicitud',           sub: 'Seleccione el producto financiero que necesita', Icon: FileText },
  operacion:       { step: 2, title: 'Definición de la operación',  sub: 'Configure los parámetros de la operación',       Icon: Briefcase },
  contrato:        { step: 3, title: 'Estructura del contrato',     sub: 'Condiciones financieras del acuerdo',            Icon: DollarSign },
  documentos:      { step: 4, title: 'Documentación requerida',     sub: 'Adjunte los documentos necesarios',              Icon: Upload },
  revision:        { step: 5, title: 'Solicitud enviada',           sub: 'Su solicitud está siendo procesada',             Icon: CheckSquare },
};

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ step }) {
  return (
    <div className="w-full py-4 sm:py-6">

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-sm font-semibold text-text-1">{STEPS[step]?.label}</span>
          <span className="text-xs text-text-4">{step + 1} / {STEPS.length}</span>
        </div>
        <div className="flex items-center px-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center w-full">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <Fragment key={i}>
                  {i > 0 && (
                    <div className={`flex-1 h-0.5 rounded-full transition-all ${done ? '' : 'bg-gray-200'}`}
                      style={done ? { background: GRAD } : {}} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 transition-all
                    ${active ? 'text-white ring-4 ring-[#e0201c]/20' : done ? 'text-white opacity-70' : 'bg-gray-200 text-gray-400'}`}
                    style={active || done ? { background: GRAD } : {}}>
                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-1">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(step / Math.max(STEPS.length - 1, 1)) * 100}%`, background: GRAD }} />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex items-start w-full">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <Fragment key={i}>
              {i > 0 && (
                <div className={`flex-1 h-1 mt-5 mx-2 rounded transition-all ${done ? '' : 'bg-gray-200'}`}
                  style={done ? { background: GRAD } : {}} />
              )}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                    ${!done && !active ? 'bg-gray-200 text-gray-500' : 'text-white'}`}
                  style={done || active ? { background: GRAD } : {}}
                >
                  {done ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`mt-2 text-xs font-medium text-center w-20 leading-tight
                  ${active ? '' : done ? 'text-text-3' : 'text-text-4'}`}
                  style={active ? { color: RED } : {}}>
                  {s.label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Form atoms ────────────────────────────────────────────────────────────────
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

function SectionHeader({ title }) {
  return (
    <div className="px-6 py-4 bg-gray-50 border-b border-border -mx-8 lg:-mx-12">
      <h3 className="font-semibold text-text-1">{title}</h3>
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel = 'Continuar', nextDisabled = false, hideNext = false }) {
  return (
    <div className="pt-6 border-t border-border flex items-center justify-between gap-4">
      <button
        onClick={onBack}
        disabled={!onBack}
        className="h-11 px-6 flex items-center gap-2 text-sm font-semibold rounded-xl border border-border text-text-2 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Atrás
      </button>
      {!hideNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="h-11 px-8 flex items-center gap-2 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{ background: GRAD, boxShadow: '0 4px 14px rgba(224,32,28,0.25)' }}
        >
          {nextLabel} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ── Choice card ───────────────────────────────────────────────────────────────
function ChoiceCard({ selected, onClick, Icon, title, desc, tags }) {
  return (
    <button
      onClick={onClick}
      className={`p-6 lg:p-8 rounded-2xl border-2 text-left transition-all cursor-pointer w-full
        ${selected ? 'border-[#e0201c] bg-red-50' : 'border-border hover:border-[#e0201c] hover:bg-red-50/40'}`}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GRAD }}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="font-bold text-text-1 text-base mb-1.5">{title}</div>
      <div className="text-sm text-text-3 leading-relaxed mb-4">{desc}</div>
      {tags && (
        <div className="flex flex-wrap gap-2">
          {tags.map(t => (
            <span key={t} className="text-xs bg-white border border-border px-2.5 py-1 rounded-full text-text-3">{t}</span>
          ))}
        </div>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SolicitarContrato() {
  const { go } = useApp();

  const [phase, setPhase] = useState('client_check');
  const [isClient, setIsClient] = useState(null);
  const [nif, setNif] = useState('');
  const [nifSearched, setNifSearched] = useState(false);
  const [foundCompany, setFoundCompany] = useState(null);
  const [prevTipoPhase, setPrevTipoPhase] = useState('kyc_contacto');
  const [useExisting, setUseExisting] = useState(null);

  const [contactData, setContactData] = useState({ nombre: '', cargo: '', email: '', telefono: '' });
  const [kycEmpresa, setKycEmpresa] = useState({ razonSocial: '', nombreComercial: '', nif: '', fechaFundacion: '', formaJuridica: '', empleados: '' });
  const [kycContacto, setKycContacto] = useState({ telefono: '', email: '', web: '' });

  const [tipoSolicitud, setTipoSolicitud] = useState(null);
  const [quienSolicita, setQuienSolicita] = useState(null);
  const [empresaAsociada, setEmpresaAsociada] = useState('');
  const [contratoComercial, setContratoComercial] = useState('');
  const [fondoParticipacion, setFondoParticipacion] = useState('');
  const [pymesInverso, setPymesInverso] = useState([{ nombre: '', monto: '' }]);

  const [contrato, setContrato] = useState({
    montoTotal: '', moneda: 'XAF', tasaInteres: '', comisionBonafide: '',
    retencion: '', duracion: '30', formaPago: 'bullet', desembolsoDirecto: 'si',
  });

  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [refNumber] = useState(() => Math.floor(10000 + Math.random() * 90000));

  const meta = PHASE_META[phase] ?? PHASE_META.client_check;

  const handleNifSearch = () => {
    if (!nif.trim()) return;
    setFoundCompany({ razonSocial: 'TotalEnerGE S.A.', estadoCliente: 'Activo', pais: 'Guinea Ecuatorial', riesgo: 'Bajo', ultimoKYC: 'Dic. 2025' });
    setNifSearched(true);
  };

  const goTipo = (prev) => { setPrevTipoPhase(prev); setPhase('tipo_solicitud'); };

  const addDocCat = (cat, files) => {
    const newDocs = Array.from(files).map(f => ({ name: f.name, id: Date.now() + Math.random(), cat }));
    setUploadedDocs(p => [...p, ...newDocs]);
  };

  // ── Phase content ───────────────────────────────────────────────────────────
  const phases = {

    /* ── FASE 1: ¿Cliente? ──────────────────────────────────────────────── */
    client_check: (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <ChoiceCard
            selected={isClient === true}
            onClick={() => setIsClient(true)}
            Icon={Building2}
            title="Sí, soy cliente de Bonafide"
            desc="Tengo historial, cuenta o contrato activo con Bonafide. Identificación rápida por NIF."
            tags={['Identificación rápida', 'Datos pre-cargados']}
          />
          <ChoiceCard
            selected={isClient === false}
            onClick={() => setIsClient(false)}
            Icon={User}
            title="No, soy nuevo en Bonafide"
            desc="Primera vez que interactúo con Bonafide. Necesito completar el proceso de vinculación."
            tags={['Onboarding completo', 'Alta en el sistema']}
          />
        </div>
        <NavRow
          onBack={null}
          onNext={() => { isClient ? setPhase('nif_search') : setPhase('kyc_empresa'); }}
          nextDisabled={isClient === null}
        />
      </>
    ),

    /* ── FASE 1.1: NIF ──────────────────────────────────────────────────── */
    nif_search: (
      <>
        <div className="max-w-xl space-y-6 mb-10">
          <Field label="NIF / RUC / Identificador fiscal" required hint="Formato utilizado en Guinea Ecuatorial: Ej. GQ-2024-00234">
            <div className="flex gap-3">
              <input
                className={iCls + ' flex-1'}
                value={nif}
                onChange={e => { setNif(e.target.value); setNifSearched(false); setFoundCompany(null); }}
                placeholder="Ej. GQ-2024-00234"
                onKeyDown={e => e.key === 'Enter' && handleNifSearch()}
              />
              <button
                onClick={handleNifSearch}
                disabled={!nif.trim()}
                className="px-5 h-[42px] rounded-lg text-white flex items-center gap-2 text-sm font-semibold disabled:opacity-40 cursor-pointer shrink-0 transition-all"
                style={{ background: GRAD }}
              >
                <Search className="w-4 h-4" /> Buscar
              </button>
            </div>
          </Field>

          {foundCompany && (
            <div className="rounded-xl border border-green-border bg-green-bg p-5">
              <div className="flex items-center gap-2 text-green-text font-semibold text-sm mb-3">
                <Check className="w-4 h-4" /> Empresa localizada en el sistema
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: GRAD }}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-text-1 text-base">{foundCompany.razonSocial}</div>
                  <div className="text-sm text-text-4">{foundCompany.pais}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[['Estado', foundCompany.estadoCliente], ['Riesgo', foundCompany.riesgo], ['Último KYC', foundCompany.ultimoKYC], ['NIF', nif]].map(([k, v]) => (
                  <div key={k} className="bg-white rounded-lg p-3 border border-green-border">
                    <div className="text-[10px] text-text-4 uppercase tracking-wider mb-1">{k}</div>
                    <div className="font-semibold text-text-1 text-sm">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <NavRow
          onBack={() => setPhase('client_check')}
          onNext={() => setPhase('confirm_company')}
          nextDisabled={!foundCompany}
        />
      </>
    ),

    /* ── FASE 1.2: Confirmar ────────────────────────────────────────────── */
    confirm_company: (
      <>
        <div className="space-y-6 mb-10">
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-5 p-8 bg-gray-50 border-b border-border">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: GRAD }}>
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="font-bold text-text-1 text-xl mb-1">{foundCompany?.razonSocial}</div>
                <div className="text-sm text-text-4">{foundCompany?.pais}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-border">
              {[['Estado cliente', foundCompany?.estadoCliente], ['Nivel de riesgo', foundCompany?.riesgo], ['Último KYC', foundCompany?.ultimoKYC], ['Identificador', nif]].map(([k, v]) => (
                <div key={k} className="p-5">
                  <div className="text-xs text-text-4 uppercase tracking-wider mb-1.5">{k}</div>
                  <div className="font-semibold text-text-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-text-3">
            Si estos datos no corresponden a su empresa, haga clic en <strong>Atrás</strong> e introduzca otro NIF.
          </p>
        </div>
        <NavRow
          onBack={() => setPhase('nif_search')}
          onNext={() => setPhase('contact_form')}
          nextLabel="Sí, continuar"
        />
      </>
    ),

    /* ── FASE 1.3: Contacto ─────────────────────────────────────────────── */
    contact_form: (
      <>
        <div className="space-y-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Nombre completo" required>
              <input className={iCls} value={contactData.nombre} onChange={e => setContactData(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej. María García Rodríguez" />
            </Field>
            <Field label="Cargo en la empresa" required>
              <input className={iCls} value={contactData.cargo} onChange={e => setContactData(p => ({ ...p, cargo: e.target.value }))} placeholder="Ej. Director Financiero" />
            </Field>
            <Field label="Correo electrónico" required hint="Se enviará la confirmación de solicitud a este correo">
              <input className={iCls} type="email" value={contactData.email} onChange={e => setContactData(p => ({ ...p, email: e.target.value }))} placeholder="correo@empresa.com" />
            </Field>
            <Field label="Teléfono de contacto" required>
              <input className={iCls} type="tel" value={contactData.telefono} onChange={e => setContactData(p => ({ ...p, telefono: e.target.value }))} placeholder="+240 222 000 000" />
            </Field>
          </div>
        </div>
        <NavRow onBack={() => setPhase('confirm_company')} onNext={() => setPhase('use_existing')} />
      </>
    ),

    /* ── FASE 1.4: Usar existentes ──────────────────────────────────────── */
    use_existing: (
      <>
        <div className="space-y-6 mb-10">
          <div className="rounded-xl border border-green-border bg-green-bg p-5">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-text shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-green-text mb-1">Información KYC actualizada</div>
                <div className="text-sm text-text-3">Disponemos de su información corporativa actualizada a diciembre de 2025. Puede continuar sin necesidad de volver a introducir sus datos.</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChoiceCard
              selected={useExisting === 'si'}
              onClick={() => setUseExisting('si')}
              Icon={Check}
              title="Sí, usar datos existentes"
              desc="Continúe directamente con la información que Bonafide tiene registrada. Proceso más rápido."
              tags={['Más rápido', 'Sin rellenar formularios']}
            />
            <ChoiceCard
              selected={useExisting === 'no'}
              onClick={() => setUseExisting('no')}
              Icon={Building2}
              title="No, actualizar mis datos"
              desc="Revise y actualice la información antes de continuar. Accederá al formulario de actualización."
              tags={['Datos actualizados', 'Control total']}
            />
          </div>
        </div>
        <NavRow
          onBack={() => setPhase('contact_form')}
          onNext={() => {
            if (useExisting === 'si') { setPrevTipoPhase('use_existing'); setPhase('tipo_solicitud'); }
            else setPhase('kyc_empresa');
          }}
          nextDisabled={!useExisting}
        />
      </>
    ),

    /* ── KYC: Empresa ───────────────────────────────────────────────────── */
    kyc_empresa: (
      <>
        <div className="space-y-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Razón social" required className="md:col-span-2">
              <input className={iCls} value={kycEmpresa.razonSocial} onChange={e => setKycEmpresa(p => ({ ...p, razonSocial: e.target.value }))} placeholder="Nombre legal de la empresa" />
            </Field>
            <Field label="NIF / RUC" required hint="Identificador fiscal de la empresa">
              <input className={iCls + ' uppercase'} value={kycEmpresa.nif || nif} onChange={e => setKycEmpresa(p => ({ ...p, nif: e.target.value }))} placeholder="Ej. GQ-2024-00234" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Nombre comercial">
              <input className={iCls} value={kycEmpresa.nombreComercial} onChange={e => setKycEmpresa(p => ({ ...p, nombreComercial: e.target.value }))} placeholder="Nombre con el que opera" />
            </Field>
            <Field label="Fecha de constitución" required>
              <input className={iCls} type="date" value={kycEmpresa.fechaFundacion} onChange={e => setKycEmpresa(p => ({ ...p, fechaFundacion: e.target.value }))} />
            </Field>
            <Field label="Nº de empleados">
              <select className={sCls} value={kycEmpresa.empleados} onChange={e => setKycEmpresa(p => ({ ...p, empleados: e.target.value }))}>
                <option value="">Seleccionar...</option>
                <option>1 - 5</option><option>6 - 20</option><option>21 - 50</option><option>51 - 100</option><option>100+</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Forma jurídica" required className="md:col-span-2">
              <select className={sCls} value={kycEmpresa.formaJuridica} onChange={e => setKycEmpresa(p => ({ ...p, formaJuridica: e.target.value }))}>
                <option value="">Seleccionar forma jurídica...</option>
                <option>Sociedad Anónima (S.A.)</option>
                <option>Sociedad de Responsabilidad Limitada (S.R.L.)</option>
                <option>Empresa Individual</option>
                <option>Cooperativa</option>
                <option>Fundación</option>
                <option>ONG</option>
                <option>Otra</option>
              </select>
            </Field>
          </div>
        </div>
        <NavRow
          onBack={() => setPhase(isClient ? 'use_existing' : 'client_check')}
          onNext={() => setPhase('kyc_contacto')}
        />
      </>
    ),

    /* ── KYC: Contacto ──────────────────────────────────────────────────── */
    kyc_contacto: (
      <>
        <div className="space-y-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Teléfono corporativo" required>
              <input className={iCls} type="tel" value={kycContacto.telefono} onChange={e => setKycContacto(p => ({ ...p, telefono: e.target.value }))} placeholder="+240 222 000 000" />
            </Field>
            <Field label="Email corporativo" required>
              <input className={iCls} type="email" value={kycContacto.email} onChange={e => setKycContacto(p => ({ ...p, email: e.target.value }))} placeholder="contacto@empresa.com" />
            </Field>
            <Field label="Sitio web">
              <input className={iCls} value={kycContacto.web} onChange={e => setKycContacto(p => ({ ...p, web: e.target.value }))} placeholder="www.empresa.com" />
            </Field>
          </div>

          <div>
            <h4 className="text-sm font-bold text-text-4 uppercase tracking-wider mb-4">Persona de contacto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Nombre completo" required>
                <input className={iCls} value={contactData.nombre} onChange={e => setContactData(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej. María García" />
              </Field>
              <Field label="Cargo" required>
                <input className={iCls} value={contactData.cargo} onChange={e => setContactData(p => ({ ...p, cargo: e.target.value }))} placeholder="Cargo en la empresa" />
              </Field>
              <Field label="Email personal" required>
                <input className={iCls} type="email" value={contactData.email} onChange={e => setContactData(p => ({ ...p, email: e.target.value }))} placeholder="nombre@empresa.com" />
              </Field>
              <Field label="Teléfono personal" required>
                <input className={iCls} type="tel" value={contactData.telefono} onChange={e => setContactData(p => ({ ...p, telefono: e.target.value }))} placeholder="+240 222 000 000" />
              </Field>
            </div>
          </div>
        </div>
        <NavRow
          onBack={() => setPhase('kyc_empresa')}
          onNext={() => goTipo('kyc_contacto')}
        />
      </>
    ),

    /* ── FASE 2: Tipo ───────────────────────────────────────────────────── */
    tipo_solicitud: (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <ChoiceCard
            selected={tipoSolicitud === 'factoring'}
            onClick={() => setTipoSolicitud('factoring')}
            Icon={FileText}
            title="Contrato de Factoring"
            desc="La PYME o empresa contratante anticipa el cobro de facturas pendientes cediendo el crédito comercial a Bonafide, que garantiza el pago."
            tags={['Anticipo de facturas', 'Liquidez inmediata', 'PYME o Contratante']}
          />
          <ChoiceCard
            selected={tipoSolicitud === 'factoring_inverso'}
            onClick={() => setTipoSolicitud('factoring_inverso')}
            Icon={DollarSign}
            title="Factoring Inverso"
            desc="La empresa contratante define un fondo de participación y designa las PYMEs proveedoras que podrán acceder a financiación anticipada."
            tags={['Fondo de participación', 'Múltiples PYMEs', 'Iniciativa del contratante']}
          />
        </div>
        <NavRow
          onBack={() => setPhase(prevTipoPhase)}
          onNext={() => setPhase('operacion')}
          nextDisabled={!tipoSolicitud}
        />
      </>
    ),

    /* ── FASE 3: Operación ──────────────────────────────────────────────── */
    operacion: (
      <>
        <div className="space-y-8 mb-10">
          {tipoSolicitud === 'factoring' && (
            <>
              <div>
                <h4 className="text-sm font-bold text-text-4 uppercase tracking-wider mb-4">¿Quién solicita la financiación?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { val: 'pyme', title: 'PYME', desc: 'La empresa pequeña solicita el anticipo de sus facturas emitidas al contratante.' },
                    { val: 'contratante', title: 'Empresa Contratante', desc: 'El contratante gestiona el factoring en nombre y beneficio de la PYME proveedora.' },
                  ].map(({ val, title, desc }) => (
                    <button key={val} onClick={() => setQuienSolicita(val)}
                      className={`p-5 rounded-xl border-2 text-left cursor-pointer transition-all w-full ${quienSolicita === val ? 'border-[#e0201c] bg-red-50' : 'border-border hover:border-[#e0201c]'}`}>
                      <div className="font-semibold text-text-1 mb-1">{title}</div>
                      <div className="text-sm text-text-3">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {quienSolicita && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={quienSolicita === 'pyme' ? 'Empresa contratante asociada' : 'PYME beneficiaria'} required hint="Nombre legal o NIF de la empresa">
                    <input className={iCls} value={empresaAsociada} onChange={e => setEmpresaAsociada(e.target.value)} placeholder="Nombre o NIF de la empresa" />
                  </Field>
                  <Field label="Contrato comercial de referencia" required hint="Número o referencia del contrato entre ambas partes">
                    <input className={iCls} value={contratoComercial} onChange={e => setContratoComercial(e.target.value)} placeholder="Ej. CTR-2026-001" />
                  </Field>
                </div>
              )}
            </>
          )}

          {tipoSolicitud === 'factoring_inverso' && (
            <>
              <div className="max-w-sm">
                <Field label="Monto del fondo de participación" required hint="Monto total en XAF que la empresa contratante pone a disposición">
                  <div className="relative">
                    <input className={iCls + ' pr-14'} type="number" value={fondoParticipacion} onChange={e => setFondoParticipacion(e.target.value)} placeholder="0" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-4 font-semibold">XAF</span>
                  </div>
                </Field>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-text-4 uppercase tracking-wider">PYMEs beneficiarias</h4>
                  <button onClick={() => setPymesInverso(p => [...p, { nombre: '', monto: '' }])}
                    className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer transition-colors hover:opacity-75"
                    style={{ color: RED }}>
                    <Plus className="w-4 h-4" /> Añadir PYME
                  </button>
                </div>
                <div className="space-y-3">
                  {pymesInverso.map((p, i) => (
                    <div key={i} className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl border border-border">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: GRAD }}>{i + 1}</div>
                      <input className={iCls + ' flex-1'} value={p.nombre} onChange={e => setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, nombre: e.target.value } : x))} placeholder="Nombre o NIF de la PYME" />
                      <div className="relative w-44 shrink-0">
                        <input className={iCls + ' pr-14'} type="number" value={p.monto} onChange={e => setPymesInverso(ps => ps.map((x, j) => j === i ? { ...x, monto: e.target.value } : x))} placeholder="Monto" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-4 font-semibold">XAF</span>
                      </div>
                      {pymesInverso.length > 1 && (
                        <button onClick={() => setPymesInverso(ps => ps.filter((_, j) => j !== i))} className="text-text-4 hover:text-red-500 cursor-pointer shrink-0 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <NavRow
          onBack={() => setPhase('tipo_solicitud')}
          onNext={() => setPhase('contrato')}
          nextDisabled={tipoSolicitud === 'factoring' && !quienSolicita}
        />
      </>
    ),

    /* ── FASE 4: Contrato ───────────────────────────────────────────────── */
    contrato: (
      <>
        <div className="space-y-10 mb-10">
          <div>
            <h4 className="text-sm font-bold text-text-4 uppercase tracking-wider mb-5">Información financiera</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Monto total a aprobar" required hint="Importe en Francos CFA (XAF)">
                <div className="relative">
                  <input className={iCls + ' pr-14'} type="number" value={contrato.montoTotal} onChange={e => setContrato(p => ({ ...p, montoTotal: e.target.value }))} placeholder="0" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-4">XAF</span>
                </div>
              </Field>
              <Field label="Tasa de interés" required>
                <div className="relative">
                  <input className={iCls + ' pr-10'} type="number" step="0.01" value={contrato.tasaInteres} onChange={e => setContrato(p => ({ ...p, tasaInteres: e.target.value }))} placeholder="0.00" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-4">%</span>
                </div>
              </Field>
              <Field label="Comisión Bonafide" required>
                <div className="relative">
                  <input className={iCls + ' pr-10'} type="number" step="0.01" value={contrato.comisionBonafide} onChange={e => setContrato(p => ({ ...p, comisionBonafide: e.target.value }))} placeholder="0.00" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-4">%</span>
                </div>
              </Field>
              <Field label="Porcentaje de retención" required>
                <div className="relative">
                  <input className={iCls + ' pr-10'} type="number" step="0.01" value={contrato.retencion} onChange={e => setContrato(p => ({ ...p, retencion: e.target.value }))} placeholder="0.00" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-4">%</span>
                </div>
              </Field>
              <Field label="Duración" required>
                <select className={sCls} value={contrato.duracion} onChange={e => setContrato(p => ({ ...p, duracion: e.target.value }))}>
                  <option value="30">30 días</option>
                  <option value="60">60 días</option>
                  <option value="90">90 días</option>
                  <option value="mixto">Mixto</option>
                </select>
              </Field>
              <Field label="Forma de pago" required>
                <select className={sCls} value={contrato.formaPago} onChange={e => setContrato(p => ({ ...p, formaPago: e.target.value }))}>
                  <option value="bullet">Bullet — pago único al vencimiento</option>
                  <option value="parcial">Parcial — cuotas periódicas</option>
                  <option value="mixto">Mixto</option>
                </select>
              </Field>
            </div>
          </div>

          {(tipoSolicitud === 'factoring_inverso' || (tipoSolicitud === 'factoring' && quienSolicita === 'pyme')) && (
            <div>
              <h4 className="text-sm font-bold text-text-4 uppercase tracking-wider mb-5">Condiciones operativas</h4>
              <p className="text-sm font-medium text-text-1 mb-3">¿Desembolso directo a la PYME?</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                {[{ val: 'si', label: 'Sí, desembolso directo', sub: 'La PYME recibe los fondos directamente' }, { val: 'no', label: 'No, pago a proveedores', sub: 'Bonafide ejecuta pagos a terceros' }].map(({ val, label, sub }) => (
                  <button key={val} onClick={() => setContrato(p => ({ ...p, desembolsoDirecto: val }))}
                    className={`flex-1 p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${contrato.desembolsoDirecto === val ? 'border-[#e0201c] bg-red-50' : 'border-border hover:border-[#e0201c]'}`}>
                    <div className={`text-sm font-semibold mb-0.5 ${contrato.desembolsoDirecto === val ? 'text-[#e0201c]' : 'text-text-1'}`}>{label}</div>
                    <div className="text-xs text-text-4">{sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <NavRow onBack={() => setPhase('operacion')} onNext={() => setPhase('documentos')} />
      </>
    ),

    /* ── FASE 5: Documentos ─────────────────────────────────────────────── */
    documentos: (
      <>
        <div className="space-y-5 mb-10">
          {[
            { cat: 'legal',     title: 'Documentos legales',         docs: ['Escrituras de constitución', 'Estatutos sociales', 'Actas constitutivas'] },
            { cat: 'fiscal',    title: 'Documentos fiscales',        docs: ['Certificado de RUC / NIF', 'Declaraciones tributarias', 'Certificado de estar al corriente'] },
            { cat: 'comercial', title: 'Contrato comercial',         docs: ['Contrato entre PYME y contratante', 'Órdenes de compra', 'Facturas relacionadas'] },
            { cat: 'kyc',       title: 'Identificación y KYC',       docs: ['DNI o Pasaporte del representante legal', 'Poderes notariales de representación'] },
          ].map(({ cat, title, docs }) => {
            const catDocs = uploadedDocs.filter(d => d.cat === cat);
            return (
              <div key={cat} className="border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-border">
                  <div>
                    <div className="font-semibold text-text-1">{title}</div>
                    <div className="text-xs text-text-4 mt-0.5">{docs.join(' · ')}</div>
                  </div>
                  {catDocs.length > 0 && (
                    <span className="text-xs bg-green-bg text-green-text border border-green-border px-3 py-1 rounded-full font-semibold shrink-0 ml-4">
                      {catDocs.length} archivo{catDocs.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  {catDocs.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {catDocs.map(d => (
                        <div key={d.id} className="flex items-center gap-3 p-3 bg-green-bg rounded-lg border border-green-border">
                          <FileText className="w-4 h-4 text-green-text shrink-0" />
                          <span className="text-sm text-text-2 flex-1 truncate">{d.name}</span>
                          <button onClick={() => setUploadedDocs(p => p.filter(x => x.id !== d.id))} className="text-text-4 hover:text-red-500 cursor-pointer p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex flex-col items-center gap-3 border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-[#e0201c] hover:bg-red-50/40 transition-all">
                    <input type="file" multiple className="hidden" onChange={e => { addDocCat(cat, e.target.files); e.target.value = ''; }} accept="image/*,.pdf" />
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-text-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-2">Seleccionar o arrastrar archivos</div>
                      <div className="text-xs text-text-4 mt-1">PDF, JPG, PNG — máximo 10 MB por archivo</div>
                    </div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <NavRow onBack={() => setPhase('contrato')} onNext={() => setPhase('revision')} nextLabel="Enviar solicitud" />
      </>
    ),

    /* ── FASE 6: Revisión ───────────────────────────────────────────────── */
    revision: (
      <div className="space-y-8">
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: GRAD }}>
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-1 mb-2">Solicitud enviada con éxito</h2>
          <p className="text-text-3 max-w-md mx-auto">Su solicitud ha sido recibida y está siendo procesada por el equipo de Compliance de Bonafide.</p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-100 rounded-full">
            <span className="text-xs text-text-4">Número de referencia</span>
            <span className="font-mono font-bold text-text-1 text-sm">SOL-2026-{refNumber}</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { fase: 'Fase 7', label: 'Validación Compliance', desc: 'Scoring de empresa y contraparte, análisis de riesgo país, exposición acumulada e historial de operaciones.', status: 'En revisión', active: true, Icon: Clock },
            { fase: 'Fase 8', label: 'Aprobación de línea',   desc: 'Generación de línea de financiación con límite de crédito, monto disponible y monto bloqueado.',        status: 'Pendiente',  active: false, Icon: DollarSign },
            { fase: 'Fase 9', label: 'Activación de wallet',  desc: 'Creación de wallet por empresa, ledger contable asociado y configuración de límites operativos.',       status: 'Pendiente',  active: false, Icon: Building2 },
            { fase: 'Fase 10', label: 'Ejecución',             desc: 'Inicio de la operación financiera: desembolso directo a la PYME o pago a proveedores por Bonafide.', status: 'Pendiente',  active: false, Icon: Check },
          ].map(({ fase, label, desc, status, active, Icon }, i) => (
            <div key={i} className={`flex gap-4 p-5 rounded-xl border ${active ? 'bg-yellow-bg border-yellow-text/30' : 'bg-gray-50 border-border'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? '' : 'bg-white border border-border'}`}
                style={active ? { background: GRAD } : {}}>
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-text-4'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold text-text-4 uppercase tracking-wide">{fase}</span>
                  <span className="font-semibold text-text-1 text-sm">{label}</span>
                  <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${active ? 'bg-orange-tint text-orange' : 'bg-border text-text-4'}`}>{status}</span>
                </div>
                <p className="text-sm text-text-3 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-blue-bg border border-blue-text/20 p-5">
          <div className="font-semibold text-blue-text mb-2">¿Qué ocurre ahora?</div>
          <ul className="space-y-1.5 text-sm text-text-3">
            {[
              'Recibirá un email de confirmación con el número de referencia de su solicitud',
              'El plazo habitual de revisión por parte de Compliance es de 2 a 5 días hábiles',
              'Una vez aprobada la línea, recibirá acceso a la plataforma B-Mori para operar',
            ].map((t, i) => (
              <li key={i} className="flex gap-2"><span className="shrink-0 mt-0.5" style={{ color: RED }}>•</span>{t}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={() => go('login')}
            className="h-11 px-8 flex items-center gap-2 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
            style={{ background: GRAD, boxShadow: '0 4px 14px rgba(224,32,28,0.25)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </button>
        </div>
      </div>
    ),
  };

  // ── Layout ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <img src={logo} alt="Bonafide" className="h-12 w-auto object-contain" />
          <button
            onClick={() => go('login')}
            className="flex items-center gap-2 text-sm text-text-3 hover:text-text-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" /> Salir
          </button>
        </div>

        {/* Stepper */}
        <Stepper step={meta.step} />

        {/* Card */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-border p-8 lg:p-12">

          {/* Step header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: GRAD }}>
                <meta.Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-1 leading-tight">{meta.title}</h2>
                <p className="text-sm text-text-3 mt-0.5">{meta.sub}</p>
              </div>
            </div>
            <div className="h-1 w-16 rounded-full mt-3" style={{ background: GRAD }} />
          </div>

          {/* Phase content */}
          {phases[phase] ?? null}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-text-4 mt-6">
          ¿Tiene alguna duda?{' '}
          <span className="font-medium cursor-pointer hover:underline" style={{ color: RED }}>soporte@bonafide.gq</span>
        </p>
      </div>
    </div>
  );
}
