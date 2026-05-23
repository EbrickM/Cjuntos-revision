import { useState } from 'react';
import { DollarSign, Mail, Building2, Plus, Search, CheckCircle2, Edit, User } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';
import UploadZone from '../../components/ui/UploadZone';

const STEPS = ['Préstamo', 'Contratante', 'Proveedores', 'Distribución', 'Confirmar'];

function StepHeader({ current }) {
  return (
    <>
      <Stepper steps={STEPS} current={current} />
      <div className="text-[10px] font-semibold text-orange uppercase tracking-[1px] mb-1">
        PASO {current + 1} DE {STEPS.length}
      </div>
    </>
  );
}

export default function SolicitarPrestamo() {
  const { go } = useApp();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    monto: '120,000,000',
    contrato: 'CTR-2026-001',
    plazo: '12',
    // contratante
    contratante: 'TotalEnerGE',
    rucContratante: 'GE-2020-00567',
    repLegal: 'Jean-Pierre Obiang',
    emailContratante: 'jp.obiang@totalenerge.com',
    telContratante: '+240 222 111 444',
    // proveedores agregados
    proveedores: [
      { nombre: 'Cemex GE', ruc: 'GE-2019-00123', sector: 'Materiales', montoAsignado: '30,000,000' },
      { nombre: 'TransGE S.L.', ruc: 'GE-2020-00445', sector: 'Transporte', montoAsignado: '15,000,000' },
    ],
    // distribución
    reserva: '10,000,000',
    nomina: '25,000,000',
    proveedoresTotal: '75,000,000',
  });

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const calculoAnticipo = parseInt((data.monto || '0').replace(/,/g, '')) * 0.98;

  return (
    <AppShell active="epSolicitar" role="empresa-pequena" title="Solicitar Préstamo" sub={`Paso ${step + 1} de ${STEPS.length}`}>
      <div className="max-w-[720px] mx-auto fade-in">
        <StepHeader current={step} />

        {/* PASO 0: Datos del préstamo */}
        {step === 0 && (
          <>
            <div className="text-[20px] font-bold text-text-1 mb-1.5">Datos del préstamo</div>
            <div className="text-[13px] text-text-3 mb-7">Indica el monto y contrato que respalda tu solicitud</div>
            <div className="bg-white rounded-[14px] border border-border p-7">
              <div className="grid grid-cols-2 gap-x-4">
                <FormGroup label="Monto solicitado (XAF)" required className="col-span-2">
                  <Input value={data.monto} onChange={e => setData({...data, monto: e.target.value})} placeholder="120,000,000" />
                </FormGroup>
                <FormGroup label="Empresa contratante" required>
                  <Select value={data.contratante} onChange={e => setData({...data, contratante: e.target.value})}>
                    <option>TotalEnerGE</option>
                    <option>ConstrGE Corp.</option>
                  </Select>
                </FormGroup>
                <FormGroup label="Referencia del contrato" required>
                  <Input value={data.contrato} onChange={e => setData({...data, contrato: e.target.value})} placeholder="CTR-2026-XXX" />
                </FormGroup>
                <FormGroup label="Plazo del préstamo (meses)" required>
                  <Select value={data.plazo} onChange={e => setData({...data, plazo: e.target.value})}>
                    <option value="6">6 meses</option>
                    <option value="12">12 meses</option>
                    <option value="18">18 meses</option>
                    <option value="24">24 meses</option>
                  </Select>
                </FormGroup>
                <FormGroup label="Fecha de inicio del contrato" required>
                  <Input type="text" placeholder="01 / 05 / 2026" />
                </FormGroup>
                <FormGroup label="Adjuntar contrato (PDF)" required className="col-span-2">
                  <UploadZone label="Subir contrato firmado" hint="PDF · máx 10 MB" />
                </FormGroup>
                <FormGroup label="Adjuntar documento de domiciliación" required className="col-span-2">
                  <UploadZone label="Domiciliación bancaria del contratante" hint="PDF · máx 5 MB — Cuenta donde pagará el contratante" />
                </FormGroup>
              </div>
              <div className="bg-green-bg border border-green-border rounded-[12px] p-3.5 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-green-text font-semibold flex items-center gap-1.5">
                    <DollarSign size={16} className="text-green-text" />
                    Importe estimado del préstamo
                  </span>
                  <span className="text-[16px] font-extrabold text-green-text">XAF {calculoAnticipo.toLocaleString('es')}</span>
                </div>
                <div className="text-[11px] text-text-4 mt-1">Sujeto a aprobación Bonafide · Tasa preferencial PYME</div>
              </div>
            </div>
          </>
        )}

        {/* PASO 1: Datos del contratante */}
        {step === 1 && (
          <>
            <div className="text-[20px] font-bold text-text-1 mb-1.5">Datos del contratante</div>
            <div className="text-[13px] text-text-3 mb-2">Información de la empresa con quien tienes el contrato</div>
            <div className="bg-orange-tint border border-orange-border rounded-[12px] p-3 mb-6">
              <div className="text-[12px] font-bold text-orange mb-0.5">⚠ Importante</div>
              <div className="text-[11px] text-text-3 leading-[1.5]">
                Una vez aprobado el préstamo, estos datos no podrán modificarse. El contratante deberá verificar esta información antes de que Bonafide autorice el préstamo.
              </div>
            </div>
            <div className="bg-white rounded-[14px] border border-border p-7">
              <div className="grid grid-cols-2 gap-x-4">
                <FormGroup label="Nombre de la empresa contratante" required className="col-span-2">
                  <Input value={data.contratante} onChange={e => setData({...data, contratante: e.target.value})} />
                </FormGroup>
                <FormGroup label="RUC / NIF del contratante" required>
                  <Input value={data.rucContratante} onChange={e => setData({...data, rucContratante: e.target.value})} />
                </FormGroup>
                <FormGroup label="Sector">
                  <Select><option>Energía y Minería</option><option>Construcción</option><option>Gobierno</option></Select>
                </FormGroup>
                <FormGroup label="Representante legal" required>
                  <Input value={data.repLegal} onChange={e => setData({...data, repLegal: e.target.value})} placeholder="Nombre completo" />
                </FormGroup>
                <FormGroup label="Cargo del representante">
                  <Input type="text" placeholder="Director de Operaciones" />
                </FormGroup>
                <FormGroup label="Email del contratante" required>
                  <Input type="email" value={data.emailContratante} onChange={e => setData({...data, emailContratante: e.target.value})} />
                </FormGroup>
                <FormGroup label="Teléfono">
                  <Input type="text" value={data.telContratante} onChange={e => setData({...data, telContratante: e.target.value})} />
                </FormGroup>
                <FormGroup label="Monto del contrato (XAF)" required className="col-span-2">
                  <Input type="text" defaultValue="150,000,000" />
                </FormGroup>
                <FormGroup label="Fecha de inicio" required>
                  <Input type="text" defaultValue="01 / 05 / 2026" />
                </FormGroup>
                <FormGroup label="Fecha de fin">
                  <Input type="text" defaultValue="30 / 04 / 2027" />
                </FormGroup>
                <FormGroup label="Objeto del contrato" className="col-span-2">
                  <Textarea defaultValue="Construcción de infraestructura según especificaciones técnicas adjuntas." />
                </FormGroup>
              </div>
              <div className="bg-blue-bg border border-blue-text/20 rounded-[12px] p-3.5 mt-2">
                <div className="text-[11px] text-text-3 leading-[1.5] flex items-start gap-1.5">
                  <Mail size={14} className="text-text-3 flex-shrink-0 mt-0.5" />
                  <span>Se enviará una notificación a <strong>{data.emailContratante}</strong> para que verifique estos datos. Bonafide no autorizará el préstamo hasta recibir esa confirmación.</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PASO 2: Mis proveedores */}
        {step === 2 && (
          <>
            <div className="text-[20px] font-bold text-text-1 mb-1.5">Datos de tus proveedores</div>
            <div className="text-[13px] text-text-3 mb-7">Ingresa los proveedores a quienes pagarás con este préstamo. Podrás editar esta información después.</div>
            <div className="bg-white rounded-[14px] border border-border p-5 mb-4">
              {data.proveedores.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-page-bg rounded-[12px] mb-3 last:mb-0">
                  <div className="w-10 h-10 rounded-[10px] bg-orange-tint flex items-center justify-center text-orange font-bold text-[14px] shrink-0">
                    {p.nombre.slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-text-1">{p.nombre}</div>
                    <div className="text-[11px] text-text-4">{p.ruc} · {p.sector}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[13px] font-bold text-orange">XAF {p.montoAsignado}</div>
                    <div className="text-[11px] text-text-4">Asignado</div>
                  </div>
                  <Button variant="ghost" size="sm"><Edit size={16} /> Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => setData({...data, proveedores: data.proveedores.filter((_,j)=>j!==i)})}>✕</Button>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold mb-4">➕ Agregar proveedor</div>
              <div className="grid grid-cols-2 gap-x-4">
                <FormGroup label="Nombre del proveedor" required>
                  <Input type="text" placeholder="Nombre empresa" />
                </FormGroup>
                <FormGroup label="RUC / NIF" required>
                  <Input type="text" placeholder="GE-XXXX-XXXXX" />
                </FormGroup>
                <FormGroup label="Sector">
                  <Select><option>Materiales</option><option>Transporte</option><option>Servicios</option><option>Alimentación</option></Select>
                </FormGroup>
                <FormGroup label="Monto asignado (XAF)">
                  <Input type="text" placeholder="15,000,000" />
                </FormGroup>
                <FormGroup label="Email de contacto" className="col-span-2">
                  <Input type="email" placeholder="proveedor@empresa.com" />
                </FormGroup>
              </div>
              <Button variant="secondary" className="mt-2">+ Agregar proveedor</Button>
            </div>
          </>
        )}

        {/* PASO 3: Distribución del crédito */}
        {step === 3 && (
          <>
            <div className="text-[20px] font-bold text-text-1 mb-1.5">Distribución del crédito</div>
            <div className="text-[13px] text-text-3 mb-2">Planifica cómo distribuirás el préstamo. Podrás ajustar esto después.</div>
            <div className="bg-green-bg border border-green-border rounded-[12px] p-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-green-text font-semibold flex items-center gap-1.5">
                  <DollarSign size={16} className="text-green-text" />
                  Monto total del préstamo
                </span>
                <span className="text-[16px] font-extrabold text-green-text">XAF 120,000,000</span>
              </div>
            </div>
            <div className="bg-white rounded-[14px] border border-border p-7">
              <div className="flex flex-col gap-5">
                {[
                  { icon: 'BANK', lbl: 'Reserva', key: 'reserva', color: 'text-blue-text', desc: 'Fondo de contingencia y emergencias' },
                  { icon: 'WORKER', lbl: 'Nómina', key: 'nomina', color: 'text-orange', desc: 'Pago de personal y salarios' },
                  { icon: 'BUILD', lbl: 'Proveedores', key: 'proveedoresTotal', color: 'text-green-text', desc: 'Pagos a tus proveedores registrados' },
                ].map(({ icon, lbl, key, color, desc }) => {
                  let IconComp = Building2;
                  switch(icon) {
                    case 'BANK': IconComp = Building2; break;
                    case 'WORKER': IconComp = User; break;
                    case 'BUILD': IconComp = Building2; break;
                  }
                  return (
                  <div key={key} className="flex items-center gap-4 p-4 bg-page-bg rounded-[12px]">
                    <IconComp size={24} className="text-text-2" />
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-text-1">{lbl}</div>
                      <div className="text-[11px] text-text-4">{desc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-text-4">XAF</span>
                      <input
                        type="text"
                        value={data[key]}
                        onChange={e => setData({...data, [key]: e.target.value})}
                        className={`w-[140px] h-10 border border-input-border rounded-[8px] px-3 text-[14px] font-bold text-right outline-none focus:border-orange ${color}`}
                      />
                    </div>
                  </div>
                  );
                })}
              </div>
              <div className="mt-4 p-4 bg-orange-tint border border-orange-border rounded-[12px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[13px] font-semibold text-text-1">Total distribuido</span>
                  <span className="text-[16px] font-extrabold text-orange">XAF 110,000,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-text-4">Sin asignar</span>
                  <span className="text-[14px] font-bold text-yellow-text">XAF 10,000,000</span>
                </div>
                <div className="h-2 bg-orange-border rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-orange rounded-full" style={{width:'91.6%'}} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* PASO 4: Confirmación */}
        {step === 4 && (
          <>
            <div className="text-[20px] font-bold text-text-1 mb-1.5">Confirmar solicitud</div>
            <div className="text-[13px] text-text-3 mb-7">Revisa todos los datos antes de enviar</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-[14px] border border-border p-5">
                <div className="text-[13px] font-bold mb-4">Resumen del préstamo</div>
                {[['Monto solicitado','XAF 120,000,000'],['Contratante',data.contratante],['Contrato','CTR-2026-001'],['Plazo','12 meses'],['Proveedores registrados','2'],['Total distribuido','XAF 110,000,000']].map(([k,v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-[12px] text-text-4">{k}</span>
                    <span className="text-[13px] font-semibold text-text-1">{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="bg-white rounded-[14px] border border-border p-5 mb-4">
                  <div className="text-[13px] font-bold mb-3">¿Qué pasa ahora?</div>
                  {[['EMAIL','Notificación al contratante','< 1 hora'],['CHECK','Contratante verifica datos','1–2 días'],['SEARCH','Bonafide revisa y autoriza','< 72 horas'],['MONEY','Préstamo disponible en tu cuenta','Tras aprobación']].map(([type,lbl,t]) => {
                    let IconComp = Mail;
                    switch(type) {
                      case 'EMAIL': IconComp = Mail; break;
                      case 'CHECK': IconComp = CheckCircle2; break;
                      case 'SEARCH': IconComp = Search; break;
                      case 'MONEY': IconComp = DollarSign; break;
                    }
                    return (
                    <div key={lbl} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                      <IconComp size={18} className="text-orange" />
                      <span className="text-[12px] flex-1">{lbl}</span>
                      <span className="text-[11px] font-semibold text-orange">{t}</span>
                    </div>
                    );
                  })}
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer text-[13px] text-text-2 p-4 bg-orange-tint border border-orange-border rounded-[12px]">
                  <input type="checkbox" defaultChecked className="w-4 h-4 mt-0.5 accent-orange shrink-0" />
                  <span>Confirmo que los datos son correctos y autorizo a Bonafide Microbank a procesar esta solicitud de préstamo.</span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 gap-3">
          {step > 0
            ? <Button variant="ghost" className="h-12 min-w-[140px]" onClick={prev}>← Anterior</Button>
            : <div />
          }
          {step < STEPS.length - 1 ? (
            <Button variant="primary" className="h-12 min-w-[180px] text-[15px]" onClick={next}>
              Siguiente →
            </Button>
          ) : (
            <Button variant="primary" className="h-12 min-w-[220px] text-[15px]" onClick={() => go('epPrestamos')}>
              Enviar solicitud ✓
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
