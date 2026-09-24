import { useState } from 'react';
import { Search, Eye, ScrollText, ListFilter } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import InfoRow from '../../components/ui/InfoRow';
import FiltroClienteSelect from './FiltroClienteSelect';
import { contratoService } from '../../services/contrato.service';
import { nombrePymeContrato } from '../../components/contratos/contratoUtils';
import { BANCO } from './fondeadorShared';

// ── CONTRATOS (portal Banco Fondeador) ─────────────────────────────────────────
// Listado de consulta (sin borrar), como en /admin/contratos.
const ESTADOS_FILTRO_CT = ['Todos', 'Pendiente de Configuración', 'Pendiente de Revisión', 'Con Requerimientos', 'En Discusión de Términos', 'Activo'];

const formatXaf = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;

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

export default function FondContratos() {
  const [contracts] = useState(() => contratoService.listar());
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroCliente, setFiltroCliente] = useState('');
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
    <AppShell active="fondContratos" role="fondeador" title="Contratos" sub={`Contratos de crédito de la plataforma vistos por ${BANCO}`}>
      <div className="fade-in space-y-4">
        <div className="flex justify-end">
          <FiltroClienteSelect value={filtroCliente} onChange={setFiltroCliente} />
        </div>
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
      </div>
    </AppShell>
  );
}
