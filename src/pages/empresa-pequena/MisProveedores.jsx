import { useState, useEffect } from 'react';
import {
  Pencil, Trash2, Building2, FileText, Search,
} from 'lucide-react';
import { localDb } from '../../lib/localDb';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import isotipoBlanco from '../../assets/isotipo-blanco.webp';

const SECTORES = ['Energía', 'Construcción', 'Manufactura', 'Transporte', 'Tecnología', 'Servicios', 'Alimentación', 'Minería', 'Agricultura', 'Comercio', 'Materiales', 'Otro'];

const KYC_BADGE = {
  vigente:   { label: 'KYC Vigente',   bg: '#E3F4EA', color: '#2E7D5B', border: '1px solid #A8D5BE'              },
  pendiente: { label: 'KYC Pendiente', bg: '#FDF6E8', color: '#C68A1D', border: '1px solid rgba(198,138,29,.3)'  },
  vencido:   { label: 'KYC Vencido',   bg: '#FDEEEB', color: '#B8352A', border: '1px solid rgba(184,53,42,.3)'   },
};

const scoreStyle = (score) => {
  if (!score) return { bg: '#F6F5F3', color: '#A9A6A1', label: 'Sin datos' };
  if (score >= 750) return { bg: '#E3F4EA', color: '#2E7D5B', label: 'Bajo'     };
  if (score >= 600) return { bg: '#FDF6E8', color: '#C68A1D', label: 'Moderado' };
  return               { bg: '#FDEEEB', color: '#B8352A', label: 'Alto'     };
};


const MODAL_EMPTY = {
  open: false, editId: null,
  razonSocial: '', nombreComercial: '', ruc: '', sector: 'Materiales',
  telefono: '', correo: '', esClienteBonafide: false, kyc: 'pendiente', scoreCredito: '',
};

// 15 proveedores mock — usados para probar el scroll infinito (pageSize 10):
// las primeras 10 cards se ven de una sola carga y las 5 restantes aparecen
// al llegar al final, con un loader que simula la llamada a backend.
const initialProviders = [
  {
    id: 'p1', razonSocial: 'Cemex GE', nombreComercial: 'Cemex GE',
    ruc: 'GE-2019-00123', sector: 'Materiales', email: 'ventas@cemex.gq', telefono: '+240 222 111 222',
    contratos: 1, esClienteBonafide: false, kyc: 'vigente', scoreCredito: 780,
  },
  {
    id: 'p2', razonSocial: 'TransGE S.L.', nombreComercial: 'TransGE',
    ruc: 'GE-2020-00445', sector: 'Transporte', email: 'info@transge.gq', telefono: '+240 222 333 444',
    contratos: 0, esClienteBonafide: true, kyc: 'vigente', scoreCredito: 645,
  },
  {
    id: 'p3', razonSocial: 'ServTec GE', nombreComercial: 'ServTec GE',
    ruc: 'GE-2022-00112', sector: 'Tecnología', email: 'soporte@servtec.gq', telefono: '+240 222 777 888',
    contratos: 0, esClienteBonafide: false, kyc: 'pendiente', scoreCredito: 510,
  },
  {
    id: 'p4', razonSocial: 'Agroindustrial Bata', nombreComercial: 'Agrobata',
    ruc: 'GE-2018-00981', sector: 'Agricultura', email: 'contacto@agrobata.gq', telefono: '+240 222 101 202',
    contratos: 2, esClienteBonafide: true, kyc: 'vigente', scoreCredito: 710,
  },
  {
    id: 'p5', razonSocial: 'Constructora Malabo Norte', nombreComercial: 'Conmalnor',
    ruc: 'GE-2017-00456', sector: 'Construcción', email: 'info@conmalnor.gq', telefono: '+240 222 303 404',
    contratos: 1, esClienteBonafide: false, kyc: 'vencido', scoreCredito: 420,
  },
  {
    id: 'p6', razonSocial: 'Minera Río Muni', nombreComercial: 'MinRíoMuni',
    ruc: 'GE-2015-00223', sector: 'Minería', email: 'ventas@minriomuni.gq', telefono: '+240 222 505 606',
    contratos: 0, esClienteBonafide: false, kyc: 'pendiente', scoreCredito: 560,
  },
  {
    id: 'p7', razonSocial: 'Alimentos del Golfo', nombreComercial: 'AlimGolfo',
    ruc: 'GE-2021-00778', sector: 'Alimentación', email: 'pedidos@alimgolfo.gq', telefono: '+240 222 707 808',
    contratos: 3, esClienteBonafide: true, kyc: 'vigente', scoreCredito: 690,
  },
  {
    id: 'p8', razonSocial: 'Comercial Ebebiyín', nombreComercial: 'ComEbe',
    ruc: 'GE-2019-00334', sector: 'Comercio', email: 'info@comebe.gq', telefono: '+240 222 909 010',
    contratos: 1, esClienteBonafide: false, kyc: 'vigente', scoreCredito: 615,
  },
  {
    id: 'p9', razonSocial: 'Manufacturas Bioko', nombreComercial: 'ManufBioko',
    ruc: 'GE-2016-00667', sector: 'Manufactura', email: 'contacto@manufbioko.gq', telefono: '+240 222 111 313',
    contratos: 0, esClienteBonafide: false, kyc: 'pendiente', scoreCredito: null,
  },
  {
    id: 'p10', razonSocial: 'Servicios Integrales GE', nombreComercial: 'SIGE',
    ruc: 'GE-2020-00889', sector: 'Servicios', email: 'admin@sige.gq', telefono: '+240 222 212 414',
    contratos: 2, esClienteBonafide: true, kyc: 'vigente', scoreCredito: 735,
  },
  {
    id: 'p11', razonSocial: 'Energía Solar Bata', nombreComercial: 'EnerSolBata',
    ruc: 'GE-2022-00990', sector: 'Energía', email: 'info@enersolbata.gq', telefono: '+240 222 515 616',
    contratos: 1, esClienteBonafide: false, kyc: 'vigente', scoreCredito: 680,
  },
  {
    id: 'p12', razonSocial: 'Transportes Litoral', nombreComercial: 'TransLitoral',
    ruc: 'GE-2018-00112', sector: 'Transporte', email: 'ops@translitoral.gq', telefono: '+240 222 717 818',
    contratos: 0, esClienteBonafide: false, kyc: 'vencido', scoreCredito: 395,
  },
  {
    id: 'p13', razonSocial: 'Materiales del Este', nombreComercial: 'MatEste',
    ruc: 'GE-2019-00556', sector: 'Materiales', email: 'ventas@mateste.gq', telefono: '+240 222 919 020',
    contratos: 1, esClienteBonafide: true, kyc: 'vigente', scoreCredito: 660,
  },
  {
    id: 'p14', razonSocial: 'Tech Solutions Malabo', nombreComercial: 'TechSol',
    ruc: 'GE-2023-00121', sector: 'Tecnología', email: 'hola@techsol.gq', telefono: '+240 222 121 232',
    contratos: 0, esClienteBonafide: false, kyc: 'pendiente', scoreCredito: 590,
  },
  {
    id: 'p15', razonSocial: 'Construcciones Annobón', nombreComercial: 'ConAnnobón',
    ruc: 'GE-2017-00789', sector: 'Construcción', email: 'contacto@conannobon.gq', telefono: '+240 222 323 434',
    contratos: 2, esClienteBonafide: false, kyc: 'vigente', scoreCredito: 705,
  },
];


export default function EpMisProveedores() {
  const [providers, setProviders] = useState(() => localDb.get('ep_providers', initialProviders, 3));
  const [modal, setModal]         = useState(MODAL_EMPTY);
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState({ visible: false, message: '' });

  useEffect(() => { localDb.set('ep_providers', providers); }, [providers]);

  const filteredProviders = search.trim()
    ? providers.filter(p =>
        p.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
        (p.nombreComercial || '').toLowerCase().includes(search.toLowerCase()) ||
        p.ruc.toLowerCase().includes(search.toLowerCase()) ||
        p.sector.toLowerCase().includes(search.toLowerCase())
      )
    : providers;

  // Delay solo de prueba, para ver el loader funcionando con estos 15 mocks —
  // en el resto de pantallas (y cuando esto se conecte a un backend real) el
  // delay se deja en 0 para no meter una espera artificial desde el frontend.
  const { visibleItems: pagedProviders, hasMore, loading, sentinelRef } =
    useInfiniteScroll(filteredProviders, { pageSize: 10, delay: 900, resetKey: search });

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 4500);
  };

  const kycVigentes      = providers.filter(p => p.kyc === 'vigente').length;
  const clientesBonafide = providers.filter(p => p.esClienteBonafide).length;
  const conContratos     = providers.filter(p => p.contratos > 0).length;

  const handleOpenNew  = () => setModal({ ...MODAL_EMPTY, open: true });
  const handleOpenEdit = (p) => setModal({
    open: true, editId: p.id,
    razonSocial: p.razonSocial, nombreComercial: p.nombreComercial, ruc: p.ruc,
    sector: p.sector, telefono: p.telefono, correo: p.email,
    esClienteBonafide: p.esClienteBonafide ?? false,
    kyc: p.kyc ?? 'pendiente',
    scoreCredito: p.scoreCredito?.toString() ?? '',
  });
  const handleClose = () => setModal(MODAL_EMPTY);

  const handleSave = () => {
    if (!modal.razonSocial.trim()) return;
    const score = modal.scoreCredito ? parseInt(modal.scoreCredito, 10) || null : null;
    if (modal.editId) {
      setProviders(prev => prev.map(p => p.id === modal.editId
        ? { ...p, razonSocial: modal.razonSocial, nombreComercial: modal.nombreComercial, ruc: modal.ruc, sector: modal.sector, telefono: modal.telefono, email: modal.correo, esClienteBonafide: modal.esClienteBonafide, kyc: modal.kyc, scoreCredito: score }
        : p));
      showToast(`${modal.razonSocial} ha sido actualizado correctamente.`);
    } else {
      const newId = `p${Math.max(...providers.map(p => Number(p.id.replace('p', ''))), 0) + 1}`;
      setProviders(prev => [...prev, {
        id: newId, razonSocial: modal.razonSocial, nombreComercial: modal.nombreComercial,
        ruc: modal.ruc, sector: modal.sector, email: modal.correo, telefono: modal.telefono,
        contratos: 0, esClienteBonafide: modal.esClienteBonafide, kyc: modal.kyc, scoreCredito: score,
      }]);
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
    <AppShell active="epProveedores" role="empresa-pequena" title="Mis Proveedores" sub="Directorio de proveedores" back>
      <div className="fade-in space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { value: providers.length, label: 'Proveedores registrados' },
            { value: clientesBonafide, label: 'Clientes Bonafide' },
            { value: kycVigentes,      label: 'KYC Vigentes' },
            { value: conContratos,     label: 'Con contratos activos' },
          ].map(({ value, label }) => (
            <StatCard key={label} label={label} value={value} tone="gradient" />
          ))}
        </div>

        {/* Directorio */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-[14px] font-bold text-text-1">Directorio</div>
              <div className="text-[12px] text-text-4">Todos los proveedores registrados en tu cuenta.</div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto order-first sm:order-last" onClick={handleOpenNew}>Nuevo proveedor</Button>
              <div className="relative w-full sm:w-auto order-last sm:order-first">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar proveedor…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-9 pl-8 pr-3 w-full sm:w-56 text-[12px] rounded-[10px] border border-border bg-page-bg focus:outline-none focus:border-orange/50 transition placeholder:text-text-4"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedProviders.map((p, idx) => {
              const kycStyle = KYC_BADGE[p.kyc] ?? KYC_BADGE.pendiente;
              const sStyle   = scoreStyle(p.scoreCredito);
              return (
                <div key={p.id}
                  className="bg-white rounded-[16px] p-5 flex flex-col gap-4 card-enter transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)]"
                  style={{ animationDelay: `${idx * 70}ms` }}
                >
                  {/* Icono + nombre + sector + RUC | Score (esquina sup. der.) */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--bonafide-gradient)' }}>
                      <img src={isotipoBlanco} alt="" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-bold text-text-1 leading-tight truncate">{p.razonSocial}</div>
                      <div className="text-[11px] text-text-4 mt-0.5">{p.sector}</div>
                      <div className="text-[11px] font-mono text-text-5 mt-0.5">{p.ruc}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[9px] font-semibold uppercase tracking-wide text-text-4">Score</div>
                      <div className="text-[18px] font-extrabold leading-tight" style={{ color: sStyle.color }}>
                        {p.scoreCredito ?? '—'}
                      </div>
                    </div>
                  </div>

                  {/* Badges: Cliente Bonafide + KYC + Riesgo */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.esClienteBonafide && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: '#FDEEEB', color: '#E0201C', border: '1px solid rgba(224,32,28,0.2)' }}>
                        Cliente Bonafide
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: kycStyle.bg, color: kycStyle.color, border: kycStyle.border }}>
                      {kycStyle.label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.color}22` }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sStyle.color }} />
                      Riesgo {sStyle.label}
                    </span>
                  </div>

                  {/* Footer: contratos (izq) + acciones (der) */}
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-text-4">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>{p.contratos} {p.contratos === 1 ? 'contrato' : 'contratos'}</span>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                              className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProviders.length === 0 && (
              <div className="col-span-full text-[12px] text-text-4 py-10 text-center">
                {search.trim() ? `Sin resultados para "${search}".` : 'No hay proveedores registrados aún.'}
              </div>
            )}

            <InfiniteScrollSentinel sentinelRef={sentinelRef} loading={loading} hasMore={hasMore} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Estado KYC">
                <Select value={modal.kyc} onChange={e => setModal({ ...modal, kyc: e.target.value })}>
                  <option value="pendiente">Pendiente</option>
                  <option value="vigente">Vigente</option>
                  <option value="vencido">Vencido</option>
                </Select>
              </FormGroup>
              <FormGroup label="Score crediticio">
                <Input
                  type="text" inputMode="numeric" placeholder="Ej: 720"
                  value={modal.scoreCredito}
                  onChange={e => setModal({ ...modal, scoreCredito: e.target.value.replace(/[^0-9]/g, '') })}
                />
                {modal.scoreCredito && (
                  <div className="text-[11px] mt-1" style={{ color: scoreStyle(parseInt(modal.scoreCredito)).color }}>
                    {scoreStyle(parseInt(modal.scoreCredito)).label}
                  </div>
                )}
              </FormGroup>
            </div>

            {/* Toggle Cliente Bonafide */}
            <button
              type="button"
              onClick={() => setModal({ ...modal, esClienteBonafide: !modal.esClienteBonafide })}
              className="flex items-center gap-3 w-full rounded-[10px] border px-4 py-3 transition-all"
              style={{
                borderColor: modal.esClienteBonafide ? 'rgba(224,32,28,0.35)' : '#ECEAE7',
                background:  modal.esClienteBonafide ? '#FFF3E0' : '#F6F5F3',
              }}
            >
              <div className="w-9 h-5 rounded-full flex items-center transition-all shrink-0 px-0.5"
                   style={{ background: modal.esClienteBonafide ? '#E0201C' : '#A9A6A1' }}>
                <div className="w-4 h-4 rounded-full bg-white shadow transition-transform"
                     style={{ transform: modal.esClienteBonafide ? 'translateX(16px)' : 'translateX(0)' }} />
              </div>
              <div className="text-left">
                <div className="text-[13px] font-semibold text-text-1">Cliente Bonafide</div>
                <div className="text-[11px] text-text-4">Este proveedor también opera como cliente dentro del ecosistema Bonafide.</div>
              </div>
            </button>
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
