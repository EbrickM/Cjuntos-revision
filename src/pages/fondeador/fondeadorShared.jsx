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
