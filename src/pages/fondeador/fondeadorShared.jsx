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
