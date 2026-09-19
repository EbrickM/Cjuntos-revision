// ── Utilidades de contratos (sin componentes, por react-refresh) ──────────────
// Adaptadores entre el esquema canónico del contratoService y las formas que
// consumen las vistas y formularios (selector de facturación, wizards, admin).
// Como el servicio ya expone `estadoLabelCt`/`estadoBadgeCt` desde
// contractStates, este archivo queda solo con proyecciones de datos.

// Forma mínima para el selector de facturación (antes `seedContratosActivos`):
// id + tipo de factoring + contratante + banco + monto máximo de factura.
export const aFactoring = (c) => ({
  id: c.id,
  tipoFactoring: c.tipoFactoring,
  contratante: c.contratanteNombre ?? c.contratante?.razonSocial ?? '',
  bancoFondeador: c.bancoFondeador,
  montoMax: c.montoMax ?? 0,
});

// Proyección hacia las listas "Mis Contratos" de la Contratante y del
// Proveedor. En esas vistas el esquema canónico significa: `monto` = monto
// total del contrato (asignado a la contraparte), `asignado` = ya consumido /
// distribuido, `disponible` = lo que queda. Mantiene así los mismos totales
// que mostraban los mocks anteriores (p. ej. 0041: 180M / 47,5M / 132,5M).
export const aViewContrato = (c) => {
  const monto = c.monto ?? c.montoAsignado ?? c.montoBase ?? 0;
  const utilizado = c.asignado ?? 0;
  return {
    ...c,
    monto,
    asignado: monto,
    utilizado,
    disponible: c.disponible ?? Math.max(0, monto - utilizado),
    facturas: c.facturas ?? 0,
    pyme: c.pyme ?? c.pymeNombre ?? '—',
    sector: c.sector ?? '',
    ini: c.ini ?? '',
  };
};

// Normaliza un registro canónico a la forma que espera el wizard de la PYME.
export const aContratoPyme = (c) => ({
  id: c.id,
  estado: c.estado,
  contratanteNombre: c.contratanteNombre ?? c.contratante?.razonSocial ?? '',
  montoAsignado: c.montoAsignado ?? c.monto ?? 0,
  plazoPago: c.plazoPago,
  interes: c.interes,
  bancoFondeador: c.bancoFondeador,
  porcentajeRetencion: c.porcentajeRetencion,
  porcentajeGestionCobranza: c.porcentajeGestionCobranza,
  fechaAsignacion: c.fechaAsignacion ?? c.fechaCreacion ?? '',
  gestionFondos: c.gestionFondos ?? null,
  comentarioRechazo: c.comentarioRechazo ?? '',
  proveedoresAsignados: c.proveedoresAsignados ?? [],
  requerimiento: c.requerimiento ?? null,
});

// Proyección de un contrato-marco hacia el wizard de la Empresa Contratante.
export const aContratoMarco = (c) => ({
  id: c.id,
  estado: c.estado,
  montoBase: c.montoBase ?? c.monto ?? 0,
  plazoPagoDefault: c.plazoPagoDefault ?? c.plazoPago ?? 30,
  interes: c.interes,
  bancoFondeador: c.bancoFondeador,
  porcentajeRetencion: c.porcentajeRetencion,
  porcentajeGestionCobranza: c.porcentajeGestionCobranza,
  fechaCreacion: c.fechaCreacion ?? '',
  cuentaBancaria: c.cuentaBancaria ?? null,
  pymesAsignadas: c.pymesAsignadas ?? [],
  requerimiento: c.requerimiento ?? null,
});

// Proyección hacia el wizard del Proveedor.
export const aContratoProveedor = (c) => ({
  id: c.id,
  estado: c.estado,
  pymeNombre: c.pymeNombre ?? '',
  montoAsignado: c.montoAsignado ?? c.monto ?? 0,
  fechaAsignacion: c.fechaAsignacion ?? '',
  bancoFondeador: c.bancoFondeador,
  interes: c.interes,
  porcentajeRetencion: c.porcentajeRetencion,
  porcentajeGestionCobranza: c.porcentajeGestionCobranza,
  cuentaBancaria: c.cuentaBancaria ?? null,
  suministradoresAsignados: c.suministradoresAsignados ?? [],
  requerimiento: c.requerimiento ?? null,
});