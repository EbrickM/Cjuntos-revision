import { useState, useEffect } from 'react';
import { localDb } from '../../lib/localDb';

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
      entidades: ['Empresa Contratada'],
      mensaje: 'El proveedor "Lideshore Este" no tiene monto suficiente sustentado con factura. Adjunta o corrige el presupuesto antes de continuar.',
      fecha: '21/06/2026',
    },
  },
];

export const montoDisponibleProveedores = (item, excluirId = null) =>
  item.montoAsignado - item.proveedoresAsignados
    .filter(p => p.id !== excluirId)
    .reduce((sum, p) => sum + p.monto, 0);

// ── Directorio de proveedores mock de la PYME ──────────────────────────────
// 15 proveedores — usados para el scroll infinito de MisProveedores (pageSize
// 10) y para autocompletar correo/teléfono en EpConfigurarContrato.
const PROVIDERS_KEY = 'ep_providers';
const PROVIDERS_VERSION = 5;

// MisProveedores.jsx (directorio) y Creditos.jsx (botón "Agregar Proveedor"
// dentro de un contrato) comparten el mismo directorio vía localDb, para que
// un proveedor registrado desde cualquiera de las dos pantallas aparezca en
// ambas.
export function useProviders() {
  const [providers, setProviders] = useState(() => localDb.get(PROVIDERS_KEY, initialProviders, PROVIDERS_VERSION));
  useEffect(() => { localDb.set(PROVIDERS_KEY, providers); }, [providers]);
  return [providers, setProviders];
}

export const initialProviders = [
  {
    id: 'p1', razonSocial: 'SAP', nombreComercial: 'SAP',
    ruc: 'GE-2019-00123', sector: 'Materiales', email: 'ventas@cemex.gq', telefono: '+240 222 111 222',
    esClienteBonafide: false, kyc: 'vigente', scoreCredito: 780,
    contratosActivos: [
      { id: 'CT-2026-0041', contratante: 'GEOMS', objeto: 'Suministro de cemento y áridos para obra', asignado: 26_000_000, utilizado: 26_000_000 },
    ],
  },
  {
    id: 'p2', razonSocial: 'APEX', nombreComercial: 'APEX',
    ruc: 'GE-2020-00445', sector: 'Transporte', email: 'info@transge.gq', telefono: '+240 222 333 444',
    esClienteBonafide: true, kyc: 'vigente', scoreCredito: 645,
    contratosActivos: [],
  },
  {
    id: 'p3', razonSocial: 'APEX Tech', nombreComercial: 'APEX Tech',
    ruc: 'GE-2022-00112', sector: 'Tecnología', email: 'soporte@servtec.gq', telefono: '+240 222 777 888',
    esClienteBonafide: false, kyc: 'pendiente', scoreCredito: 510,
    contratosActivos: [],
  },
  {
    id: 'p4', razonSocial: 'SAP Agro', nombreComercial: 'SAP',
    ruc: 'GE-2018-00981', sector: 'Agricultura', email: 'contacto@agrobata.gq', telefono: '+240 222 101 202',
    esClienteBonafide: true, kyc: 'vigente', scoreCredito: 710,
    contratosActivos: [
      { id: 'CT-2026-0059', contratante: 'Chevron', objeto: 'Suministro de insumos alimentarios para campamento', asignado: 12_000_000, utilizado: 9_000_000 },
      { id: 'CT-2026-0072', contratante: 'Subsea 7', objeto: 'Provisión de víveres para obra', asignado: 8_000_000, utilizado: 3_200_000 },
    ],
  },
  {
    id: 'p5', razonSocial: 'GEOMS Norte', nombreComercial: 'Lideshore',
    ruc: 'GE-2017-00456', sector: 'Construcción', email: 'info@conmalnor.gq', telefono: '+240 222 303 404',
    esClienteBonafide: false, kyc: 'vencido', scoreCredito: 420,
    contratosActivos: [
      { id: 'CT-2026-0041', contratante: 'GEOMS', objeto: 'Movimiento de tierras y estructura', asignado: 21_500_000, utilizado: 21_500_000 },
    ],
  },
  {
    id: 'p6', razonSocial: 'APEX Minera', nombreComercial: 'APEX',
    ruc: 'GE-2015-00223', sector: 'Minería', email: 'ventas@minriomuni.gq', telefono: '+240 222 505 606',
    esClienteBonafide: false, kyc: 'pendiente', scoreCredito: 560,
    contratosActivos: [],
  },
  {
    id: 'p7', razonSocial: 'SAP Alimentos', nombreComercial: 'SAP',
    ruc: 'GE-2021-00778', sector: 'Alimentación', email: 'pedidos@alimgolfo.gq', telefono: '+240 222 707 808',
    esClienteBonafide: true, kyc: 'vigente', scoreCredito: 690,
    contratosActivos: [
      { id: 'CT-2026-0059', contratante: 'Chevron', objeto: 'Catering para personal offshore', asignado: 15_000_000, utilizado: 11_000_000 },
      { id: 'CT-2026-0068', contratante: 'GEOMS', objeto: 'Suministro de alimentos para comedor de obra', asignado: 6_500_000, utilizado: 2_000_000 },
      { id: 'CT-2026-0077', contratante: 'Subsea 7', objeto: 'Víveres para fase de acabados', asignado: 4_200_000, utilizado: 900_000 },
    ],
  },
  {
    id: 'p8', razonSocial: 'SAP Comercial', nombreComercial: 'SAP',
    ruc: 'GE-2019-00334', sector: 'Comercio', email: 'info@comebe.gq', telefono: '+240 222 909 010',
    esClienteBonafide: false, kyc: 'vigente', scoreCredito: 615,
    contratosActivos: [
      { id: 'CT-2026-0068', contratante: 'GEOMS', objeto: 'Compra de consumibles de ferretería', asignado: 3_800_000, utilizado: 1_500_000 },
    ],
  },
  {
    id: 'p9', razonSocial: 'Lideshore Manufacturas', nombreComercial: 'Lideshore',
    ruc: 'GE-2016-00667', sector: 'Manufactura', email: 'contacto@manufbioko.gq', telefono: '+240 222 111 313',
    esClienteBonafide: false, kyc: 'pendiente', scoreCredito: null,
    contratosActivos: [],
  },
  {
    id: 'p10', razonSocial: 'APEX Servicios', nombreComercial: 'APEX',
    ruc: 'GE-2020-00889', sector: 'Servicios', email: 'admin@sige.gq', telefono: '+240 222 212 414',
    esClienteBonafide: true, kyc: 'vigente', scoreCredito: 735,
    contratosActivos: [
      { id: 'CT-2026-0059', contratante: 'Chevron', objeto: 'Servicios de limpieza y mantenimiento', asignado: 9_600_000, utilizado: 7_200_000 },
      { id: 'CT-2026-0077', contratante: 'Subsea 7', objeto: 'Seguridad y vigilancia de obra', asignado: 5_400_000, utilizado: 1_800_000 },
    ],
  },
  {
    id: 'p11', razonSocial: 'SAP Energía', nombreComercial: 'SAP',
    ruc: 'GE-2022-00990', sector: 'Energía', email: 'info@enersolbata.gq', telefono: '+240 222 515 616',
    esClienteBonafide: false, kyc: 'vigente', scoreCredito: 680,
    contratosActivos: [
      { id: 'CT-2026-0041', contratante: 'GEOMS', objeto: 'Instalación de paneles solares en obra', asignado: 18_000_000, utilizado: 6_000_000 },
    ],
  },
  {
    id: 'p12', razonSocial: 'Lideshore Transporte', nombreComercial: 'Lideshore',
    ruc: 'GE-2018-00112', sector: 'Transporte', email: 'ops@translitoral.gq', telefono: '+240 222 717 818',
    esClienteBonafide: false, kyc: 'vencido', scoreCredito: 395,
    contratosActivos: [],
  },
  {
    id: 'p13', razonSocial: 'SAP Materiales', nombreComercial: 'SAP',
    ruc: 'GE-2019-00556', sector: 'Materiales', email: 'ventas@mateste.gq', telefono: '+240 222 919 020',
    esClienteBonafide: true, kyc: 'vigente', scoreCredito: 660,
    contratosActivos: [
      { id: 'CT-2026-0072', contratante: 'Subsea 7', objeto: 'Suministro de acero y perfiles', asignado: 14_500_000, utilizado: 10_000_000 },
    ],
  },
  {
    id: 'p14', razonSocial: 'APEX Tech Solutions', nombreComercial: 'APEX',
    ruc: 'GE-2023-00121', sector: 'Tecnología', email: 'hola@techsol.gq', telefono: '+240 222 121 232',
    esClienteBonafide: false, kyc: 'pendiente', scoreCredito: 590,
    contratosActivos: [],
  },
  {
    id: 'p15', razonSocial: 'Lideshore Obras', nombreComercial: 'Lideshore',
    ruc: 'GE-2017-00789', sector: 'Construcción', email: 'contacto@conannobon.gq', telefono: '+240 222 323 434',
    esClienteBonafide: false, kyc: 'vigente', scoreCredito: 705,
    contratosActivos: [
      { id: 'CT-2026-0059', contratante: 'Chevron', objeto: 'Hormigonado de plataformas', asignado: 11_000_000, utilizado: 11_000_000 },
      { id: 'CT-2026-0068', contratante: 'GEOMS', objeto: 'Albañilería de interiores', asignado: 7_500_000, utilizado: 3_000_000 },
    ],
  },
];
