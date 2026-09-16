export const fmt = n => new Intl.NumberFormat('de-DE').format(n);

// Contrato que la Empresa Contratante ya configuró y asignó a esta PYME
// (Subproceso 1 del BPMN, ya completado del otro lado) y que ahora espera que
// la PYME lo configure repartiéndolo entre sus propios Proveedores
// (Subproceso 2). Concepto análogo a `contratosMarco` en
// src/pages/contratante/contratanteData.js, pero desde la perspectiva PYME.
export const pymeContratosPendientes = [
  {
    id: 'CT-2026-0058',
    contratanteNombre: 'TotalEnerGE S.A.',
    montoAsignado: 45_000_000,
    plazoPago: 30,
    interes: '4.5% anual',
    bancoFondeador: 'CCEI Bank Guinea Ecuatorial',
    porcentajeRetencion: 2.5,
    porcentajeGestionCobranza: 1,
    fechaAsignacion: '10/07/2026',
    estado: 'Pendiente de Configuración', // -> 'En Discusión de Términos' | 'Pendiente de Revisión'
    gestionFondos: null,                  // 'retirar' | 'billetera'
    comentarioRechazo: '',
    proveedoresAsignados: [],             // [{ id, nombre, email, telefono, monto, cargaNomina }]
  },
];

export const montoDisponibleProveedores = (item, excluirId = null) =>
  item.montoAsignado - item.proveedoresAsignados
    .filter(p => p.id !== excluirId)
    .reduce((sum, p) => sum + p.monto, 0);
