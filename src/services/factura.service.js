// ── Servicio de facturación ───────────────────────────────────────────────────
// Capa de datos única sobre localDb (patrón de authService/adminService): hoy
// lee/escribe el mock local; cuando exista `apiUrl` de b-mori, solo cambia la
// implementación interna de cada método. La lógica de negocio del BPMN
// (máquina de estados, fondeo automático, modalidad de desembolso) vive aquí.
import { localDb } from '../lib/localDb';
import { INV, MODALIDAD, TRANSICIONES, estadoLabel } from '../lib/invoiceStates';
import {
  SEED_VERSION, seedFacturas, seedPagos, seedBilleteras,
} from '../lib/invoiceSeeds';

const KEY_FACTURAS  = 'facturas';
const KEY_PAGOS     = 'factura_pagos';
const KEY_BILLETERAS = 'factura_billeteras';

const hoy = () => new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });

const evento = (titulo, detalle) => ({ titulo, detalle, fecha: hoy(), actor: 'Sistema' });

function mutarFactura(id, fn) {
  const lista = localDb.get(KEY_FACTURAS, seedFacturas, SEED_VERSION);
  const fact = lista.find(f => f.id === id);
  if (!fact) throw new Error(`Factura ${id} no encontrada`);
  const next = fn(fact);
  localDb.set(KEY_FACTURAS, lista.map(f => (f.id === id ? next : f)));
  return next;
}

function transicionarFactura(id, transicion, detalle) {
  return mutarFactura(id, (f) => {
    const destinos = TRANSICIONES[f.estado] ?? [];
    if (!destinos.includes(transicion)) {
      throw new Error(`Transición inválida: ${f.estado} → ${transicion}`);
    }
    return {
      ...f,
      estado: transicion,
      historia: [...(f.historia ?? []), evento(`${estadoLabel(transicion)}`, detalle ?? '')].filter(h => h),
    };
  });
}

// ── Lecturas ──────────────────────────────────────────────────────────────────
export const facturaService = {
  hasBackend: false,

  listar() {
    return localDb.get(KEY_FACTURAS, seedFacturas, SEED_VERSION);
  },

  obtener(id) {
    return this.listar().find(f => f.id === id) ?? null;
  },

  listarPorRol(rol) {
    const todas = this.listar();
    if (rol === 'admin') return todas;
    if (rol === 'proveedor') return todas.filter(f => f.origen === 'suministrador');
    // empresa-pequena y contratante ven las facturas emitidas al contratante
    // (la PYME las emite; la Contratante las recibe): Fase 1 del BPMN.
    return todas.filter(f => f.origen === 'contratante');
  },

  // En inversa: facturas listas para que el Contratante emita el IPI.
  enEsperaDeIpi() {
    return this.listar().filter(f => f.tipoFactoring === 'inverso' && f.estado === INV.aprobada);
  },

  // Bandeja del admin: IPIs emitidos pendientes de validación de Bonafide.
  bandejaIpis() {
    return this.listar().filter(f => f.tipoFactoring === 'inverso' && f.estado === INV.emitida);
  },

  // ── Operaciones PYME ──
  crear(data) {
    const lista = localDb.get(KEY_FACTURAS, seedFacturas, SEED_VERSION);
    const max = lista.reduce((m, f) => Math.max(m, parseInt(String(f.id).replace('FAC-2026-', ''), 10) || 0), 2108);
    const id = `FAC-2026-${max + 1}`;
    const factura = {
      id,
      tipoFactoring: 'inverso',
      origen: 'contratante',
      modalidadPago: MODALIDAD.retiroTotal,
      estado: INV.creada,
      ipi: null,
      requerimientos: null,
      documentos: [],
      ...data,
      historia: [evento('Factura emitida', 'La PYME subió la factura de servicio.')],
    };
    localDb.set(KEY_FACTURAS, [...lista, factura]);
    return factura;
  },

  enviar(id) {
    return transicionarFactura(id, INV.enviada, 'La PYME envió la factura a la Empresa Contratante.');
  },

  eliminar(id) {
    const lista = localDb.get(KEY_FACTURAS, seedFacturas, SEED_VERSION);
    const fact = lista.find(f => f.id === id);
    if (!fact) return null;
    if (fact.estado !== INV.creada) {
      throw new Error('Solo se pueden eliminar facturas en estado Creada.');
    }
    localDb.set(KEY_FACTURAS, lista.filter(f => f.id !== id));
    return true;
  },

  corregirYReenviar(id, data = {}) {
    const next = mutarFactura(id, (f) => ({
      ...f,
      ...data,
      fecha: hoy(),
      estado: INV.enviada,
      historia: [...(f.historia ?? []), evento('Reenviada', 'La PYME corrigió y reenvió la factura.')],
    }));
    return next;
  },

  notificarContratante(id) {
    return mutarFactura(id, (f) => {
      if (f.estado !== INV.conRequerimientos) return f;
      return {
        ...f,
        pymeNotifico: true,
        historia: [...(f.historia ?? []), evento('Notificada a la Contratante', 'La PYME notificó la factura validada a la Empresa Contratante.')],
      };
    });
  },

  // ── Operaciones Contratante ──
  evaluar(id, { aprobada, motivo = '', plazoPago = 30 }) {
    if (aprobada) {
      return mutarFactura(id, (f) => ({
        ...f,
        estado: INV.aprobada,
        fechaAprobacion: hoy(),
        plazoPago,
        historia: [...(f.historia ?? []), evento('Factura aprobada', 'La Empresa Contratante aprobó la factura.')],
      }));
    }
    return mutarFactura(id, (f) => ({
      ...f,
      estado: INV.conCorrecciones,
      motivoCorreccion: motivo || 'Se señalaron correcciones a la factura.',
      historia: [...(f.historia ?? []), evento('Con correcciones', motivo || 'La Contratante devolvió la factura con correcciones.')],
    }));
  },

  emitirIPI(id) {
    return mutarFactura(id, (f) => {
      if (f.tipoFactoring !== 'inverso') return f;
      const num = f.ipi?.numero ?? `IPI-2026-0${String(f.id.replace('FAC-2026-', '')).slice(-3)}`;
      return {
        ...f,
        estado: INV.emitida,
        ipi: { numero: num, fechaEmision: hoy() },
        historia: [...(f.historia ?? []), evento('IPI emitido', `La Contratante emitió el ${num} y lo envió a Bonafide.`)],
      };
    });
  },

  enviarOrdenFondeador(id) {
    return transicionarFactura(id, INV.ordenFondeador, 'La Contratante envió la orden/IPI al Banco Fondeador.');
  },

  verificarOTP(id) {
    const next = transicionarFactura(id, INV.otpVerificada, 'La Empresa Contratante verificó la transferencia.');
    const modalidad = next.modalidadPago || MODALIDAD.retiroTotal;
    // Fondeador ya acreditó: según la modalidad de la PYME (Ruta A / Ruta B).
    const terminal = modalidad === MODALIDAD.billeteraVirtual ? INV.billetera : INV.pagada;
    return transicionarFactura(id, terminal,
      terminal === INV.billetera
        ? 'Fondos desbloqueados en la Billetera Virtual de la PYME.'
        : 'Los fondos fueron transferidos a la PYME (retiro total).'
    );
  },

  // Directa (sin IPI): la Contratante paga directamente al aprobar.
  pagarDirecta(id) {
    const f = this.obtener(id);
    if (f.tipoFactoring !== 'directo') return f;
    return transicionarFactura(id, INV.pagada, 'La Empresa Contratante pagó la factura directamente (modalidad directa).');
  },

  // ── Operaciones Admin / Bonafide ──
  validarIPI(id, { modalidadPago = MODALIDAD.retiroTotal, retencion = 0, gestionCobranza = 0, interes = 0, observacion = '' }) {
    return mutarFactura(id, (f) => {
      if (f.estado !== INV.emitida) return f;
      const neto = Math.round(f.monto * (1 - (retencion + gestionCobranza + interes) / 100));
      return {
        ...f,
        estado: INV.conRequerimientos,
        modalidadPago,
        requerimientos: { entidades: ['Bonafide'], mensaje: observacion || 'IPI validado.', fecha: hoy() },
        condiciones: { retencion, gestionCobranza, interes, neto },
        pymeNotifico: false,
        historia: [...(f.historia ?? []), evento('Validado por Bonafide', `IPI validado — modalidad ${modalidadPago === MODALIDAD.billeteraVirtual ? 'Billetera Virtual' : 'Retiro Total'}.`)],
      };
    });
  },

  // Pone un requerimiento a la factura (Emitida → Con Requerimientos),
  // sin pasar por la validación financiera completa.
  ponerRequerimiento(id, mensaje) {
    return mutarFactura(id, (f) => {
      if (f.estado !== INV.emitida) return f;
      return {
        ...f,
        estado: INV.conRequerimientos,
        pymeNotifico: false,
        requerimientos: { entidades: ['Bonafide'], mensaje: (mensaje || '').trim() || 'Se señalaron requisitos a la factura.', fecha: hoy() },
        historia: [...(f.historia ?? []), evento('Requerimiento enviado', 'Bonafide puso un requerimiento a la factura.')],
      };
    });
  },

  // Fondeo: transiciones automáticas del lado del banco (Fondeo Recibido ->
  // OTP Enviada). Se llama con `delayMs` para simular el procesamiento del
  // core bancario; cuando haya backend real, esto pasará a ser un evento.
  fondeoAutomatico(id, delayMs = 1400) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const fondeado = transicionarFactura(id, INV.fondeado, 'El Banco Fondeador transfirió y acreditó los fondos a Bonafide.');
        const otp = transicionarFactura(id, INV.otpEnviada, 'Se envió un código de verificación (OTP) a la Empresa Contratante.');
        resolve({ fondeado, otp });
      }, delayMs);
    });
  },

  // ── Billetera virtual y pagos a proveedores (Fase 2) ──
  listarBilleteras() {
    const billeteras = localDb.get(KEY_BILLETERAS, seedBilleteras, SEED_VERSION);
    const facturasBilletera = this.listar().filter(f => f.estado === INV.billetera);
    return billeteras.map(b => ({
      ...b,
      facturas: facturasBilletera.filter(f => f.pyme === b.pyme).map(f => f.id),
    }));
  },

  listarPagos() {
    return localDb.get(KEY_PAGOS, seedPagos, SEED_VERSION);
  },

  // Emite el pago de la factura al proveedor/suministrador (transferencia core
  // si tiene cuenta, si no Cheque de Venta), ajustando la billetera (Fase 2).
  pagarAlProveedor({ facturaId, proveedor, monto, cuentaBancaria = false }) {
    const pagos = localDb.get(KEY_PAGOS, seedPagos, SEED_VERSION);
    const metodo = cuentaBancaria ? 'transferencia' : 'cheque';
    const pago = {
      id: `PAG-2026-${String(pagos.length + 1).padStart(4, '0')}`,
      facturaId,
      proveedor,
      monto,
      metodo,
      estado: 'Pendiente de Cobro',
      fechaPago: hoy(),
      ...(metodo === 'cheque' ? { cheque: `CHQ-2026-${String(800 + pagos.length).padStart(4, '0')}` } : {}),
    };
    localDb.set(KEY_PAGOS, [...pagos, pago]);
    return pago;
  },

  // Desbloquea el monto de una factura en estado 'billetera' hacia el saldo
  // disponible de la PYME (Ruta B del subproceso Fondeador).
  desbloquearBilletera(facturaId) {
    const facturas = this.listar();
    const f = facturas.find(x => x.id === facturaId);
    if (!f || f.estado !== INV.billetera) return this.listarBilleteras();
    const billeteras = localDb.get(KEY_BILLETERAS, seedBilleteras, SEED_VERSION);
    const idx = billeteras.findIndex(b => b.pyme === f.pyme);
    if (idx >= 0) {
      billeteras[idx] = { ...billeteras[idx], saldoDisponible: (f.billetera?.saldoDisponible ?? f.monto) };
      localDb.set(KEY_BILLETERAS, billeteras);
    }
    return this.listarBilleteras();
  },
};