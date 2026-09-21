import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import { facturaService } from '../../services/factura.service';
import { INV } from '../../lib/invoiceStates';

const txns = [
  ['💰','Pago contrato Chevron','TRX-0501','15/05/2026','+15,000,000','text-green-text'],
  ['🏗','Pago SAP (Libr. #LIB-001)','TRX-0502','14/05/2026','−8,000,000','text-red-text'],
  ['🚛','Pago APEX (Libr. #LIB-002)','TRX-0503','12/05/2026','−5,000,000','text-red-text'],
  ['💰','Pago contrato Chevron','TRX-0498','01/05/2026','+25,000,000','text-green-text'],
  ['👷','Nómina quincenal','TRX-0499','10/05/2026','−12,500,000','text-red-text'],
];

const cats = [
  ['🏗','Pagos a proveedores','13,000,000',45,'text-orange'],
  ['👷','Nómina','12,500,000',43,'text-blue-text'],
  ['📦','Materiales','3,500,000',12,'text-green-text'],
];

const fmt = v => new Intl.NumberFormat('de-DE').format(v ?? 0);

export default function EpBilletera() {
  // Billetera Virtual (Ruta B del BPMN): fondos desbloqueados por el Fondeador
  // vía Bonafide para distribuir a proveedores (Fase 2).
  const billeteras = facturaService.listarBilleteras();
  const mia = billeteras.find(b => b.pyme === 'Conexxia');
  const desbloqueadas = facturaService.listar().filter(f => f.estado === INV.billetera);

  return (
    <AppShell active="epBilletera" role="empresa-pequena" title="Mi Billetera" sub="Saldo y movimientos">
      <div className="fade-in grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-start">
        {/* Izquierda */}
        <div>
          {/* Wallet card — Billetera Virtual */}
          <div className="bg-gradient-to-br from-orange to-orange-dark rounded-2xl p-6 text-white mb-4">
            <div className="text-[11px] font-semibold opacity-80 uppercase tracking-[1px] mb-2">BILLETERA VIRTUAL · B-MORÏ</div>
            <div className="text-[11px] opacity-70 mb-1">Saldo disponible (desbloqueado)</div>
            <div className="text-[32px] font-extrabold mb-2">XAF {fmt(mia?.saldoDisponible ?? 0)}</div>
            <div className="bg-black/15 rounded-[8px] px-2.5 py-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold">
              📊 Monto presupuestado: XAF {fmt(mia?.montoPresupuestado ?? 0)}
            </div>
            <div className="border-t border-white/20 mt-3.5 pt-3.5 flex justify-between text-[12px] opacity-80">
              <span>Fondos del Fondeador vía Bonafide</span><span>{desbloqueadas.length} factura(s)</span>
            </div>
          </div>

          {mia && mia.facturas && mia.facturas.length > 0 && (
            <div className="bg-white rounded-[14px] border border-border p-5 mb-4">
              <div className="text-[13px] font-bold mb-3">Facturas desbloqueadas</div>
              {desbloqueadas.map(f => (
                <div key={f.id} className="flex items-center gap-3 py-2 border-b border-page-bg last:border-0">
                  <span className="text-[18px]">💳</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold truncate">{f.id}</div>
                    <div className="text-[11px] text-text-4 truncate">{f.concepto}</div>
                  </div>
                  <span className="text-[12px] font-bold text-orange">XAF {fmt(f.monto)}</span>
                </div>
              ))}
              <div className="text-[11px] text-text-4 mt-3">
                Distribuí estos fondos pagando a tus proveedores (Fase 2). Sin cuenta bancaria → Cheque de Venta.
              </div>
            </div>
          )}

          {/* Categorías de gasto */}
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="text-[13px] font-bold mb-4">Categorías de gasto — Mayo 2026</div>
            {cats.map(([ico,cat,amt,pct,c]) => (
              <div key={cat} className="flex items-center gap-3 mb-3">
                <span className="text-[20px] w-7">{ico}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] font-semibold">{cat}</span>
                    <span className="text-[12px] font-bold">XAF {amt}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c === 'text-orange' ? 'bg-orange' : c === 'text-blue-text' ? 'bg-blue-text' : 'bg-green'}`} style={{width:`${pct}%`}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Derecha: historial */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] font-bold">Historial de transacciones</span>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-page-bg border border-border rounded-[10px] px-3.5 py-2 text-[13px] text-text-4 w-[200px] cursor-pointer">
                🔍 Buscar...
              </div>
              <Button variant="ghost" size="sm">📥 Exportar</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Tipo','Descripción','ID','Fecha','Monto (XAF)'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase tracking-[0.5px] bg-[#FAFBFC] border-b border-border last:text-right">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map(([ico,desc,id,dt,amt,c]) => (
                <tr key={id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8] cursor-pointer">
                  <td className="px-4 py-3 text-[18px]">{ico}</td>
                  <td className="px-4 py-3 font-semibold text-[13px] text-text-1">{desc}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-text-4">{id}</td>
                  <td className="px-4 py-3 text-[12px] text-text-4">{dt}</td>
                  <td className={`px-4 py-3 text-[13px] font-bold text-right ${c}`}>{amt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
