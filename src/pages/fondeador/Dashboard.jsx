import { useApp } from '../../state/AppContext';
import { useCountUp } from '../../hooks/useCountUp';
import AppShell from '../../components/layout/AppShell';
import { LineChart } from '../../components/charts/Charts';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import { facturaService } from '../../services/factura.service';
import { fmt } from '../empresa-pequena/epData';
import { BANCO, BANCO_CORTO, netoFactura } from './fondeadorShared';

// ── INICIO (portal Banco Fondeador) ───────────────────────────────────────────
// Vista general de la cartera del banco: órdenes de fondeo pendientes de
// liquidar, monto ya fondeado y su evolución mensual.
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const SERIE_DEMO = MESES.slice(3, 9).map((mes, i) => ({ mes, monto: [0, 0, 18, 24, 9, 32][i] }));

export default function FondDash() {
  const { go } = useApp();

  const ordenes = facturaService.bandejaOrdenes(BANCO);
  const cartera = facturaService.carteraFondeador(BANCO);

  const porLiquidar = ordenes.reduce((a, f) => a + netoFactura(f), 0);
  const fondeado    = cartera.reduce((a, f) => a + netoFactura(f), 0);

  // ── Contadores animados ───────────────────────────────────────────────────
  const animOrdenes     = useCountUp(ordenes.length, 800,  150);
  const animPorLiquidar = useCountUp(porLiquidar,    1400, 200);
  const animCartera     = useCountUp(cartera.length, 800,  300);
  const animFondeado    = useCountUp(fondeado,       1400, 350);

  const serie = MESES.map((mes, i) => {
    const mm = String(i + 1).padStart(2, '0');
    const total = cartera
      .filter(f => (f.fecha ?? '').split('/')[1] === mm)
      .reduce((a, f) => a + netoFactura(f), 0);
    return { mes, monto: Math.round(total / 1_000_000) };
  }).filter(d => d.monto > 0);
  const lineData = serie.length >= 2 ? serie : SERIE_DEMO;


  return (
    <AppShell
      active="fondDash"
      role="fondeador"
      title="Inicio"
      sub={`Vista general de ${BANCO} · cartera de fondeo`}
    >
      <div className="fade-in space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-enter bg-white rounded-[14px] border border-border p-4">
            <div className="text-[22px] font-extrabold leading-none mb-2 truncate text-orange tabular-nums">{animOrdenes}</div>
            <div className="text-[12px] text-text-4 leading-snug">Órdenes por liquidar</div>
          </div>
          <div className="card-enter bg-white rounded-[14px] border border-border p-4">
            <div className="text-[22px] font-extrabold leading-none mb-2 truncate text-blue-text tabular-nums">{fmt(animPorLiquidar)} XAF</div>
            <div className="text-[12px] text-text-4 leading-snug">Monto por liquidar</div>
          </div>
          <div className="card-enter bg-white rounded-[14px] border border-border p-4">
            <div className="text-[22px] font-extrabold leading-none mb-2 truncate text-green-text tabular-nums">{animCartera}</div>
            <div className="text-[12px] text-text-4 leading-snug">Operaciones fondeadas</div>
          </div>
          <div className="card-enter bg-white rounded-[14px] border border-border p-4">
            <div className="text-[22px] font-extrabold leading-none mb-2 truncate text-yellow-text tabular-nums">{fmt(animFondeado)} XAF</div>
            <div className="text-[12px] text-text-4 leading-snug">Capital fondeado</div>
          </div>
        </div>

        {/* Evolución + órdenes recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5 flex flex-col">
            <div className="mb-4">
              <div className="text-[14px] font-bold text-text-1">Fondeo por mes</div>
              <div className="text-[11px] text-text-4">Monto neto acreditado · millones XAF</div>
            </div>
            <div className="flex-1 min-h-[200px]">
              <LineChart id="fond-general" data={lineData} color="#ef7a2c" xKey="mes" yKey="monto" unit="M" h={180} />
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-[14px] font-bold text-text-1">Órdenes por liquidar</div>
                <div className="text-[11px] text-text-4">Recibidas de las Contratantes</div>
              </div>
              <button
                onClick={() => go('fondOrdenes')}
                className="text-[12px] text-orange-dark font-semibold hover:opacity-75 transition cursor-pointer whitespace-nowrap"
              >
                Ver todas →
              </button>
            </div>

            {ordenes.length === 0 ? (
              <div className="text-[13px] text-text-4 py-8 text-center">No hay órdenes pendientes.</div>
            ) : (
              <div className="space-y-3">
                {ordenes.slice(0, 4).map(o => (
                  <div
                    key={o.id}
                    onClick={() => go('fondOrdenes')}
                    className="slide-up flex items-center justify-between gap-3 p-3 rounded-[10px] border border-border hover:bg-orange-tint/30 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-text-1 truncate">{o.pyme}</div>
                      <div className="text-[10px] font-mono text-text-4">{o.ipi?.numero ?? o.id}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[12px] font-extrabold text-green-text whitespace-nowrap">{fmt(netoFactura(o))} XAF</div>
                      <div className="text-[10px] text-text-4">a transferir</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cartera reciente */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-[14px] font-bold text-text-1">Cartera reciente</div>
              <div className="text-[11px] text-text-4">Operaciones fondeadas por {BANCO_CORTO}</div>
            </div>
            <button
              onClick={() => go('fondCartera')}
              className="text-[12px] text-orange-dark font-semibold hover:opacity-75 transition cursor-pointer whitespace-nowrap"
            >
              Ver historial →
            </button>
          </div>

          {cartera.length === 0 ? (
            <div className="text-[13px] text-text-4 py-8 text-center">Aún no hay operaciones fondeadas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-page-bg">
                  <tr className="border-b border-border">
                    {['Operación', 'PYME', 'Estado', 'Monto fondeado', 'Fecha'].map((h, i) => (
                      <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3 ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cartera.slice(0, 5).map(f => (
                    <tr key={f.id} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-[12px] font-bold text-text-1">{f.id}</div>
                        <div className="text-[10px] font-mono text-text-4">{f.ipi?.numero ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-text-1 whitespace-nowrap">{f.pyme}</td>
                      <td className="px-4 py-3"><InvoiceStatusBadge estado={f.estado} /></td>
                      <td className="px-4 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmt(netoFactura(f))} XAF</td>
                      <td className="px-4 py-3 text-[11px] text-text-5 whitespace-nowrap">{f.fecha ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
