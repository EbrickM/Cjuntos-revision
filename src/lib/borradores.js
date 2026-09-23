import { localDb } from './localDb';

// ── Borradores de configuración de contrato ─────────────────────────────────
// Persistencia local (localStorage vía localDb) de los wizards de los tres
// portales (Contratante / PYME / Proveedor): guardan el paso y la info que
// escribieron al pulsar "Guardar borrador", y la sección "Mis Contratos" los
// muestra para retomar la configuración exacta donde quedó.
//
// Sin seed: la lista nace vacía y se llena con el botón de cada wizard.

const KEY_BORRADORES = 'borradores';

export function listarBorradores(rol) {
  const lista = localDb.get(KEY_BORRADORES, [], null);
  return (Array.isArray(lista) ? lista : [])
    .filter(b => b?.rol === rol)
    .map(b => ({ ...b, datos: b?.datos ?? {} }))
    .sort((a, b) => String(b.actualizado).localeCompare(String(a.actualizado)));
}

export function guardarBorrador({ rol, contratoId, paso, datos = {} }) {
  const lista = localDb.get(KEY_BORRADORES, [], null);
  const borrador = {
    id: contratoId,
    rol,
    contratoId,
    paso: Number(paso) || 0,
    datos,
    actualizado: new Date().toISOString(),
  };
  const idx = lista.findIndex(b => b?.rol === rol && b?.contratoId === contratoId);
  const next = idx >= 0
    ? [...lista.slice(0, idx), borrador, ...lista.slice(idx + 1)]
    : [...lista, borrador];
  localDb.set(KEY_BORRADORES, next);
  return borrador;
}

export function obtenerBorrador(rol, contratoId) {
  return listarBorradores(rol).find(b => b.contratoId === contratoId) ?? null;
}

export function eliminarBorrador(rol, contratoId) {
  const lista = localDb.get(KEY_BORRADORES, [], null);
  localDb.set(KEY_BORRADORES, lista.filter(b => !(b?.rol === rol && b?.contratoId === contratoId)));
}