// ── Utilidades de contratos (sin componentes, por react-refresh) ──────────────
// Adaptadores entre el esquema canónico del contratoService y las formas que
// consumen las vistas y formularios (selector de facturación, wizards, admin).
// Como el servicio ya expone `estadoLabelCt`/`estadoBadgeCt` desde
// contractStates, este archivo queda solo con proyecciones de datos.
import { CST } from '../../lib/contractStates';

// Forma mínima para el selector de facturación (antes `seedContratosActivos`):
// id + tipo de factoring + contratante + banco + monto máximo de factura.
export const aFactoring = (c) => ({
  id: c.id,
  tipoFactoring: c.tipoFactoring,
  contratante: c.contratanteNombre ?? c.contratante?.razonSocial ?? '',
  bancoFondeador: c.bancoFondeador,
  montoMax: c.montoMax ?? 0,
});

// Nombre de la contraparte que debe verse en las listas/cards de un contrato.
// Si el registro ya trae un nombre real se respeta; si trae el marcador vacío
// "—" o ninguno (caso típico de los contratos-marco en `pendienteConfiguracion`),
// se usa el nombre de la PRIMERA entidad que quien configuró el contrato dejó
// asignada: primera PYME, primer proveedor o primer suministrador.
export const nombrePymeContrato = (c) => {
  const nombre = c.pyme ?? c.pymeNombre ?? '';
  if (nombre && nombre !== '—') return nombre;
  const primera =
    (c.pymesAsignadas?.[0]?.pymeNombre) ||
    (c.pymesAsignadas?.[0]?.nombre) ||
    (c.proveedoresAsignados?.[0]?.nombre) ||
    (c.suministradoresAsignados?.[0]?.nombre) ||
    (c.contratante?.razonSocial) ||
    '';
  return primera || (c.tipo === 'marco' ? 'Contrato Marco' : '—');
};

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
    pyme: nombrePymeContrato(c),
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

// ── Registros de un contrato (pestaña "Registros" de los detalles) ──────────
// Deriva, sin backend, todos los registros/movimientos del contrato desde su
// esquema canónico (fechas, estado, requerimiento, entidades) más las facturas
// del contrato. Cada registro tiene la forma
//   { referente, fecha, asunto, registro }
// donde `asunto` ∈ {'contrato', 'facturas', 'indicación'} y `referente` es el
// nombre de la entidad que actuó (la Empresa Contratante, la PYME, el Banco
// Fondeador o "administración").
const fmtRegistro = (n) => `${new Intl.NumberFormat('de-DE').format(Number(n) || 0)} XAF`;

export const registrosContrato = (c = {}, facturas = [], referentes = {}) => {
  const admin     = 'administración';
  const empresa   = c.contratante?.razonSocial ?? c.contratanteNombre ?? null;
  const pyme      = c.pyme && c.pyme !== '—' ? c.pyme : (c.pymeNombre && c.pymeNombre !== '—' ? c.pymeNombre : nombrePymeContrato(c));
  const banco     = c.bancoFondeador ?? null;
  const configurador = referentes.configurador
    ?? (c.tipo === 'marco' ? (empresa ?? 'Empresa Contratante') : (pyme || empresa));
  const fechaBase = c.fechaCreacion ?? c.fechaAsignacion ?? c.fechaInicio ?? '—';
  const ev = [];
  const push = (referente, fecha, asunto, registro) => ev.push({ referente: referente ?? admin, fecha: fecha ?? '—', asunto, registro });

  push(admin, fechaBase, 'contrato', 'Registró el contrato en el sistema.');
  if (configurador && ![CST.pendienteConfiguracion].includes(c.estado)) {
    push(configurador, c.fechaAsignacion ?? fechaBase, 'contrato', 'Configuró el contrato y lo envió a revisión ante Bonafide.');
  }
  if (c.requerimiento) {
    push(admin, c.requerimiento.fecha ?? fechaBase, 'indicación', `Puso un requerimiento al contrato: ${c.requerimiento.mensaje ?? 'revisa los datos y vuelve a enviarlo.'}`);
  }
  if (c.estado === CST.enDiscusionTerminos) {
    push(configurador ?? pyme ?? empresa ?? admin, c.fechaInicio ?? fechaBase, 'indicación', 'Rechazó los términos del contrato; quedó en discusión.');
  }
  if (c.estado === CST.activo) {
    push(admin, c.fechaInicio ?? fechaBase, 'contrato', 'Autorizó y activó el contrato.');
    if (banco) push(banco, c.fechaInicio ?? fechaBase, 'contrato', 'Confirmó las condiciones de fondeo del contrato.');
  }

  // Registros de facturas: las emite el emisor (PYME / suministrador); cuando
  // el estado ya está aprobado/verificado/emitido/pagado, el banco fondador
  // registra la aprobación (misma narrativa cruzada entre portales).
  (facturas ?? []).forEach(f => {
    const emisor = f.pyme ?? f.suministrador ?? f.proveedor ?? pyme ?? empresa ?? admin;
    push(emisor, f.fecha ?? fechaBase, 'facturas', `Registró la factura ${f.id} por ${fmtRegistro(f.monto)}.`);
    if (['Aprobada', 'Pagada', 'Emitida', 'Verificada', 'Validada'].includes(f.estado)) {
      push(banco ?? admin, f.fecha ?? fechaBase, 'facturas', `Aprobó la factura ${f.id} por ${fmtRegistro(f.monto)}.`);
    }
  });

  return ev;
};

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