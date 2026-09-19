// ── Servicio de contratos ─────────────────────────────────────────────────────
// Capa de datos única sobre localDb (patrón de authService/facturaService): hoy
// lee/escribe el mock local; cuando exista `apiUrl` de b-mori, solo cambia la
// implementación interna de cada método. La lógica de negocio del BPMN
// (máquina de estados de configuración, autorización, requerimientos) vive aquí.
import { localDb } from '../lib/localDb';
import { CST, TRANSICIONES_CT, estadoLabelCt } from '../lib/contractStates';
import { SEED_VERSION, seedContratos } from '../lib/contractSeeds';

const KEY_CONTRATOS = 'contratos';

const hoy = () => new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });

const evento = (titulo, detalle) => ({ titulo, detalle, fecha: hoy(), actor: 'Sistema' });

function mutarContrato(id, fn) {
  const lista = localDb.get(KEY_CONTRATOS, seedContratos, SEED_VERSION);
  const contr = lista.find(c => c?.id === id);
  if (!contr) throw new Error(`Contrato ${id} no encontrado`);
  const next = fn(contr);
  localDb.set(KEY_CONTRATOS, lista.map(c => (c?.id === id ? next : c)));
  return next;
}

function transicionarContrato(id, transicion, detalle) {
  return mutarContrato(id, (c) => {
    const destinos = TRANSICIONES_CT[c.estado] ?? [];
    if (!destinos.includes(transicion)) {
      throw new Error(`Transición inválida: ${c.estado} → ${transicion}`);
    }
    return {
      ...c,
      estado: transicion,
      historia: [...(c.historia ?? []), evento(estadoLabelCt(transicion), detalle ?? '')],
    };
  });
}

// Normaliza un registro al esquema canónico (campos que toda vista lee).
const normalizar = (c) => ({
  ...c,
  portales: Array.isArray(c.portales) ? c.portales : [c.portal ?? 'admin'],
  historia: Array.isArray(c.historia) ? c.historia : [],
  asignado: c.asignado ?? c.montoAsignado ?? 0,
  disponible: c.disponible ?? Math.max(0, (c.monto ?? c.montoAsignado ?? c.montoBase ?? 0) - (c.asignado ?? 0)),
});

// ── Lecturas ──────────────────────────────────────────────────────────────────
export const contratoService = {
  hasBackend: false,

  listar() {
    const guardadas = localDb.get(KEY_CONTRATOS, seedContratos, SEED_VERSION);
    let lista = Array.isArray(guardadas) ? guardadas : seedContratos.map(c => ({ ...c }));
    const ids = new Set(lista.map(c => c?.id));
    const faltantes = seedContratos.filter(s => !ids.has(s.id));
    if (faltantes.length) {
      lista = [...lista, ...faltantes.map(s => ({ ...s }))];
      localDb.set(KEY_CONTRATOS, lista);
    }
    return lista.map(normalizar);
  },

  obtener(id) {
    return this.listar().find(c => c.id === id) ?? null;
  },

  // Vista de un portal: filtra por el campo explícito `portales` de cada
  // registro (el mismo contrato puede aparecer en varios portales).
  listarPorVista(vista) {
    return this.listar().filter(c => c.portales.includes(vista));
  },

  // Contratos pendientes de configuración de un portal (para el badge del
  // Topbar y para las listas "por configurar" de los wizards).
  listarPendientes(vista) {
    return this.listarPorVista(vista).filter(c => c.estado === CST.pendienteConfiguracion);
  },

  // Contratos listos para el selector de facturación (PYME / Proveedor):
  // es la vista que antes consumía `seedContratosActivos` de invoiceSeeds.
  listarFactoring() {
    return this.listarPorVista('factoring');
  },

// ── Operaciones Admin / Bonafide ──
  // Registra un contrato nuevo (Fase 1 del BPMN). El id se asigna del
  // correlativo único CT-2026-XXXX para no chocar con los demás portales.
  crear(vista, data = {}) {
    const lista = localDb.get(KEY_CONTRATOS, seedContratos, SEED_VERSION);
    const max = lista.reduce((m, c) => Math.max(m, parseInt(String(c?.id).replace(/^CT(?:M)?-2026-/, ''), 10) || 0), 1000);
    const id = `CT-2026-${String(Math.max(max + 1, 1001)).padStart(4, '0')}`;
    const contrato = normalizar({
      id,
      portal: vista,
      // Un contrato registrado por el admin (vista 'admin') "baja" también al
      // portal de la Empresa Contratante para que esta lo configure y lo
      // reparta entre sus PYMEs (Subproceso 1 del BPMN), igual que los marcos
      // sembrados — así la sección "Mis Contratos" del Contratante lo ve.
      portales: vista === 'factoring' ? ['factoring', 'admin'] : vista === 'admin' ? ['contratante', 'admin'] : [vista, 'admin'],
      tipo: 'asignacion',
      tipoFactoring: null,
      estado: CST.pendienteConfiguracion,
      pymeNombre: '—',
      monto: data.monto ?? 0,
      asignado: 0,
      disponible: data.monto ?? 0,
      historia: [evento('Contrato registrado', 'Bonafide registró el contrato en el sistema.')],
      ...data,
    });
    localDb.set(KEY_CONTRATOS, [...lista, contrato]);
    return contrato;
  },

  eliminar(id) {
    const lista = localDb.get(KEY_CONTRATOS, seedContratos, SEED_VERSION);
    const contr = lista.find(c => c?.id === id);
    if (!contr) return null;
    if (contr.estado === CST.activo) {
      throw new Error('No se pueden eliminar contratos activos.');
    }
    localDb.set(KEY_CONTRATOS, lista.filter(c => c?.id !== id));
    return true;
  },

  // Bonafide autoriza (Pendiente de Revisión → Activo). Limpia la nota del
  // requerimiento previo: el contrato queda operativo.
  autorizar(id) {
    return transicionarContrato(id, CST.activo, 'Bonafide autorizó y activó el contrato.');
  },

  // Bonafide devuelve el contrato con observaciones (→ Con Requerimientos).
  ponerRequerimiento(id, { entidades = [], pymes = [], proveedores = [], mensaje = '' } = {}) {
    return mutarContrato(id, (c) => {
      const destinos = TRANSICIONES_CT[c.estado] ?? [];
      if (!destinos.includes(CST.conRequerimientos)) {
        throw new Error(`Transición inválida: ${c.estado} → ${CST.conRequerimientos}`);
      }
      return {
        ...c,
        estado: CST.conRequerimientos,
        nota: (mensaje || '').trim() || 'La configuración enviada no cumple los requisitos. Se solicitó una corrección a la parte responsable.',
        requerimiento: { entidades, pymes, proveedores, mensaje: (mensaje || '').trim(), fecha: hoy() },
        historia: [...(c.historia ?? []), evento('Requerimiento enviado', (mensaje || '').trim() || 'Bonafide puso un requerimiento al contrato.')],
      };
    });
  },

  // ── Operaciones de los portales (wizards) ──
  // El portal configuró el contrato y lo envió a revisión → Pendiente de
  // Revisión, visible en el bandeja del admin. `patch` guarda los datos que
  // escribió el wizard (gestionFondos, proveedoresAsignados, cuentaBancaria,
  // pymesAsignadas, suministradoresAsignados…). Vale tanto para el envío
  // inicial (Pendiente de Configuración / Con Requerimientos → Revisión) como
  // para la reconfiguración tras requerimiento.
  configurar(id, patch = {}) {
    return mutarContrato(id, (c) => {
      const destinos = TRANSICIONES_CT[c.estado] ?? [];
      if (!destinos.includes(CST.pendienteRevision)) {
        throw new Error(`Transición inválida: ${c.estado} → ${CST.pendienteRevision}`);
      }
      return {
        ...c,
        ...patch,
        estado: CST.pendienteRevision,
        nota: 'La Empresa Contratante ya configuró el contrato. Revisa los datos y autorízalo para activarlo.',
        historia: [...(c.historia ?? []), evento('Enviado a revisión', 'El portal configuró el contrato y lo envió a Bonafide para revisión.')],
      };
    });
  },

  // La parte responsable rechazó los términos → En Discusión de Términos.
  rechazarTerminos(id, comentario = '') {
    return mutarContrato(id, (c) => {
      const destinos = TRANSICIONES_CT[c.estado] ?? [];
      if (!destinos.includes(CST.enDiscusionTerminos)) {
        throw new Error(`Transición inválida: ${c.estado} → ${CST.enDiscusionTerminos}`);
      }
      return {
        ...c,
        estado: CST.enDiscusionTerminos,
        comentarioRechazo: comentario.trim() || 'Se rechazaron los términos del contrato.',
        nota: 'La PYME rechazó los términos del contrato. Bonafide debe contactar a ambas partes para resolver el desacuerdo.',
        historia: [...(c.historia ?? []), evento('Términos rechazados', comentario.trim() || 'La parte responsable rechazó los términos del contrato.')],
      };
    });
  },
};