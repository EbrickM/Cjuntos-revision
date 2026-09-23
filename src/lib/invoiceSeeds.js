// ── Semillas de facturación (BPMN "Facturación y Pago") ───────────────────────
// Reemplazan los arrays estáticos por rol (contratanteData.facturas,
// provData.facturas, initialInvoices de Facturacion, allInvoices de AdminRisk)
// por un modelo único consumido por factura.service via localDb.
import { INV, MODALIDAD } from './invoiceStates';

export const SEED_VERSION = 12;

// ── Entidades de la narrativa ─────────────────────────────────────────────────
const E = {
  contratantes: {
    totalenerge: 'Chevron',
    evans:       'Subsea 7',
    puerto:      'SEGESA',
  },
  pymes: {
    silva:  'Tradex',
    agrosur:'Martinez Hermanos (MH)',
    techbata:'Conexxia',
    logige: 'Conexxia',
  },
  proveedores: {
    transge: 'APEX',
    servtec: 'APEX Tech',
    cemex:   'SAP',
  },
  suministradores: {
    combustibles: 'SAP',
    repuestos:    'Lideshore',
  },
};

const CONTRATOS = {
  c1: { id: 'CT-2026-0041', nombre: E.contratantes.totalenerge, pyme: E.pymes.silva,    tipoFactoring: 'directo',  banco: 'BGFI Bank Guinea Ecuatorial', retencion: 3, gestionCobranza: 1.5, interes: '5% anual' },
  c2: { id: 'CT-2026-0052', nombre: E.contratantes.totalenerge, pyme: E.pymes.agrosur,  tipoFactoring: 'inverso', banco: 'BGFI Bank Guinea Ecuatorial', retencion: 3, gestionCobranza: 1.5, interes: '5% anual' },
  c3: { id: 'CT-2026-0021', nombre: E.contratantes.evans,       pyme: E.pymes.techbata, tipoFactoring: 'inverso', banco: 'CCEIBank',                 retencion: 2, gestionCobranza: 1,   interes: '6% anual' },
  c4: { id: 'CT-2026-0033', nombre: E.contratantes.puerto,      pyme: E.pymes.logige,   tipoFactoring: 'inverso', banco: 'ECOBank',                  retencion: 2.5, gestionCobranza: 1, interes: '5.5% anual' },
  p1: { id: 'CT-2026-0081', nombre: E.pymes.agrosur,  pyme: E.pymes.agrosur,  tipoFactoring: 'inverso', banco: 'CCEI Bank Guinea Ecuatorial', retencion: 2.5, gestionCobranza: 1, interes: '5.5% anual' },
  p2: { id: 'CT-2026-0088', nombre: E.pymes.silva,    pyme: E.pymes.silva,    tipoFactoring: 'inverso', banco: 'BGFI Bank Guinea Ecuatorial', retencion: 3,   gestionCobranza: 1.5, interes: '5% anual' },
};

const D = (f) => `12/${f}/2026`;
const H = (ttl, detalle, fecha) => ({ titulo: ttl, detalle, fecha, actor: 'Sistema' });

// Historia acumulada según el estado actual — refleja el BPMN: emisión,
// envío, evaluación, IPI, validación de Bonafide, fondeo y pago.
function historia(estado, extra = []) {
  const ev = [];
  const push = (titulo, detalle, fecha) => ev.push(H(titulo, detalle, fecha));
  push('Factura emitida', 'La PYME subió la factura de servicio.', D('03'));
  if (['enviada','en_evaluacion','con_correcciones','aprobada','emitida','con_requerimientos','orden_fondeador','fondeado','otp_enviada','otp_verificada','pagada','billetera'].includes(estado)) {
    push('Enviada a la Contratante', 'La PYME envió la factura a la Empresa Contratante.', D('05'));
  }
  if (['en_evaluacion','con_correcciones','aprobada','emitida','con_requerimientos','orden_fondeador','fondeado','otp_enviada','otp_verificada','pagada','billetera'].includes(estado)) {
    push('En evaluación', 'La Empresa Contratante recibió y está evaluando la factura.', D('07'));
  }
  if (['con_correcciones'].includes(estado)) {
    push('Con correcciones', 'La Contratante señaló correcciones; la PYME debe corregir y reenviar.', D('09'));
  }
  if (['aprobada','emitida','con_requerimientos','orden_fondeador','fondeado','otp_enviada','otp_verificada','pagada','billetera'].includes(estado)) {
    push('Factura aprobada', 'La Empresa Contratante aprobó la factura.', D('10'));
  }
  if (['emitida','con_requerimientos','orden_fondeador','fondeado','otp_enviada','otp_verificada','pagada','billetera'].includes(estado)) {
    push('IPI emitido', 'La Contratante emitió el Instrumento de Pago (IPI) y lo envió a Bonafide.', D('12'));
  }
  if (['con_requerimientos','orden_fondeador','fondeado','otp_enviada','otp_verificada','pagada','billetera'].includes(estado)) {
    push('Validado por Bonafide', 'Bonafide validó el IPI y fijó las condiciones financieras.', D('14'));
  }
  if (['orden_fondeador','fondeado','otp_enviada','otp_verificada','pagada','billetera'].includes(estado)) {
    push('Orden enviada al Fondeador', 'La Contratante envió la orden/IPI al Banco Fondeador.', D('16'));
  }
  if (['fondeado','otp_enviada','otp_verificada','pagada','billetera'].includes(estado)) {
    push('Fondeo recibido', 'El Banco Fondeador transfirió y acreditó los fondos a Bonafide.', D('18'));
  }
  if (['otp_enviada','otp_verificada','pagada','billetera'].includes(estado)) {
    push('Código de verificación enviado', 'Se envió un OTP a la Empresa Contratante.', D('19'));
  }
  if (['otp_verificada','pagada','billetera'].includes(estado)) {
    push('OTP verificado', 'La Empresa Contratante verificó la transferencia.', D('20'));
  }
  if (['pagada'].includes(estado)) {
    push('Pagada', 'Los fondos fueron transferidos a la PYME (retiro total).', D('21'));
  }
  if (['billetera'].includes(estado)) {
    push('Saldo en billetera', 'Fondos desbloqueados en la Billetera Virtual de la PYME.', D('21'));
  }
  return [...ev, ...extra];
}

// Banco Fondeador del que proviene cada contrato — se denormaliza en la factura
// para que el portal del Fondeador (BGFI) pueda filtrar su propia cartera sin
// tener que resolver el contrato.
export const BANCO_POR_CONTRATO = Object.fromEntries(
  Object.values(CONTRATOS).map(c => [c.id, c.banco])
);

// Semilla base: facturas PYME → Contratante (Fase 1 del BPMN).
const fac = (id, o) => ({
  id,
  tipoFactoring: 'inverso',
  origen: 'contratante',           // factura al contratante
  modalidadPago: MODALIDAD.retiroTotal,
  estado: INV.creada,
  bancoFondeador: BANCO_POR_CONTRATO[o.contrato] ?? null,
  ipi: null,
  requerimientos: null,
  documentos: [],
  ...o,
  historia: o.historia ?? historia(o.estado ?? INV.creada),
});

const seedFacturasRaw = [
  // ── Facturación Inversa (con IPI) — distintos estados del pipeline ──
  fac('FAC-2026-1048', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c2.id, contratante: CONTRATOS.c2.nombre, pyme: CONTRATOS.c2.pyme,
    proveedor: E.proveedores.transge,
    monto: 12_000_000, estado: INV.creada, concepto: 'Consultoría técnica explotación minera – Q2 2026',
    fecha: D('02'), fechaVencimiento: D('02') + ' / 45 días',
  }),
  fac('FAC-2026-1036', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c4.id, contratante: CONTRATOS.c4.nombre, pyme: CONTRATOS.c4.pyme,
    proveedor: E.proveedores.cemex,
    monto: 6_500_000, estado: INV.enviada, concepto: 'Mantenimiento preventivo instalaciones portuarias – Abr 2026',
    fecha: D('02'), fechaVencimiento: D('02') + ' / 30 días',
  }),
  fac('FAC-2026-1025', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c2.id, contratante: CONTRATOS.c2.nombre, pyme: CONTRATOS.c2.pyme,
    proveedor: E.proveedores.transge,
    monto: 21_500_000, estado: INV.en_evaluacion, concepto: 'Avance de obra fase 1 – Cimentación y estructura',
    fecha: D('01'), fechaVencimiento: D('01') + ' / 45 días',
  }),
  fac('FAC-2026-1039', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c3.id, contratante: CONTRATOS.c3.nombre, pyme: CONTRATOS.c3.pyme,
    proveedor: E.proveedores.servtec,
    monto: 9_500_000, estado: INV.con_correcciones, concepto: 'Suministro e instalación de equipos eléctricos – Fase 2',
    fecha: D('04'), fechaVencimiento: D('04') + ' / 45 días',
  }),
  fac('FAC-2026-1052', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c2.id, contratante: CONTRATOS.c2.nombre, pyme: CONTRATOS.c2.pyme,
    proveedor: E.proveedores.transge,
    monto: 8_000_000, estado: INV.aprobada, concepto: 'Alquiler de maquinaria de construcción – Mayo 2026',
    fecha: D('06'), fechaVencimiento: D('06') + ' / 30 días',
    pagosAcumulados: 1_600_000, pagoParcial: { pct: 20, monto: 1_600_000, fecha: D('07') },
  }),
  fac('FAC-2026-1060', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c2.id, contratante: CONTRATOS.c2.nombre, pyme: CONTRATOS.c2.pyme,
    proveedor: E.proveedores.transge,
    monto: 15_000_000, estado: INV.aprobada, concepto: 'Acabados interiores y carpintería – Módulos A y B',
    fecha: D('07'), fechaVencimiento: D('07') + ' / 60 días',
  }),
  fac('FAC-2026-1093', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c2.id, contratante: CONTRATOS.c2.nombre, pyme: CONTRATOS.c2.pyme,
    proveedor: E.proveedores.transge,
    monto: 9_800_000, estado: INV.emitida, concepto: 'Adecuación de campamentos y módulo habitacional – Fase 2',
    fecha: D('10'), fechaVencimiento: D('10') + ' / 45 días',
    ipi: { numero: 'IPI-2026-0322', fechaEmision: D('12') },
  }),
  fac('FAC-2026-1096', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c3.id, contratante: CONTRATOS.c3.nombre, pyme: CONTRATOS.c3.pyme,
    proveedor: E.proveedores.servtec,
    monto: 7_600_000, estado: INV.aprobada, concepto: 'Topografía y levantamiento batimétrico – Corredor Norte',
    fecha: D('10'), fechaVencimiento: D('10') + ' / 45 días',
  }),
  fac('FAC-2026-1099', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c4.id, contratante: CONTRATOS.c4.nombre, pyme: CONTRATOS.c4.pyme,
    proveedor: E.proveedores.cemex,
    monto: 5_900_000, estado: INV.aprobada, concepto: 'Inspección y mantenimiento de líneas de transmisión – L35',
    fecha: D('11'), fechaVencimiento: D('11') + ' / 30 días',
  }),
  fac('FAC-2026-1065', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c2.id, contratante: CONTRATOS.c2.nombre, pyme: CONTRATOS.c2.pyme,
    proveedor: E.proveedores.transge,
    monto: 10_000_000, estado: INV.conRequerimientos, modalidadPago: MODALIDAD.retiroTotal,
    concepto: 'Suministro de materiales de construcción – Lote 3',
    fecha: D('07'), fechaVencimiento: D('07') + ' / 45 días',
    ipi: { numero: 'IPI-2026-0312', fechaEmision: D('08'), fechaValidacion: D('10') },
    requerimientos: { entidades: ['Bonafide'], mensaje: 'IPI validado. Condición: % de retención y cobranza según Matriz de Riesgo.', fecha: D('10') },
  }),
  fac('FAC-2026-1075', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c3.id, contratante: CONTRATOS.c3.nombre, pyme: CONTRATOS.c3.pyme,
    proveedor: E.proveedores.servtec,
    monto: 11_500_000, estado: INV.conRequerimientos,
    concepto: 'Instalación y puesta en marcha de sistemas eléctricos – Fase 3',
    fecha: D('08'), fechaVencimiento: D('08') + ' / 45 días',
    ipi: { numero: 'IPI-2026-0319', fechaEmision: D('09'), fechaValidacion: D('11') },
    requerimientos: { entidades: ['Bonafide'], mensaje: 'IPI validado. Condición: % de retención y cobranza según Matriz de Riesgo.', fecha: D('11') },
  }),
  fac('FAC-2026-1082', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c4.id, contratante: CONTRATOS.c4.nombre, pyme: CONTRATOS.c4.pyme,
    proveedor: E.proveedores.cemex,
    monto: 7_200_000, estado: INV.conRequerimientos,
    concepto: 'Suministro e instalación de iluminación portuaria – Fachada A',
    fecha: D('08'), fechaVencimiento: D('08') + ' / 30 días',
    ipi: { numero: 'IPI-2026-0321', fechaEmision: D('10'), fechaValidacion: D('12') },
    requerimientos: { entidades: ['Bonafide'], mensaje: 'IPI validado. Se requiere actualizar la póliza de seguros del suministro ante la Contratante.', fecha: D('12') },
  }),
  fac('FAC-2026-1071', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c4.id, contratante: CONTRATOS.c4.nombre, pyme: CONTRATOS.c4.pyme,
    proveedor: E.proveedores.cemex,
    monto: 4_200_000, estado: INV.orden_fondeador, concepto: 'Consultoría técnica – Q2 2026',
    fecha: D('09'), fechaVencimiento: D('09') + ' / 45 días',
    ipi: { numero: 'IPI-2026-0313', fechaEmision: D('11'), fechaValidacion: D('12') },
    requerimientos: { entidades: ['Bonafide'], mensaje: 'IPI validado', fecha: D('12') },
  }),
  fac('FAC-2026-1090', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c2.id, contratante: CONTRATOS.c2.nombre, pyme: CONTRATOS.c2.pyme,
    proveedor: E.proveedores.transge, modalidadPago: MODALIDAD.retiroTotal,
    monto: 5_500_000, estado: INV.orden_fondeador, concepto: 'Servicios de movimiento de tierras – Lote 4',
    fecha: D('10'), fechaVencimiento: D('10') + ' / 45 días',
    ipi: { numero: 'IPI-2026-0318', fechaEmision: D('12'), fechaValidacion: D('14') },
    requerimientos: { entidades: ['Bonafide'], mensaje: 'IPI validado', fecha: D('14') },
    condiciones: { retencion: 3, gestionCobranza: 1.5, interes: 5, neto: 4_977_500 },
  }),
  fac('FAC-2026-1031', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c1.id, contratante: CONTRATOS.c1.nombre, pyme: CONTRATOS.c1.pyme,
    proveedor: E.proveedores.transge,
    monto: 18_000_000, estado: INV.fondeado, concepto: 'Obras de estructura fase 2 – detalles',
    fecha: D('05'), fechaVencimiento: D('05') + ' / 45 días',
    ipi: { numero: 'IPI-2026-0314', fechaEmision: D('07'), fechaValidacion: D('09') },
    requerimientos: { entidades: ['Bonafide'], mensaje: 'IPI validado', fecha: D('09') },
    condiciones: { retencion: 3, gestionCobranza: 1.5, interes: 5, neto: 16_290_000 },
  }),
  fac('FAC-2026-1078', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c2.id, contratante: CONTRATOS.c2.nombre, pyme: CONTRATOS.c2.pyme,
    proveedor: E.proveedores.transge,
    monto: 7_500_000, estado: INV.otp_enviada, modalidadPago: MODALIDAD.retiroTotal,
    concepto: 'Preparación de obra e instalación de faeneras',
    fecha: D('10'), fechaVencimiento: D('10') + ' / 30 días',
    ipi: { numero: 'IPI-2026-0315', fechaEmision: D('12'), fechaValidacion: D('14') },
    requerimientos: { entidades: ['Bonafide'], mensaje: 'IPI validado', fecha: D('14') },
    condiciones: { retencion: 3, gestionCobranza: 1.5, interes: 5, neto: 6_787_500 },
  }),
  fac('FAC-2026-1085', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c3.id, contratante: CONTRATOS.c3.nombre, pyme: CONTRATOS.c3.pyme,
    proveedor: E.proveedores.servtec,
    monto: 13_000_000, estado: INV.billetera, modalidadPago: MODALIDAD.billeteraVirtual,
    concepto: 'Servicios de consultoría y auditoría TI – trimestral',
    fecha: D('12'), fechaVencimiento: D('12') + ' / 45 días',
    ipi: { numero: 'IPI-2026-0316', fechaEmision: D('14'), fechaValidacion: D('16') },
    requerimientos: { entidades: ['Bonafide'], mensaje: 'IPI validado. Modalidad: Billetera Virtual.', fecha: D('16') },
    billetera: { montoPresupuestado: 13_000_000, saldoDisponible: 12_870_000 },
  }),
  fac('FAC-2026-1041', {
    tipoFactoring: 'inverso', contrato: CONTRATOS.c4.id, contratante: CONTRATOS.c4.nombre, pyme: CONTRATOS.c4.pyme,
    proveedor: E.proveedores.cemex, modalidadPago: MODALIDAD.retiroTotal,
    monto: 4_500_000, estado: INV.pagada, concepto: 'Transporte de materiales al sitio de obra',
    fecha: D('01'), fechaVencimiento: D('01') + ' / 30 días',
    ipi: { numero: 'IPI-2026-0317', fechaEmision: D('03'), fechaValidacion: D('05') },
    requerimientos: { entidades: ['Bonafide'], mensaje: 'IPI validado', fecha: D('05') },
  }),

  // ── Facturación Directa (sin IPI) ──
  fac('FAC-2026-0911', {
    tipoFactoring: 'directo', contrato: CONTRATOS.c1.id, contratante: CONTRATOS.c1.nombre, pyme: CONTRATOS.c1.pyme,
    monto: 21_500_000, estado: INV.enviada, concepto: 'Obras de estructura fase 2 — planta baja y primer piso',
    fecha: D('05'), fechaVencimiento: D('07'),
  }),
  fac('FAC-2026-0918', {
    tipoFactoring: 'directo', contrato: CONTRATOS.c1.id, contratante: CONTRATOS.c1.nombre, pyme: CONTRATOS.c1.pyme,
    monto: 26_000_000, estado: INV.pagada, concepto: 'Acabados interiores y carpintería — módulos A y B',
    fecha: D('06'), fechaVencimiento: D('08'),
  }),

  // ── Facturas de suministradores → Proveedor (Fase 2, vista Proveedor) ──
  fac('FAC-2026-2101', {
    origen: 'suministrador', contrato: CONTRATOS.p1.id, contratante: CONTRATOS.p1.nombre, pyme: CONTRATOS.p1.pyme,
    suministrador: E.suministradores.combustibles,
    monto: 9_500_000, estado: INV.aprobada, concepto: 'Suministro de combustible para flota de transporte – junio 2026',
    fecha: D('06'), fechaVencimiento: D('06') + ' / 30 días',
    pagosAcumulados: 1_900_000, pagoParcial: { pct: 20, monto: 1_900_000, fecha: D('07') },
  }),
  fac('FAC-2026-2108', {
    origen: 'suministrador', contrato: CONTRATOS.p2.id, contratante: CONTRATOS.p2.nombre, pyme: CONTRATOS.p2.pyme,
    suministrador: E.suministradores.repuestos,
    monto: 4_500_000, estado: INV.pagada, concepto: 'Repuestos y mantenimiento de unidades de transporte',
    fecha: D('07'), fechaVencimiento: D('07') + ' / 30 días',
  }),
  fac('FAC-2026-2103', {
    origen: 'suministrador', contrato: CONTRATOS.p2.id, contratante: CONTRATOS.p2.nombre, pyme: CONTRATOS.p2.pyme,
    suministrador: E.suministradores.repuestos,
    monto: 5_400_000, estado: INV.aprobada, concepto: 'Repuestos y mantenimiento de unidades – julio 2026',
    fecha: D('07'), fechaVencimiento: D('07') + ' / 30 días',
  }),
  fac('FAC-2026-2106', {
    origen: 'suministrador', contrato: CONTRATOS.p1.id, contratante: CONTRATOS.p1.nombre, pyme: CONTRATOS.p1.pyme,
    suministrador: E.suministradores.combustibles,
    monto: 7_700_000, estado: INV.aprobada, concepto: 'Combustible para flota de transporte – julio 2026',
    fecha: D('07'), fechaVencimiento: D('07') + ' / 30 días',
  }),
  fac('FAC-2026-2110', {
    origen: 'suministrador', contrato: CONTRATOS.p1.id, contratante: CONTRATOS.p1.nombre, pyme: CONTRATOS.p1.pyme,
    suministrador: E.suministradores.combustibles,
    monto: 6_800_000, estado: INV.conRequerimientos, concepto: 'Combustible para flota de transporte – julio 2026',
    fecha: D('08'), fechaVencimiento: D('08') + ' / 30 días',
    requerimientos: { entidades: ['Bonafide'], mensaje: 'Falta adjuntar el comprobante fiscal del suministro. Requiere coordinación con la Contratante.', fecha: D('09') },
  }),
  fac('FAC-2026-2112', {
    origen: 'suministrador', contrato: CONTRATOS.p2.id, contratante: CONTRATOS.p2.nombre, pyme: CONTRATOS.p2.pyme,
    suministrador: E.suministradores.repuestos,
    monto: 3_600_000, estado: INV.conRequerimientos, concepto: 'Repuestos y mantenimiento de unidades – julio 2026',
    fecha: D('08'), fechaVencimiento: D('08') + ' / 30 días',
    requerimientos: { entidades: ['Bonafide'], mensaje: 'El RUC del suministrador no está vigente; actualizar el KYC ante Bonafide.', fecha: D('10') },
  }),
];

// Toda factura sembrada como aprobada se estandariza con el pago al 20%
// completado (pagosAcumulados + pagoParcial) para que por defecto todas
// muestren la barra de progreso de pago con el mismo porcentaje.
export const seedFacturas = seedFacturasRaw.map(f => {
  if (f.estado !== INV.aprobada) return f;
  if (Number(f.pagosAcumulados || 0) > 0 && f.pagoParcial) return f;
  const pago = Math.round((Number(f.monto) || 0) * 0.2);
  return {
    ...f,
    pagosAcumulados: pago,
    pagoParcial: { pct: 20, monto: pago, fecha: f.fecha },
  };
});

// ── Pagos a proveedores / Billetera Virtual (Fase 2 del BPMN) ─────────────────
// método: 'transferencia' (Core Bancario) | 'cheque' (Cheque de Venta)
export const seedPagos = [
  { id: 'PAG-2026-0001', facturaId: 'FAC-2026-1041', proveedor: E.proveedores.cemex, monto: 4_275_000, metodo: 'transferencia', estado: 'Realizado', fechaPago: D('21'), cuenta: '0245 8810 4432' },
  { id: 'PAG-2026-0002', facturaId: 'FAC-2026-0918', proveedor: E.proveedores.transge, monto: 24_700_000, metodo: 'transferencia', estado: 'Realizado', fechaPago: D('22') },
  { id: 'PAG-2026-0003', facturaId: 'FAC-2026-1085', proveedor: E.proveedores.servtec, monto: 6_435_000, metodo: 'cheque', estado: 'Pendiente de Cobro', fechaPago: D('23'), cheque: 'CHQ-2026-0777' },
  { id: 'PAG-2026-0004', facturaId: 'FAC-2026-1085', proveedor: E.proveedores.transge, monto: 6_435_000, metodo: 'cheque', estado: 'Pendiente de Cobro', fechaPago: D('23'), cheque: 'CHQ-2026-0778' },
];

// ── Billeteras virtuales por PYME (Tab Billeteras del admin) ─────────────────
export const seedBilleteras = [
  { pyme: E.pymes.techbata, montoPresupuestado: 13_000_000, saldoDisponible: 12_870_000, totalDistribuido: 0 },
];

// Contratos de ejemplo para los formularios PYME (directo/inverso).
export const seedContratosActivos = [
  { id: 'CT-2026-0041', tipoFactoring: 'directo', contratante: E.contratantes.totalenerge, bancoFondeador: 'BGFI Bank Guinea Ecuatorial', montoMax: 50_000_000 },
  { id: 'CT-2026-0052', tipoFactoring: 'inverso', contratante: E.contratantes.totalenerge, bancoFondeador: 'BGFI Bank Guinea Ecuatorial', montoMax: 30_000_000 },
];

export const seedProveedores = [
  { id: 'p1', razonSocial: 'SAP',     sector: 'Materiales', cuentaBancaria: true },
  { id: 'p2', razonSocial: 'APEX', sector: 'Transporte', cuentaBancaria: true },
  { id: 'p3', razonSocial: 'APEX Tech',   sector: 'Tecnología', cuentaBancaria: false },
];