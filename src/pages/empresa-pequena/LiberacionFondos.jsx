import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import FormGroup, { Select, Input } from '../../components/ui/FormGroup';
import UploadZone from '../../components/ui/UploadZone';
import Modal from '../../components/ui/Modal';

const proveedores = [
  { nombre: 'Cemex GE',     asignado: 30000000, pagado: 12000000, disponible: 18000000 },
  { nombre: 'TransGE S.L.', asignado: 15000000, pagado:  5000000, disponible: 10000000 },
];

const historial = [
  { fecha: '14/05/2026', proveedor: 'Cemex GE',     monto: '8,000,000', ref: 'LIB-001', estado: 'Aprobado',  estadoCls: 'green' },
  { fecha: '12/05/2026', proveedor: 'TransGE S.L.', monto: '5,000,000', ref: 'LIB-002', estado: 'Aprobado',  estadoCls: 'green' },
  { fecha: '10/05/2026', proveedor: 'Cemex GE',     monto: '4,000,000', ref: 'LIB-003', estado: 'En revisión', estadoCls: 'blue' },
];

export default function EpLiberacion() {
  const { go } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [provSel, setProvSel] = useState('');
  const [monto, setMonto]     = useState('');

  const provInfo = proveedores.find(p => p.nombre === provSel);

  return (
    <AppShell active="epPrestamos" role="empresa-pequena" title="Liberación de Fondos" sub="Préstamo PRE-2026-001">
      <div className="fade-in">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => go('epPrestamoDetalle')}>← Volver al préstamo</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          {/* Formulario de liberación */}
          <div>
            <div className="bg-white rounded-[14px] border border-border p-6 mb-5">
              <div className="text-[15px] font-bold mb-1">Nueva solicitud de liberación</div>
              <div className="text-[13px] text-text-3 mb-5">Solicita a Bonafide liberar fondos para pagar a uno de tus proveedores. Debes adjuntar la factura justificante.</div>

              <FormGroup label="Préstamo" required>
                <Select defaultValue="">
                  <option value="">Seleccionar préstamo</option>
                  <option value="PRE-2026-001">PRE-2026-001 · TotalEnerGE · XAF 120M</option>
                </Select>
              </FormGroup>

              <FormGroup label="Proveedor a pagar" required>
                <Select value={provSel} onChange={e => setProvSel(e.target.value)}>
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.nombre} value={p.nombre}>
                      {p.nombre} · Disponible XAF {(p.disponible/1e6).toFixed(0)}M
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {provInfo && (
                <div className="grid grid-cols-3 gap-3 bg-page-bg rounded-[12px] p-4 mb-4">
                  {[['Asignado',`XAF ${(provInfo.asignado/1e6).toFixed(0)}M`,'text-text-1'],['Pagado',`XAF ${(provInfo.pagado/1e6).toFixed(0)}M`,'text-orange'],['Disponible',`XAF ${(provInfo.disponible/1e6).toFixed(0)}M`,'text-green-text']].map(([l,v,c]) => (
                    <div key={l} className="text-center">
                      <div className={`text-[15px] font-extrabold ${c}`}>{v}</div>
                      <div className="text-[11px] text-text-4">{l}</div>
                    </div>
                  ))}
                </div>
              )}

              <FormGroup label="Monto a liberar (XAF)" required>
                <Input
                  type="text"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  placeholder="8,000,000"
                />
                {provInfo && monto && (
                  <div className="text-[11px] text-text-4 mt-1">
                    Disponible tras liberación: XAF {Math.max(0, provInfo.disponible - parseInt(monto.replace(/,/g,''))).toLocaleString('es')}
                  </div>
                )}
              </FormGroup>

              <FormGroup label="Concepto / Descripción" required>
                <Input type="text" placeholder="Ej: Compra de cemento para obra fase 2" />
              </FormGroup>

              <FormGroup label="Factura / Justificante (PDF)" required>
                <UploadZone label="Adjuntar factura del proveedor" hint="PDF · máx 10 MB — Obligatorio para procesar la liberación" />
              </FormGroup>

              <FormGroup label="Notas adicionales">
                <Input type="text" placeholder="Información adicional para Bonafide..." />
              </FormGroup>

              <div className="bg-orange-tint border border-orange-border rounded-[12px] p-3.5 mt-2 mb-5">
                <div className="text-[11px] text-text-3 leading-[1.5]">
                  ⏱ Bonafide revisará tu solicitud en menos de 24 horas. Los fondos se acreditarán directamente al proveedor una vez aprobado.
                </div>
              </div>

              <Button variant="primary" full className="h-12 text-[15px]" onClick={() => setShowModal(true)}>
                Solicitar liberación de fondos →
              </Button>
            </div>
          </div>

          {/* Historial */}
          <div>
            <div className="bg-white rounded-[14px] border border-border p-5 mb-4">
              <div className="text-[13px] font-bold mb-4">Historial de liberaciones</div>
              {historial.map(h => (
                <div key={h.ref} className="p-3 bg-page-bg rounded-[10px] mb-3 last:mb-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[12px] font-mono text-text-4">{h.ref}</span>
                    <Badge variant={h.estadoCls}>{h.estado}</Badge>
                  </div>
                  <div className="text-[13px] font-bold text-text-1">{h.proveedor}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[11px] text-text-4">{h.fecha}</span>
                    <span className="text-[13px] font-bold text-orange">XAF {h.monto}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen por proveedor */}
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold mb-4">Resumen por proveedor</div>
              {proveedores.map(p => {
                const pct = Math.round(p.pagado/p.asignado*100);
                return (
                  <div key={p.nombre} className="mb-4 last:mb-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-[13px] font-semibold">{p.nombre}</span>
                      <span className="text-[12px] text-text-4">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-orange rounded-full" style={{width:`${pct}%`}} />
                    </div>
                    <div className="flex justify-between text-[11px] text-text-4">
                      <span>Pagado: XAF {(p.pagado/1e6).toFixed(0)}M</span>
                      <span className="text-green-text">Disponible: XAF {(p.disponible/1e6).toFixed(0)}M</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal confirmación */}
      {showModal && (
        <Modal
          title="Confirmar solicitud de liberación"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => { setShowModal(false); go('epPrestamos'); }}>
                ✓ Confirmar y enviar a Bonafide
              </Button>
            </>
          }
        >
          <div className="bg-page-bg rounded-[12px] p-4 mb-4">
            {[['Préstamo','PRE-2026-001 · TotalEnerGE'],['Proveedor', provSel || 'Cemex GE'],['Monto a liberar', `XAF ${monto || '8,000,000'}`],['Factura adjunta','factura_cemex_001.pdf ✅']].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-[12px] text-text-4">{k}</span>
                <span className="text-[13px] font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <div className="bg-orange-tint border border-orange-border rounded-[12px] p-3 text-[12px] text-text-3">
            Bonafide revisará esta solicitud en menos de 24 horas y notificará el resultado por email.
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
