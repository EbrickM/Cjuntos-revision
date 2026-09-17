// ── Brand tokens ──────────────────────────────────────────────────────────────
export const RED    = '#E0201C';
export const ORA    = '#EF7A2C';
export const GREEN  = '#2E7D5B';
export const WARN   = '#C68A1D';
export const ERR    = '#B8352A';
export const TEXT4  = '#A9A6A1';
export const BORDER = '#ECEAE7';
export const BLUE   = '#3B82F6';

export const fmt = n => new Intl.NumberFormat('de-DE').format(n);

// ── Datos ─────────────────────────────────────────────────────────────────────
// Identidad del Proveedor logueado en este dashboard: TransGE S.L., ya
// referenciado como proveedor en los mocks de Creditos.jsx (PYME) y
// admin/Contratos.jsx — los montos de abajo son coherentes con esas
// asignaciones (misma narrativa cruzada entre los 3 portales).
export const contratos = [
  { id: 'CT-2026-0081', pyme: 'AgroSur GE S.L.', ini: 'AS', sector: 'Transporte', asignado: 22_000_000, utilizado: 9_500_000, facturas: 1, estado: 'Activo',
    objeto: 'Transporte y logística de insumos agrícolas entre almacenes regionales de la PYME.', fechaInicio: '01/04/2026', fechaFin: '31/03/2027', plazo: '12 meses', plazoPago: 30,
    bancoFondeador: 'CCEI Bank Guinea Ecuatorial', interes: '5.5% anual', porcentajeRetencion: 2.5, porcentajeGestionCobranza: 1,
    cuentaBancaria: { tipo: 'bonafide', numero: null },
    suministradores: [
      { id: 'SUM-001', nombre: 'Combustibles Bata S.L.', email: 'ventas@combata.gq', telefono: '+240 222 606 707', monto: 9_500_000, cargaNomina: false, kyc: 'vigente', scoreCredito: 705 },
    ],
  },
  { id: 'CT-2026-0088', pyme: 'Const. Silva Ltd.', ini: 'CS', sector: 'Transporte', asignado: 9_000_000, utilizado: 4_500_000, facturas: 1, estado: 'Activo',
    objeto: 'Transporte de materiales de construcción para obras en Malabo.', fechaInicio: '01/05/2026', fechaFin: '30/04/2027', plazo: '12 meses', plazoPago: 30,
    bancoFondeador: 'BGFI Bank Guinea Ecuatorial', interes: '5% anual', porcentajeRetencion: 3, porcentajeGestionCobranza: 1.5,
    cuentaBancaria: { tipo: 'bonafide', numero: null },
    // Bonafide encontró una observación en la reconfiguración de este
    // contrato (Fase 3 del proceso maestro) — `contratoId` apunta al ítem en
    // `contratosPendientes` que el wizard debe reabrir.
    requerimiento: {
      entidades: ['Proveedor'],
      mensaje: 'El suministrador "Repuestos Malabo GE" no tiene KYC vigente registrado. Actualiza su verificación antes de continuar.',
      fecha: '19/07/2026',
      contratoId: 'CT-2026-0079',
    },
    suministradores: [
      { id: 'SUM-002', nombre: 'Repuestos Malabo GE', email: 'info@repmalabo.gq', telefono: '+240 222 808 111', monto: 4_500_000, cargaNomina: false, kyc: 'pendiente', scoreCredito: 640 },
    ],
  },
];

// 2 facturas, una por contrato, emitidas por el Suministrador al Proveedor.
export const facturas = [
  { id: 'FAC-2026-2101', contrato: 'CT-2026-0081', suministrador: 'Combustibles Bata S.L.', monto: 9_500_000, fecha: '30/06/2026', estado: 'Recibida', concepto: 'Suministro de combustible para flota de transporte — junio 2026' },
  { id: 'FAC-2026-2108', contrato: 'CT-2026-0088', suministrador: 'Repuestos Malabo GE',    monto: 4_500_000, fecha: '08/07/2026', estado: 'Recibida', concepto: 'Repuestos y mantenimiento de unidades de transporte' },
];

// Directorio de Suministradores (equivalente a `pymes` en contratanteData.js).
export const suministradores = [
  { ini: 'CB', nombre: 'Combustibles Bata S.L.', sector: 'Energía', contratos: 1, montoTotal: 9_500_000, score: 705, semaforo: 'Verde',
    nombreComercial: 'ComBata', ruc: 'GE-2019-00567', telefono: '+240 222 606 707', correo: 'ventas@combata.gq',
    repNombre: 'Manuel Eyi Ndong', repTipoDoc: 'Cédula', repId: 'GE-19850612-CB', repCargo: 'Gerente Comercial', repTel: '+240 551 330 099', repCorreo: 'm.eyi@combata.gq' },
  { ini: 'RM', nombre: 'Repuestos Malabo GE', sector: 'Comercio', contratos: 1, montoTotal: 4_500_000, score: 640, semaforo: 'Amarillo',
    nombreComercial: 'RepMalabo', ruc: 'GE-2021-00334', telefono: '+240 222 808 111', correo: 'info@repmalabo.gq',
    repNombre: 'Sofía Nchama Bindang', repTipoDoc: 'DNI', repId: 'GE-19930225-RM', repCargo: 'Directora', repTel: '+240 551 440 220', repCorreo: 's.nchama@repmalabo.gq' },
];

export const misSolicitudes = [
  { id: 'SOL-2026-0201', tipo: 'Nuevo contrato', desc: 'Contrato con Repuestos Malabo GE · Comercio', monto: 15_000_000, fecha: '05/07/2026', estado: 'En revisión' },
];

export const solicitudesSuministradores = [
  { id: 'SOLS-2026-0071', ini: 'TM', pyme: 'TechMalabo Ltd.', sector: 'Tecnología',  desc: 'Mantenimiento de sistemas de rastreo GPS para la flota', monto: 12_000_000, fecha: '02/07/2026' },
  { id: 'SOLS-2026-0068', ini: 'AL', pyme: 'AlmaLogística SL', sector: 'Transporte', desc: 'Alquiler de vehículos de carga pesada — campaña 2026',   monto: 18_000_000, fecha: '28/06/2026' },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────
export const facturaBadge = e => ({ 'Recibida': 'orange', 'En revisión': 'yellow', 'Verificada': 'blue', 'Emitida': 'green', 'Pagada': 'green' }[e] ?? 'gray');
export const solicBadge   = e => ({ 'En revisión': 'yellow', 'Aprobada': 'green', 'Rechazada': 'red' }[e] ?? 'gray');
export const semBadge     = s => s === 'Verde' ? 'green' : s === 'Amarillo' ? 'yellow' : 'red';
export const semColor     = s => s === 'Verde' ? GREEN : s === 'Amarillo' ? WARN : ERR;
export const scoreColor   = n => n >= 750 ? GREEN : n >= 500 ? WARN : ERR;
export const kycBadge     = k => ({ vigente: 'green', pendiente: 'yellow', vencido: 'red' }[k] ?? 'yellow');

// ── Contratos pendientes de configuración (Subproceso 3 del BPMN) ─────────────
// La PYME ya le asignó un monto a este Proveedor (Subproceso 2, completado del
// otro lado) y espera que el Proveedor lo configure repartiéndolo entre sus
// propios Suministradores.
export const contratosPendientes = [
  {
    id: 'CT-2026-0073',
    pymeNombre: 'Const. Silva Ltd.',
    montoAsignado: 15_000_000,
    fechaAsignacion: '12/07/2026',
    estado: 'Pendiente de Configuración', // -> 'Pendiente de Revisión' al enviar
    cuentaBancaria: null,                 // { tipo: 'bonafide' | 'banco', numero }
    suministradoresAsignados: [],         // [{ id, nombre, email, telefono, monto, cargaNomina }]
  },
  {
    // Ya fue configurado por el Proveedor y enviado a revisión, pero Bonafide
    // encontró una observación y lo devolvió con un requerimiento — el
    // Proveedor debe reconfigurarlo.
    id: 'CT-2026-0079',
    pymeNombre: 'Const. Silva Ltd.',
    montoAsignado: 9_000_000,
    fechaAsignacion: '19/07/2026',
    estado: 'Con Requerimientos',
    cuentaBancaria: { tipo: 'bonafide', numero: null },
    suministradoresAsignados: [
      { id: 'SUM-002', nombre: 'Repuestos Malabo GE', email: 'info@repmalabo.gq', telefono: '+240 222 808 111', monto: 4_500_000, cargaNomina: false },
    ],
    requerimiento: {
      entidades: ['Proveedor'],
      mensaje: 'El suministrador "Repuestos Malabo GE" no tiene KYC vigente registrado. Actualiza su verificación antes de continuar.',
      fecha: '19/07/2026',
    },
  },
];

export const montoDisponibleProveedores = (item, excluirId = null) =>
  item.montoAsignado - item.suministradoresAsignados
    .filter(s => s.id !== excluirId)
    .reduce((sum, s) => sum + s.monto, 0);

// ── Estado compartido entre pantallas (selección de contrato) ─────────────────
export const provState = {
  selectedContrato: contratos[0],
};
