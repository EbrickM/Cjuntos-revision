export const fmt = n => new Intl.NumberFormat('de-DE').format(n);

// Contrato que la Empresa Contratante ya configuró y asignó a esta PYME
// (Subproceso 1 del BPMN, ya completado del otro lado) y que ahora espera que
// la PYME lo configure repartiéndolo entre sus propios Proveedores
// (Subproceso 2). Concepto análogo a `contratosMarco` en
// src/pages/contratante/contratanteData.js, pero desde la perspectiva PYME.
export const pymeContratosPendientes = [
  {
    id: 'CT-2026-0058',
    contratanteNombre: 'Chevron',
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
  {
    // Ya fue configurado por la PYME y enviado a revisión, pero Bonafide
    // encontró una observación y lo devolvió con un requerimiento — la PYME
    // debe reconfigurarlo.
    id: 'CT-2026-0066',
    contratanteNombre: 'Subsea 7',
    montoAsignado: 30_000_000,
    plazoPago: 45,
    interes: '5.5% anual',
    bancoFondeador: 'ECOBank',
    porcentajeRetencion: 2.5,
    porcentajeGestionCobranza: 1,
    fechaAsignacion: '20/06/2026',
    estado: 'Con Requerimientos',
    gestionFondos: 'retirar',
    comentarioRechazo: '',
    proveedoresAsignados: [
      { id: 'PROV-9001', nombre: 'Lideshore Este', email: 'ventas@suminest.gq', telefono: '+240 222 808 909', monto: 12_000_000, cargaNomina: false },
    ],
    requerimiento: {
      entidades: ['PYME'],
      mensaje: 'El proveedor "Lideshore Este" no tiene monto suficiente sustentado con factura. Adjunta o corrige el presupuesto antes de continuar.',
      fecha: '21/06/2026',
    },
  },
];

export const montoDisponibleProveedores = (item, excluirId = null) =>
  item.montoAsignado - item.proveedoresAsignados
    .filter(p => p.id !== excluirId)
    .reduce((sum, p) => sum + p.monto, 0);
