import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';
import UploadZone from '../../components/ui/UploadZone';
import { EmojiIcon } from '../../components/ui/IconHelper';
import { renderEmojiText } from '../../components/ui/IconHelperUtils';

const facturas = [
  { id: 'FAC-2026-0892', contratante: 'TotalEnerGE', monto: '12,500,000', estado: 'Pagada', estadoCls: 'green', fecha: '01/05/2026', concepto: 'Fase 1 obra CTR-2026-001' },
  { id: 'FAC-2026-0933', contratante: 'TotalEnerGE', monto: '18,000,000', estado: 'Enviada', estadoCls: 'blue', fecha: '10/05/2026', concepto: 'Avance obra fase 2' },
  { id: 'FAC-2026-0971', contratante: 'TotalEnerGE', monto: '10,000,000', estado: 'Borrador', estadoCls: 'yellow', fecha: '18/05/2026', concepto: 'Suministros materiales' },
];

export default function EpFacturacion() {
  const { go } = useApp();
  const [showModal, setShowModal] = useState(false);

  return (
    <AppShell active="epFacturacion" role="empresa-pequena" title="Facturación" sub="Facturas al contratante"
      extra={<Button variant="primary" size="sm" onClick={() => setShowModal(true)}>+ Nueva Factura</Button>}
    >
      <div className="fade-in">
        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[['🧾','3','Facturas emitidas','text-text-1'],['💰','XAF 12.5M','Cobrado este mes','text-green-text'],['⏳','XAF 28M','Pendiente de cobro','text-orange']].map(([ico,v,l,c]) => (
            <div key={l} className="bg-white rounded-[14px] p-5 border border-border">
              <div className="text-[28px] mb-2"><EmojiIcon emoji={ico} size={28} className="inline-block" /></div>
              <div className={`text-[22px] font-extrabold ${c} mb-1`}>{v}</div>
              <div className="text-[12px] text-text-4">{l}</div>
            </div>
          ))}
        </div>

        {/* Tabla de facturas */}
        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <span className="text-[14px] font-bold">Mis Facturas</span>
            <Button variant="ghost" size="sm">📥 Exportar</Button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Nº Factura','Contratante','Concepto','Monto (XAF)','Estado','Fecha',''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase tracking-[0.5px] bg-[#FAFBFC] border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => (
                <tr key={f.id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8] cursor-pointer">
                  <td className="px-4 py-3 font-mono text-[11px] text-text-4 font-semibold">{f.id}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-text-1">{f.contratante}</td>
                  <td className="px-4 py-3 text-[12px] text-text-3">{f.concepto}</td>
                  <td className="px-4 py-3 text-[13px] font-bold text-text-1">XAF {f.monto}</td>
                  <td className="px-4 py-3"><Badge variant={f.estadoCls}>{f.estado}</Badge></td>
                  <td className="px-4 py-3 text-[12px] text-text-4">{f.fecha}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm"><EmojiIcon emoji="📄" size={16} className="mr-2" />Ver</Button>
                      {f.estado === 'Borrador' && <Button variant="primary" size="sm">Enviar</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Modal nueva factura */}
      {showModal && (
        <Modal
          title="Nueva Factura al Contratante"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowModal(false)}>Guardar borrador</Button>
                <Button variant="primary" onClick={() => setShowModal(false)}>Enviar al contratante <EmojiIcon emoji="→" size={16} className="ml-2" /></Button>
              </div>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-x-4">
            <FormGroup label="Contratante" required className="col-span-2">
              <Select>
                <option>TotalEnerGE</option>
                <option>ConstrGE Corp.</option>
              </Select>
            </FormGroup>
            <FormGroup label="Nº de Factura" required>
              <Input type="text" defaultValue="FAC-2026-0985" />
            </FormGroup>
            <FormGroup label="Fecha de emisión" required>
              <Input type="text" defaultValue="18 / 05 / 2026" />
            </FormGroup>
            <FormGroup label="Monto (XAF)" required className="col-span-2">
              <Input type="text" placeholder="15,000,000" />
            </FormGroup>
            <FormGroup label="Concepto / Descripción" required className="col-span-2">
              <Textarea placeholder="Descripción del trabajo o entrega facturada..." />
            </FormGroup>
            <FormGroup label="Contrato relacionado">
              <Select>
                <option>CTR-2026-001</option>
                <option>CTR-2026-004</option>
              </Select>
            </FormGroup>
            <FormGroup label="Fecha de vencimiento">
              <Input type="text" placeholder="30 / 06 / 2026" />
            </FormGroup>
            <FormGroup label="Adjuntar factura (PDF)" required className="col-span-2">
              <UploadZone label="Subir factura firmada" hint="PDF · máx 5 MB" />
            </FormGroup>
          </div>
          <div className="bg-blue-bg border border-blue-text/20 rounded-[12px] p-3 mt-2">
            <div className="text-[11px] text-text-3 leading-[1.5]">
              {renderEmojiText('📧 Se enviará notificación a TotalEnerGE para que revise y pague esta factura a través de la plataforma.')}
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
