// ── Servicio de facturación ───────────────────────────────────────────────────
// Capa de datos única sobre localDb (patrón de authService/adminService): hoy
// lee/escribe el mock local; cuando exista `apiUrl` de b-mori, solo cambia la
// implementación interna de cada método. La lógica de negocio del BPMN
// (máquina de estados, liquidación del fondeo, modalidad de desembolso) vive aquí.
import { localDb } from '../lib/localDb';
import { INV, MODALIDAD, TRANSICIONES, estadoLabel } from '../lib/invoiceStates';
import {
  SEED_VERSION, seedFacturas, seedPagos, seedBilleteras, BANCO_POR_CONTRATO,
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
    const guardadas = localDb.get(KEY_FACTURAS, seedFacturas, SEED_VERSION);
    let lista = Array.isArray(guardadas) ? guardadas : seedFacturas.map(f => ({ ...f }));
    const ids = new Set(lista.map(f => f?.id));
    const faltantes = seedFacturas.filter(s => !ids.has(s.id));
    if (faltantes.length) {
      lista = [...lista, ...faltantes.map(s => ({ ...s }))];
      localDb.set(KEY_FACTURAS, lista);
    }
    // Auto-reparación: las facturas seed con con_requerimientos que quedaron
    // persistidas con estado undefined/roto (bug de semilla anterior) se
    // re-aplican al estado correcto para que el demo siempre las muestre.
    const reqSeeds = seedFacturas.filter(s => s.estado === INV.conRequerimientos);
    const reqIds = new Set(reqSeeds.map(s => s.id));
    const roto = lista.some(f => reqIds.has(f?.id) && !f?.estado);
    if (roto) {
      lista = lista.map(f => {
        if (reqIds.has(f?.id) && !f?.estado) {
          const s = reqSeeds.find(x => x.id === f.id);
          return { ...f, ...s };
        }
        return f;
      });
      localDb.set(KEY_FACTURAS, lista);
    }
    // Normaliza estados en blanco (dato viejo en localDb) a "Emitida".
    return lista.map(f => (f?.estado ? f : { ...f, estado: INV.emitida }));
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

  // ── Lecturas del Banco Fondeador ──
  // Facturas cuyo Banco Fondeador es `banco` (denormalizado en la semilla).
  listarPorBanco(banco) {
    return this.listar().filter(f => f.bancoFondeador === banco);
  },

  // El Fondeador solo interviene en Factoring Inverso emitido al Contratante
  // (la facturación directa y la de suministradores no pasan por el banco).
  esOperacionDeFondeo(f) {
    return f.tipoFactoring === 'inverso' && f.origen === 'contratante';
  },

  // Bandeja del Fondeador: órdenes de fondeo pendientes de liquidar.
  bandejaOrdenes(banco) {
    return this.listarPorBanco(banco).filter(f =>
      this.esOperacionDeFondeo(f) && f.estado === INV.ordenFondeador
    );
  },

  // Cartera ya fondeada por el banco (en proceso de OTP / pago / billetera).
  carteraFondeador(banco) {
    return this.listarPorBanco(banco).filter(f =>
      this.esOperacionDeFondeo(f) &&
      [INV.fondeado, INV.otpEnviada, INV.otpVerificada, INV.pagada, INV.billetera].includes(f.estado)
    );
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
      // El banco se resuelve del contrato para que la factura llegue al portal
      // del Fondeador cuando avance a `orden_fondeador`.
      bancoFondeador: BANCO_POR_CONTRATO[data?.contrato] ?? null,
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
    const next2 = transicionarFactura(id, terminal,
      terminal === INV.billetera
        ? 'Fondos desbloqueados en la Billetera Virtual de la PYME.'
        : 'Los fondos fueron transferidos a la PYME (retiro total).'
    );
    // Ruta B: acredita el neto fondeado en el saldo disponible de la PYME.
    if (terminal === INV.billetera) this.desbloquearBilletera(id);
    return next2;
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

  // Liquidación del Banco Fondeador (Fondeo Recibido → OTP Enviada): transfiere
  // y acredita los fondos a Bonafide y dispara el OTP a la Empresa Contratante.
  // La ejecuta el propio Fondeador desde su portal — ya no es automática.
  liquidarFondeo(id, { referencia = '' } = {}) {
    transicionarFactura(id, INV.fondeado, 'El Banco Fondeador transfirió y acreditó los fondos a Bonafide.');
    transicionarFactura(id, INV.otpEnviada, 'Se envió un código de verificación (OTP) a la Empresa Contratante.');
    return mutarFactura(id, (f) => ({
      ...f,
      transferencia: { referencia: referencia.trim(), fecha: hoy(), banco: f.bancoFondeador ?? null },
      historia: [...(f.historia ?? []), evento('Liquidación confirmada', referencia.trim() ? `Referencia bancaria ${referencia.trim()}.` : 'Transferencia ejecutada por el Banco Fondeador.')],
    }));
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
    const f = this.obtener(facturaId);
    if (!f || f.estado !== INV.billetera) return this.listarBilleteras();
    // Lo que el Fondeador acreditó es el neto (IPI − retención − cobranza − interés).
    const neto = f.condiciones?.neto ?? f.monto;
    const billeteras = localDb.get(KEY_BILLETERAS, seedBilleteras, SEED_VERSION);
    const idx = billeteras.findIndex(b => b.pyme === f.pyme);
    if (idx >= 0) {
      billeteras[idx] = { ...billeteras[idx], saldoDisponible: (billeteras[idx].saldoDisponible ?? 0) + neto };
    } else {
      billeteras.push({ pyme: f.pyme, montoPresupuestado: neto, saldoDisponible: neto, totalDistribuido: 0 });
    }
    localDb.set(KEY_BILLETERAS, billeteras);
    return this.listarBilleteras();
  },
};