import { useState } from 'react';
import { Receipt, Eye, Search, ListFilter } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InfoRow from '../../components/ui/InfoRow';

const formatXaf = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;

const FILTROS_ESTADO = ['Todos', 'Pagada', 'Enviada', 'Pendiente'];

/* ─── Admin Facturas ─── */
const contratos = {
  'CTR-2026-002': 'Evans Construction & Engineering S.A.',
  'CTR-2026-005': 'Autoridad Portuaria de Bata S.A.',
  'CTR-2026-009': 'TotalEnerGE SA',
  'CTR-2026-011': 'MinGE Sociedad Est.',
};

const allInvoices = [
  { id:'FAC-2026-1031', tipo:'contratante', contrato:'CTR-2026-002', pyme:'Const. Silva Ltd.',  monto:18000000, estado:'Pagada',   concepto:'Avance de obra fase 1 – Cimentación y estructura',           fecha:'10/05/2026' },
  { id:'FAC-2026-1044', tipo:'contratante', contrato:'CTR-2026-009', pyme:'TechBata PYME S.L.', monto:9500000,  estado:'Pagada',   concepto:'Suministro e instalación de equipos eléctricos – Fase 2',   fecha:'14/05/2026' },
  { id:'FAC-2026-1036', tipo:'contratante', contrato:'CTR-2026-005', pyme:'LogiGE S.A.',         monto:6500000,  estado:'Enviada',  concepto:'Mantenimiento preventivo instalaciones portuarias – Abr 2026', fecha:'02/05/2026' },
  { id:'FAC-2026-1048', tipo:'contratante', contrato:'CTR-2026-011', pyme:'AgriEco PYME',         monto:4200000,  estado:'Pendiente',concepto:'Consultoría técnica explotación minera – Q2 2026',            fecha:'20/05/2026' },
  { id:'FAC-2026-1025', tipo:'proveedor',   contrato:'CTR-2026-002', pyme:'Const. Silva Ltd.',  monto:4500000,  estado:'Pagada',   concepto:'Transporte de materiales al sitio de obra',                  fecha:'01/05/2026', proveedor:'TransGE S.L.' },
  { id:'FAC-2026-1039', tipo:'proveedor',   contrato:'CTR-2026-009', pyme:'TechBata PYME S.L.', monto:3100000,  estado:'Pagada',   concepto:'Suministro de componentes electrónicos – Lote 3',            fecha:'13/05/2026', proveedor:'ServTec GE' },
  { id:'FAC-2026-1052', tipo:'proveedor',   contrato:'CTR-2026-005', pyme:'LogiGE S.A.',         monto:1800000,  estado:'Enviada',  concepto:'Alquiler de maquinaria portuaria – Mayo 2026',               fecha:'21/05/2026', proveedor:'Cemex GE' },
];

const header = (title, sub, right) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
    <div className="flex items-center gap-3">
      <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
        <Receipt className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-[14px] font-bold text-text-1">{title}</div>
        <div className="text-[11px] text-text-4">{sub}</div>
      </div>
    </div>
    {right}
  </div>
);

const estadoVariant = (estado) => (
  estado === 'Pagada' ? 'green' : estado === 'Enviada' ? 'blue' : 'yellow'
);

const pesquisa = (rows, q, filtro) => {
  const kw = q.trim().toLowerCase();
  return rows.filter(inv =>
    (filtro === 'Todos' || inv.estado === filtro) &&
    (!kw || [inv.id, contratos[inv.contrato], inv.pyme, inv.proveedor].some(v => (v ?? '').toLowerCase().includes(kw)))
  );
};

const SearchBar = ({ value, onChange, placeholder = 'Buscar…', withEstado = false, estado, onEstado, estados, compact = false }) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
    <div className={`relative ${compact ? 'w-full max-w-[300px]' : 'flex-1'}`}>
      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-8 pr-3 rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange ${compact ? 'py-1.5 text-[12px]' : 'py-2 text-[12px]'}`}
      />
    </div>
    {withEstado && (
      <div className="relative flex items-center shrink-0">
        <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
        <select
          value={estado}
          onChange={e => onEstado(e.target.value)}
          className="h-9 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          {estados.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>
    )}
  </div>
);

// ── Tabla estilo Admin (igual que Contratos/FacturasAdmin) ────────────────────
const TablaFacturas = ({ invs, busqueda, setBusqueda, filtro, setFiltro, onDetalle, proveedor }) => (
  <>
    <SearchBar
      value={busqueda}
      onChange={setBusqueda}
      placeholder={proveedor ? 'Buscar por Nº, proveedor, PYME o concepto…' : 'Buscar por Nº, contratante, PYME o concepto…'}
      compact
      withEstado
      estado={filtro}
      onEstado={setFiltro}
      estados={FILTROS_ESTADO}
    />
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px]">
        <thead className="bg-page-bg">
          <tr className="border-b border-border">
            {[
              'Nº Factura',
              proveedor ? 'Proveedor' : 'Contratante',
              'PYME', 'Estado', 'Monto', 'Fecha', 'Detalle',
            ].map((h, i) => (
              <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                ${i === 0 ? 'text-left' : i === 4 ? 'text-right' : 'text-center'}
              `}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invs.map(inv => (
            <tr key={inv.id} onClick={() => onDetalle(inv)}
              className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-orange-tint/40">
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] font-bold text-text-1">{inv.id}</span>
                <div className="text-[10px] text-text-5 max-w-[220px] truncate">{inv.concepto}</div>
              </td>
              <td className="px-4 py-3 text-[12px] font-semibold text-text-1 whitespace-nowrap">
                {proveedor ? inv.proveedor : contratos[inv.contrato]}
              </td>
              <td className="px-4 py-3 text-[12px] text-text-4 whitespace-nowrap">{inv.pyme}</td>
              <td className="px-4 py-3 text-center"><Badge variant={estadoVariant(inv.estado)}>{inv.estado}</Badge></td>
              <td className="px-4 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{formatXaf(inv.monto)}</td>
              <td className="px-4 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{inv.fecha}</td>
              <td className="px-4 py-3 text-center">
                <div onClick={e => e.stopPropagation()}>
                  <button onClick={() => onDetalle(inv)} title="Ver detalle"
                    className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {invs.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-[12px] text-text-4">
                No hay {proveedor ? 'facturas de proveedores' : 'facturas al contratante'} que coincidan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
);

export default function AdminRisk() {
  const [tab, setTab]                 = useState('ct');
  const [detalle, setDetalle]         = useState(null);
  const [busquedaCt, setBusquedaCt]   = useState('');
  const [filtroCt, setFiltroCt]       = useState('Todos');
  const [busquedaProv, setBusquedaProv] = useState('');
  const [filtroProv, setFiltroProv]   = useState('Todos');

  const TABS = [
    { id: 'ct',   lbl: 'Pagadas por el contratante' },
    { id: 'prov', lbl: 'Fondos liberados a proveedores' },
  ];

  const ctFacturas   = allInvoices.filter(inv => inv.tipo === 'contratante');
  const provFacturas = allInvoices.filter(inv => inv.tipo === 'proveedor');
  const totalPagadoCt  = ctFacturas.filter(inv => inv.estado === 'Pagada').reduce((s, inv) => s + inv.monto, 0);
  const totalLiberado  = provFacturas.filter(inv => inv.estado === 'Pagada').reduce((s, inv) => s + inv.monto, 0);

  const ctFiltradas   = pesquisa(ctFacturas, busquedaCt, filtroCt);
  const provFiltradas = pesquisa(provFacturas, busquedaProv, filtroProv);

  return (
    <AppShell active="adminRisk" role="admin" title="Riesgo" sub="Seguimiento de pagos de la contratante y liberación de fondos a proveedores">
      <div className="fade-in space-y-5">

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: ctFacturas.length,       label: 'Facturas al contratante',          cls: 'text-blue-text' },
            { value: formatXaf(totalPagadoCt), label: 'Pagado por contratantes (cobrado)',cls: 'text-green-text', small: true },
            { value: formatXaf(totalLiberado), label: 'Fondos liberados a proveedores',  cls: 'text-orange',     small: true },
          ].map(({ value, label, cls, small }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4">
              <div className={`font-extrabold leading-none mb-1 ${cls} ${small ? 'text-[18px] mt-1' : 'text-[32px]'}`}>{value}</div>
              <div className="text-[12px] text-text-4">{label}</div>
            </div>
          ))}
        </div>

        {/* Selector superior entre las dos tablas */}
        <div className="flex gap-1 bg-page-bg p-1 rounded-xl w-full sm:w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-4 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap text-center ${
                tab === t.id ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
              }`}>
              {t.lbl}
            </button>
          ))}
        </div>

        {/* ── Tab: Pagadas por el contratante ── */}
        {tab === 'ct' && (
          <div className="bg-white rounded-[14px] border border-border p-5">
            {header(
              'Pagadas por el contratante',
              'Ingresos cobrados por la plataforma — dinero que entra al banco.',
              <span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{ctFacturas.length} facturas</span>
            )}
            <TablaFacturas
              invs={ctFiltradas}
              busqueda={busquedaCt}
              setBusqueda={setBusquedaCt}
              filtro={filtroCt}
              setFiltro={setFiltroCt}
              onDetalle={setDetalle}
              proveedor={false}
            />
          </div>
        )}

        {/* ── Tab: Fondos liberados a proveedores ── */}
        {tab === 'prov' && (
          <div className="bg-white rounded-[14px] border border-border p-5">
            {header(
              'Fondos liberados a proveedores',
              'Pagos realizados a proveedores desde el crédito de cada PYME.',
              <span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{provFacturas.length} facturas</span>
            )}
            <TablaFacturas
              invs={provFiltradas}
              busqueda={busquedaProv}
              setBusqueda={setBusquedaProv}
              filtro={filtroProv}
              setFiltro={setFiltroProv}
              onDetalle={setDetalle}
              proveedor
            />
          </div>
        )}

      </div>

      {/* ── Modal: Detalle de factura ── */}
      {detalle && (
        <Modal
          title={`Detalle de Factura · ${detalle.id}`}
          onClose={() => setDetalle(null)}
          footer={<Button variant="ghost" onClick={() => setDetalle(null)}>Cerrar</Button>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Nº Factura" value={detalle.id} />
            <InfoRow label="Tipo" value={detalle.tipo === 'proveedor' ? 'Proveedor' : 'Contratante'} />
            <InfoRow label="Contrato" value={detalle.contrato} />
            <InfoRow label="Contratante" value={contratos[detalle.contrato]} />
            <InfoRow label="PYME" value={detalle.pyme} />
            {detalle.proveedor && <InfoRow label="Proveedor" value={detalle.proveedor} />}
            <InfoRow label="Estado" value={detalle.estado} />
            <InfoRow label="Monto" value={`${formatXaf(detalle.monto)}`} />
            <InfoRow label="Fecha" value={detalle.fecha} />
          </div>
          <div className="mt-4">
            <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">Concepto</div>
            <div className="text-[13px] text-text-1 bg-page-bg rounded-[8px] px-3 py-2">{detalle.concepto}</div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}