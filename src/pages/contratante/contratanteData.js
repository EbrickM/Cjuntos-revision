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
export const contratos = [
  { id: 'CT-2026-0041', pyme: 'Const. Silva Ltd.', ini: 'CS', sector: 'Construcción', asignado: 180_000_000, utilizado: 47_500_000, facturas: 2, estado: 'Activo',
    objeto: 'Construcción de sede corporativa en el Paseo Luba, Malabo — estructura, instalaciones y acabados interiores.', fechaInicio: '01/03/2026', fechaFin: '28/02/2027', plazo: '12 meses' },
];

// 2 facturas sobre CT-2026-0041 · suma: 47 500 000 XAF (= utilizado)
export const facturas = [
  { id: 'FAC-2026-0911', contrato: 'CT-2026-0041', pyme: 'Const. Silva Ltd.', monto: 21_500_000, fecha: '28/06/2026', estado: 'Recibida',  concepto: 'Obras de estructura fase 2 — planta baja y primer piso' },
  { id: 'FAC-2026-0918', contrato: 'CT-2026-0041', pyme: 'Const. Silva Ltd.', monto: 26_000_000, fecha: '05/07/2026', estado: 'Recibida',   concepto: 'Acabados interiores y carpintería — módulos A y B' },
];

export const pymes = [
  { ini: 'CS', nombre: 'Const. Silva Ltd.', sector: 'Construcción', contratos: 1, montoTotal: 180_000_000, score: 870, semaforo: 'Verde',
    nombreComercial: 'Construsilva GE', ruc: 'GE-2018-04512', telefono: '+240 222 301 458', correo: 'info@constsilva.gq',
    repNombre: 'Carlos Silva Mba',      repTipoDoc: 'DNI', repId: 'GE-19820314-CS', repCargo: 'Gerente General', repTel: '+240 551 120 001', repCorreo: 'c.silva@constsilva.gq' },
];

export const misSolicitudes = [
  { id: 'SOL-2026-0142', tipo: 'Nuevo contrato', desc: 'Contrato con ConstCentro PYME · Construcción', monto: 50_000_000, fecha: '01/07/2026', estado: 'En revisión' },
  { id: 'SOL-2026-0138', tipo: 'Nuevo contrato', desc: 'Contrato con MaderGE PYME S.L.',               monto: 80_000_000, fecha: '25/06/2026', estado: 'Aprobada'    },
  { id: 'SOL-2026-0119', tipo: 'Nuevo contrato', desc: 'Contrato con InfraBata S.L.',                   monto: 45_000_000, fecha: '10/06/2026', estado: 'Rechazada'   },
];

export const solicitudesPymes = [
  { id: 'SOLP-2026-0051', ini: 'CC', pyme: 'ConstCentro PYME', sector: 'Construcción',  desc: 'Obras de infraestructura vial — Bata Norte',    monto: 95_000_000, fecha: '05/07/2026' },
  { id: 'SOLP-2026-0048', ini: 'AS', pyme: 'AgroSur GE S.L.',  sector: 'Agroindustria', desc: 'Suministro productos agrícolas — campaña 2026', monto: 60_000_000, fecha: '03/07/2026' },
  { id: 'SOLP-2026-0044', ini: 'TM', pyme: 'TechMalabo Ltd.',  sector: 'Tecnología',    desc: 'Mantenimiento sistemas TI corporativos',        monto: 35_000_000, fecha: '28/06/2026' },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────
export const facturaBadge = e => ({ 'Recibida': 'orange', 'En revisión': 'yellow', 'Verificada': 'blue', 'IPI emitido': 'green', 'Pagada': 'green' }[e] ?? 'gray');
export const solicBadge   = e => ({ 'En revisión': 'yellow', 'Aprobada': 'green', 'Rechazada': 'red' }[e] ?? 'gray');
export const semBadge     = s => s === 'Verde' ? 'green' : s === 'Amarillo' ? 'yellow' : 'red';
export const semColor     = s => s === 'Verde' ? GREEN : s === 'Amarillo' ? WARN : ERR;
export const scoreColor   = n => n >= 750 ? GREEN : n >= 500 ? WARN : ERR;

// ── Estado compartido entre pantallas (selección de contrato / solicitud) ─────
// Objeto mutable simple: mientras contratos/facturas/pymes sean mock estático
// no hace falta un store (nadie necesita re-render reactivo, solo leer una vez
// al montar la pantalla destino). Si esto pasa a venir de la API real, ahí sí
// migrar a Zustand (loading/error/refetch), igual que authStore.
export const contratanteState = {
  selectedContrato: contratos[0],
  solicitudPyme: null,
};
