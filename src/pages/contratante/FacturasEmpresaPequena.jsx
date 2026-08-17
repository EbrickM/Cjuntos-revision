import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const facturas = [
  { id: 'FAC-2026-0911', empresa: 'Const. Silva Ltd.', contrato: 'CT-2026-0041', monto: '21,500,000', fecha: '28/06/2026', vence: '28/07/2026', estado: 'Recibida', estadoCls: 'yellow', concepto: 'Obras de estructura fase 2 — planta baja y primer piso' },
  { id: 'FAC-2026-0918', empresa: 'Const. Silva Ltd.', contrato: 'CT-2026-0041', monto: '26,000,000', fecha: '05/07/2026', vence: '05/08/2026', estado: 'Recibida', estadoCls: 'yellow', concepto: 'Acabados interiores y carpintería — módulos A y B' },
];

export default function EmpFactEP() {
  const [selected, setSelected] = useState(null);
  const [pagadas, setPagadas] = useState({});

  const f = facturas.find(x => x.id === selected);

  return (
    <AppShell active="empFactEP" role="contratante" title="Facturas de Empresas PYME" sub="Revisar y pagar">
      <div className="fade-in">
        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[['🧾','4','Facturas recibidas','text-text-1'],['💰','XAF 28.5M','Pendiente de pago','text-orange'],['✅','XAF 21M','Pagado este mes','text-green-text']].map(([ico,v,l,c]) => (
            <div key={l} className="bg-white rounded-[14px] p-5 border border-border">
              <div className="text-[28px] mb-2">{ico}</div>
              <div className={`text-[22px] font-extrabold ${c} mb-1`}>{v}</div>
              <div className="text-[12px] text-text-4">{l}</div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <span className="text-[14px] font-bold">Facturas recibidas de empresas PYME</span>
            <Button variant="ghost" size="sm">📥 Exportar</Button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Nº Factura','Empresa','Contrato','Concepto','Monto (XAF)','Vence','Estado',''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase tracking-[0.5px] bg-[#FAFBFC] border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => {
                const isPagada = f.estado === 'Pagada' || pagadas[f.id];
                return (
                  <tr key={f.id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8]">
                    <td className="px-4 py-3 font-mono text-[11px] text-text-4 font-semibold">{f.id}</td>
                    <td className="px-4 py-3 font-semibold text-[13px]">{f.empresa}</td>
                    <td className="px-4 py-3 text-[12px] font-mono text-text-4">{f.contrato}</td>
                    <td className="px-4 py-3 text-[12px] text-text-3">{f.concepto}</td>
                    <td className="px-4 py-3 font-bold text-[13px]">XAF {f.monto}</td>
                    <td className="px-4 py-3 text-[12px] text-text-4">{f.vence}</td>
                    <td className="px-4 py-3"><Badge variant={isPagada ? 'green' : 'yellow'}>{isPagada ? 'Pagada' : f.estado}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(f.id)}>📄 Ver</Button>
                        {!isPagada && (
                          <Button variant="primary" size="sm" onClick={() => setPagadas(p => ({...p, [f.id]: true}))}>
                            💳 Pagar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Modal detalle factura */}
      {f && (
        <Modal title={`Factura ${f.id}`} onClose={() => setSelected(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setSelected(null)}>Cerrar</Button>
              {!pagadas[f.id] && f.estado !== 'Pagada' && (
                <Button variant="primary" onClick={() => { setPagadas(p => ({...p, [f.id]: true})); setSelected(null); }}>
                  💳 Marcar como pagada
                </Button>
              )}
            </>
          }
        >
          <div className="bg-page-bg rounded-[12px] p-4 mb-4">
            {[['Empresa',f.empresa],['Contrato',f.contrato],['Concepto',f.concepto],['Monto','XAF '+f.monto],['Fecha emisión',f.fecha],['Fecha vencimiento',f.vence]].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-[12px] text-text-4">{k}</span>
                <span className="text-[13px] font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-bg border border-blue-text/20 rounded-[12px] p-3">
            <div className="text-[11px] text-text-3 leading-[1.5]">
              📄 <strong>Domiciliación bancaria:</strong> El pago debe realizarse a la cuenta indicada en el documento de domiciliación adjunto al contrato {f.contrato}. Los fondos serán recibidos por Bonafide Microbank.
            </div>
          </div>
          <div className="mt-3">
            <Button variant="ghost" full>📥 Descargar factura PDF</Button>
          </div>
          <div className="mt-2">
            <Button variant="ghost" full>🏦 Ver documento de domiciliación</Button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
