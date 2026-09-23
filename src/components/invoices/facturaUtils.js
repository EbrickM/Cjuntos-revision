// Utilidades de facturación compartidas (string de moneda XAF y fechas del
// modal). Viven en un módulo sin componentes para no romper Fast Refresh
// (react-refresh/only-export-components) — los archivos de páginas y el modal
// la importan desde aquí.
export const formatXaf = (v) => `${new Intl.NumberFormat('de-DE').format(Number(v) || 0)} XAF`;

export const pad2 = n => String(n).padStart(2, '0');

export const parseFecha = v => {
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(v || '');
  return m ? { d: +m[1], mo: +m[2], y: +m[3] } : null;
};

export const defaultVencimiento = () => {
  const t = new Date();
  t.setDate(t.getDate() + 30);
  return `${pad2(t.getDate())}/${pad2(t.getMonth() + 1)}/${t.getFullYear()}`;
};

// Saldo pendiente de una factura: su monto original menos lo ya acumulado en
// pagos previos (parciales). Fuente única de verdad para que el formulario de
// pago (Contratante) y el servicio de facturación clampeen contra el mismo
// número — nunca se puede pagar más de lo que queda pendiente.
export const montoRestanteFactura = (factura) => {
  const total = Number(factura?.monto) || 0;
  const pagado = Math.min(Number(factura?.pagosAcumulados) || 0, total);
  return Math.max(total - pagado, 0);
};