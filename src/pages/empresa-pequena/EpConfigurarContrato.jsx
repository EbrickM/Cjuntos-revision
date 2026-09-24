import { useState, useEffect } from 'react';
import {
  FileCheck, Wallet, Truck, ClipboardCheck, ArrowLeft, ArrowRight, Plus,
  Pencil, Trash2, CheckCircle2, AlertTriangle, Save,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';
import { montoDisponibleProveedores, fmt, initialProviders } from './epData';
import { contratoService } from '../../services/contrato.service';
import { obtenerBorrador, guardarBorrador, eliminarBorrador } from '../../lib/borradores';

// ── CONFIGURAR CONTRATO (Subproceso 2 del BPMN: la PYME acepta los términos,
// decide cómo gestiona sus fondos y reparte el monto asignado entre sus
// propios Proveedores) ─────────────────────────────────────────────────────

const STEPS = ['Términos', 'Gestión de Fondos', 'Proveedores', 'Simulación'];

const PROVEEDOR_EMPTY = {
  open: false, editId: null, provSel: '', proveedorNombreLibre: '',
  email: '', telefono: '', monto: '',
};

const parseMonto = (str) => Number(String(str).replace(/[^\d]/g, '')) || 0;

// Vista en vivo en el input: el estado guarda solo dígitos, el campo muestra
// el monto agrupado con puntos (5.000.000) mientras se escribe.
const fmtMonto = (digits) => {
  const n = Number(String(digits ?? '').replace(/\D/g, ''));
  return n ? fmt(n) : '';
};

// Ventana especializada: sin Sidebar ni Topbar del portal (mismo criterio que
// EmpConfigurarContrato.jsx del lado Contratante) — la PYME queda enfocada
// solo en configurar este contrato.
function WizardHeader({ contrato, step, onExit }) {
  return (
    <div className="h-[60px] bg-white border-b border-border flex items-center px-4 sm:px-8 gap-3 shrink-0">
      <button onClick={onExit} className="flex items-center gap-1.5 text-[13px] font-medium text-text-3 hover:text-text-1 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" />Salir
      </button>
      <span className="text-[14px] sm:text-[15px] font-bold text-text-1 flex-1 text-center truncate">
        Configurar Contrato · {contrato.id}
      </span>
      <span className="text-[12px] text-text-4 shrink-0">Paso {step + 1} de 4</span>
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

export default function EpConfigurarContrato() {
  const { go, opts } = useApp();
  const contrato = contratoService.obtener(opts?.contratoId) ?? contratoService.listarPendientes('pyme')[0] ?? null;
  const borrador = contrato ? obtenerBorrador('pyme', contrato.id) : null;

  useEffect(() => {
    if (!contrato) go('epCreditos');
  }, [contrato, go]);

  const [modo, setModo]                 = useState('wizard'); // 'wizard' | 'rechazado' | 'enviado'
  // Solo se retoma el paso del borrador cuando se entra explícitamente desde
  // "Continuar" en la pestaña Borradores; cualquier otra entrada siempre
  // arranca en el paso 1 (Términos).
  const [step, setStep]                 = useState(opts?.desdeBorrador ? (borrador?.paso ?? 0) : 0);
  const [mostrarRechazo, setMostrarRechazo] = useState(false);
  const [comentarioRechazo, setComentarioRechazo] = useState('');
  const [gestionFondos, setGestionFondos] = useState(borrador?.datos?.gestionFondos ?? contrato?.gestionFondos ?? null);
  const [proveedores, setProveedores]   = useState(borrador?.datos?.proveedores ?? contrato?.proveedoresAsignados ?? []);
  const [modal, setModal]               = useState(PROVEEDOR_EMPTY);
  const [confirmado, setConfirmado]     = useState(borrador?.datos?.confirmado ?? false);
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [toast, setToast]               = useState(null);

  if (!contrato) return null;

  const totalAsignado    = proveedores.reduce((s, p) => s + p.monto, 0);
  const disponibleGlobal = contrato.montoAsignado - totalAsignado;

  const montoNumLive        = parseMonto(modal.monto);
  const disponibleParaModal = montoDisponibleProveedores({ ...contrato, proveedoresAsignados: proveedores }, modal.editId);
  const montoInvalido       = modal.monto !== '' && (montoNumLive <= 0 || montoNumLive > disponibleParaModal);
  const proveedorNombreResuelto = modal.provSel === '__nueva__' ? modal.proveedorNombreLibre.trim() : modal.provSel;
  // Proveedor ya conocido (elegido del directorio, o el nombre libre coincide
  // con uno existente) — su email/teléfono vienen de su perfil y no se editan aquí.
  const provExistente = modal.provSel !== '__nueva__' || initialProviders.some(x =>
    x.razonSocial.toLowerCase() === modal.proveedorNombreLibre.trim().toLowerCase() ||
    (x.nombreComercial || '').toLowerCase() === modal.proveedorNombreLibre.trim().toLowerCase());
  const puedeGuardar        = !!proveedorNombreResuelto && modal.email.trim() && modal.telefono.trim() && montoNumLive > 0 && !montoInvalido;

  const retencionCalc = contrato.montoAsignado * (contrato.porcentajeRetencion / 100);
  const gestionCalc   = contrato.montoAsignado * (contrato.porcentajeGestionCobranza / 100);

  const openAdd  = () => {
    const primera = initialProviders[0] ?? null;
    setModal({
      ...PROVEEDOR_EMPTY, open: true,
      provSel: primera?.razonSocial ?? '__nueva__',
      email: primera?.email ?? '',
      telefono: primera?.telefono ?? '',
    });
  };
  const openEdit = (p) => {
    const enDirectorio = initialProviders.some(x => x.razonSocial === p.nombre);
    setModal({
      open: true, editId: p.id,
      provSel: enDirectorio ? p.nombre : '__nueva__',
      proveedorNombreLibre: enDirectorio ? '' : p.nombre,
      email: p.email, telefono: p.telefono,
      monto: String(p.monto),
    });
  };

  const handleEliminar = (id) => setProveedores(prev => prev.filter(p => p.id !== id));

  const handleGuardarProveedor = () => {
    if (!puedeGuardar) return;
    const nuevo = {
      id: modal.editId ?? `PROV-${Date.now()}`,
      nombre: proveedorNombreResuelto, email: modal.email.trim(), telefono: modal.telefono.trim(),
      monto: montoNumLive,
    };
    setProveedores(prev => modal.editId ? prev.map(p => p.id === modal.editId ? nuevo : p) : [...prev, nuevo]);
    setModal(PROVEEDOR_EMPTY);
  };

  const handleAceptarTerminos = () => setStep(1);

  const handleConfirmarRechazo = () => {
    if (!comentarioRechazo.trim()) return;
    try {
      contratoService.rechazarTerminos(contrato.id, comentarioRechazo.trim());
    } catch { /* la transición ya no aplica; se conserva el estado actual */ }
    setModo('rechazado');
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  const handleNext = () => setStep(s => Math.min(s + 1, 3));

  const handleGuardarBorrador = () => {
    guardarBorrador({
      rol: 'pyme',
      contratoId: contrato.id,
      paso: step,
      datos: { gestionFondos, proveedores, confirmado },
    });
    setToast({ type: 'success', message: `Borrador del contrato ${contrato.id} guardado. Quedaste en el paso ${step + 1} de ${STEPS.length}.` });
  };

  const handleEnviarClick = () => {
    setIntentoEnvio(true);
    if (!confirmado) return;
    try {
      contratoService.configurar(contrato.id, { gestionFondos, proveedoresAsignados: proveedores });
    } catch { /* la transición ya no aplica; se conserva el estado actual */ }
    eliminarBorrador('pyme', contrato.id);
    setModo('enviado');
  };

  const siguienteDeshabilitado = step === 1 && !gestionFondos;

  // ── Pantalla: términos rechazados ──
  if (modo === 'rechazado') {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center fade-in px-5">
        <div className="max-w-[480px] w-full flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-yellow-bg">
            <AlertTriangle className="w-10 h-10 text-yellow-text" />
          </div>
          <h2 className="text-[20px] font-bold text-text-1 mb-2">Términos en discusión</h2>
          <p className="text-[13px] text-text-3 leading-relaxed mb-6">
            Registramos tu desacuerdo con los términos del contrato {contrato.id}. Bonafide se pondrá en contacto con {contrato.contratanteNombre} y contigo para resolverlo.
          </p>
          <Button variant="primary" full className="h-[48px]" onClick={() => go('epCreditos')}>
            Volver a Mis Contratos
          </Button>
        </div>
      </div>
    );
  }

  // ── Pantalla de éxito ──
  if (modo === 'enviado') {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center fade-in px-5">
        <div className="max-w-[480px] w-full flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'var(--bonafide-gradient)' }}>
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-[20px] font-bold text-text-1 mb-2">Contrato enviado a revisión</h2>
          <p className="text-[13px] text-text-3 leading-relaxed mb-6">
            Bonafide revisará la configuración del contrato {contrato.id} y su distribución entre tus proveedores. Te notificaremos cuando el contrato esté activo.
          </p>
          <Button variant="primary" full className="h-[48px]" onClick={() => go('epCreditos')}>
            Volver a Mis Contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg fade-in">
      <WizardHeader contrato={contrato} step={step} onExit={() => go('epCreditos')} />
      <div className="max-w-[720px] mx-auto py-8 sm:py-10 px-4 sm:px-5 space-y-5">
        <p className="text-[12px] text-text-4 text-center mb-1">Monto asignado por {contrato.contratanteNombre}: <span className="font-semibold text-text-2">{fmt(contrato.montoAsignado)} XAF</span></p>
        <Stepper steps={STEPS} current={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">

          {/* ── Paso 1: Términos del Contrato ── */}
          {step === 0 && (
            <>
              <StepHeader icon={FileCheck} title="Términos del Contrato" subtitle="Revisa las condiciones que te asignó la Contratante" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-[12px] bg-page-bg">
                <div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">Contratante</div>
                  <div className="text-[13px] text-text-1">{contrato.contratanteNombre}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">Monto asignado</div>
                  <div className="text-[13px] text-text-1">{fmt(contrato.montoAsignado)} XAF</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">Plazo de pago</div>
                  <div className="text-[13px] text-text-1">{contrato.plazoPago} días</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">Interés</div>
                  <div className="text-[13px] text-text-1">{contrato.interes}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">% Retención</div>
                  <div className="text-[13px] text-text-1">{contrato.porcentajeRetencion}%</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">% Gestión de Cobranza</div>
                  <div className="text-[13px] text-text-1">{contrato.porcentajeGestionCobranza}%</div>
                </div>
              </div>

              {!mostrarRechazo ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="primary" full className="justify-center" onClick={handleAceptarTerminos}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />Aceptar términos
                  </Button>
                  <Button variant="ghost" full className="justify-center" onClick={() => setMostrarRechazo(true)}>
                    Rechazar términos
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <FormGroup label="Cuéntanos por qué rechazas los términos" required>
                    <Textarea
                      value={comentarioRechazo}
                      onChange={e => setComentarioRechazo(e.target.value)}
                      rows={4}
                      placeholder="Ej. El plazo de pago no se ajusta a nuestra operación…"
                    />
                  </FormGroup>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="ghost" full className="justify-center" onClick={() => { setMostrarRechazo(false); setComentarioRechazo(''); }}>
                      Cancelar
                    </Button>
                    <Button variant="danger" full className="justify-center" onClick={handleConfirmarRechazo} disabled={!comentarioRechazo.trim()}>
                      Confirmar rechazo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Paso 2: Gestión de Fondos ── */}
          {step === 1 && (
            <>
              <StepHeader icon={Wallet} title="Gestión de Fondos" subtitle="Elige cómo operarás el monto asignado" />
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-[12px] border-2 cursor-pointer transition-all ${gestionFondos === 'retirar' ? 'border-orange bg-orange-tint/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="gestion" checked={gestionFondos === 'retirar'} onChange={() => setGestionFondos('retirar')} className="w-4 h-4 accent-orange shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-text-1">Opción A: Retirar todo</div>
                    <div className="text-[12px] text-text-4">Transfieres el monto asignado a tu cuenta bancaria externa.</div>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-[12px] border-2 cursor-pointer transition-all ${gestionFondos === 'billetera' ? 'border-orange bg-orange-tint/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="gestion" checked={gestionFondos === 'billetera'} onChange={() => setGestionFondos('billetera')} className="w-4 h-4 accent-orange shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-text-1">Opción B: Uso en Billetera Virtual</div>
                    <div className="text-[12px] text-text-4">Dispones del 100% del saldo presupuestado para pagos internos a tus proveedores.</div>
                  </div>
                </label>
              </div>
            </>
          )}

          {/* ── Paso 3: Proveedores y Montos ── */}
          {step === 2 && (
            <>
              <StepHeader icon={Truck} title="Proveedores y Montos" subtitle="Registra tus proveedores y el monto que le corresponde a cada uno" />

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
                  <Plus className="w-3.5 h-3.5" />Agregar Proveedor
                </Button>
              </div>

              <div className="space-y-3">
                {proveedores.map(p => (
                  <div key={p.id} className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-[14px] border border-border">
                    <div className="w-10 h-10 rounded-[10px] bg-orange-tint flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-orange-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-text-1 truncate">{p.nombre}</div>
                      <div className="text-[11px] text-text-4 truncate">{p.email}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] sm:text-[14px] font-extrabold text-text-1">{fmt(p.monto)} XAF</div>
                    </div>
                    <div className="flex items-center gap-1 border-l border-border pl-2 sm:pl-3 shrink-0">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange-dark cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleEliminar(p.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {proveedores.length === 0 && (
                  <div className="text-[12px] text-text-4 text-center py-8">Aún no agregaste ningún proveedor.</div>
                )}
              </div>
            </>
          )}

          {/* ── Paso 4: Simulación y Envío ── */}
          {step === 3 && (
            <>
              <StepHeader icon={ClipboardCheck} title="Simulación y Envío" subtitle="Revisa el cálculo de Bonafide antes de enviar" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="p-3 rounded-[10px] bg-page-bg text-center">
                  <div className="text-[16px] font-extrabold text-text-1">{fmt(retencionCalc)}</div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">Retención ({contrato.porcentajeRetencion}%)</div>
                </div>
                <div className="p-3 rounded-[10px] bg-page-bg text-center">
                  <div className="text-[16px] font-extrabold text-text-1">{fmt(gestionCalc)}</div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">Gestión Cobranza ({contrato.porcentajeGestionCobranza}%)</div>
                </div>
                <div className="p-3 rounded-[10px] bg-page-bg text-center">
                  <div className="text-[16px] font-extrabold text-text-1">{contrato.interes}</div>
                  <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">Interés sobre factura</div>
                </div>
              </div>
              <p className="text-[11px] text-text-4 mb-5">Cálculo estimado según la Matriz de Riesgo de Bonafide, aplicado sobre el monto asignado.</p>

              <div className="rounded-[12px] border border-border overflow-hidden mb-5">
                <table className="w-full text-[12px]">
                  <thead className="bg-page-bg">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-text-4">Proveedor</th>
                      <th className="text-right px-3 py-2 font-semibold text-text-4">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map(p => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="px-3 py-2 text-text-1 font-medium">{p.nombre}</td>
                        <td className="px-3 py-2 text-right font-bold text-text-1">{fmt(p.monto)} XAF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`rounded-[12px] border-2 p-5 transition-colors ${intentoEnvio && !confirmado ? 'border-red-400' : 'border-gray-200'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={confirmado} onChange={e => setConfirmado(e.target.checked)} className="mt-0.5 w-5 h-5 accent-orange cursor-pointer shrink-0" />
                  <span className="text-[13px] text-text-2">Confirmo que los datos de mis proveedores y la simulación son correctos.</span>
                </label>
                {intentoEnvio && !confirmado && (
                  <p className="text-xs text-red-500 mt-2 ml-8">Debes confirmar antes de enviar.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Navegación (el Paso 1 tiene sus propias acciones; Guardar
             borrador está disponible en todos los pasos) ── */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
                <ArrowLeft className="w-4 h-4 mr-1" />Atrás
              </Button>
            )}
            <Button variant="secondary" onClick={handleGuardarBorrador}>
              <Save className="w-4 h-4 mr-1" />Guardar borrador
            </Button>
          </div>
          {step > 0 && (step < 3 ? (
            <Button variant="primary" onClick={handleNext} disabled={siguienteDeshabilitado}>
              Siguiente<ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleEnviarClick} disabled={!confirmado}>
              Enviar a revisión<CheckCircle2 className="w-4 h-4 ml-1" />
            </Button>
          ))}
        </div>
      </div>

      {/* ── Modal: agregar/editar proveedor ── */}
      {modal.open && (
        <Modal
          title={modal.editId ? 'Editar proveedor / reasignar monto' : 'Agregar Proveedor'}
          onClose={() => setModal(PROVEEDOR_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(PROVEEDOR_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleGuardarProveedor} disabled={!puedeGuardar}>Guardar</Button>
            </>
          }
        >
          <div className="space-y-4">
            <FormGroup label="Proveedor" required>
              <Select value={modal.provSel} onChange={e => {
                const v = e.target.value;
                const p = initialProviders.find(x => x.razonSocial === v);
                setModal(m => ({
                  ...m, provSel: v,
                  email: p?.email ?? '',
                  telefono: p?.telefono ?? '',
                  proveedorNombreLibre: '',
                }));
              }}>
                {initialProviders.map(p => <option key={p.razonSocial} value={p.razonSocial}>{p.razonSocial}</option>)}
                <option value="__nueva__">Otro (nuevo)…</option>
              </Select>
            </FormGroup>

            {modal.provSel === '__nueva__' && (
              <FormGroup label="Nombre del nuevo proveedor" required>
                <Input
                  value={modal.proveedorNombreLibre}
                  onChange={e => {
                    const v = e.target.value;
                    const match = initialProviders.find(x =>
                      x.razonSocial.toLowerCase() === v.trim().toLowerCase() ||
                      (x.nombreComercial || '').toLowerCase() === v.trim().toLowerCase());
                    setModal(m => match
                      ? { ...m, proveedorNombreLibre: v, email: match.email, telefono: match.telefono }
                      : { ...m, proveedorNombreLibre: v });
                  }}
                  placeholder="Nombre o razón social"
                />
              </FormGroup>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormGroup label="Email" required className="mb-0">
                  <Input type="email" value={modal.email} onChange={e => setModal(m => ({ ...m, email: e.target.value }))} placeholder="contacto@proveedor.gq" disabled={provExistente} />
                </FormGroup>
                {provExistente && <p className="text-xs text-text-4 -mt-2">Dato del perfil del proveedor; no se puede modificar aquí.</p>}
              </div>
              <div>
                <FormGroup label="Teléfono" required className="mb-0">
                  <Input value={modal.telefono} onChange={e => setModal(m => ({ ...m, telefono: e.target.value }))} placeholder="+240 222 XXX XXX" disabled={provExistente} />
                </FormGroup>
                {provExistente && <p className="text-xs text-text-4 -mt-2">Dato del perfil del proveedor; no se puede modificar aquí.</p>}
              </div>
            </div>

            <FormGroup label="Presupuesto / Factura (XAF)" required>
              <Input
                inputMode="numeric"
                value={fmtMonto(modal.monto)}
                onChange={e => setModal(m => ({ ...m, monto: e.target.value.replace(/\D/g, '') }))}
                placeholder="Ej. 5.000.000"
                className={montoInvalido ? '!border-red-400 focus:!border-red-500' : ''}
              />
            </FormGroup>
            {montoInvalido && (
              <p className="text-xs text-red-500 -mt-2">
                {montoNumLive <= 0 ? 'Ingresa un monto válido.' : `El monto supera el disponible (${fmt(disponibleParaModal)} XAF).`}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* ── Toast ── */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
