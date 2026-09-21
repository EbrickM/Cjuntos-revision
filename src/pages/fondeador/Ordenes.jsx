import { useState } from 'react';
import { Search, Eye, CheckCircle, MessageSquare, ShieldCheck, ListFilter } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InfoRow from '../../components/ui/InfoRow';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import { facturaService } from '../../services/factura.service';
import { INV, MODALIDAD } from '../../lib/invoiceStates';
import { fmt } from '../empresa-pequena/epData';
import { BANCO } from './fondeadorShared';

// ── ÓRDENES DE FONDEO (portal Banco Fondeador) ────────────────────────────────
// Bandeja de IPIs pendientes de validación: el banco valida la operación, aplica
// la Matriz de Riesgo y define la modalidad de desembolso (las condiciones con
// las que Bonafide ejecuta el fondeo).

const FILTROS_ESTADO = ['Todos', 'Enviada', 'En Evaluación', 'Emitida', 'Con Requerimientos', 'OTP Enviada', 'Pagada', 'Saldo en Billetera'];
const FILTROS_ESTADO_KEY = { 'Enviada': INV.enviada, 'En Evaluación': INV.enEvaluacion, 'Emitida': INV.emitida, 'Con Requerimientos': INV.conRequerimientos, 'OTP Enviada': INV.otpEnviada, 'Pagada': INV.pagada, 'Saldo en Billetera': INV.billetera };

const contratosCtx = {
  'CT-2026-0041': { retencion: 3, gestionCobranza: 1.5, interes: 5 },
  'CT-2026-0052': { retencion: 3, gestionCobranza: 1.5, interes: 5 },
  'CT-2026-0021': { retencion: 2, gestionCobranza: 1, interes: 6 },
  'CT-2026-0033': { retencion: 2.5, gestionCobranza: 1, interes: 5.5 },
};

const Header = ({ title, sub, Icon, right }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
    <div className="flex items-center gap-3">
      <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-[14px] font-bold text-text-1">{title}</div>
        {sub && <div className="text-[11px] text-text-4">{sub}</div>}
      </div>
    </div>
    {right}
  </div>
);

const SearchBar = ({ value, onChange, placeholder = 'Buscar…', withEstado = false, estado, onEstado, estados, compact = false }) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
    <div className={`relative ${compact ? 'w-full max-w-[300px]' : 'flex-1'}`}>
      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-8 pr-3 rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange ${compact ? 'py-1.5 text-[12px]' : 'py-2 text-[12px]'}`}
      />
    </div>
    {withEstado && (
      <div className="relative flex items-center shrink-0">
        <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
        <select
          value={estado}
          onChange={e => onEstado(e.target.value)}
          className="h-9 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          {estados.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>
    )}
  </div>
);

export default function FondOrdenes() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroBandeja, setFiltroBandeja] = useState('Todos');
  const [validando, setValidando] = useState(null);
  const [requerimiento, setRequerimiento] = useState(null);
  const [, setTick] = useState(0);
  const bump = () => setTick(t => t + 1);

  const bandeja = facturaService.bandejaIpis();
  const q = busqueda.trim().toLowerCase();
  const matchesQ = (f, fields) => !q || fields.some(v => (v ?? '').toLowerCase().includes(q));
  const bandejaFiltrada = bandeja
    .filter(f => (filtroBandeja === 'Todos' ? true : f.estado === FILTROS_ESTADO_KEY[filtroBandeja]))
    .filter(f => matchesQ(f, [f.id, f.ipi?.numero, f.pyme, f.contratante]));

  const handleConfirmarValidacion = (f, data) => {
    facturaService.validarIPI(f.id, {
      modalidadPago: data.modalidadPago,
      retencion: data.retencion,
      gestionCobranza: data.gestionCobranza,
      interes: data.interes,
      observacion: data.observacion,
    });
    setValidando(null);
    bump();
  };

  const handleConfirmarRequerimiento = (f, mensaje) => {
    facturaService.ponerRequerimiento(f.id, mensaje);
    setRequerimiento(null);
    bump();
  };

  return (
    <AppShell
      active="fondOrdenes"
      role="fondeador"
      title="Órdenes de Fondeo"
      sub={`IPIs emitidos por las Contratantes para ${BANCO}`}
    >
      <div className="fade-in space-y-5">

        <div className="bg-white rounded-[14px] border border-border p-5">
          <Header
            title="IPIs pendientes de validación"
            sub="Emitidos por las Contratantes; validá, aplicá la Matriz de Riesgo y definí la modalidad de desembolso."
            Icon={ShieldCheck}
            right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{bandeja.length} pendientes</span>}
          />
          <SearchBar
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar…"
            compact
            withEstado
            estado={filtroBandeja}
            onEstado={setFiltroBandeja}
            estados={FILTROS_ESTADO}
          />

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-page-bg">
                <tr className="border-b border-border">
                  {['IPI', 'PYME', 'Contratante', 'Monto', 'Emisión', 'Estado', 'Detalle', 'Acción'].map((h, i) => (
                    <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-3 py-3
                      ${i === 0 ? 'text-left' : i === 3 ? 'text-right' : 'text-center'}
                    `}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bandejaFiltrada.map(f => (
                  <tr key={f.id} className="border-b border-border last:border-0 transition-colors hover:bg-orange-tint/40">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-[12px] font-bold text-text-1">{f.id}</div>
                      <div className="text-[10px] font-mono text-text-4">{f.ipi?.numero}</div>
                    </td>
                    <td className="px-3 py-3 text-[12px] font-semibold text-text-1 whitespace-nowrap">{f.pyme}</td>
                    <td className="px-3 py-3 text-[12px] text-text-4 max-w-[180px]">
                      <span className="block truncate">{f.contratante}</span>
                    </td>
                    <td className="px-3 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmt(f.monto)} XAF</td>
                    <td className="px-3 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{f.ipi?.fechaEmision}</td>
                    <td className="px-4 py-3 text-center"><InvoiceStatusBadge estado={INV.emitida} /></td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => setValidando(f)} title="Ver detalle"
                        className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <button onClick={() => setRequerimiento(f)} title="Poner requerimiento"
                          className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button onClick={() => setValidando(f)} title="Validar IPI"
                          className="p-1.5 rounded-[8px] hover:bg-green-bg transition text-green-text cursor-pointer">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bandejaFiltrada.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-text-4">No hay IPIs pendientes que coincidan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Modal: Validar IPI ── */}
      {validando && (
        <ValidacionIpiModal
          factura={validando}
          onClose={() => setValidando(null)}
          onConfirm={handleConfirmarValidacion}
        />
      )}

      {/* ── Modal: Poner requerimiento a la PYME ── */}
      {requerimiento && (
        <RequerimientoIpiModal
          factura={requerimiento}
          onClose={() => setRequerimiento(null)}
          onConfirm={handleConfirmarRequerimiento}
        />
      )}
    </AppShell>
  );
}

// ── Modal: poner requerimiento a la PYME desde la Bandeja de validación ───────
function RequerimientoIpiModal({ factura, onClose, onConfirm }) {
  const [mensaje, setMensaje] = useState('');

  return (
    <Modal
      title={`Poner requerimiento · ${factura.id}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => onConfirm(factura, mensaje)} disabled={!mensaje.trim()}>
            <MessageSquare className="w-3.5 h-3.5 mr-1" />Enviar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoRow label="PYME" value={factura.pyme} />
          <InfoRow label="Contrato" value={factura.contrato} />
          <InfoRow label="Monto IPI" value={`${fmt(factura.monto)} XAF`} />
          <InfoRow label="Vence" value={factura.fechaVencimiento ?? '—'} />
        </div>

        <div>
          <label className="text-[11px] text-text-4 mb-1 block">Mensaje para la PYME</label>
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            rows={4}
            placeholder="Escribe el requerimiento que debe corregir la PYME…"
            className="w-full rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none px-3 py-2 text-[13px] resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Modal: validación del IPI con condiciones financieras ─────────────────────
function ValidacionIpiModal({ factura, onClose, onConfirm }) {
  const ctx = contratosCtx[factura.contrato] ?? { retencion: 3, gestionCobranza: 1.5, interes: 5 };
  const [modalidad] = useState(MODALIDAD.retiroTotal);
  const [retencion, setRetencion] = useState(ctx.retencion);
  const [gestion, setGestion]     = useState(ctx.gestionCobranza);
  const [interes, setInteres]     = useState(ctx.interes);
  const [observacion, setObservacion] = useState('');

  const neto = Math.round(factura.monto * (1 - (retencion + gestion + interes) / 100));

  return (
    <Modal
      title={`Validar IPI · ${factura.id}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="success" onClick={() => onConfirm(factura, { modalidadPago: modalidad, retencion, gestionCobranza: gestion, interes, observacion })}>
            <CheckCircle className="w-3.5 h-3.5 mr-1" />Validar y enviar
          </Button>
        </>
      }
      wide
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoRow label="PYME" value={factura.pyme} />
          <InfoRow label="Contrato" value={factura.contrato} />
          <InfoRow label="Monto IPI" value={`${fmt(factura.monto)} XAF`} />
          <InfoRow label="Vence" value={factura.fechaVencimiento ?? '—'} />
        </div>

        <div>
          <div className="text-[12px] font-semibold text-text-3 mb-2">Matriz de Riesgo (porcentajes)</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-text-4 mb-1 block">Retención (%)</label>
              <input type="number" value={retencion} min={0} max={50}
                onChange={e => setRetencion(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[14px] font-semibold text-center" />
            </div>
            <div>
              <label className="text-[11px] text-text-4 mb-1 block">Cobranza (%)</label>
              <input type="number" value={gestion} min={0} max={50}
                onChange={e => setGestion(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[14px] font-semibold text-center" />
            </div>
            <div>
              <label className="text-[11px] text-text-4 mb-1 block">Interés (%)</label>
              <input type="number" value={interes} min={0} max={50}
                onChange={e => setInteres(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[14px] font-semibold text-center" />
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-border p-4" style={{ background: '#F8F7F5' }}>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-4">Monto del IPI</span>
            <span className="font-semibold">{fmt(factura.monto)} XAF</span>
          </div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-4">Retención</span>
            <span className="font-semibold">− {fmt(factura.monto * retencion / 100)} XAF</span>
          </div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-4">Gestión de cobranza</span>
            <span className="font-semibold">− {fmt(factura.monto * gestion / 100)} XAF</span>
          </div>
          <div className="flex justify-between text-[12px] mb-2">
            <span className="text-text-4">Intereses</span>
            <span className="font-semibold">− {fmt(factura.monto * interes / 100)} XAF</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2.5">
            <span className="text-[12px] font-semibold text-text-1">Monto a transferir</span>
            <span className="text-[16px] font-extrabold text-green-text">{fmt(neto)} XAF</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-text-4 mb-1 block">Observación para la PYME (requerimiento)</label>
          <input
            type="text"
            value={observacion}
            onChange={e => setObservacion(e.target.value)}
            placeholder="Condiciones de la validación…"
            className="w-full h-11 px-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[13px]"
          />
        </div>
      </div>
    </Modal>
  );
}