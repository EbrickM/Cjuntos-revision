import { useState } from 'react';
import { ArrowLeft, ArrowRight, Lock, CheckCircle2, FileText, ClipboardList, Building2, Lightbulb, Camera } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';

const STEPS = ['Empresa', 'Documentos', 'Verificación', 'Listo'];

function WizardHeader({ step, onBack }) {
  const { go } = useApp();
  return (
    <div className="h-[60px] bg-white border-b border-border flex items-center px-4 sm:px-8 gap-3">
      <Button variant="ghost" size="sm" onClick={() => onBack ? onBack() : go('roleSelect')}><ArrowLeft size={14} className="mr-1" />Volver</Button>
      <span className="text-[15px] font-bold text-text-1 flex-1 text-center">Registro B-Morï</span>
      <span className="text-[12px] text-text-4">{step} de 4</span>
    </div>
  );
}

export function KycStep1() {
  const { go } = useApp();
  return (
    <div className="min-h-screen bg-page-bg fade-in">
      <WizardHeader step={1} />
      <div className="max-w-[580px] mx-auto py-10 px-5">
        <Stepper steps={STEPS} current={0} />
        <div className="text-[10px] font-semibold text-orange uppercase tracking-[1px] mb-1">PASO 1 DE 4</div>
        <div className="text-[20px] font-bold text-text-1 mb-1.5">Datos de tu empresa</div>
        <div className="text-[13px] text-text-3 mb-7">Cuéntanos sobre tu negocio</div>
        <div className="bg-white rounded-[14px] border border-border p-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Nombre legal de la empresa" required className="sm:col-span-2">
              <Input type="text" placeholder="Ej: Tradex Ltda." />
            </FormGroup>
            <FormGroup label="RUC / NIF" required>
              <Input type="text" placeholder="GE-2021-XXXXX" />
            </FormGroup>
            <FormGroup label="Sector de actividad" required>
              <Select><option>Construcción</option><option>Agricultura</option><option>Transporte</option><option>Tecnología</option><option>Comercio</option></Select>
            </FormGroup>
            <FormGroup label="Número de empleados">
              <Select><option>1–5</option><option>6–10</option><option>11–25</option><option>26–50</option><option>50+</option></Select>
            </FormGroup>
            <FormGroup label="Teléfono" required>
              <Input type="text" placeholder="+240 222 XXX XXX" />
            </FormGroup>
            <FormGroup label="Email corporativo" required className="sm:col-span-2">
              <Input type="email" placeholder="contacto@empresa.com" />
            </FormGroup>
          </div>
          <div className="bg-page-bg border border-border rounded-[12px] p-3.5 mt-2">
            <div className="text-[11px] text-text-3 flex items-center gap-1.5">
              <Lock size={12} className="text-text-3" />
              <span>Tus datos están protegidos bajo normativa COBAC/AML</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <Button variant="primary" className="h-[52px] w-full sm:w-auto sm:min-w-[180px] text-[15px]" onClick={() => go('kyc2')}>
            Siguiente <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function KycStep2() {
  const { go } = useApp();
  return (
    <div className="min-h-screen bg-page-bg fade-in">
      <WizardHeader step={2} onBack={() => go('kyc1')} />
      <div className="max-w-[580px] mx-auto py-10 px-5">
        <Stepper steps={STEPS} current={1} />
        <div className="text-[10px] font-semibold text-orange uppercase tracking-[1px] mb-1">PASO 2 DE 4</div>
        <div className="text-[20px] font-bold text-text-1 mb-1.5">Sube tus documentos</div>
        <div className="text-[13px] text-text-3 mb-7">Necesitamos verificar tu identidad</div>
        <div className="bg-white rounded-[14px] border border-border p-6 flex flex-col gap-3">
          {[['FILE','Cédula o Pasaporte','PDF, JPG · máx 5MB',false],['CLIPBOARD','Registro Comercial / RUC','PDF · máx 5MB',false],['BANK','Estado de cuenta bancario','Últimos 3 meses · PDF',true]].map(([ico,name,hint,done]) => (
            <div key={name} className={`flex items-center gap-3.5 p-3.5 border rounded-[12px] ${done ? 'border-green-border bg-green-bg' : 'border-border bg-white'}`}>
              <div className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center ${done ? 'bg-green-bg' : 'bg-page-bg'}`}>
                {done ? <CheckCircle2 size={20} className="text-green-text" /> : (() => {
                  switch(ico) {
                    case 'FILE': return <FileText size={20} className="text-text-2" />;
                    case 'CLIPBOARD': return <ClipboardList size={20} className="text-text-2" />;
                    case 'BANK': return <Building2 size={20} className="text-text-2" />;
                    default: return ico;
                  }
                })()}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-text-1">{name}</div>
                <div className="text-[11px] text-text-4">{done ? 'archivo_cargado.pdf · 2.4 MB' : hint}</div>
              </div>
              {done
                ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-bg text-green-text border border-green-border">Cargado</span>
                : <Button variant="ghost" size="sm">Subir +</Button>}
            </div>
          ))}
          <div className="bg-yellow-bg border border-yellow/40 rounded-[12px] p-3.5 mt-1">
            <div className="text-[12px] font-bold text-yellow-text mb-1 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-yellow" />
              <span>Consejos</span>
            </div>
            <div className="text-[11px] text-text-3 leading-[1.5]">• Asegúrate que los documentos sean legibles<br />• Formato válido: PDF, JPG, PNG<br />• Vigencia mínima: 3 meses</div>
          </div>
        </div>
        <div className="flex justify-between mt-5 gap-3">
          <Button variant="ghost" onClick={() => go('kyc1')}><ArrowLeft size={16} className="mr-2" />Anterior</Button>
          <Button variant="primary" className="h-[52px] sm:min-w-[180px] text-[15px]" onClick={() => go('kyc3')}>Siguiente <ArrowRight size={16} className="ml-2" /></Button>
        </div>
      </div>
    </div>
  );
}

export function KycStep3() {
  const { go } = useApp();
  const [captured, setCaptured] = useState(false);
  return (
    <div className="min-h-screen bg-page-bg fade-in">
      <WizardHeader step={3} onBack={() => go('kyc2')} />
      <div className="max-w-[580px] mx-auto py-10 px-5">
        <Stepper steps={STEPS} current={2} />
        <div className="text-[10px] font-semibold text-orange uppercase tracking-[1px] mb-1">PASO 3 DE 4</div>
        <div className="text-[20px] font-bold text-text-1 mb-1.5">Verificación de identidad</div>
        <div className="text-[13px] text-text-3 mb-7">Foto con tu documento de identidad</div>
        <div className="bg-white rounded-[14px] border border-border p-6">
          <div
            onClick={() => setCaptured(true)}
            className="border-2 border-dashed border-input-border rounded-[14px] p-10 text-center cursor-pointer bg-page-bg mb-5 hover:border-orange hover:bg-orange-tint"
          >
            {captured ? (
              <>
                <div className="mb-3"><CheckCircle2 size={48} className="text-green-text mx-auto" /></div>
                <div className="text-[14px] font-semibold text-green-text">Foto capturada correctamente</div>
              </>
            ) : (
              <>
                <div className="mb-3"><Camera size={48} className="text-text-3 mx-auto" /></div>
                <div className="text-[14px] font-semibold text-text-1 mb-1.5">Tomar selfie con cédula</div>
                <div className="text-[12px] text-text-4">Haz clic para simular captura</div>
              </>
            )}
          </div>
          <label className="flex items-start gap-2.5 cursor-pointer text-[13px] text-text-2">
            <input type="checkbox" className="w-4 h-4 mt-0.5 accent-orange" />
            <span>Autorizo el tratamiento de mis datos personales conforme a la normativa COBAC/AML y la política de privacidad de Bonafide Microbank.</span>
          </label>
        </div>
        <div className="flex justify-between mt-5 gap-3">
          <Button variant="ghost" onClick={() => go('kyc2')}><ArrowLeft size={16} className="mr-2" />Anterior</Button>
          <Button variant="primary" className="h-[52px] sm:min-w-[200px] text-[15px]" onClick={() => go('kyc4')}>Enviar solicitud KYC <ArrowRight size={16} className="ml-2" /></Button>
        </div>
      </div>
    </div>
  );
}

export function KycStep4() {
  const { go } = useApp();
  return (
    <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center fade-in">
      <div className="max-w-[480px] w-full px-6">
        <Stepper steps={STEPS} current={3} />
        <div className="flex flex-col items-center text-center py-10 px-7">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center mb-5 shadow-[0_8px_24px_rgba(224,32,28,0.3)]">
            <CheckCircle2 size={44} className="text-white" />
          </div>
          <div className="text-[22px] font-bold text-text-1 mb-2.5">¡Registro enviado!</div>
          <div className="text-[14px] text-text-3 leading-[1.7] max-w-[340px] mb-6">
            Tu solicitud está en revisión. Recibirás respuesta en 3–5 días hábiles por email y SMS.
          </div>
          <div className="bg-page-bg border border-border rounded-[12px] p-4 w-full text-left mb-6">
            {[['Nº de seguimiento','KYC-2026-04821'],['Estado','En revisión'],['Respuesta en','3–5 días hábiles']].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-[12px] text-text-4">{k}</span>
                <span className="text-[13px] font-semibold text-text-1 font-mono">{v}</span>
              </div>
            ))}
          </div>
          <Button variant="primary" full className="h-[52px] text-[15px]" onClick={() => go('epHome')}>
            Ir a mi cuenta <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
