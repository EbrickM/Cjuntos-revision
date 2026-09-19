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

const FatCard = ({ inv, onDetalle }) => (
  <div className="bg-white rounded-[16px] p-4 flex items-start gap-4 shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
        <span className="text-[13px] font-bold text-text-1">{inv.id}</span>
        <Badge variant={estadoVariant(inv.estado)}>{inv.estado}</Badge>
      </div>
      <div className="text-[12px] text-text-3 truncate mb-1">{inv.concepto}</div>
      <div className="text-[11px] text-text-5 mb-1.5">
        {inv.tipo === 'proveedor' && inv.proveedor
          ? <span>Proveedor: <span className="font-medium text-text-4">{inv.proveedor}</span> · </span>
          : null
        }
        PYME: <span className="font-medium text-text-4">{inv.pyme}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-orange-dark bg-orange-tint px-2 py-0.5 rounded-full">{inv.contrato}</span>
        <span className="text-[11px] text-text-5 truncate">· {contratos[inv.contrato]}</span>
      </div>
    </div>
    <div className="shrink-0 text-right">
      <button onClick={() => onDetalle(inv)} title="Ver detalle"
        className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer ml-auto">
        <Eye className="w-3.5 h-3.5" />
      </button>
      <div className="text-[15px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
      <div className="text-[11px] text-text-5 mt-0.5">{inv.fecha}</div>
    </div>
  </div>
);

export default function AdminRisk() {
  const [detalle, setDetalle]       = useState(null);
  const [busquedaCt, setBusquedaCt] = useState('');
  const [filtroCt, setFiltroCt]     = useState('Todos');
  const [busquedaProv, setBusquedaProv] = useState('');
  const [filtroProv, setFiltroProv] = useState('Todos');

  const ctFacturas   = allInvoices.filter(inv => inv.tipo === 'contratante');
  const provFacturas = allInvoices.filter(inv => inv.tipo === 'proveedor');
  const totalPagadoCt  = ctFacturas.filter(inv => inv.estado === 'Pagada').reduce((s, inv) => s + inv.monto, 0);
  const totalLiberado  = provFacturas.filter(inv => inv.estado === 'Pagada').reduce((s, inv) => s + inv.monto, 0);

  const ctFiltradas   = pesquisa(ctFacturas, busquedaCt, filtroCt);
  const provFiltradas = pesquisa(provFacturas, busquedaProv, filtroProv);

  return (
    <AppShell active="adminRisk" role="admin" title="Facturas" sub="Todas las facturas de la plataforma">
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

        {/* Pagadas por el contratante */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          {header(
            'Pagadas por el contratante',
            'Ingresos cobrados por la plataforma — dinero que entra al banco.',
            <span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{ctFacturas.length} facturas</span>
          )}
          <SearchBar
            value={busquedaCt}
            onChange={setBusquedaCt}
            placeholder="Buscar por Nº, contratante, PYME o concepto…"
            compact
            withEstado
            estado={filtroCt}
            onEstado={setFiltroCt}
            estados={FILTROS_ESTADO}
          />
          <div className="space-y-3">
            {ctFiltradas.map(inv => <FatCard key={inv.id} inv={inv} onDetalle={setDetalle} />)}
            {ctFiltradas.length === 0 && (
              <div className="text-[12px] text-text-4 text-center py-8">No hay facturas al contratante que coincidan.</div>
            )}
          </div>
        </div>

        {/* Fondos liberados a proveedores */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          {header(
            'Fondos liberados a proveedores',
            'Pagos realizados a proveedores desde el crédito de cada PYME.',
            <span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{provFacturas.length} facturas</span>
          )}
          <SearchBar
            value={busquedaProv}
            onChange={setBusquedaProv}
            placeholder="Buscar por Nº, proveedor, PYME o concepto…"
            compact
            withEstado
            estado={filtroProv}
            onEstado={setFiltroProv}
            estados={FILTROS_ESTADO}
          />
          <div className="space-y-3">
            {provFiltradas.map(inv => <FatCard key={inv.id} inv={inv} onDetalle={setDetalle} />)}
            {provFiltradas.length === 0 && (
              <div className="text-[12px] text-text-4 text-center py-8">No hay facturas de proveedores que coincidan.</div>
            )}
          </div>
        </div>

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