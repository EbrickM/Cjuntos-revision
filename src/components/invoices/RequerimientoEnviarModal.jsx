// ── Modal para enviar un requerimiento a una factura ──────────────────────────
// Se abre desde el icono de mensaje (RequerirButton) que está en todas las
// facturas de los portales. Solo escribe el requerimiento en la historia; el
// estado de la factura no cambia (eso lo decide el flujo de cada portal).
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function RequerimientoEnviarModal({ factura, emisor = 'Contratante', onClose, onSend }) {
  const [mensaje, setMensaje] = useState('');
  const puedeEnviar = mensaje.trim().length > 0;

  return (
    <Modal
      title={`Enviar requerimiento · ${factura?.id ?? ''}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" disabled={!puedeEnviar} onClick={() => onSend?.(mensaje.trim())}>
            <MessageSquare className="w-3.5 h-3.5" /> Enviar requerimiento
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-[12px]" style={{ background: '#FFF3E0' }}>
          <MessageSquare className="w-5 h-5 shrink-0 mt-0.5 text-orange" />
          <p className="text-[12px] text-text-3 leading-relaxed">
            Escribe un requerimiento u observación sobre <b>{factura?.id}</b>. Se registra en la historia de la
            factura y queda visible para todas las partes ({emisor}).
          </p>
        </div>
        <textarea
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          rows={5}
          placeholder="Ej: falta adjuntar el comprobante fiscal del suministro…"
          className="w-full p-3 rounded-[10px] border-2 border-input-border focus:border-orange focus:outline-none text-[13px] resize-none"
        />
      </div>
    </Modal>
  );
}