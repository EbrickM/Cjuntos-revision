import { useState } from 'react';
import { Pencil, Trash2, Building2, Package, Truck, Cpu, Wrench, Zap, HardHat, Leaf, ShoppingCart, Settings } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';

const SECTORES = ['Energía', 'Construcción', 'Manufactura', 'Transporte', 'Tecnología', 'Servicios', 'Alimentación', 'Minería', 'Agricultura', 'Comercio', 'Materiales', 'Otro'];

const SECTOR_ICONS = {
  Materiales:   Package,
  Transporte:   Truck,
  Tecnología:   Cpu,
  Servicios:    Wrench,
  Energía:      Zap,
  Construcción: HardHat,
  Minería:      HardHat,
  Manufactura:  Settings,
  Agricultura:  Leaf,
  Alimentación: ShoppingCart,
  Comercio:     ShoppingCart,
};

const MODAL_EMPTY = { open: false, editId: null, razonSocial: '', nombreComercial: '', ruc: '', sector: 'Materiales', telefono: '', correo: '' };

const initialProviders = [
  { id: 'p1', razonSocial: 'Cemex GE',      nombreComercial: 'Cemex GE',   ruc: 'GE-2019-00123', sector: 'Materiales', email: 'ventas@cemex.gq',    telefono: '+240 222 111 222', contratos: 0 },
  { id: 'p2', razonSocial: 'TransGE S.L.',  nombreComercial: 'TransGE',    ruc: 'GE-2020-00445', sector: 'Transporte', email: 'info@transge.gq',    telefono: '+240 222 333 444', contratos: 1 },
  { id: 'p3', razonSocial: 'ServTec GE',    nombreComercial: 'ServTec GE', ruc: 'GE-2022-00112', sector: 'Tecnología', email: 'soporte@servtec.gq', telefono: '+240 222 777 888', contratos: 0 },
];

export default function EpMisProveedores() {
  const { go } = useApp();
  const [providers, setProviders] = useState(initialProviders);
  const [modal, setModal]         = useState(MODAL_EMPTY);
  const [toast, setToast]         = useState({ visible: false, message: '' });

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 4500);
  };

  const asociados   = providers.filter(p => p.contratos > 0).length;
  const noAsociados = providers.filter(p => p.contratos === 0).length;

  const handleOpenNew  = () => setModal({ ...MODAL_EMPTY, open: true });
  const handleOpenEdit = (p) => setModal({ open: true, editId: p.id, razonSocial: p.razonSocial, nombreComercial: p.nombreComercial, ruc: p.ruc, sector: p.sector, telefono: p.telefono, correo: p.email });
  const handleClose    = () => setModal(MODAL_EMPTY);

  const handleSave = () => {
    if (!modal.razonSocial.trim()) return;
    if (modal.editId) {
      setProviders(prev => prev.map(p => p.id === modal.editId
        ? { ...p, razonSocial: modal.razonSocial, nombreComercial: modal.nombreComercial, ruc: modal.ruc, sector: modal.sector, telefono: modal.telefono, email: modal.correo }
        : p));
      showToast(`${modal.razonSocial} ha sido actualizado correctamente.`);
    } else {
      const newId = `p${Math.max(...providers.map(p => Number(p.id.replace('p', ''))), 0) + 1}`;
      setProviders(prev => [...prev, { id: newId, razonSocial: modal.razonSocial, nombreComercial: modal.nombreComercial, ruc: modal.ruc, sector: modal.sector, email: modal.correo, telefono: modal.telefono, contratos: 0 }]);
      showToast(`${modal.razonSocial} ha sido añadido al directorio de proveedores.`);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    const p = providers.find(pr => pr.id === id);
    setProviders(prev => prev.filter(pr => pr.id !== id));
    showToast(`${p?.razonSocial} ha sido eliminado del directorio.`);
  };

  return (
    <AppShell active="epProveedores" role="empresa-pequena" title="Mis Proveedores" sub="Directorio de proveedores">
      <div className="fade-in space-y-5">

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: providers.length, label: 'Proveedores registrados',           cls: 'text-text-1'     },
            { value: asociados,        label: 'Asociados a contratos',              cls: 'text-orange'     },
            { value: noAsociados,      label: 'No asociados a contratos',           cls: 'text-text-4'     },
          ].map(({ value, label, cls }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4">
              <div className={`text-[32px] font-extrabold leading-none mb-1 ${cls}`}>{value}</div>
              <div className="text-[12px] text-text-4">{label}</div>
            </div>
          ))}
        </div>

        {/* Lista */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="text-[14px] font-bold">Directorio</div>
              <div className="text-[12px] text-text-4">Todos los proveedores registrados en tu cuenta.</div>
            </div>
            <Button variant="primary" onClick={handleOpenNew}>Nuevo proveedor</Button>
          </div>

          <div className="space-y-3">
            {providers.map(p => {
              const SectorIcon = SECTOR_ICONS[p.sector] ?? Building2;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-[16px] p-4 border border-border flex items-start gap-4 transition-all duration-200 hover:scale-[1.015] hover:border-orange/40 cursor-default"
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
                >
                  {/* Icono sector */}
                  <div className="w-12 h-12 rounded-[14px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
                    <SectorIcon className="w-5 h-5 text-orange" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                      <span className="text-[14px] font-bold text-text-1">{p.razonSocial}</span>
                      {p.nombreComercial && p.nombreComercial !== p.razonSocial && (
                        <span className="text-[11px] text-text-5">· {p.nombreComercial}</span>
                      )}
                    </div>
                    <div className="text-[12px] text-text-4 mb-2">
                      <span className="font-mono">{p.ruc}</span>
                      <span className="mx-1.5 text-text-5">·</span>
                      <span className="font-medium">{p.sector}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-[11px] text-text-5">
                      {p.email    && <span>✉ {p.email}</span>}
                      {p.telefono && <span>📞 {p.telefono}</span>}
                    </div>
                  </div>

                  {/* Contratos + acciones */}
                  <div className="shrink-0 flex items-start gap-3">
                    <div className="text-right min-w-[52px]">
                      <div className={`text-[22px] font-extrabold leading-tight ${p.contratos > 0 ? 'text-orange' : 'text-text-5'}`}>
                        {p.contratos}
                      </div>
                      <div className="text-[10px] font-semibold text-text-5 uppercase tracking-wide">
                        {p.contratos === 1 ? 'contrato' : 'contratos'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-border pl-3">
                      <button onClick={() => handleOpenEdit(p)} className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {providers.length === 0 && (
              <div className="text-[12px] text-text-4 py-8 text-center">No hay proveedores registrados aún.</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal nuevo / editar proveedor */}
      {modal.open && (
        <Modal
          title={modal.editId ? 'Editar proveedor' : 'Nuevo proveedor'}
          onClose={handleClose}
          footer={
            <>
              <Button variant="ghost"   onClick={handleClose}>Cancelar</Button>
              <Button variant="primary" onClick={handleSave}>
                {modal.editId ? 'Guardar cambios' : 'Guardar proveedor'}
              </Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="text-[12px] text-text-4">
              {modal.editId ? 'Modifica los datos del proveedor.' : 'Registra un nuevo proveedor en tu directorio. Podrás asignarlo a distribuciones de crédito en cualquier momento.'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormGroup label="Razón Social" required>
                <Input value={modal.razonSocial} onChange={e => setModal({ ...modal, razonSocial: e.target.value })} placeholder="Nombre legal exacto" />
              </FormGroup>
              <FormGroup label="Nombre Comercial">
                <Input value={modal.nombreComercial} onChange={e => setModal({ ...modal, nombreComercial: e.target.value })} placeholder="Nombre comercial o marca" />
              </FormGroup>
              <FormGroup label="RUC / NIF" required>
                <Input value={modal.ruc} onChange={e => setModal({ ...modal, ruc: e.target.value })} placeholder="Ej: GE-2024-00123" />
              </FormGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormGroup label="Sector Productivo" required>
                <Select value={modal.sector} onChange={e => setModal({ ...modal, sector: e.target.value })}>
                  <option value="">Seleccionar…</option>
                  {SECTORES.map(s => <option key={s}>{s}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Teléfono">
                <Input value={modal.telefono} onChange={e => setModal({ ...modal, telefono: e.target.value })} placeholder="+240 222 000 000" />
              </FormGroup>
              <FormGroup label="Correo" required>
                <Input type="email" value={modal.correo} onChange={e => setModal({ ...modal, correo: e.target.value })} placeholder="correo@empresa.gq" />
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      <div className={`fixed bottom-6 right-6 z-50 w-[340px] bg-white rounded-[14px] shadow-xl border border-border p-4 flex items-start gap-3 transition-all duration-300 ease-out
        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      >
        <div className="w-8 h-8 rounded-[8px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
          <Building2 className="w-4 h-4 text-orange" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-text-1 mb-0.5">Directorio actualizado</div>
          <div className="text-[12px] text-text-4 leading-snug">{toast.message}</div>
        </div>
      </div>
    </AppShell>
  );
}
