// ── Modal de detalle de factura (unificado para todos los portales) ──────────
// Muestra los datos de la factura + historial (timeline vertical) y permite
// al llamador inyectar acciones en el footer según su rol y estado.
import { FileText, Landmark, Percent } from 'lucide-react';
import Modal from '../ui/Modal';
import InfoRow from '../ui/InfoRow';
import Timeline from '../ui/Timeline';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { fmt } from '../../pages/empresa-pequena/epData';

function TimelineItem({ h }) {
  return {
    title: h.titulo,
    timestamp: h.fecha,
    sub: h.detalle,
    ...(h.hecho === false ? {} : { done: true }),
    icon: '✓',
  };
}

export default function InvoiceDetailModal({ factura, title, onClose, footer, children }) {
  const f = factura;
  const timeline = (f.historia ?? []).map(h => TimelineItem({ h }));

  return (
    <Modal title={title ?? `Factura · ${f.id}`} onClose={onClose} footer={footer} wide>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-2">
          <InvoiceStatusBadge estado={f.estado} />
          <span className="text-[12px]" style={{ color: '#A9A6A1' }}>{f.fecha}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="Nº Factura" value={f.id} />
          <InfoRow label="Emp. Contratada" value={f.pyme ?? '—'} />
          <InfoRow label="Contratante" value={f.contratante ?? '—'} />
          {f.proveedor && <InfoRow label="Proveedor" value={f.proveedor} />}
          {f.suministrador && <InfoRow label="Suministrador" value={f.suministrador} />}
          <InfoRow label="Contrato" value={f.contrato} />
          <InfoRow label="Monto" value={`${fmt(f.monto)} XAF`} />
          <InfoRow label="Fecha" value={f.fecha} />
          <InfoRow label="Vence" value={f.fechaVencimiento ?? '—'} />
          <InfoRow label="Concepto" value={f.concepto} />
          <InfoRow label="Modalidad" value={f.modalidadPago === 'billetera_virtual' ? 'Billetera Virtual' : 'Retiro Total'} />
        </div>

        {f.ipi && (
          <div className="rounded-[12px] border border-border p-4 space-y-0.5" style={{ background: '#F8F7F5' }}>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#A9A6A1' }}>
              <Landmark className="w-3.5 h-3.5" /> Instrumento de Pago (IPI)
            </div>
            <div className="flex justify-between text-[12px]"><span style={{ color: '#A9A6A1' }}>Número</span><span className="font-semibold font-mono">{f.ipi.numero}</span></div>
            <div className="flex justify-between text-[12px]"><span style={{ color: '#A9A6A1' }}>Emisión</span><span className="font-semibold">{f.ipi.fechaEmision}</span></div>
            {f.ipi.fechaValidacion && (
              <div className="flex justify-between text-[12px]"><span style={{ color: '#A9A6A1' }}>Validación</span><span className="font-semibold">{f.ipi.fechaValidacion}</span></div>
            )}
          </div>
        )}

        {f.requerimientos && (
          <div className="rounded-[12px] p-4 border" style={{ background: '#FDEEEB', borderColor: 'rgba(184,53,42,0.25)' }}>
            <div className="flex items-start gap-2.5">
              <Landmark className="w-4 h-4 shrink-0 mt-0.5 text-red-text" />
              <div>
                <div className="text-[11px] font-bold text-red-text mb-0.5">Requerimiento · Bonafide</div>
                <div className="text-[12px] text-text-1 leading-relaxed">{f.requerimientos.mensaje}</div>
                {f.requerimientos.fecha && <div className="text-[11px] mt-1" style={{ color: '#A9A6A1' }}>Emitido el {f.requerimientos.fecha}</div>}
              </div>
            </div>
          </div>
        )}

        {f.requerimientosEnviados && f.requerimientosEnviados.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">Requerimientos enviados</div>
            {f.requerimientosEnviados.map((r, i) => (
              <div key={i} className="rounded-[12px] p-3 border" style={{ background: '#FDF6E8', borderColor: 'rgba(239,122,44,0.25)' }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-orange">{r.emisor}</span>
                  <span className="text-[10px]" style={{ color: '#A9A6A1' }}>{r.fecha}</span>
                </div>
                <p className="text-[12px] text-text-1 leading-relaxed">{r.mensaje}</p>
              </div>
            ))}
          </div>
        )}

        {f.condiciones && (
          <div className="rounded-[12px] border border-border p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#A9A6A1' }}>
              <Percent className="w-3.5 h-3.5" /> Condiciones financieras (Matriz de Riesgo)
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[10px] text-text-4 uppercase tracking-wide mb-0.5">Retención</div>
                <div className="text-[14px] font-extrabold text-text-1">{f.condiciones.retencion}%</div>
              </div>
              <div>
                <div className="text-[10px] text-text-4 uppercase tracking-wide mb-0.5">Cobranza</div>
                <div className="text-[14px] font-extrabold text-text-1">{f.condiciones.gestionCobranza}%</div>
              </div>
              <div>
                <div className="text-[10px] text-text-4 uppercase tracking-wide mb-0.5">Interés</div>
                <div className="text-[14px] font-extrabold text-text-1">{f.condiciones.interes}%</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-[12px]">
              <span style={{ color: '#A9A6A1' }}>Monto a transferir (neto)</span>
              <span className="font-extrabold text-orange">{fmt(f.condiciones.neto)} XAF</span>
            </div>
          </div>
        )}

        {f.documentos && f.documentos.length > 0 ? (
          <div>
            <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Documentos adjuntos</div>
            <div className="space-y-2">
              {f.documentos.map(d => (
                <div key={d.name} className="flex items-center gap-2.5 p-3 rounded-[10px] border border-border" style={{ color: '#A9A6A1' }}>
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="text-[12px]">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Documento adjunto</div>
            <div className="flex items-center gap-2.5 p-3 rounded-[10px] border border-border" style={{ color: '#A9A6A1' }}>
              <FileText className="w-4 h-4 shrink-0" />
              <span className="text-[12px]">No se ha adjuntado documento a esta factura.</span>
            </div>
          </div>
        )}

        <div>
          <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Historial</div>
          {timeline.length > 0 ? (
            <Timeline items={timeline} />
          ) : (
            <div className="text-[12px]" style={{ color: '#A9A6A1' }}>Sin eventos registrados todavía.</div>
          )}
        </div>

        {children}
      </div>
    </Modal>
  );
}