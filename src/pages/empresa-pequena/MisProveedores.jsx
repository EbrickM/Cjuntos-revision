import { useState, useEffect } from 'react';
import {
  Pencil, Trash2, Building2, FileText, Search, ChevronRight,
  CheckCircle2, ShieldCheck, Star, ClipboardList,
} from 'lucide-react';
import { localDb } from '../../lib/localDb';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InfoRow from '../../components/ui/InfoRow';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';
import { fmt } from './epData';
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

const KYC_SUB = {
  vigente:   'Documentación al día',
  pendiente: 'Pendiente de verificación',
  vencido:   'Requiere renovación',
};

const numContratos = (p) => (p.contratosActivos ?? []).length;

const ModalLabel = ({ text, Icon }) => (
  <div className="flex items-center gap-2 mb-3">
    {Icon && (
      <div className="bona-gradient-bg w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-white" />
      </div>
    )}
    <span className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">{text}</span>
  </div>
);

const ComplianceItem = ({ label, value, sub, Icon, iconBg, iconColor }) => (
  <div className="rounded-[12px] border border-border p-4">
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div>
        <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">{label}</div>
        <div className="text-[13px] font-bold leading-tight" style={{ color: iconColor }}>{value}</div>
      </div>
    </div>
    <div className="text-[11px] text-text-4 leading-snug">{sub}</div>
  </div>
);


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
    esClienteBonafide: false, kyc: 'vigente', scoreCredito: 780,
    contratosActivos: [
      { id: 'CT-2026-0041', contratante: 'Constructora Malabo S.A.', objeto: 'Suministro de cemento y áridos para obra', asignado: 26_000_000, utilizado: 26_000_000 },
    ],
  },
  {
    id: 'p2', razonSocial: 'TransGE S.L.', nombreComercial: 'TransGE',
    ruc: 'GE-2020-00445', sector: 'Transporte', email: 'info@transge.gq', telefono: '+240 222 333 444',
    esClienteBonafide: true, kyc: 'vigente', scoreCredito: 645,
    contratosActivos: [],
  },
  {
    id: 'p3', razonSocial: 'ServTec GE', nombreComercial: 'ServTec GE',
    ruc: 'GE-2022-00112', sector: 'Tecnología', email: 'soporte@servtec.gq', telefono: '+240 222 777 888',
    esClienteBonafide: false, kyc: 'pendiente', scoreCredito: 510,
    contratosActivos: [],
  },
  {
    id: 'p4', razonSocial: 'Agroindustrial Bata', nombreComercial: 'Agrobata',
    ruc: 'GE-2018-00981', sector: 'Agricultura', email: 'contacto@agrobata.gq', telefono: '+240 222 101 202',
    esClienteBonafide: true, kyc: 'vigente', scoreCredito: 710,
    contratosActivos: [
      { id: 'CT-2026-0059', contratante: 'TotalEnerGE S.A.', objeto: 'Suministro de insumos alimentarios para campamento', asignado: 12_000_000, utilizado: 9_000_000 },
      { id: 'CT-2026-0072', contratante: 'Evans Construction & Engineering S.A.', objeto: 'Provisión de víveres para obra', asignado: 8_000_000, utilizado: 3_200_000 },
    ],
  },
  {
    id: 'p5', razonSocial: 'Constructora Malabo Norte', nombreComercial: 'Conmalnor',
    ruc: 'GE-2017-00456', sector: 'Construcción', email: 'info@conmalnor.gq', telefono: '+240 222 303 404',
    esClienteBonafide: false, kyc: 'vencido', scoreCredito: 420,
    contratosActivos: [
      { id: 'CT-2026-0041', contratante: 'Constructora Malabo S.A.', objeto: 'Movimiento de tierras y estructura', asignado: 21_500_000, utilizado: 21_500_000 },
    ],
  },
  {
    id: 'p6', razonSocial: 'Minera Río Muni', nombreComercial: 'MinRíoMuni',
    ruc: 'GE-2015-00223', sector: 'Minería', email: 'ventas@minriomuni.gq', telefono: '+240 222 505 606',
    esClienteBonafide: false, kyc: 'pendiente', scoreCredito: 560,
    contratosActivos: [],
  },
  {
    id: 'p7', razonSocial: 'Alimentos del Golfo', nombreComercial: 'AlimGolfo',
    ruc: 'GE-2021-00778', sector: 'Alimentación', email: 'pedidos@alimgolfo.gq', telefono: '+240 222 707 808',
    esClienteBonafide: true, kyc: 'vigente', scoreCredito: 690,
    contratosActivos: [
      { id: 'CT-2026-0059', contratante: 'TotalEnerGE S.A.', objeto: 'Catering para personal offshore', asignado: 15_000_000, utilizado: 11_000_000 },
      { id: 'CT-2026-0068', contratante: 'Constructora Malabo S.A.', objeto: 'Suministro de alimentos para comedor de obra', asignado: 6_500_000, utilizado: 2_000_000 },
      { id: 'CT-2026-0077', contratante: 'Evans Construction & Engineering S.A.', objeto: 'Víveres para fase de acabados', asignado: 4_200_000, utilizado: 900_000 },
    ],
  },
  {
    id: 'p8', razonSocial: 'Comercial Ebebiyín', nombreComercial: 'ComEbe',
    ruc: 'GE-2019-00334', sector: 'Comercio', email: 'info@comebe.gq', telefono: '+240 222 909 010',
    esClienteBonafide: false, kyc: 'vigente', scoreCredito: 615,
    contratosActivos: [
      { id: 'CT-2026-0068', contratante: 'Constructora Malabo S.A.', objeto: 'Compra de consumibles de ferretería', asignado: 3_800_000, utilizado: 1_500_000 },
    ],
  },
  {
    id: 'p9', razonSocial: 'Manufacturas Bioko', nombreComercial: 'ManufBioko',
    ruc: 'GE-2016-00667', sector: 'Manufactura', email: 'contacto@manufbioko.gq', telefono: '+240 222 111 313',
    esClienteBonafide: false, kyc: 'pendiente', scoreCredito: null,
    contratosActivos: [],
  },
  {
    id: 'p10', razonSocial: 'Servicios Integrales GE', nombreComercial: 'SIGE',
    ruc: 'GE-2020-00889', sector: 'Servicios', email: 'admin@sige.gq', telefono: '+240 222 212 414',
    esClienteBonafide: true, kyc: 'vigente', scoreCredito: 735,
    contratosActivos: [
      { id: 'CT-2026-0059', contratante: 'TotalEnerGE S.A.', objeto: 'Servicios de limpieza y mantenimiento', asignado: 9_600_000, utilizado: 7_200_000 },
      { id: 'CT-2026-0077', contratante: 'Evans Construction & Engineering S.A.', objeto: 'Seguridad y vigilancia de obra', asignado: 5_400_000, utilizado: 1_800_000 },
    ],
  },
  {
    id: 'p11', razonSocial: 'Energía Solar Bata', nombreComercial: 'EnerSolBata',
    ruc: 'GE-2022-00990', sector: 'Energía', email: 'info@enersolbata.gq', telefono: '+240 222 515 616',
    esClienteBonafide: false, kyc: 'vigente', scoreCredito: 680,
    contratosActivos: [
      { id: 'CT-2026-0041', contratante: 'Constructora Malabo S.A.', objeto: 'Instalación de paneles solares en obra', asignado: 18_000_000, utilizado: 6_000_000 },
    ],
  },
  {
    id: 'p12', razonSocial: 'Transportes Litoral', nombreComercial: 'TransLitoral',
    ruc: 'GE-2018-00112', sector: 'Transporte', email: 'ops@translitoral.gq', telefono: '+240 222 717 818',
    esClienteBonafide: false, kyc: 'vencido', scoreCredito: 395,
    contratosActivos: [],
  },
  {
    id: 'p13', razonSocial: 'Materiales del Este', nombreComercial: 'MatEste',
    ruc: 'GE-2019-00556', sector: 'Materiales', email: 'ventas@mateste.gq', telefono: '+240 222 919 020',
    esClienteBonafide: true, kyc: 'vigente', scoreCredito: 660,
    contratosActivos: [
      { id: 'CT-2026-0072', contratante: 'Evans Construction & Engineering S.A.', objeto: 'Suministro de acero y perfiles', asignado: 14_500_000, utilizado: 10_000_000 },
    ],
  },
  {
    id: 'p14', razonSocial: 'Tech Solutions Malabo', nombreComercial: 'TechSol',
    ruc: 'GE-2023-00121', sector: 'Tecnología', email: 'hola@techsol.gq', telefono: '+240 222 121 232',
    esClienteBonafide: false, kyc: 'pendiente', scoreCredito: 590,
    contratosActivos: [],
  },
  {
    id: 'p15', razonSocial: 'Construcciones Annobón', nombreComercial: 'ConAnnobón',
    ruc: 'GE-2017-00789', sector: 'Construcción', email: 'contacto@conannobon.gq', telefono: '+240 222 323 434',
    esClienteBonafide: false, kyc: 'vigente', scoreCredito: 705,
    contratosActivos: [
      { id: 'CT-2026-0059', contratante: 'TotalEnerGE S.A.', objeto: 'Hormigonado de plataformas', asignado: 11_000_000, utilizado: 11_000_000 },
      { id: 'CT-2026-0068', contratante: 'Constructora Malabo S.A.', objeto: 'Albañilería de interiores', asignado: 7_500_000, utilizado: 3_000_000 },
    ],
  },
];


export default function EpMisProveedores() {
  const [providers, setProviders] = useState(() => localDb.get('ep_providers', initialProviders, 4));
  const [modal, setModal]         = useState(MODAL_EMPTY);
  const [detalle, setDetalle]     = useState(null);
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
  const conContratos     = providers.filter(p => numContratos(p) > 0).length;

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
        contratosActivos: [], esClienteBonafide: modal.esClienteBonafide, kyc: modal.kyc, scoreCredito: score,
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
        <div className="rounded-[14px] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-[14px] font-bold text-text-1">Directorio</div>
              <div className="text-[12px] text-text-4">Todos los proveedores registrados en tu cuenta.</div>
            </div>
            <div className="relative w-full sm:w-auto">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedProviders.map((p, idx) => {
              const kycStyle = KYC_BADGE[p.kyc] ?? KYC_BADGE.pendiente;
              const sStyle   = scoreStyle(p.scoreCredito);
              return (
                <div key={p.id}
                  onClick={() => setDetalle(p)}
                  className="bg-white rounded-[16px] p-5 flex flex-col gap-4 card-enter cursor-pointer transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)]"
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
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-text-4">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>{numContratos(p)} {numContratos(p) === 1 ? 'contrato' : 'contratos'}</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={e => { e.stopPropagation(); handleOpenEdit(p); }}
                                className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                                className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setDetalle(p); }}
                      className="ml-auto w-fit flex items-center gap-0.5 text-[11px] font-semibold text-orange-dark hover:opacity-75 transition cursor-pointer"
                    >
                      Ver detalles <ChevronRight className="w-3.5 h-3.5" />
                    </button>
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

      {/* Modal detalle de proveedor */}
      {detalle && (() => {
        const p        = detalle;
        const kycStyle = KYC_BADGE[p.kyc] ?? KYC_BADGE.pendiente;
        const sStyle   = scoreStyle(p.scoreCredito);
        return (
          <Modal
            wide
            title={p.razonSocial}
            onClose={() => setDetalle(null)}
            footer={
              <>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setDetalle(null)}>Cerrar</Button>
                <Button variant="primary" size="sm" onClick={() => { setDetalle(null); handleOpenEdit(p); }}>Editar proveedor</Button>
              </>
            }
          >
            <div className="space-y-6">

              {/* Hero */}
              <div className="flex items-center gap-4 p-4 rounded-[12px]" style={{ background: '#F8F7F5' }}>
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--bonafide-gradient)' }}>
                  <img src={isotipoBlanco} alt="" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold text-text-1 leading-snug">{p.razonSocial}</p>
                  <p className="text-[12px] text-text-4">{p.nombreComercial || '—'} · {p.sector}</p>
                  <p className="text-[11px] font-mono mt-0.5 text-text-4">{p.ruc}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: kycStyle.bg, color: kycStyle.color, border: kycStyle.border }}>
                    {kycStyle.label}
                  </span>
                  {p.esClienteBonafide && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: '#FDEEEB', color: '#E0201C', border: '1px solid rgba(224,32,28,0.2)' }}>
                      Cliente Bonafide
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.color}22` }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sStyle.color }} />
                    Riesgo {sStyle.label}
                  </span>
                </div>
              </div>

              {/* Score crediticio */}
              <div className="rounded-[12px] border border-border p-4">
                <ModalLabel text="Score crediticio" Icon={ShieldCheck} />
                <div className="flex items-end gap-4 mb-3">
                  <span className="text-[42px] font-extrabold leading-none" style={{ color: sStyle.color }}>{p.scoreCredito ?? '—'}</span>
                  <div className="pb-1">
                    <p className="text-[13px] font-bold" style={{ color: sStyle.color }}>
                      {p.scoreCredito ? `Riesgo ${sStyle.label}` : 'Sin datos'}
                    </p>
                    <p className="text-[11px] text-text-4">sobre 1000 puntos</p>
                  </div>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                  <div className="h-full rounded-full" style={{ width: `${(p.scoreCredito ?? 0) / 10}%`, background: sStyle.color }} />
                </div>
                <div className="flex justify-between text-[10px] mt-1.5 text-text-4">
                  <span>0 — Alto riesgo</span><span>1000 — Bajo riesgo</span>
                </div>
              </div>

              {/* Datos de identidad */}
              <div>
                <ModalLabel text="Datos de Identidad" Icon={Building2} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Razón Social"      value={p.razonSocial} />
                  <InfoRow label="Nombre Comercial"  value={p.nombreComercial} />
                  <InfoRow label="RUC / NIF"         value={p.ruc} />
                  <InfoRow label="Sector Productivo" value={p.sector} />
                  <InfoRow label="Teléfono"          value={p.telefono} />
                  <InfoRow label="Correo"            value={p.email} />
                </div>
              </div>

              {/* Estado & Compliance */}
              <div>
                <ModalLabel text="Estado & Compliance" Icon={CheckCircle2} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ComplianceItem label="KYC"        value={kycStyle.label.replace('KYC ', '')} sub={KYC_SUB[p.kyc] ?? KYC_SUB.pendiente} Icon={CheckCircle2} iconBg={kycStyle.bg} iconColor={kycStyle.color} />
                  <ComplianceItem label="Riesgo"     value={p.scoreCredito ?? 'Sin datos'}       sub={p.scoreCredito ? `Riesgo ${sStyle.label}` : 'Score no calculado'} Icon={ShieldCheck} iconBg={sStyle.bg} iconColor={sStyle.color} />
                  <ComplianceItem label="Contratos"  value={numContratos(p)}                      sub="Contratos activos vinculados" Icon={FileText} iconBg="#FFF3E0" iconColor="#EF7A2C" />
                  <ComplianceItem label="Bonafide"   value={p.esClienteBonafide ? 'Sí' : 'No'}    sub="Opera como cliente en el ecosistema" Icon={Star} iconBg={p.esClienteBonafide ? '#FDEEEB' : '#F6F5F3'} iconColor={p.esClienteBonafide ? '#E0201C' : '#A9A6A1'} />
                </div>
              </div>

              {/* Contratos activos */}
              <div>
                <ModalLabel text={`Contratos activos (${numContratos(p)})`} Icon={ClipboardList} />
                {numContratos(p) === 0 ? (
                  <p className="text-[12px] text-text-4 text-center py-4">Sin contratos activos</p>
                ) : (
                  <div className="space-y-2">
                    {p.contratosActivos.map(c => {
                      const pct  = Math.round((c.utilizado / c.asignado) * 100);
                      const barC = pct > 90 ? '#B8352A' : pct > 70 ? '#C68A1D' : '#2E7D5B';
                      return (
                        <div key={c.id} className="flex items-center gap-4 p-3.5 rounded-[12px] border border-border">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[12px] font-bold text-text-1 font-mono">{c.id}</span>
                              <Badge variant="green">Activo</Badge>
                            </div>
                            <p className="text-[11px] truncate text-text-4">{c.objeto}</p>
                            <p className="text-[11px] text-text-5 mt-0.5">{c.contratante}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[13px] font-extrabold text-text-1">{fmt(c.asignado)} XAF</p>
                            <p className="text-[10px] font-semibold" style={{ color: barC }}>{pct}% utilizado</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </Modal>
        );
      })()}

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
