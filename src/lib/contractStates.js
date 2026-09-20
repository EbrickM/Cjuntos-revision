// ── Máquina de estados de contratos (BPMN "Solicitar Contrato") ──────────────
// Estados del ciclo de vida de un contrato, unificados para los 4 portales.
// Referencia BPMN:
//   Bonafide registra/crea el contrato (Pendiente de Configuración)
//   → portal lo configura (Pendiente de Revisión) o rechaza términos (En
//     Discusión de Términos) → Bonafide (admin) autoriza (Activo) o pone un
//     requerimiento (Con Requerimientos) → el portal lo reconfigura.

// Los valores de estado se conservan como los literales que ya usaban los
// portales, para no romper `contractBadge` (admin) ni `contratoBadge` (listas).
export const CST = {
  pendienteConfiguracion: 'Pendiente de Configuración',
  pendienteRevision:      'Pendiente de Revisión',
  conRequerimientos:      'Con Requerimientos',
  enDiscusionTerminos:    'En Discusión de Términos',
  activo:                 'Activo',
};

export const ESTADO_LABEL_CT = {
  [CST.pendienteConfiguracion]: 'Pendiente de Configuración',
  [CST.pendienteRevision]:      'Pendiente de Revisión',
  [CST.conRequerimientos]:      'Con Requerimientos',
  [CST.enDiscusionTerminos]:    'En Discusión de Términos',
  [CST.activo]:                 'Activo',
};

// Variante de Badge (ver src/components/ui/Badge.jsx) por estado. Cada estado
// tiene una variante distinta (Anexo Digital MIC v1.0): proceso → revisión →
// alerta, con Activo en el verde semántico de éxito.
export const ESTADO_BADGE_CT = {
  [CST.pendienteConfiguracion]: 'amber',
  [CST.pendienteRevision]:      'orange',
  [CST.conRequerimientos]:      'red',
  [CST.enDiscusionTerminos]:    'brand',
  [CST.activo]:                 'green',
};

// Transiciones válidas entre estados (machine state).
export const TRANSICIONES_CT = {
  [CST.pendienteConfiguracion]: [CST.pendienteRevision, CST.enDiscusionTerminos],
  [CST.pendienteRevision]:      [CST.activo, CST.conRequerimientos],
  [CST.conRequerimientos]:      [CST.pendienteRevision, CST.enDiscusionTerminos],
  [CST.enDiscusionTerminos]:    [CST.pendienteRevision],
  [CST.activo]:                 [],
};

export const estadoLabelCt = (estado) => ESTADO_LABEL_CT[estado] ?? estado ?? CST.pendienteConfiguracion;

export const estadoBadgeCt = (estado) => ESTADO_BADGE_CT[estado] ?? 'yellow';