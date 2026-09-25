// ── Notificaciones de Bonafide (Admin): entidades añadidas por los portales ──
// Cada vez que un rol agrega una Empresa Contratada / Proveedor / Suministrador
// (desde el directorio o desde el detalle de un contrato), se registra aquí
// para que Bonafide la vea en su panel de notificaciones y pueda aprobarla,
// rechazarla (lo que la quita del directorio compartido) o ver el detalle.
import { localDb } from './localDb';

const KEY = 'admin_entity_notifs';

// Directorio compartido (mismo localDb key que usan los hooks de cada rol)
// donde vive cada tipo de entidad — para poder revertir el alta al rechazar.
const DIRECTORIO_KEY = {
  'Empresa Contratada': 'emp_pymes',
  'Suministrador': 'prov_suministradores',
  'Proveedor': 'ep_providers',
};

function generarId() {
  return `entnotif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listarNotifsEntidad() {
  return localDb.get(KEY, [], null) ?? [];
}

// referente: quién agregó la entidad (rolLabel + nombre de quien opera el portal).
export function registrarNotifEntidad({ rolLabel, quien, tipoEntidad, nombreEntidad, detalle }) {
  const lista = listarNotifsEntidad();
  const nueva = {
    id: generarId(),
    fecha: new Date().toLocaleString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    rolLabel,
    quien: quien || '—',
    tipoEntidad,
    nombreEntidad,
    detalle: detalle || {},
  };
  localDb.set(KEY, [nueva, ...lista]);
  return nueva;
}

// Quita la notificación de la lista (ya fue aprobada o rechazada).
export function resolverNotifEntidad(id) {
  const lista = listarNotifsEntidad().filter(n => n.id !== id);
  localDb.set(KEY, lista);
  return lista;
}

// Revierte el alta: quita la entidad del directorio compartido del rol que la
// agregó (mismo localDb key que usan useEmpresasContratadas/useSuministradores/
// useProviders), simulando que Bonafide rechazó la incorporación.
export function eliminarEntidadDeDirectorio(tipoEntidad, nombreEntidad) {
  const key = DIRECTORIO_KEY[tipoEntidad];
  if (!key) return;
  const lista = localDb.get(key, [], null) ?? [];
  const filtrada = lista.filter(item => (item.nombre ?? item.razonSocial) !== nombreEntidad);
  localDb.set(key, filtrada);
}
