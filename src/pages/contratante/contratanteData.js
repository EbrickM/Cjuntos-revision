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
// Ficha compartida por ambos contratos de ejemplo (ambos provienen del mismo
// contrato-marco CTM-2026-0002, ya aprobado y activo — a diferencia de
// `contratosMarco`, que solo contiene marcos aún pendientes de configuración).
const FICHA_CTM_2026_0002 = {
  marcoId: 'CTM-2026-0002',
  bancoFondeador: 'BGFI Bank Guinea Ecuatorial',
  interes: '5% anual',
  porcentajeRetencion: 3,
  porcentajeGestionCobranza: 1.5,
  cuentaBancaria: { tipo: 'bonafide', numero: null },
};

export const contratos = [
  { id: 'CT-2026-0041', pyme: 'Tradex', ini: 'TR', sector: 'Construcción', asignado: 180_000_000, utilizado: 47_500_000, facturas: 2, estado: 'Activo',
    objeto: 'Construcción de sede corporativa en el Paseo Luba, Malabo — estructura, instalaciones y acabados interiores.', fechaInicio: '01/03/2026', fechaFin: '28/02/2027', plazo: '12 meses', plazoPago: 30,
    ...FICHA_CTM_2026_0002 },
  { id: 'CT-2026-0052', pyme: 'Martinez Hermanos (MH)', ini: 'MH', sector: 'Agroindustria', asignado: 60_000_000, utilizado: 12_000_000, facturas: 0, estado: 'Con Requerimientos',
    objeto: 'Suministro de insumos agrícolas para plantaciones de cacao y café en la región continental.', fechaInicio: '01/03/2026', fechaFin: '28/02/2027', plazo: '12 meses', plazoPago: 45,
    // Bonafide encontró una observación en la reconfiguración de este
    // contrato (Fase 3 del proceso maestro) — `marcoId` apunta al
    // contrato-marco en `contratosMarco` que el wizard debe reabrir.
    requerimiento: {
      entidades: ['Empresa Contratante'],
      mensaje: 'El monto asignado a Martinez Hermanos (MH) supera el 70% del contrato base sin justificación adjunta. Redistribuye el monto entre más PYMEs o adjunta el sustento correspondiente.',
      fecha: '16/06/2026',
      marcoId: 'CTM-2026-0011',
    },
    ...FICHA_CTM_2026_0002 },
];

// 2 facturas sobre CT-2026-0041 · suma: 47 500 000 XAF (= utilizado)
export const facturas = [
  { id: 'FAC-2026-0911', contrato: 'CT-2026-0041', pyme: 'Tradex', monto: 21_500_000, fecha: '28/06/2026', estado: 'Recibida',  concepto: 'Obras de estructura fase 2 — planta baja y primer piso' },
  { id: 'FAC-2026-0918', contrato: 'CT-2026-0041', pyme: 'Tradex', monto: 26_000_000, fecha: '05/07/2026', estado: 'Recibida',   concepto: 'Acabados interiores y carpintería — módulos A y B' },
];

export const pymes = [
  { ini: 'TR', nombre: 'Tradex', sector: 'Construcción', contratos: 1, montoTotal: 180_000_000, score: 820, semaforo: 'Verde',
    nombreComercial: 'Construsilva GE', ruc: 'GE-2018-04512', telefono: '+240 222 301 458', correo: 'info@constsilva.gq',
    repNombre: 'Carlos Silva Mba',      repTipoDoc: 'DNI', repId: 'GE-19820314-CS', repCargo: 'Gerente General', repTel: '+240 551 120 001', repCorreo: 'c.silva@constsilva.gq' },
  { ini: 'MH', nombre: 'Martinez Hermanos (MH)', sector: 'Agroindustria', contratos: 1, montoTotal: 60_000_000, score: 680, semaforo: 'Amarillo',
    nombreComercial: 'Martinez Hermanos', ruc: 'GE-2020-00812', telefono: '+240 222 550 120', correo: 'contacto@agrosur.gq',
    repNombre: 'María Nguema Owono',    repTipoDoc: 'DNI', repId: 'GE-19900112-AS', repCargo: 'Directora Financiera', repTel: '+240 551 220 044', repCorreo: 'm.nguema@agrosur.gq' },
];

export const misSolicitudes = [
  { id: 'SOL-2026-0142', tipo: 'Nuevo contrato', desc: 'Contrato con Conexxia · Construcción', monto: 50_000_000, fecha: '01/07/2026', estado: 'En revisión' },
];

export const solicitudesPymes = [
  { id: 'SOLP-2026-0051', ini: 'CX', pyme: 'Conexxia', sector: 'Construcción',  desc: 'Obras de infraestructura vial — Bata Norte',    monto: 95_000_000, fecha: '05/07/2026' },
  { id: 'SOLP-2026-0048', ini: 'MH', pyme: 'Martinez Hermanos (MH)',  sector: 'Agroindustria', desc: 'Suministro productos agrícolas — campaña 2026', monto: 60_000_000, fecha: '03/07/2026' },
  { id: 'SOLP-2026-0044', ini: 'TC', pyme: 'Conexxia Tech',  sector: 'Tecnología',    desc: 'Mantenimiento sistemas TI corporativos',        monto: 35_000_000, fecha: '28/06/2026' },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────
// Cada estado distinto mapea a una variante distinta (Anexo Digital MIC v1.0).
export const facturaBadge = e => ({ 'Recibida': 'gray', 'En revisión': 'amber', 'Verificada': 'blue', 'Emitida': 'orange', 'Pagada': 'green' }[e] ?? 'gray');
export const solicBadge   = e => ({ 'En revisión': 'amber', 'Aprobada': 'green', 'Rechazada': 'red' }[e] ?? 'gray');
export const semBadge     = s => s === 'Verde' ? 'green' : s === 'Amarillo' ? 'amber' : 'red';
// Badge de estado de contrato (todas las secciones): cada estado del ciclo de
// vida de la configuración con su color distinto (misma escala que contractStates).
export const contratoBadge = e =>
  e === 'Activo' ? 'green' :
  e === 'Con Requerimientos' ? 'red' :
  e === 'En Discusión de Términos' ? 'brand' :
  e === 'Pendiente de Revisión' ? 'orange' : 'amber';
export const semColor     = s => s === 'Verde' ? GREEN : s === 'Amarillo' ? WARN : ERR;
export const scoreColor   = n => n >= 750 ? GREEN : n >= 500 ? WARN : ERR;

// ── Contratos-marco pendientes de configuración ────────────────────────────────
// Creados por Bonafide (Fase 1 del proceso BPMN maestro, fuera de este alcance)
// a partir de un acuerdo comercial con la Empresa Contratante. Esta quedan a la
// espera de que la Contratante los reparta entre sus PYMEs (Subproceso 1).
// Es un concepto separado de `contratos` (que son contratos YA activos, uno por
// PYME): un contrato-marco reparte su monto base entre N PYMEs vía
// `pymesAsignadas`, cada una con su propio monto — la suma no puede superar
// `montoBase`.
export const contratosMarco = [
  {
    id: 'CTM-2026-0007',
    montoBase: 250_000_000,
    plazoPagoDefault: 30,
    interes: '5% anual',
    bancoFondeador: 'BGFI Bank Guinea Ecuatorial',
    porcentajeRetencion: 3,
    porcentajeGestionCobranza: 1.5,
    fechaCreacion: '01/07/2026',
    estado: 'Pendiente de Configuración', // -> 'Pendiente de Revisión' al enviar
    cuentaBancaria: null,                 // { tipo: 'bonafide' | 'fondeador', numero }
    pymesAsignadas: [],                   // [{ id, pymeNombre, pymeId, monto, plazoPago, email, telefono, documentoNombre }]
  },
  {
    // Ya fue configurado por la Contratante y enviado a revisión, pero
    // Bonafide encontró una observación (Fase 3 del proceso maestro) y lo
    // devolvió con un requerimiento — la Contratante debe reconfigurarlo.
    id: 'CTM-2026-0011',
    montoBase: 120_000_000,
    plazoPagoDefault: 45,
    interes: '6% anual',
    bancoFondeador: 'CCEIBank',
    porcentajeRetencion: 2,
    porcentajeGestionCobranza: 1,
    fechaCreacion: '15/06/2026',
    estado: 'Con Requerimientos',
    cuentaBancaria: { tipo: 'bonafide', numero: null },
    pymesAsignadas: [
      { id: 'ASG-9001', pymeNombre: 'Martinez Hermanos (MH)', pymeId: 'Martinez Hermanos (MH)', monto: 80_000_000, plazoPago: 45, email: 'contacto@agrosur.gq', telefono: '+240 222 550 120', documentoNombre: 'contrato_comercial.pdf' },
    ],
    requerimiento: {
      entidades: ['Empresa Contratante'],
      mensaje: 'El monto asignado a Martinez Hermanos (MH) supera el 70% del contrato base sin justificación adjunta. Redistribuye el monto entre más PYMEs o adjunta el sustento correspondiente.',
      fecha: '16/06/2026',
    },
  },
];

export const montoDisponibleMarco = (marco, excluirAsignacionId = null) =>
  marco.montoBase - marco.pymesAsignadas
    .filter(a => a.id !== excluirAsignacionId)
    .reduce((sum, a) => sum + a.monto, 0);

// ── Estado compartido entre pantallas (selección de contrato / solicitud) ─────
// Objeto mutable simple: mientras contratos/facturas/pymes sean mock estático
// no hace falta un store (nadie necesita re-render reactivo, solo leer una vez
// al montar la pantalla destino). Si esto pasa a venir de la API real, ahí sí
// migrar a Zustand (loading/error/refetch), igual que authStore.
export const contratanteState = {
  // Guarda el registro elegido por la Contratante al hacer clic en un contrato
  // (handoff), y hoy también el primer registro de `listarPorVista` en el
  // detalle cuando se entra directo por URL. `contracts` canónicos vienen del
  // store local (contrato.service.js) — no dejar residuos del mock estático.
  selectedContrato: null,
  solicitudPyme: null,
};
