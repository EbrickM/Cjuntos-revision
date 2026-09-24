import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Eye, Building2, ScrollText, Receipt, History, ListFilter, Mail, Phone, ChevronDown, Zap,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import InfoRow from '../../components/ui/InfoRow';
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import RegistrosTabla from '../../components/contratos/RegistrosTabla';
import { facturaService } from '../../services/factura.service';
import { contratoService } from '../../services/contrato.service';
import { INV } from '../../lib/invoiceStates';
import { CST } from '../../lib/contractStates';
import { nombrePymeContrato } from '../../components/contratos/contratoUtils';
import { fmt } from '../empresa-pequena/epData';
import { BANCO, porFechaDesc } from './fondeadorShared';

// ── CONSULTAS DEL BANCO FONDEADOR (rol `fondeador`) ────────────────────────────
// El Banco Fondeador es un rol SOLO DE LECTURA: ya no valida IPIs ni pone
// requerimientos. Esta sección centraliza sus consultas en pestañas (misma
// estructura de tabs que el panel admin), tomando únicamente las tablas:
//   · Clientes   → directorio de Empresas Contratantes (como in admin/empresas)
//   · Contratos  → listado de contratos (como in admin/contratos, sin borrar)
//   · Facturas   → historial de facturas (como admin/facturas) + % de pago
//                  completado de las facturas Aprobadas
//   · IPIs       → IPIs por contrato de las Empresas Contratantes; el ojo abre
//                  el mismo modal de resumen de operaciones del portal Contratante
//   · Registros  → tabla de registros referidos a las Empresas Contratantes
//                  (asuntos: contrato · facturas · administración · cliente)

const TABS = [
  { id: 'clientes',   lbl: 'Clientes',   Icon: Building2 },
  { id: 'contratos',  lbl: 'Contratos',  Icon: ScrollText },
  { id: 'facturas',   lbl: 'Facturas',   Icon: Receipt },
  { id: 'ipis',       lbl: 'IPIs',       Icon: Zap },
  { id: 'registros',  lbl: 'Registros',  Icon: History },
];

const FILTROS_ESTADO = ['Todos', 'Enviada', 'En Evaluación', 'Emitida', 'Con Requerimientos', 'OTP Enviada', 'Pagada', 'Saldo en Billetera'];
const FILTROS_ESTADO_KEY = { 'Enviada': INV.enviada, 'En Evaluación': INV.enEvaluacion, 'Emitida': INV.emitida, 'Con Requerimientos': INV.conRequerimientos, 'OTP Enviada': INV.otpEnviada, 'Pagada': INV.pagada, 'Saldo en Billetera': INV.billetera };

const ESTADOS_FILTRO_CT = ['Todos', 'Pendiente de Configuración', 'Pendiente de Revisión', 'Con Requerimientos', 'En Discusión de Términos', 'Activo'];

const ESTADOS_FILTRO_IPI = ['Todos', 'Recibida', 'Ejecutada'];
const ipiEstadoBadge = (estado) => (estado === 'Ejecutada' ? 'green' : 'blue');

const formatXaf = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;
const fmtRegistro = (n) => `${new Intl.NumberFormat('de-DE').format(Number(n) || 0)} XAF`;

// Base de fecha canónica de un contrato (mismas resoluciones que `registrosContrato`).
const fechaContrato = (c) =>
  c.fechaCreacion ?? c.fechaAsignacion ?? c.fechaInicio ?? c.fecha
  ?? c.contratante?.fechaInicio
  ?? c.requerimiento?.fecha
  ?? c.historia?.[0]?.fecha
  ?? '01/07/2026';

const contractBadge = (estado) => ({
  'Pendiente de Configuración': { variant: 'amber', label: 'Pend. Configuración' },
  'Pendiente de Revisión':      { variant: 'orange', label: 'Pend. Revisión' },
  'Con Requerimientos':         { variant: 'red', label: 'Con Requerimientos' },
  'En Discusión de Términos':   { variant: 'brand', label: 'En Discusión' },
  'Activo':                     { variant: 'green', label: 'Activo' },
}[estado] ?? { variant: 'amber', label: estado || 'Pendiente' });

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

// ── Directorio de Empresas Contratantes (como el de /admin/empresas, solo tabla) ──
const EMPRESAS_CONTRATANTES = [
  {
    id: 'EMP-001', nombre: 'Chevron', nombreComercial: 'Chevron', sector: 'Energía',
    ruc: 'GE-2010-00011', email: 'contacto@totalenerge.gq', telefono: '+240 222 100 200',
    contratos: ['CONT-001', 'CONT-002', 'CONT-003'],
  },
  {
    id: 'EMP-002', nombre: 'Chevron Sur', nombreComercial: 'Chevron Sur', sector: 'Construcción',
    ruc: 'GE-2015-00234', email: 'info@infraconst.gq', telefono: '+240 222 300 400',
    contratos: ['CONT-004', 'CONT-005'],
  },
  {
    id: 'EMP-003', nombre: 'SEGESA', nombreComercial: 'SEGESA', sector: 'Minería',
    ruc: 'GE-2008-00056', email: 'operaciones@minge.gq', telefono: '+240 222 500 600',
    contratos: ['CONT-006'],
  },
  {
    id: 'EMP-004', nombre: 'GEOMS', nombreComercial: 'GEOMS', sector: 'Agricultura',
    ruc: 'GE-2019-00678', email: 'admin@agroge.gq', telefono: '+240 222 700 800',
    contratos: [],
  },
];

function TabClientes() {
  const [search, setSearch] = useState('');
  const [openContratos, setOpenContratos] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const contratosRef = useRef(null);

  useEffect(() => {
    if (!openContratos) return;
    const onDocClick = (e) => {
      if (contratosRef.current && !contratosRef.current.contains(e.target)) setOpenContratos(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openContratos]);

  const filtered = EMPRESAS_CONTRATANTES.filter(e => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      e.nombre.toLowerCase().includes(q) ||
      (e.nombreComercial || '').toLowerCase().includes(q) ||
      (e.ruc || '').toLowerCase().includes(q) ||
      (e.sector || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.telefono || '').toLowerCase().includes(q) ||
      e.contratos.some(c => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-[14px] border border-border p-5">
      <Header
        title="Directorio de Empresas Contratantes"
        sub="Todas las empresas contratantes registradas en la plataforma."
        Icon={Building2}
        right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{EMPRESAS_CONTRATANTES.length} registrados</span>}
      />

      <div className="relative w-full max-w-[380px] mb-4">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por empresa, RUC, sector o contrato…"
          className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
        />
      </div>

      {/* Móvil: cards */}
      <div className="sm:hidden space-y-2">
        {filtered.map(emp => (
          <div key={emp.id} className="rounded-[12px] border border-border px-3 py-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-bold text-text-1">{emp.nombre}</span>
                {emp.nombreComercial && emp.nombreComercial !== emp.nombre && (
                  <span className="text-[11px] text-text-5">· {emp.nombreComercial}</span>
                )}
              </div>
              <button onClick={() => setDetalle(emp)} title="Ver detalle"
                className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer shrink-0">
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[12px] text-text-3 mt-0.5">
              <span className="font-mono font-semibold text-text-2">{emp.ruc}</span>
              <span className="mx-1.5 text-text-4">·</span>
              <span className="font-medium">{emp.sector}</span>
            </div>
            <div className="mt-1.5 space-y-0.5 text-[12px] text-text-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <Mail className="w-3 h-3 shrink-0 text-text-4" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <Phone className="w-3 h-3 shrink-0 text-text-4" />
                <span className="truncate">{emp.telefono}</span>
              </div>
            </div>
            {emp.contratos.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {emp.contratos.slice(0, 3).map(c => (
                  <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-orange-tint text-[11px] font-semibold text-orange-dark">
                    {c}
                  </span>
                ))}
                {emp.contratos.length > 3 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-white border border-orange/30 text-[11px] font-semibold text-orange-dark">
                    +{emp.contratos.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span className="mt-2 block text-[11px] text-text-5 italic">Sin contratos activos</span>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-[12px] text-text-4 text-center py-8">No se encontraron empresas con los filtros aplicados.</div>
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead className="bg-page-bg">
            <tr className="border-b border-border">
              {['Empresa', 'RUC', 'Sector', 'Contacto', 'Contratos', 'Detalle'].map((h, i) => (
                <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3 ${i === 0 ? 'text-left' : 'text-center'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp.id} className="border-b border-border last:border-0 transition-colors hover:bg-orange-tint/40">
                <td className="px-4 py-3">
                  <div className="text-[12px] font-bold text-text-1 whitespace-nowrap">{emp.nombre}</div>
                  {emp.nombreComercial && emp.nombreComercial !== emp.nombre && (
                    <div className="text-[11px] text-text-5 whitespace-nowrap">{emp.nombreComercial}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-mono text-[12px] font-semibold text-text-2 whitespace-nowrap">{emp.ruc}</td>
                <td className="px-4 py-3 text-center text-[12px] font-medium text-text-3 whitespace-nowrap">{emp.sector}</td>
                <td className="px-4 py-3 text-[12px] text-text-3 max-w-[260px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3 h-3 shrink-0 text-text-4" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    <Phone className="w-3 h-3 shrink-0 text-text-4" />
                    <span className="truncate">{emp.telefono}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {emp.contratos.length > 0 ? (
                    <div className="relative inline-block" ref={contratosRef}>
                      <button
                        onClick={() => setOpenContratos(openContratos === emp.id ? null : emp.id)}
                        title="Ver todos los contratos"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-orange-tint text-[11px] font-semibold text-orange-dark hover:bg-orange/20 transition cursor-pointer whitespace-nowrap"
                      >
                        {emp.contratos.length} {emp.contratos.length === 1 ? 'contrato' : 'contratos'}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openContratos === emp.id ? 'rotate-180' : ''}`} />
                      </button>
                      {openContratos === emp.id && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 min-w-[170px] bg-white border border-border rounded-[10px] shadow-lg p-2 flex flex-col items-center gap-1">
                          {emp.contratos.map(c => (
                            <span key={c} className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-orange-tint text-[11px] font-semibold text-orange-dark whitespace-nowrap">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-text-5 italic">Sin contratos activos</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => setDetalle(emp)} title="Ver detalle"
                    className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-text-4">No se encontraron empresas con los filtros aplicados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detalle && (
        <Modal
          title={`${detalle.nombre} · ${detalle.id}`}
          onClose={() => setDetalle(null)}
          footer={
            <Button variant="ghost" onClick={() => setDetalle(null)}>Cerrar</Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="ID" value={detalle.id} />
            <InfoRow label="Nombre comercial" value={detalle.nombreComercial} />
            <InfoRow label="RUC / NIF" value={detalle.ruc} />
            <InfoRow label="Sector" value={detalle.sector} />
            <InfoRow label="Razón social" value={detalle.nombre} />
            <InfoRow label="Email" value={detalle.email} />
            <InfoRow label="Teléfono" value={detalle.telefono} />
          </div>
          <div className="mt-4">
            <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1.5">Contratos</div>
            {detalle.contratos.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {detalle.contratos.map(c => (
                  <span key={c} className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-orange-tint text-[11px] font-semibold text-orange-dark">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[12px] text-text-5 italic">Sin contratos activos</span>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tab: Contratos (listado consulta, sin borrar) ─────────────────────────────
function TabContratos({ filtroCliente }) {
  const [contracts] = useState(() => contratoService.listar());
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [detalleModal, setDetalleModal] = useState(null);

  const contratosCliente = filtroCliente ? contracts.filter(c => c.contratante?.razonSocial === filtroCliente) : contracts;

  const filteredContracts = contratosCliente.filter(c => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      c.id.toLowerCase().includes(q) ||
      (c.pymeNombre || '').toLowerCase().includes(q) ||
      (c.contratante?.razonSocial || '').toLowerCase().includes(q);
    const matchesEstado = filtroEstado === 'Todos' || c.estado === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => (b.estado === 'Pendiente de Revisión') - (a.estado === 'Pendiente de Revisión'));

  return (
    <div className="bg-white rounded-[14px] border border-border p-5">
      <Header
        title="Contratos"
        sub={filtroCliente ? `Contratos de ${filtroCliente} (consulta).` : 'Todos los contratos de crédito de la plataforma (consulta).'}
        Icon={ScrollText}
        right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{contratosCliente.length} registrados</span>}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
        <div className="relative w-full max-w-[300px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar contrato…"
            className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
          />
        </div>
        <div className="relative flex items-center shrink-0">
          <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="h-9 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            {ESTADOS_FILTRO_CT.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Móvil: cards */}
      <div className="sm:hidden space-y-2">
        {sortedContracts.map(c => {
          const badge = contractBadge(c.estado);
          return (
            <div
              key={c.id}
              onClick={() => setDetalleModal(c)}
              className={`rounded-[12px] border px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-orange-tint/40 transition-colors ${c.estado === 'Pendiente de Revisión' ? 'border-orange/40 bg-orange-tint/20' : 'border-border'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-text-1">{c.id}</span>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
                <div className="text-[12px] font-semibold text-text-3 truncate mt-0.5">{nombrePymeContrato(c)}</div>
                {c.contratante?.razonSocial && (
                  <div className="text-[11px] text-text-5 truncate">{c.contratante.razonSocial}</div>
                )}
                <div className="text-[12px] font-bold text-text-1 whitespace-nowrap mt-1">{formatXaf(c.monto)}</div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); setDetalleModal(c); }}
                  title="Ver detalles del contrato"
                  className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {sortedContracts.length === 0 && (
          <div className="text-[12px] text-text-4 text-center py-8">No se encontraron contratos con los filtros aplicados.</div>
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead className="bg-page-bg">
            <tr className="border-b border-border">
              {['Contrato', 'PYME', 'Contratante', 'Estado', 'Monto', 'Acciones'].map((h, i) => (
                <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3
                  ${i === 0 ? 'text-left' : i === 4 ? 'text-right' : 'text-center'}
                `}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedContracts.map(c => {
              const badge = contractBadge(c.estado);
              return (
                <tr
                  key={c.id}
                  onClick={() => setDetalleModal(c)}
                  className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-orange-tint/40 ${c.estado === 'Pendiente de Revisión' ? 'bg-orange-tint/30' : ''}`}
                >
                  <td className="px-4 py-3 text-[12px] font-bold text-text-1 whitespace-nowrap">{c.id}</td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-text-1 whitespace-nowrap">{nombrePymeContrato(c)}</td>
                  <td className="px-4 py-3 text-[12px] text-text-4 max-w-[240px]">
                    {c.contratante?.razonSocial ? (
                      <span className="block truncate">{c.contratante.razonSocial}</span>
                    ) : (
                      <span className="text-text-5 italic">Sin datos</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-[12px] font-bold text-text-1 whitespace-nowrap">{formatXaf(c.monto)}</div>
                    {c.estado === 'Activo' && (
                      <div className="text-[10px] text-text-5 whitespace-nowrap">Disp: {formatXaf(c.disponible)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setDetalleModal(c)}
                        title="Ver detalles del contrato"
                        className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortedContracts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-text-4">No se encontraron contratos con los filtros aplicados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal: Detalles del contrato (lectura) ── */}
      {detalleModal && (
        <Modal
          title={`Detalles del contrato · ${detalleModal.id}`}
          onClose={() => setDetalleModal(null)}
          wide
          footer={<Button variant="ghost" onClick={() => setDetalleModal(null)}>Cerrar</Button>}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoRow label="PYME" value={nombrePymeContrato(detalleModal)} />
              <InfoRow label="Monto" value={formatXaf(detalleModal.monto)} />
              <InfoRow label="Asignado" value={formatXaf(detalleModal.asignado ?? 0)} />
              <InfoRow label="Disponible" value={formatXaf(detalleModal.disponible ?? 0)} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <div className="text-[13px] font-bold text-text-1">Estado</div>
                <Badge variant={contractBadge(detalleModal.estado).variant}>{detalleModal.estado}</Badge>
              </div>
              {detalleModal.nota && (
                <div className="bg-blue-bg border border-blue-text/20 rounded-[12px] px-4 py-3 text-[12px] text-text-4">{detalleModal.nota}</div>
              )}
            </div>

            <div>
              <div className="text-[13px] font-bold text-text-1 mb-3 pb-2 border-b border-border">Contratante</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <InfoRow label="Razón Social" value={detalleModal.contratante?.razonSocial} />
                <InfoRow label="Nombre Comercial" value={detalleModal.contratante?.nombreComercial} />
                <InfoRow label="RUC / NIF" value={detalleModal.contratante?.ruc} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoRow label="Sector Productivo" value={detalleModal.contratante?.sectorProductivo} />
                <InfoRow label="Teléfono" value={detalleModal.contratante?.telefonoCorporativo} />
                <InfoRow label="Correo" value={detalleModal.contratante?.correoCorporativo} />
              </div>
            </div>

            <div>
              <div className="text-[13px] font-bold text-text-1 mb-3 pb-2 border-b border-border">Datos del Contrato</div>
              <InfoRow label="Objeto del Trabajo" value={detalleModal.contratante?.objetoTrabajo} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <InfoRow label="Monto Global" value={detalleModal.contratante?.montoGlobal ? formatXaf(detalleModal.contratante?.montoGlobal) : ''} />
                <InfoRow label="Fecha de Inicio" value={detalleModal.contratante?.fechaInicio} />
                <InfoRow label="Fecha de Fin" value={detalleModal.contratante?.fechaFin} />
                <InfoRow label="Plazo de Ejecución" value={detalleModal.contratante?.plazosEjecucion} />
              </div>
            </div>

            {detalleModal.financiero && (
              <div>
                <div className="text-[13px] font-bold text-text-1 mb-3 pb-2 border-b border-border">Condiciones financieras</div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <InfoRow label="Intereses" value={detalleModal.financiero.intereses != null ? `${detalleModal.financiero.intereses}%` : ''} />
                  <InfoRow label="Plazo de pago" value={detalleModal.financiero.plazoPago ? `${detalleModal.financiero.plazoPago} días` : ''} />
                  <InfoRow label="Banco fondeador" value={detalleModal.financiero.bancoFondeador} />
                  <InfoRow label="Retención" value={detalleModal.financiero.retencion != null ? `${detalleModal.financiero.retencion}%` : ''} />
                  <InfoRow label="Gestión cobranza" value={detalleModal.financiero.gestionCobranza != null ? `${detalleModal.financiero.gestionCobranza}%` : ''} />
                </div>
              </div>
            )}

            {detalleModal.requerimiento && (
              <div>
                <div className="text-[13px] font-bold text-text-1 mb-3 pb-2 border-b border-border">Requerimiento</div>
                <div className="bg-red-bg border border-red/20 rounded-[12px] px-4 py-3 text-[12px] text-text-4">
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {(detalleModal.requerimiento.entidades || []).map(e => <Badge key={e} variant="orange">{e}</Badge>)}
                  </div>
                  <div>{detalleModal.requerimiento.mensaje}</div>
                  <div className="text-[11px] text-text-5 mt-1">Fecha: {detalleModal.requerimiento.fecha}</div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tab: Facturas (historial + % de pago completado de las Aprobadas) ─────────
function TabFacturas({ filtroCliente }) {
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [detalle, setDetalle] = useState(null);

  const todasLasFacturas = facturaService.listar();
  const facturas = filtroCliente ? todasLasFacturas.filter(f => f.contratante === filtroCliente) : todasLasFacturas;

  const q = busqueda.trim().toLowerCase();
  const matchesQ = (f, fields) => !q || fields.some(v => (v ?? '').toLowerCase().includes(q));

  const facturasFiltradas = (filtroEstado === 'Todos' ? facturas : facturas.filter(f => f.estado === FILTROS_ESTADO_KEY[filtroEstado]))
    .filter(f => matchesQ(f, [f.id, f.pyme, f.contratante, f.concepto, f.contrato]))
    .sort(porFechaDesc);

  return (
    <div className="bg-white rounded-[14px] border border-border p-5">
      <Header
        title="Todas las facturas"
        sub={filtroCliente ? `Facturas de ${filtroCliente}; las aprobadas muestran el % de pago completado.` : 'Historial completo de la cadena de facturación; las aprobadas muestran el % de pago completado.'}
        Icon={Receipt}
        right={<span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{facturas.length} registradas</span>}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
        <div className="relative w-full max-w-[300px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por Nº, PYME, contratante, contrato o concepto…"
            className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
          />
        </div>
        <div className="relative flex items-center shrink-0">
          <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-orange" />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="h-9 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none w-full sm:w-auto"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            {FILTROS_ESTADO.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Móvil: cards sin scroll lateral */}
      <div className="sm:hidden space-y-2">
        {facturasFiltradas.map(f => {
          const aprobada = f.estado === INV.aprobada;
          const pagado   = aprobada ? Number(f.pagosAcumulados || 0) : 0;
          const pctAvance = aprobada ? Math.min(100, Math.round((pagado / (Number(f.monto) || 1)) * 100)) : 0;
          return (
            <div key={f.id} onClick={() => setDetalle(f)}
              className="rounded-[12px] border border-border px-3 py-2.5 cursor-pointer hover:bg-orange-tint/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-text-1 whitespace-nowrap">{f.id}</span>
                <InvoiceStatusBadge estado={f.estado} />
                <span className="text-[12px] font-bold text-text-1 ml-auto whitespace-nowrap">{fmt(f.monto)} XAF</span>
              </div>
              <div className="text-[12px] font-semibold text-text-3 truncate mt-1">{f.pyme ?? '—'}</div>
              <div className="text-[11px] text-text-5 truncate">{f.contratante ?? '—'} · {f.contrato}</div>
              {aprobada && pagado > 0 && (
                <div className="mt-1.5 flex items-center gap-2" title={`Pagado ${fmt(pagado)} XAF de ${fmt(f.monto)} XAF`}>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                    <div className="h-full rounded-full" style={{ width: `${pctAvance}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
                  </div>
                  <span className="text-[10px] font-bold text-orange-dark shrink-0">{pctAvance}%</span>
                </div>
              )}
            </div>
          );
        })}
        {facturasFiltradas.length === 0 && (
          <div className="text-[12px] text-text-4 text-center py-8">No se encontraron facturas con los filtros aplicados.</div>
        )}
      </div>

      {/* Desktop: tabla compacta (sin min-width forzado) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-page-bg">
            <tr className="border-b border-border">
              {['Nº Factura', 'PYME', 'Contratante', 'Estado', 'Avance', 'Monto', 'Fecha', 'Detalle'].map((h, i) => (
                <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-2.5 py-3 whitespace-nowrap
                  ${i === 0 ? 'text-left' : i === 5 ? 'text-right' : 'text-center'}
                `}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {facturasFiltradas.map(f => {
              const aprobada = f.estado === INV.aprobada;
              const pagado   = aprobada ? Number(f.pagosAcumulados || 0) : 0;
              const pctAvance = aprobada ? Math.min(100, Math.round((pagado / (Number(f.monto) || 1)) * 100)) : 0;
              return (
                <tr key={f.id} onClick={() => setDetalle(f)}
                  className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-orange-tint/40 ${f.estado === INV.emitida ? 'bg-orange-tint/10' : ''}`}
                >
                  <td className="px-2.5 py-3 whitespace-nowrap">
                    <span className="text-[12px] font-bold text-text-1">{f.id}</span>
                    <div className="text-[10px] text-text-5 max-w-[150px] truncate">{f.concepto}</div>
                  </td>
                  <td className="px-2.5 py-3 text-[12px] font-semibold text-text-1 max-w-[140px] truncate">{f.pyme}</td>
                  <td className="px-2.5 py-3 text-[12px] text-text-4 max-w-[170px]">
                    <span className="block truncate">{f.contratante ?? '—'}</span>
                    <span className="text-[10px] font-mono text-text-5">{f.contrato}</span>
                  </td>
                  <td className="px-2.5 py-3 text-center"><InvoiceStatusBadge estado={f.estado} /></td>
                  <td className="px-2.5 py-3 text-center">
                    {aprobada && pagado > 0 ? (
                      <div className="flex items-center justify-center gap-1.5" title={`Pagado ${fmt(pagado)} XAF de ${fmt(f.monto)} XAF`}>
                        <div className="w-14 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: '#ECEAE7' }}>
                          <div className="h-full rounded-full" style={{ width: `${pctAvance}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
                        </div>
                        <span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{pctAvance}%</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-text-5">—</span>
                    )}
                  </td>
                  <td className="px-2.5 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmt(f.monto)} XAF</td>
                  <td className="px-2.5 py-3 text-center text-[11px] text-text-5 whitespace-nowrap">{f.fecha}</td>
                  <td className="px-2.5 py-3 text-center">
                    <div onClick={e => e.stopPropagation()}>
                      <button onClick={() => setDetalle(f)} title="Ver detalle"
                        className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {facturasFiltradas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-text-4">No se encontraron facturas con los filtros aplicados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detalle && (
        <InvoiceDetailModal
          factura={detalle}
          onClose={() => setDetalle(null)}
          footer={
            <Button variant="ghost" size="sm" onClick={() => setDetalle(null)}>Cerrar</Button>
          }
        />
      )}
    </div>
  );
}

// ── IPIs por contrato (Empresas Contratantes) ─────────────────────────────────
// Un IPI agrupa las operaciones de pago de un contrato: las facturas pagadas al
// completo (estado terminal) y las aprobadas con pago parcial acumulado. El ojo
// de cada fila reabre el mismo modal "Resumen de operaciones" que el portal
// Contratante usa para generar y enviar IPIs a Bonafide (solo lectura aquí).
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

// ── Tab: IPIs (por contrato de las Empresas Contratantes) ─────────────────────
function TabIPIs({ filtroCliente }) {
  const [detalle, setDetalle] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const ipisTodosLosClientes = ipisFondeador();
  const todosLosIpis = filtroCliente ? ipisTodosLosClientes.filter(i => i.contratante === filtroCliente) : ipisTodosLosClientes;
  const ipis = filtroEstado === 'Todos' ? todosLosIpis : todosLosIpis.filter(i => i.estado === filtroEstado);

  return (
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
  );
}

// ── Registros (referidos a las Empresas Contratantes) ─────────────────────────
// Tabla igual a la de la pestaña "Registros" del detalle de contrato, restringida:
// referentes = Empresas Contratantes; asuntos ∈ {contrato, facturas, administración, cliente}.
function registrosFondeador() {
  const contracts = contratoService.listar();
  const facturas  = facturaService.listar();

  // Empresas Contratantes reales de la plataforma (desde los contratos).
  const mapaContratante = new Map();
  contracts.forEach(c => {
    const nombre = c.contratante?.razonSocial?.trim();
    if (nombre) mapaContratante.set(nombre, { nombre, fecha: fechaContrato(c) });
  });
  const validos = new Set(mapaContratante.keys());

  const ev = [];
  const push = (referente, fecha, asunto, registro) => ev.push({ referente, fecha: fecha ?? '01/07/2026', asunto, registro });

  mapaContratante.forEach(({ nombre, fecha }) => {
    push(nombre, fecha, 'cliente', 'Se registró como Empresa Contratante en la plataforma.');
    push(nombre, fecha, 'administración', 'Presentó y completó la documentación administrativa exigida por Bonafide.');
  });

  contracts.forEach(c => {
    const ref = c.contratante?.razonSocial?.trim() || 'Empresa Contratante';
    const base = fechaContrato(c);
    push(ref, base, 'contrato', `Registró el contrato ${c.id} por ${fmtRegistro(c.monto)}.`);
    push(ref, base, 'administración', `Completó la documentación administrativa del contrato ${c.id}.`);
    if (c.estado === CST.activo) {
      push(ref, c.fechaInicio ?? base, 'contrato', `Aceptó las condiciones y quedó activo el contrato ${c.id}.`);
    }
    // `c.facturas` en el esquema canónico es un CONTEO (número), no un array;
    // los registros de cada factura salen del listado global de facturas.
    if (Array.isArray(c.facturas)) {
      c.facturas.forEach(f => {
        push(ref, f.fecha ?? base, 'facturas', `Registró la factura ${f.id} del contrato ${c.id} por ${fmtRegistro(f.monto)}.`);
      });
    }
  });

  facturas.forEach(f => {
    if (!f.contratante || !validos.has(f.contratante)) return;
    push(f.contratante, f.fecha, 'facturas', `Emitió la factura ${f.id} por ${fmtRegistro(f.monto)} (${f.pyme ?? '—'}).`);
  });

  return ev.sort(porFechaDesc);
}

export default function FondOrdenes() {
  const [tab, setTab] = useState('clientes');
  const [filtroCliente, setFiltroCliente] = useState('');
  const registros = useMemo(() => registrosFondeador(), []);
  const registrosFiltrados = filtroCliente ? registros.filter(r => r.referente === filtroCliente) : registros;

  // Con un cliente seleccionado en el filtro general ya no tiene sentido la
  // pestaña "Clientes" (solo se está viendo a uno); si estaba activa, se cae
  // a "Contratos" — derivado en el render, no con un efecto, para no
  // encadenar un segundo render solo para corregir la pestaña.
  const tabsVisibles = filtroCliente ? TABS.filter(t => t.id !== 'clientes') : TABS;
  const tabActiva = filtroCliente && tab === 'clientes' ? 'contratos' : tab;

  return (
    <AppShell
      active="fondOrdenes"
      role="fondeador"
      title="Sistema"
      sub={`Consultas del ${BANCO}: clientes, contratos, facturas y registros`}
    >
      <div className="fade-in space-y-5">

        {/* Tabs + filtro general por Empresa Contratante (discreto, en la misma fila) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex gap-1 bg-page-bg p-1 rounded-[10px] w-fit">
            {tabsVisibles.map(({ id, lbl, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  tabActiva === id ? 'bg-white shadow-sm text-text-1 font-semibold' : 'text-text-3 hover:text-text-1'
                }`}>
                <Icon className="w-3.5 h-3.5" />{lbl}
              </button>
            ))}
          </div>

          <div className="relative flex items-center shrink-0">
            <Building2 className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-text-4" />
            <select
              value={filtroCliente}
              onChange={e => setFiltroCliente(e.target.value)}
              title="Filtrar por Empresa Contratante"
              className="h-8 pl-8 pr-7 text-[11px] font-medium rounded-[8px] border border-border bg-white text-text-3 focus:outline-none focus:border-orange transition cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23A9A6A1' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
            >
              <option value="">Todas las empresas</option>
              {EMPRESAS_CONTRATANTES.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
            </select>
          </div>
        </div>

        {tabActiva === 'clientes' && !filtroCliente && <TabClientes />}
        {tabActiva === 'contratos' && <TabContratos filtroCliente={filtroCliente} />}
        {tabActiva === 'facturas' && <TabFacturas filtroCliente={filtroCliente} />}
        {tabActiva === 'ipis' && <TabIPIs filtroCliente={filtroCliente} />}

        {tabActiva === 'registros' && (
          <RegistrosTabla
            noAnim
            registros={registrosFiltrados}
            titulo="Registros"
            sub={filtroCliente ? `Movimientos y actuaciones de ${filtroCliente} sobre la plataforma.` : 'Movimientos y actuaciones de las Empresas Contratantes sobre la plataforma.'}
          />
        )}

      </div>
    </AppShell>
  );
}