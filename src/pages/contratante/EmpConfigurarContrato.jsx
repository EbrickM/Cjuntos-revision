import { useState } from 'react';
import {
  Landmark, Users, ClipboardCheck, ArrowLeft, ArrowRight, Plus, Pencil, Trash2,
  Building2, CheckCircle2, FileText,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';
import { InfoRow } from './contratanteShared';
import { BANCO_FONDEADORES } from '../../lib/bancos';
import { montoDisponibleMarco, pymes, fmt } from './contratanteData';
import { contratoService } from '../../services/contrato.service';

// ── CONFIGURAR CONTRATO (Subproceso 1 del BPMN: Contratante reparte el
// contrato-marco entre sus PYMEs y les asigna monto) ──────────────────────────

const STEPS  = ['Cuenta bancaria', 'PYMEs y montos', 'Revisión y envío'];
const PLAZOS = [30, 60, 90];

const EMAIL_REGEX  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PREFIJO_TEL  = '+240';

const ASIGNACION_EMPTY = {
  open: false, editId: null, pymeSel: '', pymeNombreLibre: '',
  plazoPago: 30, email: '', telefono: '', monto: '', documentoNombre: '',
};

const parseMonto = (str) => Number(String(str).replace(/[^\d]/g, '')) || 0;

// Ventana especializada: sin Sidebar ni Topbar del portal (igual que el
// KycWizard de onboarding) — el contratante queda enfocado solo en configurar
// este contrato, sin poder navegar a otras secciones mientras lo hace.
function WizardHeader({ marco, step, onExit }) {
  return (
    <div className="h-[60px] bg-white border-b border-border flex items-center px-4 sm:px-8 gap-3 shrink-0">
      <button onClick={onExit} className="flex items-center gap-1.5 text-[13px] font-medium text-text-3 hover:text-text-1 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" />Salir
      </button>
      <span className="text-[14px] sm:text-[15px] font-bold text-text-1 flex-1 text-center truncate">
        Configurar Contrato · {marco.id}
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

export default function EmpConfigurarContrato() {
  const { go, opts } = useApp();
  const marco = contratoService.obtener(opts?.marcoId) ?? contratoService.listarPendientes('contratante')[0] ?? null;

  const [step, setStep]               = useState(0);
  const [cuentaTipo, setCuentaTipo]   = useState(marco?.cuentaBancaria?.tipo ?? 'bonafide');
  const [cuentaBanco, setCuentaBanco] = useState(marco?.cuentaBancaria?.numero ?? '');
  const [asignaciones, setAsignaciones] = useState(marco?.pymesAsignadas ?? []);
  const [modal, setModal]             = useState(ASIGNACION_EMPTY);
  const [confirmado, setConfirmado]   = useState(false);
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviado, setEnviado]         = useState(false);

  if (!marco) {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center fade-in px-5">
        <p className="text-[13px] text-text-4 mb-4">No se encontró el contrato a configurar.</p>
        <Button variant="ghost" onClick={() => go('empContratos')}>
          <ArrowLeft className="w-4 h-4 mr-1" />Volver a Mis Contratos
        </Button>
      </div>
    );
  }

  const totalAsignado   = asignaciones.reduce((s, a) => s + a.monto, 0);
  const disponibleGlobal = marco.montoBase - totalAsignado;

  const pymeNombreResuelto = modal.pymeSel === '__nueva__' ? modal.pymeNombreLibre.trim() : modal.pymeSel;
  const montoNumLive       = parseMonto(modal.monto);
  const disponibleParaModal = montoDisponibleMarco({ ...marco, pymesAsignadas: asignaciones }, modal.editId);
  const montoInvalido      = modal.monto !== '' && (montoNumLive <= 0 || montoNumLive > disponibleParaModal);

  const emailLimpio        = modal.email.trim();
  const emailValido        = EMAIL_REGEX.test(emailLimpio);
  const emailInvalido      = emailLimpio !== '' && !emailValido;

  const telefonoLocal      = modal.telefono.replace(/\D/g, '');
  const telefonoValido     = /^\d{7,9}$/.test(telefonoLocal);
  const telefonoInvalido   = telefonoLocal !== '' && !telefonoValido;

  const puedeGuardar = !!pymeNombreResuelto && emailValido && telefonoValido && montoNumLive > 0 && !montoInvalido && !!modal.documentoNombre;

  const openAdd = () => {
    const primera = pymes[0] ?? null;
    setModal({
      ...ASIGNACION_EMPTY, open: true,
      pymeSel: primera?.nombre ?? '__nueva__',
      plazoPago: marco.plazoPagoDefault,
      email: primera?.correo ?? '',
      telefono: (primera?.telefono ?? '').replace(/\D/g, '').slice(0, 9),
    });
  };

  const openEdit = (a) => setModal({
    open: true, editId: a.id,
    pymeSel: a.pymeId ?? '__nueva__',
    pymeNombreLibre: a.pymeId ? '' : a.pymeNombre,
    plazoPago: a.plazoPago, email: a.email,
    telefono: (a.telefono ?? '').replace(/^\+?\s*240\s*/, ''),
    monto: String(a.monto), documentoNombre: a.documentoNombre ?? '',
  });

  const handleEliminar = (id) => setAsignaciones(prev => prev.filter(a => a.id !== id));

  const handleGuardarAsignacion = () => {
    if (!puedeGuardar) return;
    const nueva = {
      id: modal.editId ?? `ASG-${Date.now()}`,
      pymeNombre: pymeNombreResuelto,
      pymeId: modal.pymeSel === '__nueva__' ? null : modal.pymeSel,
      monto: montoNumLive,
      plazoPago: modal.plazoPago,
      email: modal.email.trim(),
      telefono: `${PREFIJO_TEL} ${telefonoLocal}`,
      documentoNombre: modal.documentoNombre || null,
    };
    setAsignaciones(prev => modal.editId ? prev.map(a => a.id === modal.editId ? nueva : a) : [...prev, nueva]);
    setModal(ASIGNACION_EMPTY);
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));
  const handleNext = () => setStep(s => Math.min(s + 1, 2));

  const handleEnviarClick = () => {
    setIntentoEnvio(true);
    if (!confirmado) return;
    try {
      contratoService.configurar(marco.id, {
        cuentaBancaria: cuentaTipo === 'bonafide'
          ? { tipo: 'bonafide', numero: null }
          : { tipo: 'fondeador', numero: cuentaBanco },
        pymesAsignadas: asignaciones,
      });
    } catch { /* la transición ya no aplica; se conserva el estado actual */ }
    setEnviado(true);
  };

  const siguienteDeshabilitado =
    (step === 0 && cuentaTipo === 'fondeador' && !cuentaBanco) ||
    (step === 1 && asignaciones.length === 0);

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
            Bonafide revisará la configuración del contrato {marco.id} y su distribución entre las PYMEs asignadas. Te notificaremos cuando el contrato esté activo.
          </p>
          <Button variant="primary" full className="h-[48px]" onClick={() => go('empContratos')}>
            Volver a Mis Contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg fade-in">
      <WizardHeader marco={marco} step={step} onExit={() => go('empContratos')} />
      <div className="max-w-[720px] mx-auto py-8 sm:py-10 px-4 sm:px-5 space-y-5">
        <p className="text-[12px] text-text-4 text-center mb-1">Monto base del contrato: <span className="font-semibold text-text-2">{fmt(marco.montoBase)} XAF</span></p>
        <Stepper steps={STEPS} current={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">

          {/* ── Paso 1: Cuenta bancaria ── */}
          {step === 0 && (
            <>
              <StepHeader icon={Landmark} title="Cuenta bancaria operativa" subtitle="Selecciona la cuenta desde la que operará este contrato" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-[12px] bg-page-bg">
                <InfoRow label="Monto base" value={`${fmt(marco.montoBase)} XAF`} />
                <InfoRow label="Interés" value={marco.interes} />
                <InfoRow label="Banco Fondeador" value={marco.bancoFondeador} />
                <InfoRow label="% Retención" value={`${marco.porcentajeRetencion}%`} />
                <InfoRow label="% Gestión de Cobranza" value={`${marco.porcentajeGestionCobranza}%`} />
                <InfoRow label="Fecha de creación" value={marco.fechaCreacion} />
              </div>

              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-[12px] border-2 cursor-pointer transition-all ${cuentaTipo === 'bonafide' ? 'border-orange bg-orange-tint/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="cuenta" checked={cuentaTipo === 'bonafide'} onChange={() => setCuentaTipo('bonafide')} className="w-4 h-4 accent-orange shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-text-1">Cuenta Bonafide existente</div>
                    <div className="text-[12px] text-text-4">Ya eres cliente Bonafide — usaremos tu cuenta registrada.</div>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-[12px] border-2 cursor-pointer transition-all ${cuentaTipo === 'fondeador' ? 'border-orange bg-orange-tint/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="cuenta" checked={cuentaTipo === 'fondeador'} onChange={() => setCuentaTipo('fondeador')} className="w-4 h-4 accent-orange shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-text-1">Cuenta en mi Banco Fondeador</div>
                    <div className="text-[12px] text-text-4">Selecciona el banco de tu cuenta para operar este contrato.</div>
                  </div>
                </label>
                {cuentaTipo === 'fondeador' && (
                  <FormGroup label="Banco" required className="mt-2 mb-0">
                    <Select value={cuentaBanco} onChange={e => setCuentaBanco(e.target.value)}>
                      <option value="">Seleccionar…</option>
                      {BANCO_FONDEADORES.map(b => <option key={b}>{b}</option>)}
                    </Select>
                  </FormGroup>
                )}
              </div>
            </>
          )}

          {/* ── Paso 2: PYMEs y montos ── */}
          {step === 1 && (
            <>
              <StepHeader icon={Users} title="PYMEs y montos asignados" subtitle="Agrega cada Empresa Contratada (PYME) y el monto que le corresponde" />

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-[10px] bg-page-bg text-center">
                  <div className="text-[15px] sm:text-[16px] font-extrabold text-text-1">{fmt(marco.montoBase)}</div>
                  <div className="text-[9px] sm:text-[10px] font-semibold text-text-4 uppercase tracking-wide">Monto base</div>
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
                  <Plus className="w-3.5 h-3.5" />Agregar PYME
                </Button>
              </div>

              <div className="space-y-3">
                {asignaciones.map(a => (
                  <div key={a.id} className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-[14px] border border-border">
                    <div className="w-10 h-10 rounded-[10px] bg-orange-tint flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-orange-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-text-1 truncate">{a.pymeNombre}</div>
                      <div className="text-[11px] text-text-4 truncate">{a.email} · Plazo {a.plazoPago} días{a.documentoNombre ? ` · ${a.documentoNombre}` : ''}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] sm:text-[14px] font-extrabold text-text-1">{fmt(a.monto)} XAF</div>
                    </div>
                    <div className="flex items-center gap-1 border-l border-border pl-2 sm:pl-3 shrink-0">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange-dark cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleEliminar(a.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {asignaciones.length === 0 && (
                  <div className="text-[12px] text-text-4 text-center py-8">Aún no agregaste ninguna PYME a este contrato.</div>
                )}
              </div>
            </>
          )}

          {/* ── Paso 3: Revisión y envío ── */}
          {step === 2 && (
            <>
              <StepHeader icon={ClipboardCheck} title="Revisión y envío" subtitle="Confirma los datos antes de enviarlos a Bonafide" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <InfoRow label="Cuenta bancaria" value={cuentaTipo === 'bonafide' ? 'Cuenta Bonafide existente' : `Banco Fondeador · ${cuentaBanco || '—'}`} />
                <InfoRow label="PYMEs agregadas" value={String(asignaciones.length)} />
              </div>

              <div className="rounded-[12px] border border-border overflow-hidden mb-5">
                <table className="w-full text-[12px]">
                  <thead className="bg-page-bg text-text-4">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">PYME</th>
                      <th className="text-left px-3 py-2 font-semibold">Plazo</th>
                      <th className="text-right px-3 py-2 font-semibold">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.map(a => (
                      <tr key={a.id} className="border-t border-border">
                        <td className="px-3 py-2 text-text-1 font-medium">{a.pymeNombre}</td>
                        <td className="px-3 py-2 text-text-4">{a.plazoPago} días</td>
                        <td className="px-3 py-2 text-right font-bold text-text-1">{fmt(a.monto)} XAF</td>
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
                  <span className="text-[13px] text-text-2">Confirmo que los datos de las PYMEs y los montos asignados son correctos.</span>
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

      {/* ── Modal: agregar/editar PYME ── */}
      {modal.open && (
        <Modal
          title={modal.editId ? 'Editar PYME / reasignar monto' : 'Agregar PYME'}
          onClose={() => setModal(ASIGNACION_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(ASIGNACION_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleGuardarAsignacion} disabled={!puedeGuardar}>Guardar</Button>
            </>
          }
        >
          <div className="space-y-4">
            <FormGroup label="PYME" required>
              <Select value={modal.pymeSel} onChange={e => {
                const v = e.target.value;
                const p = pymes.find(x => x.nombre === v);
                setModal(m => ({
                  ...m, pymeSel: v,
                  email: p?.correo ?? '',
                  telefono: (p?.telefono ?? '').replace(/\D/g, '').slice(0, 9),
                }));
              }}>
                {pymes.map(p => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
                <option value="__nueva__">Otra (nueva)…</option>
              </Select>
            </FormGroup>

            {modal.pymeSel === '__nueva__' && (
              <FormGroup label="Nombre de la nueva PYME" required>
                <Input value={modal.pymeNombreLibre} onChange={e => setModal(m => ({ ...m, pymeNombreLibre: e.target.value }))} placeholder="Nombre o RUC de la PYME" />
              </FormGroup>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Plazo de pago" required className="mb-0">
                <Select value={modal.plazoPago} onChange={e => setModal(m => ({ ...m, plazoPago: Number(e.target.value) }))}>
                  {PLAZOS.map(p => <option key={p} value={p}>{p} días</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Monto (XAF)" required className="mb-0">
                <Input
                  inputMode="numeric"
                  value={modal.monto}
                  onChange={e => setModal(m => ({ ...m, monto: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Ej. 50000000"
                  className={montoInvalido ? '!border-red-400 focus:!border-red-500' : ''}
                />
              </FormGroup>
            </div>
            {montoInvalido && (
              <p className="text-xs text-red-500 -mt-2">
                {montoNumLive <= 0 ? 'Ingresa un monto válido.' : `El monto supera el disponible (${fmt(disponibleParaModal)} XAF).`}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormGroup label="Email" required className="mb-0">
                  <Input type="email" value={modal.email} onChange={e => setModal(m => ({ ...m, email: e.target.value }))} placeholder="contacto@pyme.gq" className={emailInvalido ? '!border-red-400 focus:!border-red-500' : ''} />
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

            <FormGroup label="Contrato Comercial (documentación adjunta)" required className="mb-0">
              {modal.documentoNombre ? (
                <div className="border-2 border-solid border-green-border bg-green-bg rounded-[12px] p-5 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-text mx-auto mb-1.5" />
                  <div className="text-[12px] font-semibold text-green-text truncate">{modal.documentoNombre}</div>
                  <button type="button" onClick={() => setModal(m => ({ ...m, documentoNombre: '' }))} className="mt-2 text-[11px] text-red-text underline cursor-pointer">
                    Quitar y elegir otro
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-input-border bg-page-bg hover:border-orange hover:bg-orange-tint rounded-[12px] p-5 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) setModal(m => ({ ...m, documentoNombre: f.name }));
                    }}
                  />
                  <FileText className="w-6 h-6 text-text-4 mx-auto mb-1.5" />
                  <div className="text-[13px] font-semibold text-text-1">Subir contrato comercial</div>
                  <div className="text-[11px] text-text-4">PDF · JPG · PNG · máx 5MB</div>
                </label>
              )}
              {!modal.documentoNombre && (
                <p className="text-xs text-red-500">Adjunta el contrato comercial para poder guardar la asignación.</p>
              )}
            </FormGroup>
          </div>
        </Modal>
      )}
    </div>
  );
}
