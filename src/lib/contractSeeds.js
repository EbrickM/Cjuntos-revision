// ── Semillas de contratos (BPMN "Solicitar Contrato") ─────────────────────────
// Reemplazan los arrays estáticos por rol (epData.pymeContratosPendientes,
// contratanteData.contratosMarco/contratos, provData.contratosPendientes/
// contratos, admin/Contratos.jsx initialContracts, invoiceSeeds
// seedContratosActivos) por un modelo único consumido por contrato.service
// via localDb. Un mismo contrato puede ser visible en varios portales
// (campo `portales`); cada portal / admin lo ve desde su propia vista.
import { CST } from './contractStates';

export const SEED_VERSION = 3;

const H = (titulo, detalle, fecha) => ({ titulo, detalle, fecha: fecha ?? '01/07/2026', actor: 'Sistema' });

// Historia acumulada según el estado actual — refleja el BPMN: registro por
// Bonafide, configuración por el portal y revisión / autorización (Fase 3).
function historia(estado, extra = []) {
  const ev = [];
  const push = (titulo, detalle) => ev.push(H(titulo, detalle));
  push('Contrato registrado', 'Bonafide registró el contrato en el sistema.');
  if ([CST.pendienteRevision, CST.conRequerimientos, CST.enDiscusionTerminos, CST.activo].includes(estado)) {
    push('Enviado a revisión', 'El portal configuró el contrato y lo envió a Bonafide para revisión.');
  }
  if ([CST.conRequerimientos].includes(estado)) {
    push('Con requerimiento de Bonafide', 'Bonafide devolvió el contrato con observaciones.');
  }
  if ([CST.enDiscusionTerminos].includes(estado)) {
    push('Términos rechazados', 'La parte responsable rechazó los términos; pendiente de discusión.');
  }
  if ([CST.activo].includes(estado)) {
    push('Activo', 'Bonafide autorizó y activó el contrato.');
  }
  return [...ev, ...extra];
}

// Semilla base con defaults del esquema canónico "fat" (los campos concreta
// que no aplican a un contrato se dejan vacíos para que todas las vistas
// lean el mismo objeto).
const fc = (o) => {
  const base = {
    portal: 'admin',
    portales: ['admin'],
    tipo: 'asignacion',
    tipoFactoring: null,
    gestionFondos: null,
    comentarioRechazo: '',
    kyc: null,
    bancoFondeador: null,
    interes: null,
    porcentajeRetencion: null,
    porcentajeGestionCobranza: null,
    plazoPago: null,
    plazo: null,
    objeto: null,
    fechaInicio: null,
    fechaFin: null,
    cuentaBancaria: null,
    proveedoresAsignados: [],
    suministradoresAsignados: [],
    suministradores: [],
    pymesAsignadas: [],
    requerimiento: null,
    nota: '',
    distribucion: [],
    facturas: [],
    historia: historia(o?.estado ?? CST.pendienteConfiguracion),
    ...o,
  };
  const montoTotal = base.monto ?? base.montoAsignado ?? base.montoBase ?? 0;
  if (base.asignado == null) {
    const asignadoListas = [...base.proveedoresAsignados, ...base.pymesAsignadas, ...base.suministradoresAsignados]
      .reduce((sum, x) => sum + (Number(x.monto) || 0), 0);
    base.asignado = base.monto > 0 ? (base.asignado ?? 0) : asignadoListas;
  }
  base.disponible = (base.disponible ?? montoTotal - (base.asignado ?? 0)) < 0 ? 0 : (base.disponible ?? montoTotal - (base.asignado ?? 0));
  return base;
};

export const seedContratos = [
  // ── Marcos registrados por Bonafide (Fase 1 del BPMN) · vista Contratante ──
  fc({
    id: 'CTM-2026-0007', portal: 'contratante', portales: ['contratante', 'admin'], tipo: 'marco',
    estado: CST.pendienteConfiguracion, pymeNombre: '—',
    montoBase: 250_000_000, monto: 250_000_000, asignado: 0, disponible: 250_000_000,
    plazoPagoDefault: 30, interes: '5% anual', bancoFondeador: 'BGFI Bank Guinea Ecuatorial',
    porcentajeRetencion: 3, porcentajeGestionCobranza: 1.5,
    fechaCreacion: '01/07/2026', cuentaBancaria: null, pymesAsignadas: [],
    nota: 'Contrato-marco registrado por Bonafide. En espera de que la Empresa Contratante lo configure y lo reparta entre sus PYMEs.',
  }),
  fc({
    id: 'CTM-2026-0011', portal: 'contratante', portales: ['contratante', 'admin'], tipo: 'marco',
    estado: CST.conRequerimientos, pymeNombre: '—',
    montoBase: 120_000_000, monto: 120_000_000, asignado: 80_000_000, disponible: 40_000_000,
    plazoPagoDefault: 45, interes: '6% anual', bancoFondeador: 'CCEIBank',
    porcentajeRetencion: 2, porcentajeGestionCobranza: 1,
    fechaCreacion: '15/06/2026', cuentaBancaria: { tipo: 'bonafide', numero: null },
    pymesAsignadas: [
      { id: 'ASG-9001', pymeNombre: 'Martinez Hermanos (MH)', pymeId: 'Martinez Hermanos (MH)', monto: 80_000_000, plazoPago: 45, email: 'contacto@agrosur.gq', telefono: '+240 222 550 120', documentoNombre: 'contrato_comercial.pdf' },
    ],
    requerimiento: {
      entidades: ['Empresa Contratante'],
      mensaje: 'El monto asignado a Martinez Hermanos (MH) supera el 70% del contrato base sin justificación adjunta. Redistribuye el monto entre más PYMEs o adjunta el sustento correspondiente.',
      fecha: '16/06/2026',
    },
    nota: 'La configuración enviada no cumple los requisitos. Se solicitó una corrección a la parte responsable.',
  }),

  // ── Asignaciones a PYME (Subproceso 2) · vista PYME ──
  fc({
    id: 'CT-2026-0058', portal: 'pyme', portales: ['pyme', 'admin'],
    estado: CST.pendienteConfiguracion,
    contratanteNombre: 'Chevron',
    montoAsignado: 45_000_000, monto: 45_000_000, asignado: 0, disponible: 45_000_000,
    plazoPago: 30, interes: '4.5% anual', bancoFondeador: 'CCEI Bank Guinea Ecuatorial',
    porcentajeRetencion: 2.5, porcentajeGestionCobranza: 1,
    fechaAsignacion: '10/07/2026', gestionFondos: null, comentarioRechazo: '', proveedoresAsignados: [],
    nota: 'Contrato registrado por Bonafide. En espera de que la PYME lo configure y lo reparta entre sus Proveedores.',
  }),
  fc({
    id: 'CT-2026-0066', portal: 'pyme', portales: ['pyme', 'admin'],
    estado: CST.conRequerimientos,
    contratanteNombre: 'Subsea 7',
    montoAsignado: 30_000_000, monto: 30_000_000, asignado: 12_000_000, disponible: 18_000_000,
    plazoPago: 45, interes: '5.5% anual', bancoFondeador: 'ECOBank',
    porcentajeRetencion: 2.5, porcentajeGestionCobranza: 1,
    fechaAsignacion: '20/06/2026', gestionFondos: 'retirar', comentarioRechazo: '',
    proveedoresAsignados: [
      { id: 'PROV-9001', nombre: 'Lideshore Este', email: 'ventas@suminest.gq', telefono: '+240 222 808 909', monto: 12_000_000, cargaNomina: false },
    ],
    requerimiento: {
      entidades: ['PYME'],
      mensaje: 'El proveedor "Lideshore Este" no tiene monto suficiente sustentado con factura. Adjunta o corrige el presupuesto antes de continuar.',
      fecha: '21/06/2026',
    },
    nota: 'La configuración enviada no cumple los requisitos. Se solicitó una corrección a la parte responsable.',
  }),

  // ── Asignaciones a Proveedor (Subproceso 3) · vista Proveedor ──
  fc({
    id: 'CT-2026-0073', portal: 'proveedor', portales: ['proveedor', 'admin'],
    estado: CST.pendienteConfiguracion,
    pymeNombre: 'Tradex', montoAsignado: 15_000_000, monto: 15_000_000, asignado: 0, disponible: 15_000_000,
    fechaAsignacion: '12/07/2026', cuentaBancaria: null, suministradoresAsignados: [],
    nota: 'Contrato registrado por Bonafide. En espera de que el Proveedor lo configure y lo reparta entre sus Suministradores.',
  }),
  fc({
    id: 'CT-2026-0079', portal: 'proveedor', portales: ['proveedor', 'admin'],
    estado: CST.conRequerimientos,
    pymeNombre: 'Tradex', montoAsignado: 9_000_000, monto: 9_000_000, asignado: 4_500_000, disponible: 4_500_000,
    fechaAsignacion: '19/07/2026', cuentaBancaria: { tipo: 'bonafide', numero: null },
    suministradoresAsignados: [
      { id: 'SUM-002', nombre: 'Lideshore', email: 'info@repmalabo.gq', telefono: '+240 222 808 111', monto: 4_500_000, cargaNomina: false },
    ],
    requerimiento: {
      entidades: ['Proveedor'],
      mensaje: 'El suministrador "Lideshore" no tiene KYC vigente registrado. Actualiza su verificación antes de continuar.',
      fecha: '19/07/2026',
    },
    nota: 'La configuración enviada no cumple los requisitos. Se solicitó una corrección a la parte responsable.',
  }),

  // ── Factoring activo (vista shared: PYME / Proveedor / Contratante / Banco) ──
  fc({
    id: 'CT-2026-0041', portal: 'banco', portales: ['pyme', 'proveedor', 'contratante', 'banco', 'admin', 'factoring'],
    estado: CST.activo, kyc: 'vigente', tipoFactoring: 'directo', gestionFondos: 'billetera',
    contratanteNombre: 'GEOMS', pyme: 'Tradex', pymeNombre: 'Tradex', sector: 'Construcción',
    monto: 180_000_000, asignado: 47_500_000, disponible: 132_500_000, montoMax: 50_000_000, utilizado: 47_500_000, facturas: 2,
    plazoPago: 30, interes: '5% anual', bancoFondeador: 'BGFI Bank Guinea Ecuatorial',
    porcentajeRetencion: 3, porcentajeGestionCobranza: 1.5,
    marcoId: 'CTM-2026-0002', cuentaBancaria: { tipo: 'bonafide', numero: null },
    objeto: 'Construcción de sede corporativa en el Paseo Luba, Malabo — estructura, instalaciones y acabados interiores.',
    fechaInicio: '01/03/2026', fechaFin: '28/02/2027', plazo: '12 meses',
    contratante: {
      razonSocial: 'GEOMS', nombreComercial: 'GEOMS', ruc: 'GE-2023-00156', sectorProductivo: 'Construcción', scoreCredito: 720,
      telefonoCorporativo: '+240 222 100 200', correoCorporativo: 'admin@conmalabo.gq',
      objetoTrabajo: 'Construcción de sede corporativa en el Paseo Luba, Malabo — estructura, instalaciones y acabados interiores.',
      documentoContrato: null, montoGlobal: '180000000',
      fechaInicio: '2026-03-01', fechaFin: '2027-02-28', plazosEjecucion: '12 meses',
      repNombre: 'Pedro Ondo Mangue', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1978-00231',
      repCargo: 'Director General', repTelefono: '+240 222 100 201', repCorreo: 'pondo@conmalabo.gq',
      confirmado: true,
    },
    distribucion: [
      { id: 'dist-001', concepto: 'Compra de Materiales', monto: 21_500_000, providerId: '',   providerName: '',            providerSector: '' },
      { id: 'dist-002', concepto: 'Pago a Proveedor',     monto: 26_000_000, providerId: 'p1', providerName: 'SAP',    providerSector: 'Materiales' },
    ],
  }),
  fc({
    id: 'CT-2026-0052', portal: 'banco', portales: ['pyme', 'proveedor', 'contratante', 'banco', 'admin', 'factoring'],
    estado: CST.conRequerimientos, kyc: 'vigente', tipoFactoring: 'inverso',
    contratanteNombre: 'Chevron', pyme: 'Martinez Hermanos (MH)', pymeNombre: 'Martinez Hermanos (MH)', sector: 'Agroindustria',
    monto: 60_000_000, asignado: 12_000_000, disponible: 48_000_000, montoMax: 30_000_000, utilizado: 12_000_000, facturas: 0,
    plazoPago: 45, interes: '5% anual', bancoFondeador: 'BGFI Bank Guinea Ecuatorial',
    porcentajeRetencion: 3, porcentajeGestionCobranza: 1.5,
    marcoId: 'CTM-2026-0002', cuentaBancaria: { tipo: 'bonafide', numero: null },
    objeto: 'Suministro de insumos agrícolas para plantaciones de cacao y café en la región continental.',
    fechaInicio: '01/03/2026', fechaFin: '28/02/2027', plazo: '12 meses',
    requerimiento: {
      entidades: ['Empresa Contratante'],
      mensaje: 'El monto asignado a Martinez Hermanos (MH) supera el 70% del contrato base sin justificación adjunta. Redistribuye el monto entre más PYMEs o adjunta el sustento correspondiente.',
      fecha: '16/06/2026',
      marcoId: 'CTM-2026-0011',
    },
    contratante: {
      razonSocial: 'Chevron', nombreComercial: 'Chevron', ruc: 'GE-2016-00789', sectorProductivo: 'Energía', scoreCredito: 780,
      telefonoCorporativo: '+240 222 300 400', correoCorporativo: 'contratos@totalenerge.gq',
      objetoTrabajo: 'Suministro de insumos agrícolas para plantaciones de cacao y café en la región continental.',
      documentoContrato: null, montoGlobal: '60000000',
      fechaInicio: '2026-03-01', fechaFin: '2027-02-28', plazosEjecucion: '12 meses',
      repNombre: 'Ricardo Nsue Obama', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1975-00456',
      repCargo: 'Gerente de Operaciones', repTelefono: '+240 222 300 401', repCorreo: 'rnsue@totalenerge.gq',
      confirmado: true,
    },
    distribucion: [],
  }),

  // ── Contratos activos PYME / Proveedor (vistas propias) ──
  fc({
    id: 'CT-2026-0059', portal: 'pyme', portales: ['pyme', 'admin'],
    estado: CST.activo, kyc: 'vigente', tipoFactoring: 'directo', gestionFondos: 'retirar',
    contratanteNombre: 'Chevron', pymeNombre: '—', sector: 'Energía',
    monto: 95_000_000, asignado: 30_000_000, disponible: 65_000_000, montoMax: 30_000_000, facturas: 0,
    plazoPago: 60, interes: '4.5% anual', bancoFondeador: 'CCEI Bank Guinea Ecuatorial',
    porcentajeRetencion: 2.5, porcentajeGestionCobranza: 1,
    contratante: {
      razonSocial: 'Chevron', nombreComercial: 'Chevron', ruc: 'GE-2016-00789', sectorProductivo: 'Energía', scoreCredito: 780,
      telefonoCorporativo: '+240 222 300 400', correoCorporativo: 'contratos@totalenerge.gq',
      objetoTrabajo: 'Suministro y mantenimiento de equipos de perforación para operaciones costa afuera en el bloque de Punta Europa.',
      documentoContrato: null, montoGlobal: '95000000',
      fechaInicio: '2026-04-01', fechaFin: '2027-03-31', plazosEjecucion: '12 meses',
      repNombre: 'Ricardo Nsue Obama', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1975-00456',
      repCargo: 'Gerente de Operaciones', repTelefono: '+240 222 300 401', repCorreo: 'rnsue@totalenerge.gq',
      confirmado: true,
    },
    distribucion: [
      { id: 'dist-201', concepto: 'Pago a Proveedor',     monto: 18_000_000, providerId: 'p2', providerName: 'APEX', providerSector: 'Transporte' },
      { id: 'dist-202', concepto: 'Compra de Materiales', monto: 12_000_000, providerId: '',   providerName: '',             providerSector: '' },
    ],
  }),
  fc({
    id: 'CT-2026-0081', portal: 'proveedor', portales: ['proveedor', 'admin'],
    estado: CST.activo, pymeNombre: 'Martinez Hermanos (MH)', pyme: 'Martinez Hermanos (MH)', sector: 'Transporte',
    monto: 22_000_000, asignado: 9_500_000, disponible: 12_500_000, montoMax: 9_500_000, facturas: 1,
    plazoPago: 30, interes: '5.5% anual', bancoFondeador: 'CCEI Bank Guinea Ecuatorial',
    porcentajeRetencion: 2.5, porcentajeGestionCobranza: 1,
    cuentaBancaria: { tipo: 'bonafide', numero: null },
    objeto: 'Transporte y logística de insumos agrícolas entre almacenes regionales de la PYME.',
    fechaInicio: '01/04/2026', fechaFin: '31/03/2027', plazo: '12 meses',
    suministradores: [
      { id: 'SUM-001', nombre: 'SAP', email: 'ventas@combata.gq', telefono: '+240 222 606 707', monto: 9_500_000, cargaNomina: false, kyc: 'vigente', scoreCredito: 705 },
    ],
  }),
  fc({
    id: 'CT-2026-0088', portal: 'proveedor', portales: ['proveedor', 'admin'],
    estado: CST.conRequerimientos, pymeNombre: 'Tradex', pyme: 'Tradex', sector: 'Transporte',
    monto: 9_000_000, asignado: 4_500_000, disponible: 4_500_000, montoMax: 4_500_000, facturas: 1,
    plazoPago: 30, interes: '5% anual', bancoFondeador: 'BGFI Bank Guinea Ecuatorial',
    porcentajeRetencion: 3, porcentajeGestionCobranza: 1.5,
    cuentaBancaria: { tipo: 'bonafide', numero: null },
    objeto: 'Transporte de materiales de construcción para obras en Malabo.',
    fechaInicio: '01/05/2026', fechaFin: '30/04/2027', plazo: '12 meses',
    suministradores: [
      { id: 'SUM-002', nombre: 'Lideshore', email: 'info@repmalabo.gq', telefono: '+240 222 808 111', monto: 4_500_000, cargaNomina: false, kyc: 'pendiente', scoreCredito: 640 },
    ],
    requerimiento: {
      entidades: ['Proveedor'],
      mensaje: 'El suministrador "Lideshore" no tiene KYC vigente registrado. Actualiza su verificación antes de continuar.',
      fecha: '19/07/2026',
      contratoId: 'CT-2026-0079',
    },
    nota: 'La configuración enviada no cumple los requisitos. Se solicitó una corrección a la parte responsable.',
  }),

  // ── Serie del admin (Bonafide), correlativo único CT-2026-XXXX ──
  fc({
    id: 'CT-2026-0101', portal: 'admin', portales: ['admin'], pymeNombre: 'Tradex',
    monto: 58_000_000, asignado: 0, disponible: 58_000_000,
    estado: CST.pendienteConfiguracion,
    nota: 'Contrato registrado por Bonafide. En espera de que la Empresa Contratante lo configure y lo reparta entre sus PYMEs.',
    contratante: {
      razonSocial: '', nombreComercial: '', ruc: '', sectorProductivo: '',
      telefonoCorporativo: '', correoCorporativo: '', objetoTrabajo: '',
      documentoContrato: null, montoGlobal: '', fechaInicio: '', fechaFin: '', plazosEjecucion: '',
      repNombre: '', repTipoDoc: '', repIdentificacion: '', repCargo: '', repTelefono: '', repCorreo: '',
      confirmado: false,
    },
    distribucion: [], facturas: [],
  }),
  fc({
    id: 'CT-2026-0102', portal: 'admin', portales: ['admin'], pymeNombre: 'Tradex',
    monto: 42_000_000, asignado: 9_000_000, disponible: 33_000_000,
    estado: CST.activo, nota: '',
    contratante: {
      razonSocial: 'Subsea 7', nombreComercial: 'Subsea 7', ruc: 'GE-2021-00278', sectorProductivo: 'Construcción',
      telefonoCorporativo: '+240 222 909 111', correoCorporativo: 'admin@evans.gq',
      objetoTrabajo: 'Obras de edificación, remodelación integral y adecuación de oficinas corporativas en el complejo empresarial de Sipopo.',
      documentoContrato: null, montoGlobal: '42000000',
      fechaInicio: '2026-02-01', fechaFin: '2026-08-01', plazosEjecucion: '6 meses',
      repNombre: 'John Evans Jr.', repTipoDoc: 'Pasaporte', repIdentificacion: 'GE-1980-00145',
      repCargo: 'CEO & Representante Legal', repTelefono: '+240 222 909 112', repCorreo: 'jevans@evans.gq',
      confirmado: true,
    },
    distribucion: [
      { id: 'dist-001', concepto: 'Pago a Proveedor', monto: 9_000_000, providerId: 'p2', providerName: 'APEX', providerSector: 'Transporte' },
    ],
    facturas: [
      { id: 'FAC-2026-1025', tipo: 'proveedor',   monto: 4_500_000, estado: 'Enviada', concepto: 'Transporte de materiales al sitio de obra',          fecha: '01/05/2026', proveedor: 'APEX' },
      { id: 'FAC-2026-1031', tipo: 'contratante', monto: 18_000_000, estado: 'Pagada',  concepto: 'Avance de obra fase 1 – Cimentación y estructura',   fecha: '10/05/2026' },
    ],
  }),
  fc({
    id: 'CT-2026-0103', portal: 'admin', portales: ['admin'], pymeNombre: 'MH Pinturas',
    monto: 31_000_000, asignado: 0, disponible: 31_000_000,
    estado: CST.enDiscusionTerminos,
    nota: 'La PYME rechazó los términos del contrato. Bonafide debe contactar a ambas partes para resolver el desacuerdo.',
    contratante: {
      razonSocial: 'SEGESA', nombreComercial: 'SEGESA', ruc: 'GE-2019-00891', sectorProductivo: 'Energía',
      telefonoCorporativo: '+240 222 456 789', correoCorporativo: 'contratos@petroguinea.gq',
      objetoTrabajo: 'Suministro de combustible y lubricantes industriales para operaciones en tierra y plataformas offshore.',
      documentoContrato: null, montoGlobal: '31000000',
      fechaInicio: '2026-03-01', fechaFin: '2026-12-31', plazosEjecucion: '10 meses',
      repNombre: 'Carlos Obiang Mba', repTipoDoc: 'Pasaporte', repIdentificacion: 'GE-1985-00234',
      repCargo: 'Director Comercial', repTelefono: '+240 222 456 780', repCorreo: 'cobiang@petroguinea.gq',
      confirmado: false,
    },
    distribucion: [], facturas: [],
  }),
  fc({
    id: 'CT-2026-0104', portal: 'admin', portales: ['admin'], pymeNombre: 'Conexxia Log',
    monto: 75_000_000, asignado: 0, disponible: 75_000_000,
    estado: CST.pendienteRevision,
    nota: 'La Empresa Contratante ya configuró el contrato. Revisa los datos y autorízalo para activarlo.',
    pymesAsignadas: ['Conexxia Log', 'Tradex Transportes'],
    contratante: {
      razonSocial: 'GEOMS', nombreComercial: 'GEOMS', ruc: 'GE-2015-00042', sectorProductivo: 'Construcción',
      telefonoCorporativo: '+240 222 001 002', correoCorporativo: 'adm@obras.gob.gq',
      objetoTrabajo: 'Construcción y pavimentación de 12 km de infraestructura vial en la zona norte de Malabo, incluyendo drenajes y señalización.',
      documentoContrato: null, montoGlobal: '75000000',
      fechaInicio: '2026-01-15', fechaFin: '2027-01-15', plazosEjecucion: '12 meses',
      repNombre: 'Eugenio Ndong Esono', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1972-00089',
      repCargo: 'Secretario General', repTelefono: '+240 222 001 003', repCorreo: 'endong@obras.gob.gq',
      confirmado: true,
    },
    distribucion: [
      { id: 'dist-101', concepto: 'Pago a Proveedor', monto: 12_000_000, providerId: 'p10', providerName: 'APEX Cargo',         providerSector: 'Logística' },
      { id: 'dist-102', concepto: 'Pago a Proveedor', monto: 8_000_000,  providerId: 'p11', providerName: 'SAP Materiales', providerSector: 'Materiales' },
    ],
    facturas: [],
  }),
  fc({
    id: 'CT-2026-0105', portal: 'admin', portales: ['admin'], pymeNombre: 'APEX',
    monto: 25_000_000, asignado: 0, disponible: 25_000_000,
    estado: CST.activo, nota: '',
    contratante: {
      razonSocial: 'SEGESA', nombreComercial: 'SEGESA', ruc: 'GE-2018-00317', sectorProductivo: 'Transporte',
      telefonoCorporativo: '+240 222 654 321', correoCorporativo: 'admin@bataporto.gq',
      objetoTrabajo: 'Gestión operativa, mantenimiento preventivo y correctivo de instalaciones y equipos en el Puerto de Bata.',
      documentoContrato: null, montoGlobal: '25000000',
      fechaInicio: '2026-04-01', fechaFin: '2027-03-31', plazosEjecucion: '12 meses',
      repNombre: 'María Esono Nguema', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1979-00312',
      repCargo: 'Directora General', repTelefono: '+240 222 654 322', repCorreo: 'mesono@bataporto.gq',
      confirmado: true,
    },
    distribucion: [], facturas: [],
  }),
  fc({
    id: 'CT-2026-0107', portal: 'admin', portales: ['admin'], pymeNombre: 'APEX Tech',
    monto: 18_500_000, asignado: 0, disponible: 18_500_000,
    estado: CST.conRequerimientos,
    nota: 'La configuración enviada no cumple los requisitos. Se solicitó una corrección a la parte responsable.',
    requerimiento: {
      entidades: ['PYME'],
      mensaje: 'La PYME APEX Tech no adjuntó la documentación de respaldo requerida para validar el monto asignado por el contratante. Favor de adjuntar el contrato comercial actualizado antes de continuar con la autorización.',
      fecha: '11/07/2026',
    },
    contratante: {
      razonSocial: 'Subsea 7', nombreComercial: 'Subsea 7', ruc: 'GE-2010-00056', sectorProductivo: 'Energía',
      telefonoCorporativo: '+240 222 100 200', correoCorporativo: 'admin@gepetrol.gq',
      objetoTrabajo: 'Mantenimiento y soporte técnico de sistemas informáticos y redes de comunicación en las instalaciones de Subsea 7 en Malabo.',
      documentoContrato: null, montoGlobal: '18500000',
      fechaInicio: '2026-05-01', fechaFin: '2026-10-31', plazosEjecucion: '6 meses',
      repNombre: 'Anastasio Ndong Ela', repTipoDoc: 'Cédula', repIdentificacion: 'GE-1981-00203',
      repCargo: 'Director de Operaciones', repTelefono: '+240 222 100 201', repCorreo: 'andong@gepetrol.gq',
      confirmado: true,
    },
    distribucion: [], facturas: [],
  }),
];