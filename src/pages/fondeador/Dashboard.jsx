import { useState, useEffect } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import AppShell from '../../components/layout/AppShell';
import { MultiLineChart, HBarChart, VBarChart, DonutChart } from '../../components/charts/Charts';
import { facturaService } from '../../services/factura.service';
import { INV, MODALIDAD } from '../../lib/invoiceStates';
import { fmt } from '../empresa-pequena/epData';
import { BANCO, netoFactura, porFechaDesc } from './fondeadorShared';

// ── INICIO (portal Banco Fondeador) ───────────────────────────────────────────
// Vista general de la cartera del banco: KPIs, fondeado vs. pendiente por mes,
// exposición por contratante y por Empresa Contratada, embudo del pipeline y
// composición de cartera.
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const SERIE_DEMO = MESES.slice(3, 9).map((mes, i) => ({ mes, monto: [0, 0, 18, 24, 9, 32][i] }));

const PALETA = ['#ef7a2c', '#3B82F6', '#059669', '#C68A1D', '#B8352A', '#8A4A1F'];
// Formato compacto (millones) para los HBarChart — el monto completo con
// separadores de miles no cabe en tarjetas angostas.
const fmtM = v => `${fmt(Math.round(v / 1_000_000))}M XAF`;

export default function FondDash() {
  const ordenes = facturaService.bandejaOrdenes(BANCO);
  const cartera = [...facturaService.carteraFondeador(BANCO)].sort(porFechaDesc);

  const porLiquidar = ordenes.reduce((a, f) => a + netoFactura(f), 0);
  const fondeado    = cartera.reduce((a, f) => a + netoFactura(f), 0);

  // ── Contadores animados ───────────────────────────────────────────────────
  const animOrdenes     = useCountUp(ordenes.length, 800,  150);
  const animPorLiquidar = useCountUp(porLiquidar,    1400, 200);
  const animCartera     = useCountUp(cartera.length, 800,  300);
  const animFondeado    = useCountUp(fondeado,       1400, 350);

  // Animación de relleno al cargar (mismo patrón que Contratante/Proveedor):
  // las barras horizontales arrancan en 0 y crecen a su ancho final una vez
  // montado el componente.
  const [barsVisible, setBarsVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setBarsVisible(true), 450);
    return () => clearTimeout(id);
  }, []);

  const serie = MESES.map((mes, i) => {
    const mm = String(i + 1).padStart(2, '0');
    const total = cartera
      .filter(f => (f.fecha ?? '').split('/')[1] === mm)
      .reduce((a, f) => a + netoFactura(f), 0);
    return { mes, monto: Math.round(total / 1_000_000) };
  }).filter(d => d.monto > 0);
  const lineData = serie.length >= 2 ? serie : SERIE_DEMO;

  // ── Fondeado vs. Pendiente por mes: compara el monto ya liquidado contra el
  // que sigue en cola de órdenes, mes a mes — salud del flujo de fondeo.
  const pendientePorMes = MESES.map((mes, i) => {
    const mm = String(i + 1).padStart(2, '0');
    const total = ordenes
      .filter(f => (f.fecha ?? '').split('/')[1] === mm)
      .reduce((a, f) => a + netoFactura(f), 0);
    return Math.round(total / 1_000_000);
  });
  const multiLineData = MESES.map((mes, i) => ({
    label: mes,
    fondeado: lineData.find(d => d.mes === mes)?.monto ?? 0,
    pendiente: pendientePorMes[i],
  }));
  const multiLineSeries = [
    { key: 'fondeado',  label: 'Fondeado',  color: '#ef7a2c' },
    { key: 'pendiente', label: 'Pendiente', color: '#3B82F6' },
  ];
  const multiLineHasData = multiLineData.some(d => d.fondeado > 0 || d.pendiente > 0);

  // ── Exposición por Empresa Contratante: top contratantes por monto neto ya
  // fondeado, para ver de un vistazo dónde se concentra el riesgo de cartera.
  const exposicionMap = new Map();
  cartera.forEach(f => {
    const key = f.contratante || 'Sin dato';
    exposicionMap.set(key, (exposicionMap.get(key) || 0) + netoFactura(f));
  });
  const exposicionData = [...exposicionMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, value], i) => ({ label, value, color: PALETA[i % PALETA.length] }));

  // ── Top Empresas Contratadas por monto fondeado: la misma lectura de
  // concentración que la exposición por contratante, pero del lado de la
  // Empresa Contratada — quién recibe más liquidez de este banco.
  const pymeMap = new Map();
  cartera.forEach(f => {
    const key = f.pyme || 'Sin dato';
    pymeMap.set(key, (pymeMap.get(key) || 0) + netoFactura(f));
  });
  const pymeData = [...pymeMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, value], i) => ({ label, value, color: PALETA[(i + 2) % PALETA.length] }));

  // ── Embudo del pipeline de fondeo: cuántas operaciones de este banco hay en
  // cada etapa, para detectar dónde se atasca el flujo.
  const operacionesBanco = facturaService.listarPorBanco(BANCO).filter(f => facturaService.esOperacionDeFondeo(f));
  const embudoData = [
    { label: 'Orden',       value: operacionesBanco.filter(f => f.estado === INV.ordenFondeador).length, color: '#9CA3AF' },
    { label: 'Fondeado',    value: operacionesBanco.filter(f => f.estado === INV.fondeado).length,       color: '#3B82F6' },
    { label: 'OTP env.',    value: operacionesBanco.filter(f => f.estado === INV.otpEnviada).length,     color: '#ef7a2c' },
    { label: 'OTP verif.',  value: operacionesBanco.filter(f => f.estado === INV.otpVerificada).length,  color: '#C68A1D' },
    { label: 'Pagada',      value: operacionesBanco.filter(f => f.estado === INV.pagada || f.estado === INV.billetera).length, color: '#059669' },
  ];

  // ── Cartera por modalidad de pago: qué tan expuesto está el banco a cada
  // modalidad de desembolso (retiro total vs. billetera virtual).
  const retiroCount    = cartera.filter(f => (f.modalidadPago || MODALIDAD.retiroTotal) === MODALIDAD.retiroTotal).length;
  const billeteraCount = cartera.length - retiroCount;
  const modalidadData = cartera.length > 0
    ? [
        { tipo: 'Retiro Total',     pct: Math.round((retiroCount / cartera.length) * 100),    color: '#ef7a2c' },
        { tipo: 'Billetera Virtual', pct: Math.round((billeteraCount / cartera.length) * 100), color: '#3B82F6' },
      ]
    : [{ tipo: 'Sin datos', pct: 100, color: '#D8D5D0' }];

  // ── Estructura de referencia (Junior/Mezzanine/Senior): pila de absorción de
  // pérdidas de referencia del programa — dato fijo, no un cálculo sobre la
  // cartera (la app todavía no modela tranches por operación).
  const capitalStackData = [
    { tipo: 'Senior',     pct: 70, color: '#059669' },
    { tipo: 'Mezzanine',  pct: 20, color: '#8A4A1F' },
    { tipo: 'Junior',     pct: 10, color: '#C68A1D' },
  ];

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
            <div className="text-[22px] font-extrabold leading-none mb-2 truncate text-orange tabular-nums">{animCartera}</div>
            <div className="text-[12px] text-text-4 leading-snug">Operaciones fondeadas</div>
          </div>
          <div className="card-enter bg-white rounded-[14px] border border-border p-4">
            <div className="text-[22px] font-extrabold leading-none mb-2 truncate text-yellow-text tabular-nums">{fmt(animFondeado)} XAF</div>
            <div className="text-[12px] text-text-4 leading-snug">Capital fondeado</div>
          </div>
        </div>

        {/* Evolución (fondeado vs. pendiente) + exposición por contratante */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          <div className="lg:col-span-3 bg-white rounded-[14px] border border-border p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-[14px] font-bold text-text-1">Fondeado vs. Pendiente por mes</div>
                <div className="text-[11px] text-text-4">Monto neto · millones XAF</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {multiLineSeries.map(s => (
                  <span key={s.key} className="flex items-center gap-1.5 text-[11px] font-semibold text-text-3">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-[200px]">
              {multiLineHasData ? (
                <MultiLineChart data={multiLineData} series={multiLineSeries} h={200} vbW={620} tipFmt={v => `${v}M`} />
              ) : (
                <div className="h-full flex items-center justify-center text-[13px] text-text-4">Aún no hay suficientes datos mensuales.</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[14px] border border-border p-4 flex flex-col min-w-0">
            <div className="mb-3">
              <div className="text-[13px] font-bold text-text-1">Exposición por Empresa Contratante</div>
              <div className="text-[10px] text-text-4">Monto neto fondeado, top contratantes</div>
            </div>
            {exposicionData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[13px] text-text-4 py-6 text-center">Aún no hay operaciones fondeadas.</div>
            ) : (
              <div className="flex-1 flex items-center min-w-0 w-full">
                <HBarChart data={exposicionData} fmtVal={fmtM} visible={barsVisible} />
              </div>
            )}
          </div>
        </div>

        {/* Embudo del pipeline + top empresas contratadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col">
            <div className="mb-4">
              <div className="text-[14px] font-bold text-text-1">Embudo del pipeline de fondeo</div>
              <div className="text-[11px] text-text-4">Operaciones de {BANCO} por etapa</div>
            </div>
            <div className="flex-1 min-h-[180px]">
              <VBarChart id="fond-embudo" data={embudoData} h={180} vbW={520} />
            </div>
          </div>

          <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col min-w-0">
            <div className="mb-4">
              <div className="text-[14px] font-bold text-text-1">Top Empresas Contratadas</div>
              <div className="text-[11px] text-text-4">Monto neto fondeado, top receptoras</div>
            </div>
            {pymeData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[13px] text-text-4 py-6 text-center">Aún no hay operaciones fondeadas.</div>
            ) : (
              <div className="flex-1 flex items-center min-w-0 w-full">
                <HBarChart data={pymeData} fmtVal={fmtM} visible={barsVisible} />
              </div>
            )}
          </div>

        </div>

        {/* Cartera por modalidad de pago + estructura de referencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col items-center">
            <div className="w-full mb-4">
              <div className="text-[14px] font-bold text-text-1">Cartera por modalidad de pago</div>
              <div className="text-[11px] text-text-4">Retiro Total vs. Billetera Virtual</div>
            </div>
            <div className="flex-1 flex items-center">
              <DonutChart data={modalidadData} centerLabel={`${cartera.length}`} centerSub="operaciones" size={170} />
            </div>
            <div className="w-full flex flex-col gap-1.5 mt-4">
              {modalidadData.map(d => (
                <div key={d.tipo} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-text-4">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    {d.tipo}
                  </span>
                  <span className="font-semibold text-text-1">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[14px] border border-border p-5 flex flex-col items-center">
            <div className="w-full mb-4">
              <div className="text-[14px] font-bold text-text-1">Estructura de referencia</div>
              <div className="text-[11px] text-text-4">Pila Junior / Mezzanine / Senior del programa</div>
            </div>
            <div className="flex-1 flex items-center">
              <DonutChart data={capitalStackData} centerLabel="10·20·70" centerSub="J / M / S" size={170} />
            </div>
            <div className="w-full flex flex-col gap-1.5 mt-4">
              {capitalStackData.map(d => (
                <div key={d.tipo} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-text-4">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    {d.tipo}
                  </span>
                  <span className="font-semibold text-text-1">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
