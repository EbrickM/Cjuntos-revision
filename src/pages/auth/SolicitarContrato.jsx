import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import logo from '../../assets/logo.png';
import {
  ChevronRight, ChevronLeft, Search, X,
  Building2, User, FileText, DollarSign, Upload,
  Clock, Check, Plus,
} from 'lucide-react';

const GRAD = 'linear-gradient(135deg, #e0201c 0%, #ef7a2c 100%)';

const STEPS = ['Identificación', 'Solicitud', 'Operación', 'Contrato', 'Documentos', 'Revisión'];

const PHASE_STEP = {
  client_check: 0, nif_search: 0, confirm_company: 0,
  contact_form: 0, use_existing: 0,
  kyc_empresa: 0, kyc_contacto: 0,
  tipo_solicitud: 1,
  operacion: 2,
  contrato: 3,
  documentos: 4,
  revision: 5,
};

// ── Atoms ─────────────────────────────────────────────────────────────────────
const iCls = 'w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e0201c] focus:border-transparent transition-all bg-white';

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-2 mb-1">
        {label}{required && <span className="text-[#e0201c] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function BtnPrimary({ onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-10 px-5 text-white text-sm font-semibold rounded-xl cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
      style={{ background: GRAD, boxShadow: '0 4px 12px rgba(224,32,28,0.2)' }}
    >
      {children}
    </button>
  );
}

function BtnSecondary({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="h-10 px-5 text-sm font-semibold rounded-xl cursor-pointer transition-all border border-border text-text-2 hover:bg-gray-50 flex items-center gap-2 shrink-0"
    >
      {children}
    </button>
  );
}

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ step }) {
  return (
    <div className="mb-6">
      <div className="flex sm:hidden items-center justify-between mb-2">
        <span className="text-xs text-text-4">Paso {step + 1} de {STEPS.length}</span>
        <span className="text-xs font-semibold text-text-1">{STEPS[step]}</span>
      </div>
      <div className="sm:hidden h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: GRAD }} />
      </div>
      <div className="hidden sm:flex items-start">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s} className="flex items-start flex-1">
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${!done && !active ? 'bg-page-bg border border-border text-text-4' : 'text-white'}`}
                  style={done || active ? { background: GRAD } : {}}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`mt-1 text-[10px] font-medium whitespace-nowrap ${active ? 'text-[#e0201c]' : done ? 'text-text-3' : 'text-text-5'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mt-3.5 mx-1" style={{ background: done ? GRAD : '#e5e7eb' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SolicitarContrato() {
  const { go } = useApp();

  const [phase, setPhase]   = useState('client_check');
  const [isClient, setIsClient] = useState(null);
  const [nif, setNif]       = useState('');
  const [foundCompany, setFoundCompany] = useState(null);
  const [prevTipoPhase, setPrevTipoPhase] = useState('kyc_contacto');

  const [contactData, setContactData] = useState({ nombre: '', cargo: '', email: '', telefono: '' });

  const [kycEmpresa, setKycEmpresa] = useState({ razonSocial: '', nif: '', fechaFundacion: '', formaJuridica: '', empleados: '' });
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

  const step = PHASE_STEP[phase] ?? 0;

  const goTipoSolicitud = (prev) => { setPrevTipoPhase(prev); setPhase('tipo_solicitud'); };

  const handleNifSearch = () => {
    setFoundCompany({ razonSocial: 'TotalEnerGE S.A.', estadoCliente: 'Activo', pais: 'Guinea Ecuatorial', riesgo: 'Bajo', ultimoKYC: 'Dic. 2025' });
    setPhase('confirm_company');
  };

  const addDocCat = (cat, files) => {
    const newDocs = Array.from(files).map(f => ({ name: f.name, id: Date.now() + Math.random(), cat }));
    setUploadedDocs(p => [...p, ...newDocs]);
  };

  // ── Phases ─────────────────────────────────────────────────────────────────
  const phases = {

    client_check: (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-1 mb-1">¿Es actualmente cliente de Bonafide?</h2>
          <p className="text-sm text-text-3">Esto nos ayuda a identificarle en el sistema</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { val: true,  label: 'Sí, soy cliente',  sub: 'Tengo historial o cuenta en Bonafide',       Icon: Building2 },
            { val: false, label: 'No, soy nuevo',     sub: 'Quiero iniciar el proceso de vinculación',   Icon: User },
          ].map(({ val, label, sub, Icon }) => (
            <button
              key={String(val)}
              onClick={() => {
                setIsClient(val);
                if (val) setPhase('nif_search');
                else setPhase('kyc_empresa');
              }}
              className="p-4 rounded-xl border-2 border-border text-left transition-all hover:border-[#e0201c] hover:bg-red-50 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: GRAD }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-semibold text-text-1 text-sm">{label}</div>
              <div className="text-xs text-text-4 mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </div>
    ),

    nif_search: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-1 mb-1">Identificación rápida</h2>
          <p className="text-sm text-text-3">Introduce tu NIF / RUC para buscarte en nuestro sistema</p>
        </div>
        <Field label="NIF / RUC / Identificador fiscal" required>
          <div className="flex gap-2">
            <input className={iCls + ' flex-1'} value={nif} onChange={e => setNif(e.target.value)} placeholder="Ej. GQ-2024-00234" onKeyDown={e => e.key === 'Enter' && nif.trim() && handleNifSearch()} />
            <button onClick={handleNifSearch} disabled={!nif.trim()} className="px-4 h-[38px] rounded-lg text-white flex items-center gap-1.5 text-sm font-semibold disabled:opacity-40 cursor-pointer shrink-0" style={{ background: GRAD }}>
              <Search className="w-4 h-4" /> Buscar
            </button>
          </div>
        </Field>
        <div className="flex justify-start">
          <BtnSecondary onClick={() => setPhase('client_check')}><ChevronLeft className="w-4 h-4" /> Atrás</BtnSecondary>
        </div>
      </div>
    ),

    confirm_company: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-1 mb-1">¿Esta es su empresa?</h2>
          <p className="text-sm text-text-3">Encontramos los siguientes datos en nuestro sistema</p>
        </div>
        {foundCompany && (
          <div className="rounded-xl border border-border p-4 bg-page-bg space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GRAD }}>
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-text-1">{foundCompany.razonSocial}</div>
                <div className="text-xs text-text-4">{foundCompany.pais}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[['Estado', foundCompany.estadoCliente], ['Riesgo', foundCompany.riesgo], ['Último KYC', foundCompany.ultimoKYC], ['NIF', nif]].map(([k, v]) => (
                <div key={k} className="bg-white rounded-lg p-2.5 border border-border">
                  <div className="text-[10px] text-text-4 uppercase tracking-wide">{k}</div>
                  <div className="font-semibold text-text-1 text-xs mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <BtnPrimary onClick={() => setPhase('contact_form')}>Sí, continuar <ChevronRight className="w-4 h-4" /></BtnPrimary>
          <BtnSecondary onClick={() => setPhase('nif_search')}>No, intentar otro NIF</BtnSecondary>
        </div>
      </div>
    ),

    contact_form: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-1 mb-1">Contacto de la solicitud</h2>
          <p className="text-sm text-text-3">¿Quién realiza esta solicitud?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nombre completo" required>
            <input className={iCls} value={contactData.nombre} onChange={e => setContactData(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej. María García" />
          </Field>
          <Field label="Cargo" required>
            <input className={iCls} value={contactData.cargo} onChange={e => setContactData(p => ({ ...p, cargo: e.target.value }))} placeholder="Ej. Director Financiero" />
          </Field>
          <Field label="Email" required>
            <input className={iCls} type="email" value={contactData.email} onChange={e => setContactData(p => ({ ...p, email: e.target.value }))} placeholder="correo@empresa.com" />
          </Field>
          <Field label="Teléfono" required>
            <input className={iCls} type="tel" value={contactData.telefono} onChange={e => setContactData(p => ({ ...p, telefono: e.target.value }))} placeholder="+240 222 000 000" />
          </Field>
        </div>
        <div className="flex justify-between">
          <BtnSecondary onClick={() => setPhase('confirm_company')}><ChevronLeft className="w-4 h-4" /> Atrás</BtnSecondary>
          <BtnPrimary onClick={() => setPhase('use_existing')}>Continuar <ChevronRight className="w-4 h-4" /></BtnPrimary>
        </div>
      </div>
    ),

    use_existing: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-1 mb-1">Datos registrados en Bonafide</h2>
          <p className="text-sm text-text-3">¿Desea utilizar la información que tenemos registrada?</p>
        </div>
        <div className="rounded-xl border border-green-border bg-green-bg p-4">
          <div className="flex items-center gap-2 text-green-text text-sm font-semibold mb-1">
            <Check className="w-4 h-4" /> Información encontrada
          </div>
          <p className="text-xs text-text-3">Tenemos su información KYC actualizada a Dic. 2025. Puede continuar sin volver a introducir datos.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => goTipoSolicitud('use_existing')} className="p-4 rounded-xl border-2 border-border text-left cursor-pointer hover:border-[#e0201c] hover:bg-red-50 transition-all">
            <div className="font-semibold text-text-1 text-sm mb-1">Sí, usar datos existentes</div>
            <div className="text-xs text-text-4">Continuar con la información que Bonafide tiene registrada</div>
          </button>
          <button onClick={() => setPhase('kyc_empresa')} className="p-4 rounded-xl border-2 border-border text-left cursor-pointer hover:border-[#e0201c] hover:bg-red-50 transition-all">
            <div className="font-semibold text-text-1 text-sm mb-1">No, actualizar datos</div>
            <div className="text-xs text-text-4">Modificar o completar la información registrada</div>
          </button>
        </div>
        <div className="flex justify-start">
          <BtnSecondary onClick={() => setPhase('contact_form')}><ChevronLeft className="w-4 h-4" /> Atrás</BtnSecondary>
        </div>
      </div>
    ),

    kyc_empresa: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-1 mb-1">Información de la empresa</h2>
          <p className="text-sm text-text-3">{isClient ? 'Actualice los datos de su empresa' : 'Introduzca los datos de su empresa'}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Field label="Razón social" required>
              <input className={iCls} value={kycEmpresa.razonSocial} onChange={e => setKycEmpresa(p => ({ ...p, razonSocial: e.target.value }))} placeholder="Nombre legal de la empresa" />
            </Field>
          </div>
          <Field label="NIF / RUC" required>
            <input className={iCls} value={kycEmpresa.nif || nif} onChange={e => setKycEmpresa(p => ({ ...p, nif: e.target.value }))} placeholder="Identificador fiscal" />
          </Field>
          <Field label="Fecha de fundación" required>
            <input className={iCls} type="date" value={kycEmpresa.fechaFundacion} onChange={e => setKycEmpresa(p => ({ ...p, fechaFundacion: e.target.value }))} />
          </Field>
          <Field label="Forma jurídica" required>
            <select className={iCls + ' cursor-pointer'} value={kycEmpresa.formaJuridica} onChange={e => setKycEmpresa(p => ({ ...p, formaJuridica: e.target.value }))}>
              <option value="">Seleccionar...</option>
              <option>Sociedad Anónima (S.A.)</option>
              <option>Sociedad de Responsabilidad Limitada (S.R.L.)</option>
              <option>Empresa Individual</option>
              <option>Cooperativa</option>
              <option>Otro</option>
            </select>
          </Field>
          <Field label="Nº de empleados" required>
            <select className={iCls + ' cursor-pointer'} value={kycEmpresa.empleados} onChange={e => setKycEmpresa(p => ({ ...p, empleados: e.target.value }))}>
              <option value="">Seleccionar...</option>
              <option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-between">
          <BtnSecondary onClick={() => setPhase(isClient ? 'use_existing' : 'client_check')}><ChevronLeft className="w-4 h-4" /> Atrás</BtnSecondary>
          <BtnPrimary onClick={() => setPhase('kyc_contacto')}>Continuar <ChevronRight className="w-4 h-4" /></BtnPrimary>
        </div>
      </div>
    ),

    kyc_contacto: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-1 mb-1">Información de contacto</h2>
          <p className="text-sm text-text-3">Datos corporativos y persona de contacto</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Teléfono corporativo" required>
            <input className={iCls} type="tel" value={kycContacto.telefono} onChange={e => setKycContacto(p => ({ ...p, telefono: e.target.value }))} placeholder="+240 222 000 000" />
          </Field>
          <Field label="Email corporativo" required>
            <input className={iCls} type="email" value={kycContacto.email} onChange={e => setKycContacto(p => ({ ...p, email: e.target.value }))} placeholder="contacto@empresa.com" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Sitio web">
              <input className={iCls} value={kycContacto.web} onChange={e => setKycContacto(p => ({ ...p, web: e.target.value }))} placeholder="www.empresa.com" />
            </Field>
          </div>
          <div className="sm:col-span-2 border-t border-border pt-3">
            <p className="text-xs font-bold text-text-4 uppercase tracking-wider mb-3">Persona de contacto</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nombre completo" required>
                <input className={iCls} value={contactData.nombre} onChange={e => setContactData(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre del contacto" />
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
        <div className="flex justify-between">
          <BtnSecondary onClick={() => setPhase('kyc_empresa')}><ChevronLeft className="w-4 h-4" /> Atrás</BtnSecondary>
          <BtnPrimary onClick={() => goTipoSolicitud('kyc_contacto')}>Continuar <ChevronRight className="w-4 h-4" /></BtnPrimary>
        </div>
      </div>
    ),

    tipo_solicitud: (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-text-1 mb-1">Tipo de solicitud</h2>
          <p className="text-sm text-text-3">Seleccione el tipo de contrato que desea solicitar</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { val: 'factoring', title: 'Contrato de Factoring', desc: 'La PYME o empresa contratante anticipa el cobro de facturas cediendo el crédito a Bonafide.', Icon: FileText, tags: ['Anticipo de facturas', 'Liquidez inmediata'] },
            { val: 'factoring_inverso', title: 'Factoring Inverso', desc: 'La empresa contratante define un fondo de participación y designa PYMEs beneficiarias.', Icon: DollarSign, tags: ['Fondo de participación', 'Múltiples PYMEs'] },
          ].map(({ val, title, desc, Icon, tags }) => (
            <button
              key={val}
              onClick={() => { setTipoSolicitud(val); setPhase('operacion'); }}
              className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer hover:border-[#e0201c] hover:bg-red-50 ${tipoSolicitud === val ? 'border-[#e0201c] bg-red-50' : 'border-border'}`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: GRAD }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-text-1 text-sm mb-1">{title}</div>
              <div className="text-xs text-text-3 mb-3 leading-relaxed">{desc}</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => <span key={t} className="text-[10px] bg-white border border-border px-2 py-0.5 rounded-full text-text-3">{t}</span>)}
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-start">
          <BtnSecondary onClick={() => setPhase(prevTipoPhase)}><ChevronLeft className="w-4 h-4" /> Atrás</BtnSecondary>
        </div>
      </div>
    ),

    operacion: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-1 mb-1">Definición de la operación</h2>
          <p className="text-sm text-text-3">
            {tipoSolicitud === 'factoring_inverso'
              ? 'Configure el fondo y las PYMEs beneficiarias'
              : '¿Quién solicita la financiación?'}
          </p>
        </div>

        {tipoSolicitud === 'factoring' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-text-2 mb-2">¿Quién solicita la financiación?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { val: 'pyme', label: 'PYME', desc: 'La empresa pequeña anticipa sus facturas' },
                  { val: 'contratante', label: 'Empresa Contratante', desc: 'El contratante gestiona el factoring' },
                ].map(({ val, label, desc }) => (
                  <button key={val} onClick={() => setQuienSolicita(val)} className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all ${quienSolicita === val ? 'border-[#e0201c] bg-red-50' : 'border-border hover:border-[#e0201c]'}`}>
                    <div className="font-semibold text-text-1 text-sm">{label}</div>
                    <div className="text-xs text-text-4 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
            {quienSolicita && (
              <div className="space-y-3">
                <Field label={quienSolicita === 'pyme' ? 'Empresa contratante asociada' : 'PYME beneficiaria'} required>
                  <input className={iCls} value={empresaAsociada} onChange={e => setEmpresaAsociada(e.target.value)} placeholder="Nombre o NIF de la empresa" />
                </Field>
                <Field label="Contrato comercial asociado" required>
                  <input className={iCls} value={contratoComercial} onChange={e => setContratoComercial(e.target.value)} placeholder="Nº de contrato o referencia" />
                </Field>
              </div>
            )}
          </div>
        )}

        {tipoSolicitud === 'factoring_inverso' && (
          <div className="space-y-4">
            <Field label="Monto del fondo de participación (XAF)" required>
              <input className={iCls} type="number" value={fondoParticipacion} onChange={e => setFondoParticipacion(e.target.value)} placeholder="0" />
            </Field>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-text-2">PYMEs beneficiarias</p>
                <button onClick={() => setPymesInverso(p => [...p, { nombre: '', monto: '' }])} className="text-xs flex items-center gap-1 font-semibold cursor-pointer" style={{ color: '#e0201c' }}>
                  <Plus className="w-3 h-3" /> Añadir PYME
                </button>
              </div>
              <div className="space-y-2">
                {pymesInverso.map((pyme, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input className={iCls + ' flex-1'} value={pyme.nombre} onChange={e => setPymesInverso(p => p.map((x, j) => j === i ? { ...x, nombre: e.target.value } : x))} placeholder={`PYME ${i + 1} — Nombre o NIF`} />
                    <input className={iCls + ' w-36'} type="number" value={pyme.monto} onChange={e => setPymesInverso(p => p.map((x, j) => j === i ? { ...x, monto: e.target.value } : x))} placeholder="Monto XAF" />
                    {pymesInverso.length > 1 && (
                      <button onClick={() => setPymesInverso(p => p.filter((_, j) => j !== i))} className="text-text-4 hover:text-red-500 cursor-pointer shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <BtnSecondary onClick={() => setPhase('tipo_solicitud')}><ChevronLeft className="w-4 h-4" /> Atrás</BtnSecondary>
          <BtnPrimary onClick={() => setPhase('contrato')} disabled={tipoSolicitud === 'factoring' && !quienSolicita}>
            Continuar <ChevronRight className="w-4 h-4" />
          </BtnPrimary>
        </div>
      </div>
    ),

    contrato: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-1 mb-1">Estructura del contrato</h2>
          <p className="text-sm text-text-3">Defina las condiciones financieras del acuerdo</p>
        </div>

        <div>
          <p className="text-xs font-bold text-text-4 uppercase tracking-wider mb-3">Información financiera</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Monto total a aprobar" required>
              <div className="relative">
                <input className={iCls + ' pr-14'} type="number" value={contrato.montoTotal} onChange={e => setContrato(p => ({ ...p, montoTotal: e.target.value }))} placeholder="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-4 font-semibold">XAF</span>
              </div>
            </Field>
            <Field label="Tasa de interés" required>
              <div className="relative">
                <input className={iCls + ' pr-8'} type="number" step="0.01" value={contrato.tasaInteres} onChange={e => setContrato(p => ({ ...p, tasaInteres: e.target.value }))} placeholder="0.00" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-4">%</span>
              </div>
            </Field>
            <Field label="Comisión Bonafide" required>
              <div className="relative">
                <input className={iCls + ' pr-8'} type="number" step="0.01" value={contrato.comisionBonafide} onChange={e => setContrato(p => ({ ...p, comisionBonafide: e.target.value }))} placeholder="0.00" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-4">%</span>
              </div>
            </Field>
            <Field label="Porcentaje de retención" required>
              <div className="relative">
                <input className={iCls + ' pr-8'} type="number" step="0.01" value={contrato.retencion} onChange={e => setContrato(p => ({ ...p, retencion: e.target.value }))} placeholder="0.00" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-4">%</span>
              </div>
            </Field>
            <Field label="Duración" required>
              <select className={iCls + ' cursor-pointer'} value={contrato.duracion} onChange={e => setContrato(p => ({ ...p, duracion: e.target.value }))}>
                <option value="30">30 días</option>
                <option value="60">60 días</option>
                <option value="90">90 días</option>
                <option value="mixto">Mixto</option>
              </select>
            </Field>
            <Field label="Forma de pago" required>
              <select className={iCls + ' cursor-pointer'} value={contrato.formaPago} onChange={e => setContrato(p => ({ ...p, formaPago: e.target.value }))}>
                <option value="bullet">Bullet (pago único al vencimiento)</option>
                <option value="parcial">Parcial (cuotas periódicas)</option>
                <option value="mixto">Mixto</option>
              </select>
            </Field>
          </div>
        </div>

        {(tipoSolicitud === 'factoring_inverso' || (tipoSolicitud === 'factoring' && quienSolicita === 'pyme')) && (
          <div>
            <p className="text-xs font-bold text-text-4 uppercase tracking-wider mb-3">Condiciones operativas</p>
            <p className="text-xs font-semibold text-text-2 mb-2">¿Desembolso directo a la PYME?</p>
            <div className="flex gap-3">
              {[{ val: 'si', label: 'Sí, desembolso directo' }, { val: 'no', label: 'No, pago a proveedores' }].map(({ val, label }) => (
                <button key={val} onClick={() => setContrato(p => ({ ...p, desembolsoDirecto: val }))} className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold cursor-pointer transition-all ${contrato.desembolsoDirecto === val ? 'border-[#e0201c] bg-red-50 text-[#e0201c]' : 'border-border text-text-3 hover:border-[#e0201c]'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <BtnSecondary onClick={() => setPhase('operacion')}><ChevronLeft className="w-4 h-4" /> Atrás</BtnSecondary>
          <BtnPrimary onClick={() => setPhase('documentos')}>Continuar <ChevronRight className="w-4 h-4" /></BtnPrimary>
        </div>
      </div>
    ),

    documentos: (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-1 mb-1">Documentación</h2>
          <p className="text-sm text-text-3">Adjunte los documentos necesarios para la solicitud</p>
        </div>

        <div className="space-y-3">
          {[
            { cat: 'legal',     label: 'Documentos legales',    desc: 'Escrituras, estatutos, actas constitutivas' },
            { cat: 'fiscal',    label: 'Documentos fiscales',   desc: 'RUC, certificado tributario, declaraciones' },
            { cat: 'comercial', label: 'Contrato comercial',    desc: 'Contrato entre PYME y empresa contratante' },
            { cat: 'kyc',       label: 'Documentos KYC',        desc: 'DNI / Pasaporte del representante legal' },
          ].map(({ cat, label, desc }) => {
            const catDocs = uploadedDocs.filter(d => d.cat === cat);
            return (
              <div key={cat} className="border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-page-bg">
                  <div>
                    <div className="text-sm font-semibold text-text-1">{label}</div>
                    <div className="text-xs text-text-4">{desc}</div>
                  </div>
                  {catDocs.length > 0 && (
                    <span className="text-[10px] bg-green-bg text-green-text border border-green-border px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2">
                      {catDocs.length} archivo{catDocs.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="p-3 border-t border-border">
                  {catDocs.length > 0 && (
                    <div className="space-y-1.5 mb-2">
                      {catDocs.map(d => (
                        <div key={d.id} className="flex items-center gap-2 p-2 bg-green-bg rounded-lg border border-green-border">
                          <FileText className="w-4 h-4 text-green-text shrink-0" />
                          <span className="text-xs text-text-2 flex-1 truncate">{d.name}</span>
                          <button onClick={() => setUploadedDocs(p => p.filter(x => x.id !== d.id))} className="text-text-4 hover:text-red-500 cursor-pointer shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="block border-2 border-dashed border-border rounded-lg p-3 text-center cursor-pointer hover:border-[#e0201c] hover:bg-red-50 transition-all">
                    <input type="file" multiple className="hidden" onChange={e => { addDocCat(cat, e.target.files); e.target.value = ''; }} />
                    <Upload className="w-4 h-4 mx-auto mb-1 text-text-4" />
                    <div className="text-xs text-text-3">Seleccionar o arrastrar archivos</div>
                    <div className="text-[10px] text-text-5 mt-0.5">PDF, JPG, PNG — máx. 10 MB</div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between">
          <BtnSecondary onClick={() => setPhase('contrato')}><ChevronLeft className="w-4 h-4" /> Atrás</BtnSecondary>
          <BtnPrimary onClick={() => setPhase('revision')}>Enviar solicitud <ChevronRight className="w-4 h-4" /></BtnPrimary>
        </div>
      </div>
    ),

    revision: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: GRAD }}>
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-text-1 mb-1">Solicitud enviada</h2>
          <p className="text-sm text-text-3">Su solicitud está siendo procesada por el equipo de Bonafide</p>
        </div>

        <div className="space-y-2.5">
          {[
            { fase: 'Fase 7 · Validación Compliance', label: 'En revisión', desc: 'El equipo de Compliance analiza scoring, riesgo país y exposición acumulada.', active: true,  Icon: Clock },
            { fase: 'Fase 8 · Aprobación de línea',   label: 'Pendiente',   desc: 'Generación de límite de crédito, monto disponible y monto bloqueado.',            active: false, Icon: DollarSign },
            { fase: 'Fase 9 · Activación de wallet',  label: 'Pendiente',   desc: 'Creación de wallet por empresa, ledger asociado y límites operativos.',             active: false, Icon: Building2 },
            { fase: 'Fase 10 · Ejecución',             label: 'Pendiente',   desc: 'Inicio de operación financiera: desembolso directo o pago a proveedores.',         active: false, Icon: Check },
          ].map(({ fase, label, desc, active, Icon }, i) => (
            <div key={i} className={`flex gap-3 p-3 rounded-xl border ${active ? 'bg-yellow-bg border-yellow-text/30' : 'bg-page-bg border-border'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? '' : 'bg-white border border-border'}`} style={active ? { background: GRAD } : {}}>
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-text-4'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[10px] text-text-4 font-medium">{fase}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-orange-tint text-orange' : 'bg-border text-text-4'}`}>{label}</span>
                </div>
                <p className="text-xs text-text-3 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-blue-bg border border-blue-text/20 p-4">
          <div className="text-xs font-semibold text-blue-text mb-1.5">¿Qué ocurre ahora?</div>
          <ul className="text-xs text-text-3 space-y-1">
            {[
              'Recibirá una notificación por email cuando su solicitud sea aprobada o rechazada',
              'El plazo habitual de revisión es de 2-5 días hábiles',
              'Puede hacer seguimiento desde su panel de control una vez activado el acceso',
            ].map((t, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="shrink-0" style={{ color: '#e0201c' }}>•</span> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center p-3 bg-page-bg rounded-xl border border-border">
          <div className="text-[10px] text-text-4 uppercase tracking-wider mb-0.5">Número de referencia</div>
          <div className="font-mono font-bold text-text-1 text-sm">SOL-2026-{refNumber}</div>
        </div>

        <div className="flex justify-center">
          <BtnPrimary onClick={() => go('login')}>Volver al inicio</BtnPrimary>
        </div>
      </div>
    ),
  };

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-page-bg flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => go('login')} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-border transition-all text-text-3 cursor-pointer shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <img src={logo} alt="Bonafide" className="h-10 w-auto object-contain" />
          <div className="flex-1" />
          <span className="text-xs text-text-4 font-medium hidden sm:block">Solicitar Contrato</span>
        </div>

        {/* Stepper */}
        <Stepper step={step} />

        {/* Card */}
        <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm">
          {phases[phase] ?? null}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-4 mt-5">
          ¿Dudas? Contacte con Bonafide en{' '}
          <span className="font-medium" style={{ color: '#e0201c' }}>soporte@bonafide.gq</span>
        </p>
      </div>
    </div>
  );
}
