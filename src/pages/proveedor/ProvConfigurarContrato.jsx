import { useState, useEffect } from 'react';
import {
  Landmark, Truck, ClipboardCheck, ArrowLeft, ArrowRight, Plus, Pencil,
  Trash2, CheckCircle2, FileText,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';
import { montoDisponibleProveedores, suministradores as directorioSuministradores, fmt } from './provData';
import { contratoService } from '../../services/contrato.service';
import { BANCO_FONDEADORES } from '../../lib/bancos';

// ── CONFIGURAR CONTRATO (Subproceso 3 del BPMN: el Proveedor reparte el
// monto que le asignó la PYME entre sus propios Suministradores) ────────────

const STEPS = ['Cuenta bancaria', 'Suministradores', 'Revisión y envío'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PREFIJO_TEL = '+240';

const SUMINISTRADOR_EMPTY = {
  open: false, editId: null, sumSel: '', suministradorLibre: '',
  email: '', telefono: '', monto: '', nominaDoc: '',
};

const parseMonto = (str) => Number(String(str).replace(/[^\d]/g, '')) || 0;

// Vista en vivo en el input: el estado guarda solo dígitos, el campo muestra
// el monto agrupado con puntos (3.000.000) mientras se escribe.
const fmtMonto = (digits) => {
  const n = Number(String(digits ?? '').replace(/\D/g, ''));
  return n ? fmt(n) : '';
};

function WizardHeader({ contrato, step, onExit }) {
  return (
    <div className="h-[60px] bg-white border-b border-border flex items-center px-4 sm:px-8 gap-3 shrink-0">
      <button onClick={onExit} className="flex items-center gap-1.5 text-[13px] font-medium text-text-3 hover:text-text-1 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" />Salir
      </button>
      <span className="text-[14px] sm:text-[15px] font-bold text-text-1 flex-1 text-center truncate">
        Configurar Contrato · {contrato.id}
      </span>
      <span className="text-[12px] text-text-4 shrink-0">Paso {step + 1} de 3</span>
    </div>
  );
}

function StepHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: 'var(--bonafide-gradient)' }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-[17px] sm:text-[18px] font-bold text-text-1 leading-tight">{title}</h2>
          {subtitle && <p className="text-[12px] sm:text-[13px] text-text-4">{subtitle}</p>}
        </div>
      </div>
      <div className="h-1 w-20 rounded-full" style={{ background: 'var(--bonafide-gradient)' }} />
    </div>
  );
}

export default function ProvConfigurarContrato() {
  const { go, opts } = useApp();
  const contrato = contratoService.obtener(opts?.contratoId)
    ?? contratoService.listarPendientes('proveedor')[0]
    ?? contratoService.listarPorVista('proveedor')[0]
?? null;

  useEffect(() => {
    if (!contrato) go('provContratos');
  }, [contrato, go]);

  const [step, setStep]                 = useState(0);
  const [cuentaTipo, setCuentaTipo]     = useState(contrato?.cuentaBancaria?.tipo ?? 'bonafide');
  const [cuentaBanco, setCuentaBanco]   = useState(contrato?.cuentaBancaria?.numero ?? '');
  const [suministradores, setSuministradores] = useState(contrato?.suministradoresAsignados ?? []);
  const [modal, setModal]               = useState(SUMINISTRADOR_EMPTY);
  const [confirmado, setConfirmado]     = useState(false);
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviado, setEnviado]           = useState(false);

  if (!contrato) return null;

  const totalAsignado    = suministradores.reduce((s, x) => s + x.monto, 0);
  const disponibleGlobal = contrato.montoAsignado - totalAsignado;

  const montoNumLive        = parseMonto(modal.monto);
  const disponibleParaModal = montoDisponibleProveedores({ ...contrato, suministradoresAsignados: suministradores }, modal.editId);
  const montoInvalido       = modal.monto !== '' && (montoNumLive <= 0 || montoNumLive > disponibleParaModal);

  const suministradorNombreResuelto = modal.sumSel === '__nueva__' ? modal.suministradorLibre.trim() : modal.sumSel;

  const emailLimpio        = modal.email.trim();
  const emailValido        = EMAIL_REGEX.test(emailLimpio);
  const emailInvalido      = emailLimpio !== '' && !emailValido;

  const telefonoLocal      = modal.telefono.replace(/\D/g, '');
  const telefonoValido     = /^\d{7,9}$/.test(telefonoLocal);
  const telefonoInvalido   = telefonoLocal !== '' && !telefonoValido;

  const puedeGuardar = !!suministradorNombreResuelto && emailValido && telefonoValido && montoNumLive > 0 && !montoInvalido;

  const openAdd  = () => {
    const primera = directorioSuministradores[0] ?? null;
    setModal({
      ...SUMINISTRADOR_EMPTY, open: true,
      sumSel: primera?.nombre ?? '__nueva__',
      email: primera?.correo ?? '',
      telefono: (primera?.telefono ?? '').replace(/\D/g, '').slice(0, 9),
    });
  };
  const openEdit = (s) => {
    const enDirectorio = directorioSuministradores.some(x => x.nombre === s.nombre);
    setModal({
      open: true, editId: s.id,
      sumSel: enDirectorio ? s.nombre : '__nueva__',
      suministradorLibre: enDirectorio ? '' : s.nombre,
      email: s.email, telefono: (s.telefono ?? '').replace(/^\+?\s*240\s*/, ''),
      monto: String(s.monto), nominaDoc: s.nominaDoc ?? '',
    });
  };

  const handleEliminar = (id) => setSuministradores(prev => prev.filter(s => s.id !== id));

  const handleGuardarSuministrador = () => {
    if (!puedeGuardar) return;
    const nuevo = {
      id: modal.editId ?? `SUM-${Date.now()}`,
      nombre: suministradorNombreResuelto, email: modal.email.trim(),
      telefono: `${PREFIJO_TEL} ${telefonoLocal}`,
      monto: montoNumLive, cargaNomina: !!modal.nominaDoc, nominaDoc: modal.nominaDoc || null,
    };
    setSuministradores(prev => modal.editId ? prev.map(s => s.id === modal.editId ? nuevo : s) : [...prev, nuevo]);
    setModal(SUMINISTRADOR_EMPTY);
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));
  const handleNext = () => setStep(s => Math.min(s + 1, 2));

  const handleEnviarClick = () => {
    setIntentoEnvio(true);
    if (!confirmado) return;
    try {
      contratoService.configurar(contrato.id, {
        cuentaBancaria: cuentaTipo === 'bonafide'
          ? { tipo: 'bonafide', numero: null }
          : { tipo: 'banco', numero: cuentaBanco },
        suministradoresAsignados: suministradores,
      });
    } catch { /* la transición ya no aplica; se conserva el estado actual */ }
    setEnviado(true);
  };

  const siguienteDeshabilitado =
    (step === 0 && cuentaTipo === 'banco' && !cuentaBanco) ||
    (step === 1 && suministradores.length === 0);

  // ── Pantalla de éxito ──
  if (enviado) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center fade-in px-5">
        <div className="max-w-[480px] w-full flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'var(--bonafide-gradient)' }}>
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-[20px] font-bold text-text-1 mb-2">Contrato enviado a revisión</h2>
          <p className="text-[13px] text-text-3 leading-relaxed mb-6">
            Bonafide revisará la configuración del contrato {contrato.id} y su distribución entre tus suministradores. Te notificaremos cuando el contrato esté activo.
          </p>
          <Button variant="primary" full className="h-[48px]" onClick={() => go('provContratos')}>
            Volver a Mis Contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg fade-in">
      <WizardHeader contrato={contrato} step={step} onExit={() => go('provContratos')} />
      <div className="max-w-[720px] mx-auto py-8 sm:py-10 px-4 sm:px-5 space-y-5">
        <p className="text-[12px] text-text-4 text-center mb-1">Monto asignado por {contrato.pymeNombre}: <span className="font-semibold text-text-2">{fmt(contrato.montoAsignado)} XAF</span></p>
        <Stepper steps={STEPS} current={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">

          {/* ── Paso 1: Cuenta bancaria ── */}
          {step === 0 && (
            <>
              <StepHeader icon={Landmark} title="Cuenta Bancaria Operativa" subtitle="Selecciona la cuenta desde la que operará este contrato" />
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-[12px] border-2 cursor-pointer transition-all ${cuentaTipo === 'bonafide' ? 'border-orange bg-orange-tint/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="cuenta" checked={cuentaTipo === 'bonafide'} onChange={() => setCuentaTipo('bonafide')} className="w-4 h-4 accent-orange shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-text-1">Cuenta Bonafide existente</div>
                    <div className="text-[12px] text-text-4">Ya eres cliente Bonafide — usaremos tu cuenta registrada.</div>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-[12px] border-2 cursor-pointer transition-all ${cuentaTipo === 'banco' ? 'border-orange bg-orange-tint/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="cuenta" checked={cuentaTipo === 'banco'} onChange={() => setCuentaTipo('banco')} className="w-4 h-4 accent-orange shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-text-1">Cuenta en mi Banco</div>
                    <div className="text-[12px] text-text-4">Selecciona tu banco para operar con tu cuenta.</div>
                  </div>
                </label>
                {cuentaTipo === 'banco' && (
                  <FormGroup label="Banco" required className="mt-2 mb-0">
                    <Select value={cuentaBanco} onChange={e => setCuentaBanco(e.target.value)}>
                      <option value="">Seleccionar…</option>
                      {BANCO_FONDEADORES.filter(b => b !== 'Bonafide').map(b => <option key={b}>{b}</option>)}
                    </Select>
                  </FormGroup>
                )}
              </div>
            </>
          )}

          {/* ── Paso 2: Suministradores y Montos ── */}
          {step === 1 && (
            <>
              <StepHeader icon={Truck} title="Suministradores y Montos" subtitle="Registra tus suministradores y el monto que le corresponde a cada uno" />

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-[10px] bg-page-bg text-center">
                  <div className="text-[15px] sm:text-[16px] font-extrabold text-text-1">{fmt(contrato.montoAsignado)}</div>
                  <div className="text-[9px] sm:text-[10px] font-semibold text-text-4 uppercase tracking-wide">Monto asignado</div>
                </div>
                <div className="p-3 rounded-[10px] bg-page-bg text-center">
                  <div className="text-[15px] sm:text-[16px] font-extrabold text-orange">{fmt(totalAsignado)}</div>
                  <div className="text-[9px] sm:text-[10px] font-semibold text-text-4 uppercase tracking-wide">Asignado</div>
                </div>
                <div className="p-3 rounded-[10px] bg-page-bg text-center">
                  <div className="text-[15px] sm:text-[16px] font-extrabold text-green-text">{fmt(disponibleGlobal)}</div>
                  <div className="text-[9px] sm:text-[10px] font-semibold text-text-4 uppercase tracking-wide">Disponible</div>
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <Button variant="primary" size="sm" onClick={openAdd} disabled={disponibleGlobal <= 0}>
                  <Plus className="w-3.5 h-3.5" />Agregar Suministrador
                </Button>
              </div>

              <div className="space-y-3">
                {suministradores.map(s => (
                  <div key={s.id} className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-[14px] border border-border">
                    <div className="w-10 h-10 rounded-[10px] bg-orange-tint flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-orange-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-text-1 truncate">{s.nombre}</div>
                      <div className="text-[11px] text-text-4 truncate">{s.email}{s.cargaNomina ? ' · Con nómina' : ''}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] sm:text-[14px] font-extrabold text-text-1">{fmt(s.monto)} XAF</div>
                    </div>
                    <div className="flex items-center gap-1 border-l border-border pl-2 sm:pl-3 shrink-0">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange-dark cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleEliminar(s.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {suministradores.length === 0 && (
                  <div className="text-[12px] text-text-4 text-center py-8">Aún no agregaste ningún suministrador.</div>
                )}
              </div>
            </>
          )}

          {/* ── Paso 3: Revisión y Envío ── */}
          {step === 2 && (
            <>
              <StepHeader icon={ClipboardCheck} title="Revisión y Envío" subtitle="Confirma los datos antes de enviarlos a Bonafide" />

              <div className="rounded-[12px] border border-border overflow-hidden mb-5">
                <table className="w-full text-[12px]">
                  <thead className="bg-page-bg">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-text-4">Suministrador</th>
                      <th className="text-right px-3 py-2 font-semibold text-text-4">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suministradores.map(s => (
                      <tr key={s.id} className="border-t border-border">
                        <td className="px-3 py-2 text-text-1 font-medium">{s.nombre}</td>
                        <td className="px-3 py-2 text-right font-bold text-text-1">{fmt(s.monto)} XAF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-[10px] bg-page-bg text-center">
                  <div className="text-[16px] font-extrabold text-orange">{fmt(totalAsignado)}</div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">Total asignado</div>
                </div>
                <div className="p-3 rounded-[10px] bg-page-bg text-center">
                  <div className="text-[16px] font-extrabold text-green-text">{fmt(disponibleGlobal)}</div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">Disponible restante</div>
                </div>
              </div>

              <div className={`rounded-[12px] border-2 p-5 transition-colors ${intentoEnvio && !confirmado ? 'border-red-400' : 'border-gray-200'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={confirmado} onChange={e => setConfirmado(e.target.checked)} className="mt-0.5 w-5 h-5 accent-orange cursor-pointer shrink-0" />
                  <span className="text-[13px] text-text-2">Confirmo que los datos de mis suministradores son correctos.</span>
                </label>
                {intentoEnvio && !confirmado && (
                  <p className="text-xs text-red-500 mt-2 ml-8">Debes confirmar antes de enviar.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Navegación ── */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
            <ArrowLeft className="w-4 h-4 mr-1" />Atrás
          </Button>
          {step < 2 ? (
            <Button variant="primary" onClick={handleNext} disabled={siguienteDeshabilitado}>
              Siguiente<ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleEnviarClick}>
              Enviar a revisión<CheckCircle2 className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Modal: agregar/editar suministrador ── */}
      {modal.open && (
        <Modal
          title={modal.editId ? 'Editar suministrador / reasignar monto' : 'Agregar Suministrador'}
          onClose={() => setModal(SUMINISTRADOR_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(SUMINISTRADOR_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleGuardarSuministrador} disabled={!puedeGuardar}>Guardar</Button>
            </>
          }
        >
          <div className="space-y-4">
            <FormGroup label="Suministrador" required>
              <Select value={modal.sumSel} onChange={e => {
                const v = e.target.value;
                const p = directorioSuministradores.find(x => x.nombre === v);
                setModal(m => ({
                  ...m, sumSel: v,
                  email: p?.correo ?? '',
                  telefono: (p?.telefono ?? '').replace(/\D/g, '').slice(0, 9),
                }));
              }}>
                {directorioSuministradores.map(p => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
                <option value="__nueva__">Otro (nuevo)…</option>
              </Select>
            </FormGroup>

            {modal.sumSel === '__nueva__' && (
              <FormGroup label="Nombre del nuevo suministrador" required>
                <Input value={modal.suministradorLibre} onChange={e => setModal(m => ({ ...m, suministradorLibre: e.target.value }))} placeholder="Nombre o razón social" />
              </FormGroup>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormGroup label="Email" required className="mb-0">
                  <Input type="email" value={modal.email} onChange={e => setModal(m => ({ ...m, email: e.target.value }))} placeholder="contacto@suministrador.gq" className={emailInvalido ? '!border-red-400 focus:!border-red-500' : ''} />
                </FormGroup>
                {emailInvalido && <p className="text-xs text-red-500 -mt-2">Ingresa un correo electrónico válido.</p>}
              </div>
              <div>
                <FormGroup label="Teléfono" required className="mb-0">
                  <div className="flex">
                    <span className="flex items-center h-12 px-3 border-2 border-r-0 border-gray-200 rounded-l-[8px] bg-[#fafafa] text-[14px] font-semibold text-text-2">
                      {PREFIJO_TEL}
                    </span>
                    <Input
                      type="tel" inputMode="numeric"
                      value={telefonoLocal.slice(0, 9)}
                      onChange={e => setModal(m => ({ ...m, telefono: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                      placeholder="222 XXX XXX"
                      className={`!rounded-l-none ${telefonoInvalido ? '!border-red-400 focus:!border-red-500' : ''}`}
                    />
                  </div>
                </FormGroup>
                {telefonoInvalido && <p className="text-xs text-red-500 -mt-2">El teléfono debe tener entre 7 y 9 dígitos.</p>}
              </div>
            </div>

            <FormGroup label="Presupuesto / Factura (XAF)" required>
              <Input
                inputMode="numeric"
                value={fmtMonto(modal.monto)}
                onChange={e => setModal(m => ({ ...m, monto: e.target.value.replace(/\D/g, '') }))}
                placeholder="Ej. 3.000.000"
                className={montoInvalido ? '!border-red-400 focus:!border-red-500' : ''}
              />
            </FormGroup>
            {montoInvalido && (
              <p className="text-xs text-red-500 -mt-2">
                {montoNumLive <= 0 ? 'Ingresa un monto válido.' : `El monto supera el disponible (${fmt(disponibleParaModal)} XAF).`}
              </p>
            )}

            <FormGroup label="Nómina del suministrador (opcional)" className="mb-0">
              {modal.nominaDoc ? (
                <div className="flex items-center justify-between gap-2 border-2 border-solid border-green-border bg-green-bg rounded-[10px] px-3 py-2.5">
                  <span className="flex items-center gap-2 text-[12px] font-medium text-green-text truncate">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />{modal.nominaDoc}
                  </span>
                  <button type="button" onClick={() => setModal(m => ({ ...m, nominaDoc: '' }))} className="text-[11px] text-red-text underline shrink-0 cursor-pointer">
                    Quitar
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2.5 border border-dashed border-border rounded-[10px] px-3 py-2.5 text-[12px] text-text-4 cursor-pointer hover:border-orange/40 hover:bg-orange-tint transition">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) setModal(m => ({ ...m, nominaDoc: f.name }));
                    }}
                  />
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Subir nómina de este suministrador (PDF o imagen)</span>
                </label>
              )}
            </FormGroup>
          </div>
        </Modal>
      )}
    </div>
  );
}
