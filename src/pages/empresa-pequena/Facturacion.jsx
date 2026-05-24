import { useState } from 'react';
import { Pencil, Trash2, Building2, Truck } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select, Textarea } from '../../components/ui/FormGroup';

const formatXaf = (v) => `XAF ${new Intl.NumberFormat('en-US').format(Number(v) || 0)}`;

const INVOICE_MODAL_EMPTY = { open: false, editId: null, type: 'contratante', contratoId: '', monto: '', concepto: '', proveedorId: '' };

// Contratos activos (paso 4) con sus distribuciones de proveedores
const activeContracts = [
  {
    id: 'CTR-2026-002',
    contratante: 'Evans Construction & Engineering S.A.',
    distribucion: [
      { providerId: 'p2', providerName: 'TransGE S.L.', providerSector: 'Transporte', monto: 9000000 },
    ],
  },
  {
    id: 'CTR-2026-005',
    contratante: 'Autoridad Portuaria de Bata S.A.',
    distribucion: [],
  },
];

const providers = [
  { id: 'p1', razonSocial: 'Cemex GE' },
  { id: 'p2', razonSocial: 'TransGE S.L.' },
  { id: 'p3', razonSocial: 'ServTec GE' },
];

const initialInvoices = [
  { id: 'FAC-2026-1025', tipo: 'proveedor',   contrato: 'CTR-2026-002', proveedorId: 'p2', proveedor: 'TransGE S.L.', monto: 4500000,  estado: 'Enviada',  concepto: 'Transporte de materiales al sitio de obra',      fecha: '01/05/2026' },
  { id: 'FAC-2026-1031', tipo: 'contratante', contrato: 'CTR-2026-002', monto: 18000000, estado: 'Pagada',  concepto: 'Avance de obra fase 1 – Cimentación y estructura', fecha: '10/05/2026' },
  { id: 'FAC-2026-1036', tipo: 'contratante', contrato: 'CTR-2026-005', monto: 6500000,  estado: 'Pendiente', concepto: 'Mantenimiento preventivo instalaciones portuarias – Abril 2026', fecha: '02/05/2026' },
];

export default function EpFacturacion() {
  const { go } = useApp();
  const [invoices, setInvoices]       = useState(initialInvoices);
  const [invoiceModal, setInvoiceModal] = useState(INVOICE_MODAL_EMPTY);

  const contratanteInvoices = invoices.filter(inv => inv.tipo === 'contratante');
  const proveedorInvoices   = invoices.filter(inv => inv.tipo === 'proveedor');

  const nextInvoiceId = () => {
    const max = invoices.reduce((m, inv) => Math.max(m, parseInt(inv.id.replace('FAC-2026-', '')) || 0), 1036);
    return `FAC-2026-${max + 1}`;
  };

  const getProviderMaxMonto = (contratoId, proveedorId) => {
    const contract = activeContracts.find(c => c.id === contratoId);
    return contract?.distribucion.filter(d => d.providerId === proveedorId).reduce((s, d) => s + d.monto, 0) ?? 0;
  };

  const getContractProviders = (contratoId) =>
    activeContracts.find(c => c.id === contratoId)?.distribucion.filter(d => d.providerId) ?? [];

  const handleOpenNew = (type) => {
    const firstContrato = activeContracts[0]?.id || '';
    const firstProvider = activeContracts.find(c => c.id === firstContrato)?.distribucion.find(d => d.providerId)?.providerId || '';
    setInvoiceModal({ open: true, editId: null, type, contratoId: firstContrato, monto: '', concepto: '', proveedorId: firstProvider });
  };

  const handleOpenEdit = (inv) =>
    setInvoiceModal({ open: true, editId: inv.id, type: inv.tipo, contratoId: inv.contrato, monto: inv.monto.toString(), concepto: inv.concepto || '', proveedorId: inv.proveedorId || '' });

  const handleSave = () => {
    const monto = Number(invoiceModal.monto.replace?.(/[^0-9]/g, '') ?? invoiceModal.monto) || 0;
    if (monto <= 0 || !invoiceModal.concepto.trim() || !invoiceModal.contratoId) return;
    const prov    = providers.find(p => p.id === invoiceModal.proveedorId);
    const today   = new Date().toLocaleDateString('es-GQ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (invoiceModal.editId) {
      setInvoices(prev => prev.map(inv => inv.id === invoiceModal.editId
        ? { ...inv, monto, concepto: invoiceModal.concepto, contrato: invoiceModal.contratoId, proveedorId: invoiceModal.proveedorId || null, proveedor: prov?.razonSocial || inv.proveedor }
        : inv));
    } else {
      setInvoices(prev => [...prev, {
        id: nextInvoiceId(),
        tipo: invoiceModal.type,
        contrato: invoiceModal.contratoId,
        monto,
        estado: 'Pendiente',
        concepto: invoiceModal.concepto,
        fecha: today,
        ...(invoiceModal.type === 'proveedor' ? { proveedorId: invoiceModal.proveedorId, proveedor: prov?.razonSocial || '' } : {}),
      }]);
    }
    setInvoiceModal(INVOICE_MODAL_EMPTY);
  };

  const handleDelete = (id) => setInvoices(prev => prev.filter(inv => inv.id !== id));

  const InvoiceCard = ({ inv }) => {
    const contract = activeContracts.find(c => c.id === inv.contrato);
    return (
      <div
        className="bg-white rounded-[16px] p-4 border border-border flex items-start gap-4 transition-all duration-200 hover:scale-[1.015] hover:border-orange/40 cursor-default"
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.18)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
      >
        <div className="w-12 h-12 rounded-[14px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
          {inv.tipo === 'contratante' ? <Building2 className="w-5 h-5 text-orange" /> : <Truck className="w-5 h-5 text-orange" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[13px] font-bold text-text-1">{inv.id}</span>
            <Badge variant={inv.estado === 'Pagada' ? 'green' : inv.estado === 'Enviada' ? 'blue' : 'yellow'}>{inv.estado}</Badge>
          </div>
          <div className="text-[12px] text-text-3 truncate mb-1">{inv.concepto}</div>
          {inv.tipo === 'proveedor' && inv.proveedor && (
            <div className="text-[11px] text-text-5">{inv.proveedor}</div>
          )}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] font-semibold text-orange bg-orange-tint px-2 py-0.5 rounded-full border border-orange/20">{inv.contrato}</span>
            {contract && <span className="text-[11px] text-text-5 truncate">· {contract.contratante}</span>}
          </div>
        </div>
        <div className="shrink-0 flex items-start gap-3">
          <div className="text-right">
            <div className="text-[15px] font-extrabold text-text-1">{formatXaf(inv.monto)}</div>
            <div className="text-[11px] text-text-5 mt-0.5">{inv.fecha}</div>
          </div>
          <div className="flex flex-col gap-1 border-l border-border pl-3">
            <button onClick={() => handleOpenEdit(inv)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell active="epFacturacion" role="empresa-pequena" title="Mis Facturas" sub="Gestión de facturas de todos los contratos activos">
      <div className="fade-in space-y-5">

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: invoices.length,            label: 'Total de facturas',         cls: 'text-text-1'    },
            { value: contratanteInvoices.length, label: 'Facturas del contratante',  cls: 'text-blue-text' },
            { value: proveedorInvoices.length,   label: 'Facturas de proveedores',   cls: 'text-orange'    },
          ].map(({ value, label, cls }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4">
              <div className={`text-[32px] font-extrabold leading-none mb-1 ${cls}`}>{value}</div>
              <div className="text-[12px] text-text-4">{label}</div>
            </div>
          ))}
        </div>

        {/* Lista agrupada */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="text-[14px] font-bold">Facturas</div>
              <div className="text-[12px] text-text-4">Todas las facturas de tus contratos activos.</div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => handleOpenNew('contratante')}>Nueva Factura al Contratante</Button>
              <Button variant="primary" onClick={() => handleOpenNew('proveedor')}>Factura a Proveedor</Button>
            </div>
          </div>

          {invoices.length === 0 && (
            <div className="text-[12px] text-text-4 py-8 text-center">No hay facturas registradas aún.</div>
          )}

          {contratanteInvoices.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] mb-2.5">Al contratante</div>
              <div className="space-y-3">
                {contratanteInvoices.map(inv => <InvoiceCard key={inv.id} inv={inv} />)}
              </div>
            </div>
          )}

          {proveedorInvoices.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-text-5 uppercase tracking-[1px] mb-2.5">A proveedores</div>
              <div className="space-y-3">
                {proveedorInvoices.map(inv => <InvoiceCard key={inv.id} inv={inv} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal nueva / editar factura */}
      {invoiceModal.open && (() => {
        const isEdit      = !!invoiceModal.editId;
        const isProv      = invoiceModal.type === 'proveedor';
        const autoId      = isEdit ? invoiceModal.editId : nextInvoiceId();
        const contProvs   = getContractProviders(invoiceModal.contratoId);
        const maxMonto    = isProv && invoiceModal.proveedorId ? getProviderMaxMonto(invoiceModal.contratoId, invoiceModal.proveedorId) : null;

        return (
          <Modal
            title={isEdit ? `Editar factura ${invoiceModal.editId}` : (isProv ? 'Nueva factura a proveedor' : 'Nueva factura al contratante')}
            onClose={() => setInvoiceModal(INVOICE_MODAL_EMPTY)}
            footer={
              <>
                <Button variant="ghost" onClick={() => setInvoiceModal(INVOICE_MODAL_EMPTY)}>Cancelar</Button>
                <Button variant="primary" onClick={handleSave}>{isEdit ? 'Guardar cambios' : 'Crear factura'}</Button>
              </>
            }
            wide
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup label="Nº de factura">
                  <Input value={autoId} disabled />
                </FormGroup>
                <FormGroup label="Contrato" required>
                  <Select
                    value={invoiceModal.contratoId}
                    onChange={e => setInvoiceModal({ ...invoiceModal, contratoId: e.target.value, proveedorId: '' })}
                    disabled={isEdit}
                  >
                    <option value="">Seleccionar contrato…</option>
                    {activeContracts.map(c => (
                      <option key={c.id} value={c.id}>{c.id} · {c.contratante}</option>
                    ))}
                  </Select>
                </FormGroup>
              </div>

              {isProv ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="Proveedor" required>
                    <Select
                      value={invoiceModal.proveedorId}
                      onChange={e => setInvoiceModal({ ...invoiceModal, proveedorId: e.target.value, monto: '' })}
                    >
                      <option value="">Seleccionar proveedor…</option>
                      {contProvs.map(d => (
                        <option key={d.providerId} value={d.providerId}>{d.providerName} · {d.providerSector}</option>
                      ))}
                    </Select>
                    {invoiceModal.contratoId && contProvs.length === 0 && (
                      <div className="text-[11px] text-yellow-text mt-1">Este contrato no tiene distribuciones con proveedor asignado.</div>
                    )}
                  </FormGroup>
                  <FormGroup label="Monto (XAF)" required>
                    <Input
                      type="text" inputMode="numeric" placeholder="Ej: 4,500,000"
                      value={invoiceModal.monto}
                      onChange={e => setInvoiceModal({ ...invoiceModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
                    />
                    {maxMonto !== null && (
                      <div className={`text-[11px] mt-1 ${Number(invoiceModal.monto) > maxMonto ? 'text-red-text font-semibold' : 'text-text-4'}`}>
                        Máximo asignable: {formatXaf(maxMonto)}
                        {Number(invoiceModal.monto) > maxMonto && ' — supera el monto otorgado'}
                      </div>
                    )}
                    {invoiceModal.monto && Number(invoiceModal.monto) <= (maxMonto ?? Infinity) && (
                      <div className="text-[11px] text-text-4 mt-1">{formatXaf(invoiceModal.monto)}</div>
                    )}
                  </FormGroup>
                </div>
              ) : (
                <FormGroup label="Monto (XAF)" required>
                  <Input
                    type="text" inputMode="numeric" placeholder="Ej: 18,000,000"
                    value={invoiceModal.monto}
                    onChange={e => setInvoiceModal({ ...invoiceModal, monto: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                  {invoiceModal.monto && <div className="text-[11px] text-text-4 mt-1">{formatXaf(invoiceModal.monto)}</div>}
                </FormGroup>
              )}

              <FormGroup label="Concepto" required>
                <Textarea
                  value={invoiceModal.concepto}
                  onChange={e => setInvoiceModal({ ...invoiceModal, concepto: e.target.value })}
                  placeholder="Descripción del servicio o trabajo facturado…"
                />
              </FormGroup>
            </div>
          </Modal>
        );
      })()}
    </AppShell>
  );
}
