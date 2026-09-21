import { useState } from 'react';
import {
  ChevronRight, CheckCircle, FileText, Clock, Building2, User, Truck,
  Receipt, ListFilter, Zap, X, Eye, Landmark,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InvoiceCard from '../../components/invoices/InvoiceCard';
import FacturaContratanteModal from '../../components/invoices/FacturaContratanteModal';
import { defaultVencimiento } from '../../components/invoices/facturaUtils';
import { facturaService } from '../../services/factura.service';
import { InfoRow, SectionHeader, IpiVerificacionModal } from './provShared';
import { ORA, GREEN, TEXT4, fmt, facturas, suministradores, facturaBadge, scoreColor, kycBadge, provState } from './provData';
import { contratoService } from '../../services/contrato.service';
import { aViewContrato } from '../../components/contratos/contratoUtils';

const cuentaLabel = (c) => c.cuentaBancaria?.tipo === 'bonafide'
  ? 'Cuenta Bonafide existente'
  : `Cuenta en mi Banco · ${c.cuentaBancaria?.numero || '—'}`;

const INIT_FAC_EMPTY = { open: false, editId: null, contratoId: '', monto: '', concepto: '', fechaVencimiento: '', documento: null };

// ── DETALLE DE CONTRATO ───────────────────────────────────────────────────────
const TABS_DETALLE = [
  { id: 'contrato',        lbl: 'Contrato',        Icon: FileText, iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'suministradores', lbl: 'Suministradores', Icon: Truck,    iconBg: '#FFF3E0', iconColor: ORA },
  { id: 'facturas',        lbl: 'Facturas',        Icon: Receipt,  iconBg: '#FFF3E0', iconColor: ORA },
];

export default function ProvContratoDetalle() {
  const { go } = useApp();
  const [tab, setTab] = useState('contrato');
  const [facturaModal, setFacturaModal] = useState(null);
  const [ipiStep, setIpiStep]           = useState(null);
  const [estadoMap, setEstadoMap]       = useState({});
  const [filtroFac, setFiltroFac]       = useState('Todos');
  const [sumDetalle, setSumDetalle]     = useState(null);
  const [facCtModal, setFacCtModal]     = useState(INIT_FAC_EMPTY);
  const [, setTick] = useState(0);
  const bump = () => setTick(t => t + 1);
  const c    = provState.selectedContrato
    ?? contratoService.listarPorVista('proveedor').map(aViewContrato)[0] ?? null;
  const pct  = c && c.asignado > 0 ? Math.round((c.utilizado / c.asignado) * 100) : 0;
  const disp = c ? c.asignado - c.utilizado : 0;
  const facturasContrato = c
    ? facturas
        .filter(f => f.contrato === c.id)
        .map(f => ({ ...f, estado: estadoMap[f.id] ?? f.estado }))
    : [];
  const modalFac = facturaModal ? (facturasContrato.find(f => f.id === facturaModal.id) ?? facturaModal) : null;

  // Suministradores que este Proveedor registró bajo este contrato
  // (Subproceso 3 del BPMN: el Proveedor reparte el monto que la PYME le
  // asignó entre sus propios Suministradores).
  const misSuministradores = c?.suministradores ?? c?.suministradoresAsignados ?? [];

  const closeModal        = () => { setFacturaModal(null); setIpiStep(null); };
  const handleVerificar   = () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Verificada' })); closeModal(); };
  const handleEnviarCodigo= () => setIpiStep('codigo');
  const handleConfirmarIPI= () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Emitida' })); closeModal(); };

  // Nueva factura al Contratante con este contrato fijo (mismos validadores que
  // el resto de secciones: monto/concepto obligatorios y tope = saldo disponible).
  const handleCrearFacCt = () => {
    const monto = Number((facCtModal.monto || '').replace(/[^0-9]/g, '')) || 0;
    if (monto <= 0 || !facCtModal.concepto.trim()) return;
    if (disp > 0 && monto > disp) return;
    const maxId = facturaService.listar().reduce((m, f) => Math.max(m, Number(String(f.id).replace('FAC-2026-', '')) || 0), 2108);
    const id = `FAC-2026-${maxId + 1}`;
    facturaService.crear({
      id,
      contrato: c.id,
      contratante: c.pyme,
      pyme: c.pyme,
      tipoFactoring: 'inverso',
      origen: 'suministrador',
      monto,
      concepto: facCtModal.concepto,
      fechaVencimiento: facCtModal.fechaVencimiento,
      fecha: new Date().toLocaleDateString('en-GB'),
      documentos: facCtModal.documento ? [{ name: facCtModal.documento.name, url: facCtModal.documento.url }] : [],
    });
    facturas.push({
      id,
      contrato: c.id,
      suministrador: '—',
      monto,
      fecha: new Date().toLocaleDateString('es-ES'),
      estado: 'Recibida',
      concepto: facCtModal.concepto,
    });
    setFacCtModal(INIT_FAC_EMPTY);
    bump();
  };

  if (!c) return <AppShell active="provContratos" role="proveedor" title="Detalle de Contrato" sub="—" back />;

  return (
    <AppShell active="provContratos" role="proveedor" title="Detalle de Contrato" sub={`${c.pyme} · ${c.id}`}>
      <div className="fade-in space-y-5">

        {/* Breadcrumb */}
        <button onClick={() => go('provContratos')} className="flex items-center gap-1.5 text-[12px] font-medium hover:opacity-75 transition px-3 py-2 rounded-[10px] hover:bg-page-bg w-fit" style={{ color: TEXT4 }}>
          <ChevronRight className="w-4 h-4 rotate-180" style={{ color: ORA }} />
          <span>Mis contratos</span>
          <span className="mx-1" style={{ color: TEXT4 }}>/</span>
          <span className="text-text-1 font-semibold">{c.id}</span>
        </button>

        {/* ── Resumen financiero ── */}
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

        {/* ── Tabs con iconos ── */}
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
              <SectionHeader title="Condiciones Económicas y Plazos" sub="Monto asignado por la PYME, vigencia y plazos" Icon={Clock} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoRow label="Monto asignado"     value={`${fmt(c.asignado)} XAF`} />
                <InfoRow label="Plazo de pago"       value={c.plazoPago ? `${c.plazoPago} días` : '—'} />
                <InfoRow label="Fecha de inicio"    value={c.fechaInicio} />
                <InfoRow label="Fecha de fin"       value={c.fechaFin} />
                <InfoRow label="Plazo de ejecución" value={c.plazo} />
              </div>
            </div>

            {/* Ficha del contrato — datos fijados por Bonafide y la cuenta
                bancaria elegida por el Proveedor al configurarlo (Subproceso
                3 del BPMN). */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '90ms' }}>
              <SectionHeader title="Ficha del Contrato" sub="Condiciones fijadas por Bonafide para este contrato" Icon={Landmark} />
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

        {/* ── Tab: Suministradores ── */}
        {tab === 'suministradores' && (
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <div className="text-[14px] font-bold text-text-1">Suministradores de este Contrato</div>
                <div className="text-[11px] text-text-4">Suministradores registrados y el monto que se les asignó</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Truck className="w-4 h-4" style={{ color: ORA }} />
                <span className="text-[11px] font-bold" style={{ color: ORA }}>{misSuministradores.length} Suministrador{misSuministradores.length === 1 ? '' : 'es'}</span>
              </div>
            </div>

            {/* Móvil: cards */}
            <div className="sm:hidden space-y-2">
              {misSuministradores.map(s => (
                <div key={s.id} className="rounded-[12px] border border-border p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-text-1 truncate">{s.nombre}</p>
                      <p className="text-[10px] font-mono" style={{ color: TEXT4 }}>{c.id}</p>
                    </div>
<Badge variant={kycBadge(s.kyc ?? 'sin kyc')}>{s.kyc ?? 'sin KYC'}</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: TEXT4 }}>Monto asignado</p>
                      <p className="text-[13px] font-extrabold text-text-1">{fmt(s.monto)} XAF</p>
                    </div>
                    <button onClick={() => setSumDetalle(s)} className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: ORA }}>
                      <Eye className="w-3.5 h-3.5" />Ver
                    </button>
                  </div>
                </div>
              ))}
              {misSuministradores.length === 0 && (
                <div className="text-[12px] text-text-4 text-center py-8">Aún no se registraron suministradores.</div>
              )}
            </div>

            {/* Desktop: tabla (mismo patrón que la tabla de PYMEs en Mis Contratos del Contratante) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-page-bg">
                  <tr className="border-b border-border">
                    {['Suministrador', 'Contrato', 'Estado', 'Score', 'Monto asignado', ''].map((h, i) => (
                      <th key={h || 'accion'} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3 ${i === 4 ? 'text-right' : i === 5 ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {misSuministradores.map(s => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors">
                      <td className="px-4 py-3 text-[12px] font-medium text-text-1">{s.nombre}</td>
                      <td className="px-4 py-3 text-[12px] font-mono" style={{ color: TEXT4 }}>{c.id}</td>
                      <td className="px-4 py-3"><Badge variant={kycBadge(s.kyc ?? 'sin kyc')}>{s.kyc ?? 'sin KYC'}</Badge></td>
                      <td className="px-4 py-3">
                        {s.scoreCredito != null ? (
                          <span className="text-[12px] font-bold" style={{ color: scoreColor(s.scoreCredito) }}>{s.scoreCredito}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] font-bold text-text-1 whitespace-nowrap">{fmt(s.monto)} XAF</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSumDetalle(s)}
                          title="Ver detalle del suministrador"
                          className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange-dark cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {misSuministradores.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-text-4">Aún no se registraron suministradores.</td>
                    </tr>
                  )}
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
                  <div className="text-[12px] text-text-4">Emitidas por el Suministrador en este contrato</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                <Button
                  onClick={() => setFacCtModal({ ...INIT_FAC_EMPTY, open: true, fechaVencimiento: defaultVencimiento() })}
                  className="w-full sm:w-auto"
                >
                  Nueva Factura
                </Button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibles.map((f, idx) => (
                  <InvoiceCard
                    key={f.id}
                    factura={f}
                    entidad={f.suministrador}
                    concepto={f.concepto}
                    style={{ animationDelay: `${(idx % 8) * 60}ms` }}
                    onClick={() => { setFacturaModal(f); setIpiStep(null); }}
                  />
                ))}
              </div>
            );
            })()}
          </div>
          );
        })()}

      </div>

      {/* ── Modal: Nueva Factura al Contratante (este contrato pre-seleccionado) ── */}
      {facCtModal.open && (
        <FacturaContratanteModal
          modal={facCtModal}
          contratoFijo={{ id: c.id, contratante: c.pyme, tipoFactoring: 'inverso', disponible: disp }}
          onChange={p => setFacCtModal(prev => ({ ...prev, ...p }))}
          onSave={handleCrearFacCt}
          onCancel={() => setFacCtModal(INIT_FAC_EMPTY)}
        />
      )}

      {/* ── Modal: Detalle de Suministrador (disparado por el ojo en la tabla) ── */}
      {sumDetalle && (() => {
        const p = suministradores.find(x => x.nombre === sumDetalle.nombre);
        if (!p) return null;
        return (
          <Modal title={`${p.nombre} · ${c.id}`} onClose={() => setSumDetalle(null)} wide>
            <div className="space-y-5">
              <div className="card-enter bg-white rounded-[14px] border border-border p-5">
                <SectionHeader
                  title="Datos de Identidad"
                  sub="Información legal y fiscal del Suministrador"
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
                <SectionHeader title="Representante Legal" sub="Persona autorizada para firmar y representar al Suministrador" Icon={User} />
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
                <SectionHeader title="Este Contrato" sub="Condiciones específicas de la asignación a este Suministrador" Icon={FileText} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InfoRow label="Contrato"        value={c.id} />
                  <InfoRow label="Estado KYC"      value={sumDetalle.kyc} />
                  <InfoRow label="Monto asignado"  value={`${fmt(sumDetalle.monto)} XAF`} />
                  <InfoRow label="Nómina"          value={sumDetalle.cargaNomina ? 'Sí' : 'No'} />
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
              <InfoRow label="Nº Factura"     value={modalFac.id} />
              <InfoRow label="Suministrador"  value={modalFac.suministrador} />
              <InfoRow label="Contrato"       value={modalFac.contrato} />
              <InfoRow label="Monto"          value={`${fmt(modalFac.monto)} XAF`} />
              <InfoRow label="Fecha"          value={modalFac.fecha} />
              <InfoRow label="Concepto"       value={modalFac.concepto} />
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
            <div className="bg-white rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
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
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Suministrador</span>
                  <span className="text-[12px] font-medium text-text-1">{modalFac.suministrador}</span>
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
