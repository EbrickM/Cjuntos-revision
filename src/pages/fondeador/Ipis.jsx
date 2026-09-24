import { useState } from 'react';
import { Eye, Zap, ListFilter } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import FiltroClienteSelect from './FiltroClienteSelect';
import { facturaService } from '../../services/factura.service';
import { contratoService } from '../../services/contrato.service';
import { INV } from '../../lib/invoiceStates';
import { fmt } from '../empresa-pequena/epData';
import { BANCO, porFechaDesc, fechaContrato } from './fondeadorShared';

// ── IPIs (portal Banco Fondeador) ──────────────────────────────────────────────
// Un IPI agrupa las operaciones de pago de un contrato: las facturas pagadas al
// completo (estado terminal) y las aprobadas con pago parcial acumulado. El ojo
// de cada fila reabre el mismo modal "Resumen de operaciones" que el portal
// Contratante usa para generar y enviar IPIs a Bonafide (solo lectura aquí).
const ESTADOS_FILTRO_IPI = ['Todos', 'Recibida', 'Ejecutada'];
const ipiEstadoBadge = (estado) => (estado === 'Ejecutada' ? 'green' : 'blue');

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

function ipisFondeador() {
  const contracts = contratoService.listar();
  const facturas  = facturaService.listar();

  const ipis = [];
  contracts.forEach(c => {
    const nombre = c.contratante?.razonSocial?.trim();
    if (!nombre) return;
    const delContrato = facturas.filter(f => f.contrato === c.id);

    const ops = [];
    delContrato.forEach(f => {
      const pagado = Number(f.pagosAcumulados || 0);
      if (f.estado === INV.pagada || f.estado === INV.billetera) {
        ops.push({
          facturaId: f.id,
          pyme: f.pyme,
          concepto: f.concepto,
          tipo: 'Completo',
          monto: Number(f.monto) || 0,
          pct: 100,
          fecha: f.fecha ?? fechaContrato(c),
        });
      } else if (f.estado === INV.aprobada && pagado > 0) {
        ops.push({
          facturaId: f.id,
          pyme: f.pyme,
          concepto: f.concepto,
          tipo: 'Parcial',
          monto: pagado,
          pct: Number(f.pagoParcial?.pct) || Math.round((pagado / (Number(f.monto) || 1)) * 100),
          fecha: f.pagoParcial?.fecha ?? f.fecha ?? fechaContrato(c),
        });
      }
    });
    if (!ops.length) return;

    ipis.push({
      contratante: nombre,
      contrato: c.id,
      fecha: ops.reduce((a, o) => (o.fecha > a ? o.fecha : a), ops[0].fecha),
      monto: ops.reduce((a, o) => a + (Number(o.monto) || 0), 0),
      // Recibida: el IPI llegó al banco pero aún tiene operaciones con pago
      // parcial en curso. Ejecutada: todas sus operaciones ya se liquidaron
      // por completo.
      estado: ops.every(o => o.tipo === 'Completo') ? 'Ejecutada' : 'Recibida',
      ops,
    });
  });

  return ipis.sort(porFechaDesc);
}

export default function FondIpis() {
  const [detalle, setDetalle] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroCliente, setFiltroCliente] = useState('');
  const ipisTodosLosClientes = ipisFondeador();
  const todosLosIpis = filtroCliente ? ipisTodosLosClientes.filter(i => i.contratante === filtroCliente) : ipisTodosLosClientes;
  const ipis = filtroEstado === 'Todos' ? todosLosIpis : todosLosIpis.filter(i => i.estado === filtroEstado);

  return (
    <AppShell active="fondIpis" role="fondeador" title="IPIs" sub={`Instrucciones de Pago vistas por ${BANCO}`}>
      <div className="fade-in space-y-4">
        <div className="flex justify-end">
          <FiltroClienteSelect value={filtroCliente} onChange={setFiltroCliente} />
        </div>
        <div className="bg-white rounded-[14px] border border-border p-5">
        <Header
          title="Instrucciones de Pago (IPIs)"
          sub={filtroCliente ? `IPIs de ${filtroCliente}; el ojo abre el resumen de operaciones de cada IPI.` : 'IPIs por contrato de las Empresas Contratantes; el ojo abre el resumen de operaciones de cada IPI.'}
          Icon={Zap}
          right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{ipis.length} IPIs</span>}
        />

        <div className="flex items-center gap-2.5 mb-4">
          <div className="relative flex items-center shrink-0">
            <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="h-9 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
            >
              {ESTADOS_FILTRO_IPI.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {/* Móvil: cards sin scroll lateral */}
        <div className="sm:hidden space-y-2">
          {ipis.map(i => (
            <div key={i.contrato} onClick={() => setDetalle(i)}
              className="rounded-[12px] border border-border px-3 py-2.5 cursor-pointer hover:bg-orange-tint/40 transition-colors">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-orange shrink-0" />
                <span className="text-[12px] font-bold text-text-1 truncate">{i.contratante}</span>
                <span className="text-[11px] font-mono text-text-5 ml-auto shrink-0">{i.contrato}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant={ipiEstadoBadge(i.estado)}>{i.estado}</Badge>
              </div>
              <div className="text-[11px] text-text-4 truncate mt-1">
                {i.fecha} · {i.ops.length} operación{i.ops.length === 1 ? '' : 'es'}
              </div>
              <div className="text-[12px] font-bold text-text-1 mt-0.5">{fmt(i.monto)} XAF</div>
            </div>
          ))}
          {ipis.length === 0 && (
            <div className="text-[12px] text-text-4 text-center py-8">
              {todosLosIpis.length === 0 ? 'No hay IPIs registrados.' : 'No se encontraron IPIs con el filtro aplicado.'}
            </div>
          )}
        </div>

        {/* Desktop: tabla compacta */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-page-bg">
              <tr className="border-b border-border">
                {['Empresa Contratante', 'Contrato', 'Operaciones', 'Estado', 'Fecha', 'Monto', 'Detalle'].map((h, i) => (
                  <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-2.5 py-3 whitespace-nowrap
                    ${i === 0 ? 'text-left' : i === 5 ? 'text-right' : 'text-center'}
                  `}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ipis.map(i => (
                <tr key={i.contrato} onClick={() => setDetalle(i)}
                  className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-orange-tint/40">
                  <td className="px-2.5 py-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-orange shrink-0" />
                      <span className="text-[12px] font-bold text-text-1 truncate max-w-[220px]">{i.contratante}</span>
                    </div>
                  </td>
                  <td className="px-2.5 py-3 text-center">
                    <span className="text-[11px] font-mono text-text-5 whitespace-nowrap">{i.contrato}</span>
                  </td>
                  <td className="px-2.5 py-3 text-center">
                    <span className="text-[11px] font-semibold text-text-3 whitespace-nowrap">{i.ops.length}</span>
                  </td>
                  <td className="px-2.5 py-3 text-center">
                    <Badge variant={ipiEstadoBadge(i.estado)}>{i.estado}</Badge>
                  </td>
                  <td className="px-2.5 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{i.fecha}</td>
                  <td className="px-2.5 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmt(i.monto)} XAF</td>
                  <td className="px-2.5 py-3 text-center">
                    <div onClick={e => e.stopPropagation()}>
                      <button onClick={() => setDetalle(i)} title="Ver resumen de operaciones"
                        className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {ipis.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[12px] text-text-4">
                    {todosLosIpis.length === 0 ? 'No hay IPIs registrados.' : 'No se encontraron IPIs con el filtro aplicado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {detalle && (
          <Modal
            title={`IPI · Resumen de operaciones (${detalle.ops.length})`}
            onClose={() => setDetalle(null)}
            footer={
              <Button variant="ghost" size="sm" onClick={() => setDetalle(null)}>Cerrar</Button>
            }
          >
            <div className="space-y-4">
              <p className="text-[12px] leading-relaxed text-text-4">
                IPI del contrato <span className="font-mono font-semibold text-text-1">{detalle.contrato}</span> de <span className="font-semibold text-text-1">{detalle.contratante}</span>.
                Resume todas las operaciones de pago registradas; la liquidación seguirá después el pipeline normal de cada factura.
              </p>

              <div className="space-y-2">
                {detalle.ops.map(o => (
                  <div key={o.facturaId} className="flex items-center justify-between gap-3 rounded-[10px] border border-border p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-mono font-bold text-text-1 truncate">{o.facturaId}</span>
                        <Badge variant={o.tipo === 'Completo' ? 'green' : 'orange'}>{o.tipo}</Badge>
                      </div>
                      <p className="text-[11px] mt-0.5 truncate text-text-4">
                        {o.pyme}{o.concepto ? ` · ${o.concepto}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-extrabold text-text-1 whitespace-nowrap">{fmt(o.monto)} XAF</div>
                      <div className="text-[10px] font-semibold text-orange-dark whitespace-nowrap">
                        {o.tipo === 'Completo' ? '100%' : `${o.pct}%`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[12px] p-4 flex items-center justify-between gap-3" style={{ background: 'var(--bonafide-gradient)' }}>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-white/80">Total operaciones</div>
                  <div className="text-[16px] sm:text-[20px] font-extrabold text-white leading-tight">{fmt(detalle.monto)} XAF</div>
                </div>
                <Badge variant="gold">{detalle.ops.length} operación{detalle.ops.length === 1 ? '' : 'es'}</Badge>
              </div>
            </div>
          </Modal>
        )}
        </div>
      </div>
    </AppShell>
  );
}
