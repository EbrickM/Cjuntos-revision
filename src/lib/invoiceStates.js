// ── Máquina de estados de facturación (BPMN "Facturación y Pago") ─────────────
// Estados del ciclo de vida de una factura, unificados para los 4 portales.
// Referencia BPMN:
//   PYME crea → envía a Contratante → Contratante evalúa (corrige/aprueba)
//   → aprobada emite IPI → Bonafide (admin) valida → Con Requerimientos
//   → PYME notifica → Contratante envía Orden/IPI al Fondeador
//   → Fondeo Recibido (auto) → OTP (auto) → Contratante verifica
//   → Pagada (Retiro Total) | Saldo en Billetera (Billetera Virtual)

export const INV = {
  creada:           'creada',
  enviada:          'enviada',
  enEvaluacion:     'en_evaluacion',
  conCorrecciones:  'con_correcciones',
  aprobada:         'aprobada',
  emitida:          'emitida',
  conRequerimientos:'con_requerimientos',
  ordenFondeador:   'orden_fondeador',
  fondeado:         'fondeado',
  otpEnviada:       'otp_enviada',
  otpVerificada:    'otp_verificada',
  pagada:           'pagada',
  billetera:        'billetera',
};

export const MODALIDAD = {
  retiroTotal:  'retirar_todo',
  billeteraVirtual: 'billetera_virtual',
};

// Etiqueta legible de cada estado (la misma en todos los portales).
export const ESTADO_LABEL = {
  creada:            'Creada',
  enviada:           'Enviada',
  en_evaluacion:     'En Evaluación',
  con_correcciones:  'Con Correcciones',
  aprobada:          'Aprobada',
  emitida:           'Emitida',
  con_requerimientos:'Con Requerimientos',
  orden_fondeador:   'Orden al Fondeador',
  fondeado:          'Fondeo Recibido',
  otp_enviada:       'OTP Enviada',
  otp_verificada:    'OTP Verificada',
  pagada:            'Pagada',
  billetera:         'Saldo en Billetera',
};

// Variante de Badge (ver src/components/ui/Badge.jsx) por estado.
export const ESTADO_BADGE = {
  creada:            'yellow',
  enviada:           'blue',
  en_evaluacion:     'yellow',
  con_correcciones:  'red',
  aprobada:          'blue',
  emitida:           'orange',
  con_requerimientos:'yellow',
  orden_fondeador:   'blue',
  fondeado:          'blue',
  otp_enviada:       'orange',
  otp_verificada:    'green',
  pagada:            'green',
  billetera:         'green',
};

// Transiciones válidas entre estados (machine state).
export const TRANSICIONES = {
  [INV.creada]:            [INV.enviada],
  [INV.enviada]:           [INV.enEvaluacion],
  [INV.enEvaluacion]:      [INV.aprobada, INV.conCorrecciones],
  [INV.conCorrecciones]:   [INV.enviada],                 // PYME corrige y reenvía
  [INV.aprobada]:          [INV.emitida, INV.pagada],  // directa → pagada
  [INV.emitida]:           [INV.conRequerimientos],    // validación de Bonafide
  [INV.conRequerimientos]: [INV.ordenFondeador],          // Contratante envía al banco
  [INV.ordenFondeador]:    [INV.fondeado],
  [INV.fondeado]:          [INV.otpEnviada],
  [INV.otpEnviada]:        [INV.otpVerificada],
  [INV.otpVerificada]:     [INV.pagada, INV.billetera],
  [INV.pagada]:            [],
  [INV.billetera]:         [],
};

// Cadena lineal mostrada en el pipeline (la corrección es una desviación que se
// pinta solo en el badge, no como paso de la cadena).
export const PASOS_INVERSO = [
  { id: INV.creada,            label: 'Creada' },
  { id: INV.enviada,           label: 'Enviada' },
  { id: INV.enEvaluacion,      label: 'En Evaluación' },
  { id: INV.aprobada,          label: 'Aprobada' },
  { id: INV.emitida,           label: 'Emitida' },
  { id: INV.conRequerimientos, label: 'Con Requerimientos' },
  { id: INV.ordenFondeador,    label: 'Orden al Fondeador' },
  { id: INV.fondeado,          label: 'Fondeo Recibido' },
  { id: INV.otpVerificada,     label: 'OTP Verificada' },
  { id: INV.pagada,            label: 'Pagada' },
];

export const PASOS_DIRECTO = [
  { id: INV.creada,       label: 'Creada' },
  { id: INV.enviada,      label: 'Enviada' },
  { id: INV.enEvaluacion, label: 'En Evaluación' },
  { id: INV.aprobada,     label: 'Aprobada' },
  { id: INV.pagada,       label: 'Pagada' },
];

export const estadoLabel = (estado) => ESTADO_LABEL[estado] ?? estado ?? ESTADO_LABEL[INV.emitida];

export const estadoBadge = (estado) => ESTADO_BADGE[estado] ?? 'yellow';

// Pasos del pipeline resuelto para una factura concreta (el paso terminal
// "Pagada" pasa a "Saldo en Billetera" cuando la factura terminó en billetera).
export function pasosFactura(factura) {
  const pasos = factura?.tipoFactoring === 'directo' ? PASOS_DIRECTO : PASOS_INVERSO;
  if (factura?.estado === INV.billetera) {
    return pasos.map(p => (p.id === INV.pagada ? { ...p, label: 'Saldo en Billetera' } : p));
  }
  return pasos;
}