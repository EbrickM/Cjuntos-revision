import { useState } from 'react';
import {
  Pencil, Trash2, Building2, Truck, Receipt, BarChart2, Upload, Paperclip,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';

const formatXaf = (v) => `${new Intl.NumberFormat('de-DE').format(Number(v) || 0)} XAF`;

const CT_ESTADOS_INVERSO = ['Creada', 'Enviada', 'Validada', 'IPI Emitido', 'Pagada'];
const CT_ESTADOS_DIRECTO = ['Creada', 'Enviada', 'Validada', 'Pagada'];

const CTPipeline = ({ estado, tipoFactoring }) => {
  const steps     = tipoFactoring === 'inverso' ? CT_ESTADOS_INVERSO : CT_ESTADOS_DIRECTO;
  const currentIdx = steps.indexOf(estado);
  const completed  = currentIdx === steps.length - 1;
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center gap-0.5">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                style={
                  completed || idx < currentIdx  ? { background: '#E3F4EA', color: '#2E7D5B' } :
                  idx === currentIdx              ? { background: '#EF7A2C', color: '#ffffff', boxShadow: '0 0 0 2px rgba(239,122,44,0.25)' } :
                                                    { background: '#F6F5F3', color: '#A9A6A1' }
                }>
            {step}
          </span>
          {idx < steps.length - 1 && (
            <div className="w-3 h-px shrink-0"
                 style={{ background: (completed || idx < currentIdx) ? '#A8D5BE' : '#ECEAE7' }} />
          )}
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({ icon: Icon, iconBg, iconColor, title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div>
        <div className="text-[14px] font-bold text-text-1">{title}</div>
        {subtitle && <div className="text-[12px] text-text-4">{subtitle}</div>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

const INV_CT_EMPTY = { open: false, editId: null, contratoId: '', monto: '', concepto: '', fechaVencimiento: '', documento: null };
const INV_PR_EMPTY = { open: false, editId: null, contratoId: '', proveedorId: '', monto: '', concepto: '', fecha: '', fechaVencimiento: '', documento: null };

const activeContracts = [
  { id: 'CTR-2026-001', tipoFactoring: 'inverso', contratante: 'Constructora Malabo S.A.' },
  { id: 'CTR-2026-002', tipoFactoring: 'inverso', contratante: 'Evans Construction & Engineering S.A.' },
  { id: 'CTR-2026-003', tipoFactoring: 'directo', contratante: 'Petro Guinea S.A.' },
  { id: 'CTR-2026-004', tipoFactoring: 'inverso', contratante: 'Ministerio de Obras Públicas e Infraestructuras' },
  { id: 'CTR-2026-005', tipoFactoring: 'directo', contratante: 'Autoridad Portuaria de Bata S.A.' },
];

const initialProviders = [
  { id: 'p1', razonSocial: 'Cemex GE',      sector: 'Materiales' },
  { id: 'p2', razonSocial: 'TransGE S.L.',  sector: 'Transporte' },
  { id: 'p3', razonSocial: 'ServTec GE',    sector: 'Tecnología' },
];

const initialInvoices = [
  {
    id: 'FAC-2026-1025', tipo: 'proveedor', contrato: 'CTR-2026-002',
    proveedorId: 'p2', proveedorNombre: 'TransGE S.L.', monto: 4500000, estado: 'Pendiente',
    concepto: 'Transporte de materiales al sitio de obra', fecha: '01/05/2026', fechaVencimiento: '01/06/2026', documento: null,
  },
  {
    id: 'FAC-2026-1031', tipo: 'contratante', contrato: 'CTR-2026-002',
    monto: 18000000, estado: 'Validada', concepto: 'Avance de obra fase 1 – Cimentación y estructura',
    fecha: '10/05/2026', fechaVencimiento: '10/06/2026', documento: null,
  },
  {
    id: 'FAC-2026-1036', tipo: 'contratante', contrato: 'CTR-2026-005',
    monto: 6500000, estado: 'Enviada', concepto: 'Mantenimiento preventivo instalaciones portuarias – Abril 2026',
    fecha: '02/05/2026', fechaVencimiento: '02/06/2026', documento: null,
  },
  {
    id: 'FAC-2026-1038', tipo: 'contratante', contrato: 'CTR-2026-002',
    monto: 7500000, estado: 'Enviada', concepto: 'Suministro e instalación de carpintería metálica – Fase 2',
    fecha: '28/05/2026', fechaVencimiento: '28/06/2026', documento: null,
  },
  {
    id: 'FAC-2026-1044', tipo: 'contratante', contrato: 'CTR-2026-002',
    monto: 12000000, estado: 'Pagada', concepto: 'Obras de impermeabilización y cubierta – Azotea principal',
    fecha: '02/06/2026', fechaVencimiento: '02/07/2026', documento: null,
  },
];

export default function EpFacturacion() {
  const { go } = useApp();
  const [invoices, setInvoices]     = useState(initialInvoices);
  const [providers]                 = useState(initialProviders);
  const [invCtModal, setInvCtModal] = useState(INV_CT_EMPTY);
  const [invPrModal, setInvPrModal] = useState(INV_PR_EMPTY);

  const contratanteInvoices = invoices.filter(inv => inv.tipo === 'contratante');
  const proveedorInvoices   = invoices.filter(inv => inv.tipo === 'proveedor');

  const nextInvoiceId = () => {
    const max = invoices.reduce((m, inv) => Math.max(m, parseInt(inv.id.replace('FAC-2026-', '')) || 0), 1044);
    return `FAC-2026-${max + 1}`;
  };

  // ── CT handlers ──

  const handleSaveCTInvoice = () => {
    const monto = Number(invCtModal.monto.replace?.(/[^0-9]/g, '') ?? invCtModal.monto) || 0;
    if (monto <= 0 || !invCtModal.concepto.trim() || !invCtModal.contratoId) return;
    const today = new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (invCtModal.editId) {
      setInvoices(prev => prev.map(inv => inv.id === invCtModal.editId
        ? { ...inv, monto, concepto: invCtModal.concepto, fechaVencimiento: invCtModal.fechaVencimiento, documento: invCtModal.documento }
        : inv));
    } else {
      setInvoices(prev => [...prev, {
        id: nextInvoiceId(), tipo: 'contratante', contrato: invCtModal.contratoId,
        monto, estado: 'Enviada', concepto: invCtModal.concepto, fecha: today,
        fechaVencimiento: invCtModal.fechaVencimiento, documento: invCtModal.documento,
      }]);
    }
    setInvCtModal(INV_CT_EMPTY);
  };

  const handleOpenEditCTInvoice = (inv) =>
    setInvCtModal({ open: true, editId: inv.id, contratoId: inv.contrato, monto: inv.monto.toString(), concepto: inv.concepto || '', fechaVencimiento: inv.fechaVencimiento || '', documento: inv.documento || null });

  // ── PR handlers ──

  const handleSavePRInvoice = () => {
    const monto = Number(invPrModal.monto.replace?.(/[^0-9]/g, '') ?? invPrModal.monto) || 0;
    if (monto <= 0 || !invPrModal.proveedorId || !invPrModal.contratoId) return;
    const prov  = providers.find(p => p.id === invPrModal.proveedorId);
    const today = invPrModal.fecha || new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (invPrModal.editId) {
      setInvoices(prev => prev.map(inv => inv.id === invPrModal.editId
        ? { ...inv, monto, concepto: invPrModal.concepto, proveedorId: invPrModal.proveedorId, proveedorNombre: prov?.razonSocial || '', fecha: today, fechaVencimiento: invPrModal.fechaVencimiento, documento: invPrModal.documento }
        : inv));
    } else {
      setInvoices(prev => [...prev, {
        id: nextInvoiceId(), tipo: 'proveedor', contrato: invPrModal.contratoId,
        monto, estado: 'Pendiente', concepto: invPrModal.concepto,
        proveedorId: invPrModal.proveedorId, proveedorNombre: prov?.razonSocial || '', fecha: today,
        fechaVencimiento: invPrModal.fechaVencimiento, documento: invPrModal.documento,
      }]);
    }
    setInvPrModal(INV_PR_EMPTY);
  };

  const handleOpenEditPRInvoice = (inv) =>
    setInvPrModal({ open: true, editId: inv.id, contratoId: inv.contrato, proveedorId: inv.proveedorId || '', monto: inv.monto.toString(), concepto: inv.concepto || '', fecha: inv.fecha || '', fechaVencimiento: inv.fechaVencimiento || '', documento: inv.documento || null });

  const handleDeleteInvoice = (id) => setInvoices(prev => prev.filter(inv => inv.id !== id));

  return (
    <AppShell active="epFacturacion" role="empresa-pequena" title="Mis Facturas" sub="Gestión de facturas de todos los contratos activos">
      <div className="fade-in space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Total facturas',  value: invoices.length,                                    Icon: Receipt,   iconBg: '#FFF3E0', color: '#EF7A2C' },
            { label: 'Al contratante',  value: contratanteInvoices.length,                         Icon: Building2, iconBg: '#EFF6FF', color: '#3B82F6' },
            { label: 'De proveedores',  value: proveedorInvoices.length,                           Icon: Truck,     iconBg: '#FDF6E8', color: '#C68A1D' },
            { label: 'Pagadas',         value: invoices.filter(i => i.estado === 'Pagada').length, Icon: BarChart2, iconBg: '#E3F4EA', color: '#2E7D5B' },
          ].map(({ label, value, Icon, iconBg, color }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-text-4 uppercase tracking-wide mb-0.5">{label}</div>
                <div className="text-[22px] font-extrabold leading-none" style={{ color }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Facturas al Contratante */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <SectionHeader icon={Building2} iconBg="#EFF6FF" iconColor="#3B82F6"
            title="Facturas al Contratante"
            subtitle="Facturas emitidas por la PYME al contratante."
            action={<Button variant="primary" onClick={() => setInvCtModal({ ...INV_CT_EMPTY, open: true })}>Nueva Factura</Button>}
          />
          <div className="space-y-3">
            {contratanteInvoices.map(inv => {
              const contract = activeContracts.find(c => c.id === inv.contrato);
              return (
                <div key={inv.id} className="bg-white rounded-[16px] p-4 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: '#EFF6FF' }}>
                      <Building2 className="w-5 h-5" style={{ color: '#3B82F6' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold text-text-1">{inv.id}</span>
                        {inv.documento && (
                          <span className="flex items-center gap-0.5 text-[10px] text-text-4"><Paperclip className="w-3 h-3" /> Doc</span>
                        )}
                      </div>
                      <div className="text-[12px] text-text-3 truncate mb-1">{inv.concepto}</div>
                      {contract && (
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: '#EFF6FF', color: '#3B82F6' }}>{inv.contrato}</span>
                          <span className="text-[12px] font-semibold text-text-2 truncate">{contract.contratante}</span>
                        </div>
                      )}
                      <CTPipeline estado={inv.estado} tipoFactoring={contract?.tipoFactoring || 'inverso'} />
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[15px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
                        <div className="text-[11px] text-text-5 mt-0.5">{inv.fecha}</div>
                      </div>
                      <div className="flex flex-col gap-1 border-l border-border pl-3">
                        <button onClick={() => handleOpenEditCTInvoice(inv)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {contratanteInvoices.length === 0 && (
              <div className="text-[12px] text-text-4 py-6 text-center">No hay facturas al contratante.</div>
            )}
          </div>
        </div>

        {/* Facturas de Proveedores */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <SectionHeader icon={Truck} iconBg="#FDF6E8" iconColor="#C68A1D"
            title="Facturas de Proveedores"
            subtitle="Recibidas de proveedores. Importadas para control interno de pagos."
            action={<Button variant="primary" onClick={() => setInvPrModal({ ...INV_PR_EMPTY, open: true })}>Importar Factura</Button>}
          />
          <div className="space-y-3">
            {proveedorInvoices.map(inv => {
              const contract = activeContracts.find(c => c.id === inv.contrato);
              const estadoStyle =
                inv.estado === 'Pagada'  ? { background: '#E3F4EA', color: '#2E7D5B' } :
                inv.estado === 'Vencida' ? { background: '#FDEEEB', color: '#B8352A' } :
                { background: '#FDF6E8', color: '#C68A1D' };
              return (
                <div key={inv.id} className="bg-white rounded-[16px] p-4 border border-border flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[14px] bg-orange-tint flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-bold text-text-1">{inv.id}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={estadoStyle}>{inv.estado}</span>
                      {inv.documento && (
                        <span className="flex items-center gap-0.5 text-[10px] text-text-4"><Paperclip className="w-3 h-3" /> Doc</span>
                      )}
                    </div>
                    <div className="text-[12px] text-text-3 truncate">{inv.concepto}</div>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {contract && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: '#EFF6FF', color: '#3B82F6' }}>{inv.contrato}</span>
                      )}
                      {inv.proveedorNombre && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: '#FDF6E8', color: '#C68A1D' }}>{inv.proveedorNombre}</span>
                      )}
                    </div>
                    {inv.fechaVencimiento && (
                      <div className="text-[11px] text-text-5 mt-1">Vence: {inv.fechaVencimiento}</div>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[15px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
                      <div className="text-[11px] text-text-5 mt-0.5">{inv.fecha}</div>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-border pl-3">
                      <button onClick={() => handleOpenEditPRInvoice(inv)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {proveedorInvoices.length === 0 && (
              <div className="text-[12px] text-text-4 py-6 text-center">No hay facturas de proveedores importadas.</div>
            )}
          </div>
        </div>

      </div>

      {/* ── Modal: Nueva / Editar factura al Contratante ── */}
      {invCtModal.open && (
        <Modal
          title={invCtModal.editId ? `Editar factura ${invCtModal.editId}` : 'Nueva Factura al Contratante'}
          onClose={() => setInvCtModal(INV_CT_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setInvCtModal(INV_CT_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveCTInvoice}>{invCtModal.editId ? 'Guardar cambios' : 'Crear factura'}</Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <FormGroup label="Contrato" required>
              <Select
                value={invCtModal.contratoId}
                onChange={e => setInvCtModal({ ...invCtModal, contratoId: e.target.value })}
                disabled={!!invCtModal.editId}
              >
                <option value="">Seleccionar contrato…</option>
                {activeContracts.map(c => (
                  <option key={c.id} value={c.id}>{c.id} · {c.contratante}</option>
                ))}
              </Select>
            </FormGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Monto (XAF)" required>
                <Input
                  type="text" inputMode="numeric" placeholder="Ej: 18,000,000"
                  value={invCtModal.monto}
                  onChange={e => setInvCtModal({ ...invCtModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
                />
                {invCtModal.monto && <div className="text-[11px] text-text-4 mt-1">{formatXaf(invCtModal.monto)}</div>}
              </FormGroup>
              <FormGroup label="Fecha de vencimiento">
                <Input type="text" placeholder="DD/MM/AAAA" value={invCtModal.fechaVencimiento} onChange={e => setInvCtModal({ ...invCtModal, fechaVencimiento: e.target.value })} />
              </FormGroup>
            </div>
            <FormGroup label="Concepto" required>
              <Textarea
                value={invCtModal.concepto}
                onChange={e => setInvCtModal({ ...invCtModal, concepto: e.target.value })}
                placeholder="Descripción del servicio o hito facturado…"
              />
            </FormGroup>
            <div>
              <div className="text-[12px] font-medium text-text-3 mb-1.5">Adjuntar documento</div>
              {invCtModal.documento ? (
                <div className="flex items-center gap-2 bg-page-bg rounded-[8px] px-3 py-2 text-[12px] text-text-3 border border-border">
                  <Paperclip className="w-3.5 h-3.5 text-text-4 shrink-0" />
                  <span className="flex-1 truncate">{invCtModal.documento.name}</span>
                  <button onClick={() => setInvCtModal(p => ({ ...p, documento: null }))} className="text-text-4 hover:text-red-text text-[14px] leading-none">×</button>
                </div>
              ) : (
                <label className="flex items-center gap-2 border border-dashed border-border rounded-[8px] px-3 py-2.5 text-[12px] text-text-4 cursor-pointer hover:border-orange/40 hover:bg-orange-tint transition">
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  Seleccionar archivo (PDF, imagen)
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setInvCtModal(p => ({ ...p, documento: { name: file.name, url: URL.createObjectURL(file) } }));
                  }} />
                </label>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Importar / Editar factura de Proveedor ── */}
      {invPrModal.open && (
        <Modal
          title={invPrModal.editId ? `Editar factura ${invPrModal.editId}` : 'Importar Factura de Proveedor'}
          onClose={() => setInvPrModal(INV_PR_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setInvPrModal(INV_PR_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSavePRInvoice}>{invPrModal.editId ? 'Guardar cambios' : 'Importar factura'}</Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="text-[12px] text-text-4">Registra una factura recibida de un proveedor para control interno de pagos.</div>
            <FormGroup label="Contrato" required>
              <Select
                value={invPrModal.contratoId}
                onChange={e => setInvPrModal({ ...invPrModal, contratoId: e.target.value })}
                disabled={!!invPrModal.editId}
              >
                <option value="">Seleccionar contrato…</option>
                {activeContracts.map(c => (
                  <option key={c.id} value={c.id}>{c.id} · {c.contratante}</option>
                ))}
              </Select>
            </FormGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Proveedor" required>
                <Select value={invPrModal.proveedorId} onChange={e => setInvPrModal({ ...invPrModal, proveedorId: e.target.value })}>
                  <option value="">Seleccionar proveedor…</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.razonSocial} · {p.sector}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Monto (XAF)" required>
                <Input
                  type="text" inputMode="numeric" placeholder="Ej: 4,500,000"
                  value={invPrModal.monto}
                  onChange={e => setInvPrModal({ ...invPrModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
                />
                {invPrModal.monto && <div className="text-[11px] text-text-4 mt-1">{formatXaf(invPrModal.monto)}</div>}
              </FormGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Fecha de emisión">
                <Input type="text" placeholder="DD/MM/AAAA" value={invPrModal.fecha} onChange={e => setInvPrModal({ ...invPrModal, fecha: e.target.value })} />
              </FormGroup>
              <FormGroup label="Fecha de vencimiento">
                <Input type="text" placeholder="DD/MM/AAAA" value={invPrModal.fechaVencimiento} onChange={e => setInvPrModal({ ...invPrModal, fechaVencimiento: e.target.value })} />
              </FormGroup>
            </div>
            <FormGroup label="Concepto">
              <Textarea
                value={invPrModal.concepto}
                onChange={e => setInvPrModal({ ...invPrModal, concepto: e.target.value })}
                placeholder="Descripción del servicio o producto facturado…"
              />
            </FormGroup>
            <div>
              <div className="text-[12px] font-medium text-text-3 mb-1.5">Adjuntar documento</div>
              {invPrModal.documento ? (
                <div className="flex items-center gap-2 bg-page-bg rounded-[8px] px-3 py-2 text-[12px] text-text-3 border border-border">
                  <Paperclip className="w-3.5 h-3.5 text-text-4 shrink-0" />
                  <span className="flex-1 truncate">{invPrModal.documento.name}</span>
                  <button onClick={() => setInvPrModal(p => ({ ...p, documento: null }))} className="text-text-4 hover:text-red-text text-[14px] leading-none">×</button>
                </div>
              ) : (
                <label className="flex items-center gap-2 border border-dashed border-border rounded-[8px] px-3 py-2.5 text-[12px] text-text-4 cursor-pointer hover:border-orange/40 hover:bg-orange-tint transition">
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  Seleccionar archivo (PDF, imagen)
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setInvPrModal(p => ({ ...p, documento: { name: file.name, url: URL.createObjectURL(file) } }));
                  }} />
                </label>
              )}
            </div>
          </div>
        </Modal>
      )}

    </AppShell>
  );
}
