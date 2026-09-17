import { useState } from 'react';
import {
  ChevronRight, CheckCircle, FileText, Clock, Building2, User, Users,
  Receipt, ListFilter, Zap, X, Eye, Landmark,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { InfoRow, SectionHeader, IpiVerificacionModal } from './contratanteShared';
import { ORA, GREEN, TEXT4, fmt, facturas, pymes, contratos, facturaBadge, scoreColor, contratanteState } from './contratanteData';

const cuentaLabel = (c) => c.cuentaBancaria?.tipo === 'bonafide'
  ? 'Cuenta Bonafide existente'
  : `Banco Fondeador · ${c.cuentaBancaria?.numero || '—'}`;

// ── DETALLE DE CONTRATO ───────────────────────────────────────────────────────
const TABS_DETALLE = [
  { id: 'contrato', lbl: 'Contrato', Icon: FileText,    iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'pyme',     lbl: 'PYME',     Icon: Users,       iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'facturas', lbl: 'Facturas', Icon: Receipt,     iconBg: '#FFF3E0', iconColor: ORA },
];

export default function EmpContratoDetalle() {
  const { go } = useApp();
  const [tab, setTab] = useState('contrato');
  const [facturaModal, setFacturaModal] = useState(null);
  const [ipiStep, setIpiStep]           = useState(null);
  const [estadoMap, setEstadoMap]       = useState({});
  const [filtroFac, setFiltroFac]       = useState('Todos');
  const [pymeDetalle, setPymeDetalle]   = useState(null);
  const c    = contratanteState.selectedContrato;
  const pct  = Math.round((c.utilizado / c.asignado) * 100);
  const disp = c.asignado - c.utilizado;
  const facturasContrato = facturas
    .filter(f => f.contrato === c.id)
    .map(f => ({ ...f, estado: estadoMap[f.id] ?? f.estado }));
  const modalFac = facturaModal ? (facturasContrato.find(f => f.id === facturaModal.id) ?? facturaModal) : null;

  // PYMEs que comparten el mismo contrato-marco (Subproceso 1 del BPMN: la
  // Contratante reparte un mismo monto base entre varias PYMEs) — si este
  // contrato no tiene `marcoId` (dato legado), la tabla cae a mostrar solo
  // esta PYME.
  const hermanos = c.marcoId ? contratos.filter(x => x.marcoId === c.marcoId) : [c];

  const closeModal        = () => { setFacturaModal(null); setIpiStep(null); };
  const handleVerificar   = () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Verificada' })); closeModal(); };
  const handleEnviarCodigo= () => setIpiStep('codigo');
  const handleConfirmarIPI= () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Emitida' })); closeModal(); };

  return (
    <AppShell active="empContratos" role="contratante" title="Detalle de Contrato" sub={`${c.pyme} · ${c.id}`}>
      <div className="fade-in space-y-5">

        {/* Breadcrumb */}
        <button onClick={() => go('empContratos')} className="flex items-center gap-1.5 text-[12px] font-medium hover:opacity-75 transition px-3 py-2 rounded-[10px] hover:bg-page-bg w-fit" style={{ color: TEXT4 }}>
          <ChevronRight className="w-4 h-4 rotate-180" style={{ color: ORA }} />
          <span>Mis contratos</span>
          <span className="mx-1" style={{ color: TEXT4 }}>/</span>
          <span className="text-text-1 font-semibold">{c.id}</span>
        </button>

        {/* ── Resumen financiero (mismo estilo degradado que en PYME) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { lbl: 'Fondo Asignado', val: `${fmt(c.asignado)} XAF` },
            { lbl: 'Utilizado',      val: `${fmt(c.utilizado)} XAF` },
            { lbl: 'Disponible',     val: `${fmt(disp)} XAF` },
            { lbl: '% Utilización',  val: `${pct}%` },
          ].map(({ lbl, val }) => (
            <div key={lbl} className="rounded-[14px] shadow-sm p-4" style={{ background: 'var(--bonafide-gradient)' }}>
              <div className="text-[10px] text-white/80 uppercase tracking-wide mb-1.5 leading-tight">{lbl}</div>
              {val.endsWith(' XAF') ? (
                <>
                  <div className="text-[18px] sm:text-[22px] font-extrabold leading-tight text-white truncate">{val.slice(0, -4)}</div>
                  <div className="text-[10px] font-semibold text-white/80 leading-tight">XAF</div>
                </>
              ) : (
                <div className="text-[22px] font-extrabold leading-tight text-white truncate">{val}</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Tabs con iconos (como en PYME) — en grid para que quepan sin scroll
              lateral en pantallas chicas ── */}
        <div className="grid grid-cols-3 gap-1.5 bg-page-bg p-1 rounded-[10px]">
          {TABS_DETALLE.map(({ id, lbl, Icon, iconBg, iconColor }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-[8px] text-[12px] sm:text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer
                  ${active ? 'bg-white shadow-sm text-text-1 font-semibold' : 'text-text-4 hover:text-text-2'}`}
              >
                <div className="w-5 h-5 rounded-[5px] flex items-center justify-center"
                     style={{ background: active ? iconBg : 'transparent' }}>
                  <Icon className="w-3 h-3" style={{ color: active ? iconColor : 'currentColor' }} />
                </div>
                {id === 'facturas' ? `${lbl} (${facturasContrato.length})` : lbl}
              </button>
            );
          })}
        </div>

        {/* ── Tab: Contrato ── */}
        {tab === 'contrato' && (
          <div className="space-y-4">

            {/* Objeto del trabajo */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5">
              <SectionHeader title="Objeto del Trabajo" sub="Descripción del alcance y servicios pactados en el contrato" Icon={FileText} />
              <p className="text-[13px] text-text-1 leading-relaxed">{c.objeto || '—'}</p>
            </div>

            {/* Condiciones económicas y plazos */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '60ms' }}>
              <SectionHeader title="Condiciones Económicas y Plazos" sub="Monto asignado a esta PYME, vigencia y plazos" Icon={Clock} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoRow label="Monto asignado"     value={`${fmt(c.asignado)} XAF`} />
                <InfoRow label="Plazo de pago"       value={c.plazoPago ? `${c.plazoPago} días` : '—'} />
                <InfoRow label="Fecha de inicio"    value={c.fechaInicio} />
                <InfoRow label="Fecha de fin"       value={c.fechaFin} />
                <InfoRow label="Plazo de ejecución" value={c.plazo} />
              </div>
            </div>

            {/* Ficha del contrato-marco — datos fijados por Bonafide y la
                cuenta bancaria elegida por la Contratante al configurarlo
                (Subproceso 1 del BPMN), compartidos por todas las PYMEs de
                este mismo contrato-marco. */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '90ms' }}>
              <SectionHeader title="Ficha del Contrato-Marco" sub="Condiciones fijadas por Bonafide para este contrato" Icon={Landmark} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoRow label="Banco Fondeador"              value={c.bancoFondeador} />
                <InfoRow label="Interés"                      value={c.interes} />
                <InfoRow label="% Retención"                  value={c.porcentajeRetencion != null ? `${c.porcentajeRetencion}%` : '—'} />
                <InfoRow label="% Gestión de Cobranza"        value={c.porcentajeGestionCobranza != null ? `${c.porcentajeGestionCobranza}%` : '—'} />
                <InfoRow label="Cuenta bancaria operativa"    value={cuentaLabel(c)} />
              </div>
            </div>

            {/* Documento */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '120ms' }}>
              <SectionHeader title="Documento del Contrato" sub="Archivo adjunto firmado entre las partes" Icon={FileText} />
              <div className="flex items-center gap-2 text-[12px]" style={{ color: TEXT4 }}>
                <FileText className="w-4 h-4 shrink-0" />
                No se ha adjuntado documento al contrato.
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: PYME ── */}
        {tab === 'pyme' && (
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <div className="text-[14px] font-bold text-text-1">PYMEs de este Contrato-Marco</div>
                <div className="text-[11px] text-text-4">Empresas Contratadas y monto que la Contratante les asignó</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Users className="w-4 h-4" style={{ color: ORA }} />
                <span className="text-[11px] font-bold" style={{ color: ORA }}>{hermanos.length} PYME{hermanos.length === 1 ? '' : 's'}</span>
              </div>
            </div>

            {/* Móvil: cards */}
            <div className="sm:hidden space-y-2">
              {hermanos.map(h => (
                <div key={h.id} className="rounded-[12px] border border-border p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-text-1 truncate">{h.pyme}</p>
                      <p className="text-[10px] font-mono" style={{ color: TEXT4 }}>{h.id}</p>
                    </div>
                    <Badge variant={h.estado === 'Activo' ? 'green' : 'yellow'}>{h.estado}</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: TEXT4 }}>Monto asignado</p>
                      <p className="text-[13px] font-extrabold text-text-1">{fmt(h.asignado)} XAF</p>
                    </div>
                    <button onClick={() => setPymeDetalle(h)} className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: ORA }}>
                      <Eye className="w-3.5 h-3.5" />Ver
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: tabla (mismo patrón que la tabla de Proyectos en Huella Verde) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-page-bg">
                  <tr className="border-b border-border">
                    {['PYME', 'Contrato', 'Estado', 'Score', 'Monto asignado', ''].map((h, i) => (
                      <th key={h || 'accion'} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3 ${i === 4 ? 'text-right' : i === 5 ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hermanos.map(h => {
                    const hPyme = pymes.find(p => p.ini === h.ini);
                    return (
                      <tr key={h.id} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors">
                        <td className="px-4 py-3 text-[12px] font-medium text-text-1">{h.pyme}</td>
                        <td className="px-4 py-3 text-[12px] font-mono" style={{ color: TEXT4 }}>{h.id}</td>
                        <td className="px-4 py-3"><Badge variant={h.estado === 'Activo' ? 'green' : 'yellow'}>{h.estado}</Badge></td>
                        <td className="px-4 py-3">
                          {hPyme ? (
                            <span className="text-[12px] font-bold" style={{ color: scoreColor(hPyme.score) }}>{hPyme.score}</span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmt(h.asignado)} XAF</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setPymeDetalle(h)}
                            title="Ver detalle de la PYME"
                            className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange-dark cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Facturas ── */}
        {tab === 'facturas' && (() => {
          const estadosDisponibles = ['Todos', ...Array.from(new Set(facturasContrato.map(f => f.estado)))];
          return (
          <div className="card-enter bg-white rounded-[14px] border border-border p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
              <div className="flex items-center gap-3 flex-1">
                <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-text-1">Facturas ({facturasContrato.length})</div>
                  <div className="text-[12px] text-text-4">Emitidas por la PYME en este contrato</div>
                </div>
              </div>
              <div className="relative flex items-center self-center sm:self-auto">
                <ListFilter className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0" style={{ color: ORA }} />
                <select
                  value={filtroFac}
                  onChange={e => setFiltroFac(e.target.value)}
                  className="h-8 pl-8 pr-7 text-[12px] font-medium rounded-[8px] border-2 border-orange bg-white text-text-1 focus:outline-none transition cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23EF7A2C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                >
                  {estadosDisponibles.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
            {(() => {
              const visibles = filtroFac === 'Todos' ? facturasContrato : facturasContrato.filter(f => f.estado === filtroFac);
              return visibles.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2" style={{ color: TEXT4 }}>
                <Receipt className="w-8 h-8" />
                <p className="text-[13px] font-semibold">Sin facturas con estado "{filtroFac}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibles.map(f => (
                  <div key={f.id} onClick={() => { setFacturaModal(f); setIpiStep(null); }} className="cursor-pointer">

                    {/* ── Móvil: card igual que Mis Facturas ── */}
                    <div className="sm:hidden bg-white rounded-[14px] border border-border p-4 flex flex-col gap-3 hover:bg-page-bg transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-bold font-mono text-text-1">{f.id}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: TEXT4 }}>{f.fecha}</p>
                        </div>
                        <Badge variant={facturaBadge(f.estado)}>{f.estado}</Badge>
                      </div>
                      <p className="text-[12px] leading-snug line-clamp-2" style={{ color: TEXT4 }}>{f.concepto}</p>
                      <div className="bg-page-bg rounded-[10px] p-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Monto</p>
                        <div className="flex items-center gap-1.5">
                          <Receipt className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                          <p className="text-[15px] font-extrabold leading-none" style={{ color: GREEN }}>
                            {fmt(f.monto)} <span className="text-[10px] font-semibold" style={{ color: GREEN }}>XAF</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1 border-t border-border">
                        <span className="text-[11px] font-semibold flex items-center gap-0.5" style={{ color: ORA }}>
                          Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* ── Desktop: row ── */}
                    <div className="hidden sm:flex items-start gap-4 p-4 rounded-[12px] border border-border hover:border-orange/30 hover:bg-page-bg transition-all group">
                      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FFF3E0' }}>
                        <Receipt className="w-5 h-5" style={{ color: ORA }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-bold text-text-1 font-mono block mb-1">{f.id}</span>
                        <p className="text-[12px] leading-snug mb-2 line-clamp-2" style={{ color: TEXT4 }}>{f.concepto}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={facturaBadge(f.estado)}>{f.estado}</Badge>
                          <span className="text-[10px]" style={{ color: TEXT4 }}>{f.fecha}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-0.5 pt-0.5">
                        <div className="text-[14px] font-extrabold text-text-1">{fmt(f.monto)}</div>
                        <div className="text-[10px]" style={{ color: TEXT4 }}>XAF</div>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100 transition mt-1" style={{ color: ORA }} />
                    </div>

                  </div>
                ))}
              </div>
            );
            })()}
          </div>
          );
        })()}

      </div>

      {/* ── Modal: Detalle de PYME (disparado por el ojo en la tabla) ── */}
      {pymeDetalle && (() => {
        const p = pymes.find(x => x.ini === pymeDetalle.ini);
        if (!p) return null;
        return (
          <Modal title={`${p.nombre} · ${pymeDetalle.id}`} onClose={() => setPymeDetalle(null)} wide>
            <div className="space-y-5">
              <div className="card-enter bg-white rounded-[14px] border border-border p-5">
                <SectionHeader
                  title="Datos de Identidad"
                  sub="Información legal y fiscal de la PYME"
                  Icon={Building2}
                  right={
                    <div className="shrink-0 px-2.5 py-1.5 rounded-[8px]" style={{ background: scoreColor(p.score) + '20' }}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold" style={{ color: scoreColor(p.score) }}>Score crediticio</span>
                        <span className="text-[15px] font-extrabold" style={{ color: scoreColor(p.score) }}>{p.score}/1000</span>
                      </div>
                    </div>
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <InfoRow label="Razón Social"      value={p.nombre} />
                  <InfoRow label="Nombre Comercial"  value={p.nombreComercial} />
                  <InfoRow label="RUC / NIF"         value={p.ruc} />
                  <InfoRow label="Sector Productivo" value={p.sector} />
                  <InfoRow label="Teléfono"          value={p.telefono} />
                  <InfoRow label="Correo"            value={p.correo} />
                </div>
              </div>

              <div className="card-enter bg-white rounded-[14px] border border-border p-5">
                <SectionHeader title="Representante Legal" sub="Persona autorizada para firmar y representar a la PYME" Icon={User} />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <InfoRow label="Nombre y Apellido"    value={p.repNombre} />
                  <InfoRow label="Tipo de Documento"    value={p.repTipoDoc} />
                  <InfoRow label="Nº de Identificación" value={p.repId} />
                  <InfoRow label="Cargo"                value={p.repCargo} />
                  <InfoRow label="Teléfono"             value={p.repTel} />
                  <InfoRow label="Correo"               value={p.repCorreo} />
                </div>
              </div>

              <div className="card-enter bg-white rounded-[14px] border border-border p-5">
                <SectionHeader title="Este Contrato" sub="Condiciones específicas de la asignación a esta PYME" Icon={FileText} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InfoRow label="Contrato"        value={pymeDetalle.id} />
                  <InfoRow label="Estado"          value={pymeDetalle.estado} />
                  <InfoRow label="Monto asignado"  value={`${fmt(pymeDetalle.asignado)} XAF`} />
                  <InfoRow label="Plazo de pago"   value={pymeDetalle.plazoPago ? `${pymeDetalle.plazoPago} días` : '—'} />
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* ── Modal: Detalle de factura ── */}
      {modalFac && (
        <Modal
          title={`Factura · ${modalFac.id}`}
          onClose={closeModal}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={closeModal}>Cerrar</Button>
              <div className="flex gap-2">
                {modalFac.estado === 'Recibida' && (
                  <Button variant="primary" size="sm" onClick={handleVerificar}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />Verificar factura
                  </Button>
                )}
                {modalFac.estado === 'Verificada' && (
                  <Button variant="primary" size="sm" onClick={() => setIpiStep('confirm')}>
                    <Zap className="w-3.5 h-3.5 mr-1" />Emitir IPI
                  </Button>
                )}
              </div>
            </>
          }
        >
          <div className="space-y-5">
            {/* Estado + fecha */}
            <div className="flex items-center justify-between">
              <Badge variant={facturaBadge(modalFac.estado)}>{modalFac.estado}</Badge>
              <span className="text-[12px]" style={{ color: TEXT4 }}>{modalFac.fecha}</span>
            </div>
            {/* Datos principales */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow label="Nº Factura"  value={modalFac.id} />
              <InfoRow label="PYME"        value={modalFac.pyme} />
              <InfoRow label="Contrato"    value={modalFac.contrato} />
              <InfoRow label="Monto"       value={`${fmt(modalFac.monto)} XAF`} />
              <InfoRow label="Fecha"       value={modalFac.fecha} />
              <InfoRow label="Concepto"    value={modalFac.concepto} />
            </div>
            {/* Documentos adjuntos */}
            <div>
              <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Documento adjunto</div>
              <div className="flex items-center gap-2.5 p-3 rounded-[10px] border border-border" style={{ color: TEXT4 }}>
                <FileText className="w-4 h-4 shrink-0" />
                <span className="text-[12px]">No se ha adjuntado documento a esta factura.</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal IPI paso 1: confirmación ── */}
      {ipiStep === 'confirm' && modalFac && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             onClick={e => e.target === e.currentTarget && setIpiStep(null)}>
          <div className="bona-gradient-shadow w-full max-w-md rounded-2xl p-[2px]">
            <div className="bg-white rounded-2xl p-8 relative">
              <button onClick={() => setIpiStep(null)} className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-text-3" />
              </button>

              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, #EF7A2C, #E0201C)' }}>
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-1 mb-1">Autorizar pago IPI</h2>
                <p className="text-sm text-text-3">Revisa los datos y confirma la autorización</p>
              </div>

              <div className="rounded-[14px] border border-border p-4 mb-4" style={{ background: '#F8F7F5' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Factura</span>
                  <span className="text-[12px] font-bold font-mono text-text-1">{modalFac.id}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>PYME</span>
                  <span className="text-[12px] font-medium text-text-1">{modalFac.pyme}</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-border">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Monto</span>
                  <span className="text-[16px] font-extrabold" style={{ color: GREEN }}>
                    {fmt(modalFac.monto)} <span className="text-[10px] font-semibold">XAF</span>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[12px] p-4 mb-6" style={{ background: '#FFF3E0', border: '1px solid #FDDDB8' }}>
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: ORA }} />
                <p className="text-[13px] text-text-1 leading-relaxed">
                  Confirmo que esta factura ha sido validada y autorizo el pago en la fecha de vencimiento.
                </p>
              </div>

              <Button onClick={handleEnviarCodigo} full className="h-[48px] mb-3">
                Aceptar y continuar
              </Button>
              <button onClick={() => setIpiStep(null)} className="w-full text-sm text-center font-medium text-text-3 hover:text-text-1 transition-colors cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal IPI paso 2: verificación con código ── */}
      {ipiStep === 'codigo' && modalFac && (
        <IpiVerificacionModal
          factura={modalFac}
          onClose={() => setIpiStep(null)}
          onConfirm={handleConfirmarIPI}
        />
      )}
    </AppShell>
  );
}
