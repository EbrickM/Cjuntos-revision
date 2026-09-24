// ── Utilidades compartidas del portal Banco Fondeador (rol `fondeador`) ───────
// Un banco concreto por portal: BGFI.

export const BANCO = 'BGFI Bank Guinea Ecuatorial';
export const BANCO_CORTO = 'BGFI Bank';

// Monto neto a transferir por el Fondeador: lo fija Bonafide al validar el IPI
// (`condiciones`); si no está, se recalcula desde los porcentajes de la factura.
export function netoFactura(f) {
  if (!f) return 0;
  if (f.condiciones?.neto != null) return f.condiciones.neto;
  const pct = (f.condiciones?.retencion ?? 0)
    + (f.condiciones?.gestionCobranza ?? 0)
    + (f.condiciones?.interes ?? 0);
  return Math.round(f.monto * (1 - pct / 100));
}

export const CONDICIONES_DEFAULT = { retencion: 3, gestionCobranza: 1.5, interes: 5 };

// Toda fecha de la plataforma llega como string 'DD/MM/YYYY' (ver `hoy()` en
// los servicios) — la parseamos a un entero YYYYMMDD ordenable en vez de
// comparar los strings directamente (un localeCompare de '01/12/2026' vs
// '12/01/2026' compara el día primero y da un orden cronológicamente falso).
function fechaOrdenable(fecha) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha ?? '');
  if (!m) return -Infinity;
  const [, d, mo, y] = m;
  return Number(`${y}${mo}${d}`);
}

// Orden estándar de todas las tablas del portal Banco Fondeador: la más
// nueva primero, la más vieja al final.
export function porFechaDesc(a, b) {
  return fechaOrdenable(b.fecha) - fechaOrdenable(a.fecha);
}

// `c.contratante?.fechaInicio` (uno de los datos de la ficha del contrato-marco)
// vive en la semilla como ISO 'YYYY-MM-DD', a diferencia de todo el resto de la
// plataforma que usa 'DD/MM/YYYY' — se normaliza acá para que la tabla de
// Registros nunca mezcle los dos formatos.
const normalizarFecha = (fecha) => {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha ?? '');
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : fecha;
};

// Base de fecha canónica de un contrato (mismas resoluciones que
// `registrosContrato`) — usada por las pestañas IPIs y Registros.
export const fechaContrato = (c) => normalizarFecha(
  c.fechaCreacion ?? c.fechaAsignacion ?? c.fechaInicio ?? c.fecha
  ?? c.contratante?.fechaInicio
  ?? c.requerimiento?.fecha
  ?? c.historia?.[0]?.fecha
  ?? '01/07/2026'
);

// ── Directorio de Empresas Contratantes (como el de /admin/empresas) ─────────
// Fuente única para la pestaña "Clientes" y para el selector "Empresa
// Contratante" que filtra Contratos/Facturas/IPIs/Registros.
export const EMPRESAS_CONTRATANTES = [
  {
    id: 'EMP-001', nombre: 'Chevron', nombreComercial: 'Chevron', sector: 'Energía',
    ruc: 'GE-2010-00011', email: 'contacto@totalenerge.gq', telefono: '+240 222 100 200',
    contratos: ['CONT-001', 'CONT-002', 'CONT-003'],
  },
  {
    id: 'EMP-002', nombre: 'Chevron Sur', nombreComercial: 'Chevron Sur', sector: 'Construcción',
    ruc: 'GE-2015-00234', email: 'info@infraconst.gq', telefono: '+240 222 300 400',
    contratos: ['CONT-004', 'CONT-005'],
  },
  {
    id: 'EMP-003', nombre: 'SEGESA', nombreComercial: 'SEGESA', sector: 'Minería',
    ruc: 'GE-2008-00056', email: 'operaciones@minge.gq', telefono: '+240 222 500 600',
    contratos: ['CONT-006'],
  },
  {
    id: 'EMP-004', nombre: 'GEOMS', nombreComercial: 'GEOMS', sector: 'Agricultura',
    ruc: 'GE-2019-00678', email: 'admin@agroge.gq', telefono: '+240 222 700 800',
    contratos: [],
  },
];
