// ── Modal: Nueva / Editar factura al Contratante (compartido PYME ↔ Proveedor
// ↔ detalle de Contrato PYME) ─────────────────────────────────────────────────
// Es el mismo modal que usaba la página de Facturación de la PYME, extraído
// para que el Proveedor y la ficha de Contrato puedan crear facturas con
// idéntica dinámica, campos y validaciones. Con `contratoFijo` (ficha de
// contrato) se oculta el selector: la factura queda ligada a ese contrato.
import { Upload, Paperclip } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormGroup, { Input, Select, Textarea } from '../ui/FormGroup';
import { seedContratosActivos } from '../../lib/invoiceSeeds';
import { formatXaf, defaultVencimiento, pad2, parseFecha } from './facturaUtils';

// Conversión DD/MM/AAAA ↔ YYYY-MM-DD (formato que entiende <input type="date">)
const toIso = v => {
  const p = parseFecha(v);
  return p ? `${p.y}-${pad2(p.mo)}-${pad2(p.d)}` : '';
};
const fromIso = v => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || '');
  return m ? `${+m[3]}/${+m[2]}/${m[1]}` : defaultVencimiento();
};

// FechaVencimientoInput — campo de fecha compacto (una sola línea).
// Es un <input type="date"> nativo: el icono de calendario que trae incorporado
// el campo abre el calendario del navegador para elegir el día. La escritura
// manual está bloqueada a nivel de teclado: solo se puede cambiar con el
// calendario o con las flechas ↑/↓ del propio campo.
function FechaVencimientoInput({ value, onChange }) {
  return (
    <input
      type="date"
      value={toIso(value) || toIso(defaultVencimiento())}
      onChange={e => onChange(e.target.value ? fromIso(e.target.value) : defaultVencimiento())}
      onKeyDown={e => {
        // Bloquea escribir letras/números a mano; deja pasar flechas, Tab, Enter y Escape.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) e.preventDefault();
      }}
      onPaste={e => e.preventDefault()}
      onDrop={e => e.preventDefault()}
      className="h-10 w-44 border-2 border-gray-200 rounded-[8px] bg-[#fafafa] px-2
        text-[13px] font-semibold text-text-1 cursor-pointer outline-none transition-all
        focus:bg-white focus:shadow-[0_0_0_3px_rgba(239,122,44,0.12)] focus:ring-1 focus:ring-orange"
    />
  );
}

export default function FacturaContratanteModal({ modal, onChange, onSave, onCancel, contratoFijo }) {
  const { editId, contratoId, monto, concepto, fechaVencimiento, documento } = modal;

  const fuente      = contratoFijo ?? (contratoId ? seedContratosActivos.find(c => c.id === contratoId) ?? null : null);
  const max         = Number(fuente?.montoMax) || Number(fuente?.disponible) || 0;
  const montoNum    = Number(String(monto || '').replace(/[^0-9]/g, '')) || 0;
  const excede      = max > 0 && montoNum > max;

  const razonContratante = contratoFijo
    ? (typeof contratoFijo.contratante === 'string' ? contratoFijo.contratante : contratoFijo.contratante?.razonSocial ?? '')
    : (fuente?.contratante ?? '');
  const modalidad = (contratoFijo?.tipoFactoring ?? fuente?.tipoFactoring) === 'directo' ? 'Directo' : 'Inverso';

  return (
    <Modal
      title={editId ? `Corregir factura ${editId}` : 'Nueva Factura al Contratante'}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" onClick={onSave} disabled={excede}>
            {editId ? 'Guardar y reenviar' : 'Crear factura'}
          </Button>
        </>
      }
      wide
    >
      <div className="space-y-4">
        {editId && (
          <div className="rounded-[12px] p-4 text-[12px]" style={{ background: '#FDEEEB', color: '#B8352A', border: '1px solid rgba(184,53,42,0.25)' }}>
            La Contratante devolvió la factura con correcciones. Editala y vuelve a enviarla.
          </div>
        )}
        {contratoFijo ? (
          <FormGroup label="Contrato" required>
            <div className="flex items-center gap-2 h-10 px-3 rounded-[8px] border-2 border-gray-200 bg-[#fafafa] text-[13px] font-semibold text-text-1 overflow-x-auto whitespace-nowrap">
              <span className="text-orange">{contratoFijo.id}</span>
              <span className="text-text-4">·</span>
              <span className="text-text-3">{razonContratante || '—'}</span>
              {max > 0 && (
                <>
                  <span className="text-text-4">·</span>
                  <span className="text-text-3">Máx {formatXaf(max)}</span>
                </>
              )}
              <span className="text-text-4">·</span>
              <span className="text-text-3">{modalidad}</span>
            </div>
          </FormGroup>
        ) : (
          <FormGroup label="Contrato" required>
            <Select
              value={contratoId}
              onChange={e => onChange({ contratoId: e.target.value })}
              disabled={!!editId}
            >
              <option value="">Seleccionar contrato</option>
              {seedContratosActivos.map(c => (
                <option key={c.id} value={c.id}>{c.id} · {c.contratante} · {c.tipoFactoring === 'directo' ? 'Directo' : 'Inverso'}</option>
              ))}
            </Select>
          </FormGroup>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Monto (XAF)" required>
            <Input
              type="text" inputMode="numeric" placeholder="Ej: 18,000,000"
              value={monto}
              onChange={e => onChange({ monto: e.target.value.replace(/[^0-9]/g, '') })}
            />
            {monto && <div className="text-[11px] text-text-4 mt-1">{formatXaf(monto)}</div>}
            {max > 0 && (
              <div className="text-[11px] text-text-4 mt-1">Monto máximo del contrato: {formatXaf(max)}</div>
            )}
            {excede && (
              <div className="text-[11px] font-semibold mt-1" style={{ color: '#B8352A' }}>
                Este monto supera el límite del contrato ({formatXaf(max)}).
              </div>
            )}
          </FormGroup>
          <FormGroup label="Fecha de vencimiento">
            <FechaVencimientoInput value={fechaVencimiento} onChange={v => onChange({ fechaVencimiento: v })} />
          </FormGroup>
        </div>
        <FormGroup label="Concepto" required>
          <Textarea
            value={concepto}
            onChange={e => onChange({ concepto: e.target.value })}
            placeholder="Descripción del servicio o hito facturado."
          />
        </FormGroup>
        <div>
          <div className="text-[12px] font-medium text-text-3 mb-1.5">Adjuntar documento</div>
          {documento ? (
            <div className="flex items-center gap-2 bg-page-bg rounded-[8px] px-3 py-2 text-[12px] text-text-3 border border-border">
              <Paperclip className="w-3.5 h-3.5 text-text-4 shrink-0" />
              <span className="flex-1 truncate">{documento.name}</span>
              <button onClick={() => onChange({ documento: null })} className="text-text-4 hover:text-red-text text-[14px] leading-none">×</button>
            </div>
          ) : (
            <label className="flex items-center gap-2 border border-dashed border-border rounded-[8px] px-3 py-2.5 text-[12px] text-text-4 cursor-pointer hover:border-orange/40 hover:bg-orange-tint transition">
              <Upload className="w-3.5 h-3.5 shrink-0" />
              Seleccionar archivo (PDF, imagen)
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
                const file = e.target.files?.[0];
                if (file) onChange({ documento: { name: file.name, url: URL.createObjectURL(file) } });
              }} />
            </label>
          )}
        </div>
      </div>
    </Modal>
  );
}