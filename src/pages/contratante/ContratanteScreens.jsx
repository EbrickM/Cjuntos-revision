import { useState, useRef, useEffect } from 'react';
import {
  ChevronRight, CheckCircle, CheckCircle2, Clock, Zap, Building2,
  Users, Receipt, User, Mail, FileText, ShieldCheck,
  TrendingUp, FilePlus, CreditCard, FileCheck, Camera, Shield,
  Leaf, AlertCircle, Star, ClipboardList, ArrowUpRight, Search, ListFilter, X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import FormGroup, { Input } from '../../components/ui/FormGroup';
import Modal from '../../components/ui/Modal';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const RED    = '#E0201C';
const ORA    = '#EF7A2C';
const GREEN  = '#2E7D5B';
const WARN   = '#C68A1D';
const ERR    = '#B8352A';
const TEXT4  = '#A9A6A1';
const BORDER = '#ECEAE7';
const BLUE   = '#3B82F6';

const fmt = n => new Intl.NumberFormat('de-DE').format(n);

// ── Helpers de Perfil (idénticos al PYME) ─────────────────────────────────────
const HeroBadge = ({ label, value, Icon, bg, color }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-[12px]" style={{ background: bg }}>
    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-white/60">
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-text-4 mb-0.5">{label}</div>
      <div className="text-[14px] font-extrabold leading-none" style={{ color }}>{value}</div>
    </div>
  </div>
);

const SectionHeader = ({ title, sub, Icon, right }) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div className="flex items-start gap-3">
      <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-text-1">{title}</div>
        {sub && <div className="text-[12px] text-text-4">{sub}</div>}
      </div>
    </div>
    {right}
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

// ── Modal de verificación IPI (misma estética que OTPModal de login) ──────────
const IpiVerificacionModal = ({ factura, onClose, onConfirm }) => {
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [timer, setTimer]         = useState(60);
  const [canResend, setCanResend] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    const iv = setInterval(() => setTimer(p => {
      if (p <= 1) { clearInterval(iv); setCanResend(true); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, []);

  const handleChange = (i, val) => {
    if (val.length > 1 || !/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const handlePaste = e => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(p)) return;
    setOtp([...p.split(''), ...Array(6 - p.length).fill('')]);
    refs.current[Math.min(p.length, 5)]?.focus();
  };
  const handleResend = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']); setTimer(60); setCanResend(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bona-gradient-shadow w-full max-w-md rounded-2xl p-[2px]">
        <div className="bg-white rounded-2xl p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5 text-text-3" />
          </button>
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #EF7A2C, #E0201C)' }}>
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-1 mb-1">Código enviado</h2>
            <p className="text-sm text-text-3">
              Ingresa el código de 6 dígitos enviado a{' '}
              <span className="font-semibold text-text-1">info@totalenerge.gq</span>
            </p>
            {factura && (
              <p className="text-[11px] mt-1.5 font-mono" style={{ color: TEXT4 }}>
                {factura.id} · {fmt(factura.monto)} XAF
              </p>
            )}
          </div>
          <div className="flex gap-2 mb-6 justify-center">
            {otp.map((digit, i) => (
              <input key={i}
                ref={el => (refs.current[i] = el)}
                type="text" inputMode="numeric" maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="w-11 h-12 text-center text-xl font-bold border-2 border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition"
              />
            ))}
          </div>
          <Button onClick={() => onConfirm(otp.join(''))} full disabled={otp.join('').length !== 6} className="mb-4 h-[48px]">
            Verificar código
          </Button>
          <div className="flex justify-end">
            <button onClick={handleResend} disabled={!canResend}
              className={`text-sm font-medium transition-colors ${canResend ? 'text-orange cursor-pointer hover:underline' : 'text-text-4 cursor-not-allowed'}`}>
              {canResend ? 'Reenviar código' : `Reenviar (${timer}s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Datos ─────────────────────────────────────────────────────────────────────
const contratos = [
  { id: 'CT-2026-0041', pyme: 'Const. Silva Ltd.', ini: 'CS', sector: 'Construcción', asignado: 180_000_000, utilizado: 120_000_000, facturas: 5, estado: 'Activo',
    objeto: 'Construcción de sede corporativa en el Paseo Luba, Malabo — estructura, instalaciones y acabados interiores.', fechaInicio: '01/03/2026', fechaFin: '28/02/2027', plazo: '12 meses' },
];

// 2 facturas sobre CT-2026-0041 · suma: 47 500 000 XAF
const facturas = [
  { id: 'FAC-2026-0911', contrato: 'CT-2026-0041', pyme: 'Const. Silva Ltd.', monto: 21_500_000, fecha: '28/06/2026', estado: 'Recibida', concepto: 'Obras de estructura fase 2 — planta baja y primer piso' },
  { id: 'FAC-2026-0918', contrato: 'CT-2026-0041', pyme: 'Const. Silva Ltd.', monto: 26_000_000, fecha: '05/07/2026', estado: 'Recibida', concepto: 'Acabados interiores y carpintería — módulos A y B' },
];

const pymes = [
  { ini: 'CS', nombre: 'Const. Silva Ltd.', sector: 'Construcción', contratos: 1, montoTotal: 180_000_000, score: 820, semaforo: 'Verde',
    nombreComercial: 'Construsilva GE', ruc: 'GE-2018-04512', telefono: '+240 222 301 458', correo: 'info@constsilva.gq',
    repNombre: 'Carlos Silva Mba',      repTipoDoc: 'DNI', repId: 'GE-19820314-CS', repCargo: 'Gerente General', repTel: '+240 551 120 001', repCorreo: 'c.silva@constsilva.gq' },
];

const misSolicitudes = [
  { id: 'SOL-2026-0142', tipo: 'Nuevo contrato', desc: 'Contrato con ConstCentro PYME · Construcción', monto: 50_000_000, fecha: '01/07/2026', estado: 'En revisión' },
];

const solicitudesPymes = [
  { id: 'SOLP-2026-0051', ini: 'CC', pyme: 'ConstCentro PYME', sector: 'Construcción',  desc: 'Obras de infraestructura vial — Bata Norte',    monto: 95_000_000, fecha: '05/07/2026' },
  { id: 'SOLP-2026-0048', ini: 'AS', pyme: 'AgroSur GE S.L.',  sector: 'Agroindustria', desc: 'Suministro productos agrícolas — campaña 2026', monto: 60_000_000, fecha: '03/07/2026' },
  { id: 'SOLP-2026-0044', ini: 'TM', pyme: 'TechMalabo Ltd.',  sector: 'Tecnología',    desc: 'Mantenimiento sistemas TI corporativos',        monto: 35_000_000, fecha: '28/06/2026' },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────
const facturaBadge = e => ({ 'Recibida': 'orange', 'En revisión': 'yellow', 'Verificada': 'blue', 'IPI emitido': 'green', 'Pagada': 'green' }[e] ?? 'gray');
const solicBadge   = e => ({ 'En revisión': 'yellow', 'Aprobada': 'green', 'Rechazada': 'red' }[e] ?? 'gray');
const semBadge     = s => s === 'Verde' ? 'green' : s === 'Amarillo' ? 'yellow' : 'red';
const semColor     = s => s === 'Verde' ? GREEN : s === 'Amarillo' ? WARN : ERR;
const scoreColor   = n => n >= 750 ? GREEN : n >= 500 ? WARN : ERR;

// ── InfoRow (igual que en PYME) ───────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div>
    <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">{label}</div>
    <div className="text-[13px] text-text-1">{value || '—'}</div>
  </div>
);

// ── Ini Avatar ────────────────────────────────────────────────────────────────
const IniAvatar = ({ ini, size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg, ${RED}, ${ORA})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: size * 0.36 }}>
    {ini}
  </div>
);

// ── MIS CONTRATOS ─────────────────────────────────────────────────────────────
let _selectedContrato = contratos[0];

export function EmpContratos() {
  const { go } = useApp();
  const [busqueda, setBusqueda] = useState('');

  const totalAsignado   = contratos.reduce((a, c) => a + c.asignado,  0);
  const totalUtilizado  = contratos.reduce((a, c) => a + c.utilizado, 0);
  const totalDisponible = totalAsignado - totalUtilizado;
  const activos         = contratos.filter(c => c.estado === 'Activo').length;

  const filtrados = contratos.filter(c =>
    !busqueda ||
    c.pyme.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.id.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.sector.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <AppShell active="empContratos" role="contratante" title="Mis Contratos" sub="Contratos activos con Bonafide">
      <div className="fade-in space-y-5">

        {/* KPI cards — compactas, sin acción */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { lbl: 'Contratos Activos',    val: String(activos),              Icon: ClipboardList, iconBg: '#FFF3E0', iconColor: ORA   },
            { lbl: 'Fondo Total Asignado', val: `${fmt(totalAsignado)} XAF`,  Icon: TrendingUp,   iconBg: '#FDEEEB', iconColor: RED   },
            { lbl: 'Utilizado',            val: `${fmt(totalUtilizado)} XAF`,  Icon: CreditCard,   iconBg: '#FDF6E8', iconColor: WARN  },
            { lbl: 'Disponible',           val: `${fmt(totalDisponible)} XAF`, Icon: CheckCircle,  iconBg: '#E3F4EA', iconColor: GREEN },
          ].map(({ lbl, val, Icon, iconBg, iconColor }) => (
            <div key={lbl} className="card-lift card-enter bg-white rounded-[12px] border border-border p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{lbl}</p>
                {val.endsWith(' XAF') ? (
                  <>
                    <p className="text-[12px] sm:text-[14px] font-extrabold text-text-1 leading-tight">{val.slice(0, -4)}</p>
                    <p className="text-[9px] font-semibold leading-tight" style={{ color: TEXT4 }}>XAF</p>
                  </>
                ) : (
                  <p className="text-[14px] font-extrabold text-text-1 leading-tight">{val}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Buscador + botón */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-text-1">Contratos</p>
            <p className="text-[11px]" style={{ color: TEXT4 }}>Distribución, utilización y facturas por contrato</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar contrato, PYME…"
                className="w-full pl-8 pr-3 py-2 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
              />
            </div>
            <Button variant="primary" size="sm" onClick={() => window.open('/solicitar-contrato', '_blank')}>
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />Nueva solicitud
            </Button>
          </div>
        </div>

        {/* Cards de contratos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(c => {
            const pct  = Math.round((c.utilizado / c.asignado) * 100);
            const bar  = pct > 90 ? ERR : pct > 70 ? WARN : GREEN;
            const disp = c.asignado - c.utilizado;
            return (
              <div key={c.id} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <IniAvatar ini={c.ini} size={44} />
                    <div>
                      <p className="text-[13px] font-bold text-text-1 leading-snug">{c.pyme}</p>
                      <p className="text-[10px] font-mono" style={{ color: TEXT4 }}>{c.id}</p>
                      <p className="text-[11px]" style={{ color: TEXT4 }}>{c.sector}</p>
                    </div>
                  </div>
                  <Badge variant={c.estado === 'Activo' ? 'green' : 'gray'}>{c.estado}</Badge>
                </div>

                {/* Utilización */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="font-semibold" style={{ color: TEXT4 }}>Utilizado</span>
                    <span className="font-bold" style={{ color: bar }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: BORDER }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bar }} />
                  </div>
                  <div className="flex justify-between text-[10px]" style={{ color: TEXT4 }}>
                    <span>{fmt(c.utilizado)} XAF usados</span>
                    <span>{fmt(c.asignado)} XAF total</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-page-bg rounded-[10px] p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Disponible</p>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                      <div>
                        <p className="text-[13px] font-extrabold leading-tight" style={{ color: GREEN }}>{fmt(disp)}</p>
                        <p className="text-[9px] font-semibold leading-tight" style={{ color: TEXT4 }}>XAF</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-page-bg rounded-[10px] p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Facturas</p>
                    <div className="flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 shrink-0" style={{ color: ORA }} />
                      <p className="text-[15px] font-extrabold leading-none" style={{ color: ORA }}>{c.facturas}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-1 flex justify-end">
                  <button
                    onClick={() => { _selectedContrato = c; go('empContratoDetalle'); }}
                    className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 cursor-pointer transition"
                    style={{ color: ORA }}
                  >
                    Ver contrato <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtrados.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center gap-2" style={{ color: TEXT4 }}>
              <Search className="w-8 h-8" />
              <p className="text-[13px] font-semibold">Sin resultados para "{busqueda}"</p>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}

// ── MIS FACTURAS ──────────────────────────────────────────────────────────────
const FILTROS_FAC = ['Todas', 'Recibidas', 'Verificadas', 'Pagadas'];

export function EmpFacturas() {
  const [filtro, setFiltro]             = useState('Todas');
  const [facturaModal, setFacturaModal] = useState(null);
  const [ipiStep, setIpiStep]           = useState(null);
  const [estadoMap, setEstadoMap]       = useState({});

  const facturasVivas = facturas.map(f => ({ ...f, estado: estadoMap[f.id] ?? f.estado }));

  const filtered = filtro === 'Todas'      ? facturasVivas
    : filtro === 'Recibidas'               ? facturasVivas.filter(f => f.estado === 'Recibida' || f.estado === 'En revisión')
    : filtro === 'Verificadas'             ? facturasVivas.filter(f => f.estado === 'Verificada' || f.estado === 'IPI emitido')
    : facturasVivas.filter(f => f.estado === 'Pagada');

  const pendientes  = facturasVivas.filter(f => f.estado === 'Recibida').length;
  const verificadas = facturasVivas.filter(f => f.estado === 'Verificada').length;
  const totalMonto  = facturasVivas.reduce((a, f) => a + f.monto, 0);

  const modalFac = facturaModal ? (facturasVivas.find(f => f.id === facturaModal.id) ?? facturaModal) : null;

  const closeModal         = () => { setFacturaModal(null); setIpiStep(null); };
  const handleVerificar    = () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Verificada' })); closeModal(); };
  const handleEnviarCodigo = () => setIpiStep('codigo');
  const handleConfirmarIPI = () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'IPI emitido' })); closeModal(); };

  return (
    <AppShell active="empFacturas" role="contratante" title="Mis Facturas" sub="Facturas emitidas por PYMEs contratadas">
      <div className="fade-in space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { lbl: 'Total facturas',     val: String(facturasVivas.length), Icon: Receipt,    iconBg: '#FFF3E0', iconColor: ORA   },
            { lbl: 'Pendientes validar', val: String(pendientes),           Icon: Clock,      iconBg: '#FDF6E8', iconColor: WARN  },
            { lbl: 'Listas para IPI',    val: String(verificadas),          Icon: FileCheck,  iconBg: '#EFF6FF', iconColor: BLUE  },
            { lbl: 'Monto total',        val: `${fmt(totalMonto)} XAF`,     Icon: TrendingUp, iconBg: '#E3F4EA', iconColor: GREEN },
          ].map(({ lbl, val, Icon, iconBg, iconColor }) => (
            <div key={lbl} className="card-lift card-enter bg-white rounded-[12px] border border-border p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{lbl}</p>
                {val.endsWith(' XAF') ? (
                  <>
                    <p className="text-[12px] sm:text-[14px] font-extrabold text-text-1 leading-tight">{val.slice(0, -4)}</p>
                    <p className="text-[9px] font-semibold leading-tight" style={{ color: TEXT4 }}>XAF</p>
                  </>
                ) : (
                  <p className="text-[14px] font-extrabold text-text-1 leading-tight">{val}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="overflow-x-auto max-w-full">
        <div className="flex gap-1 bg-page-bg p-1 rounded-xl w-fit min-w-max">
          {FILTROS_FAC.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filtro === f ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
              }`}>{f}
            </button>
          ))}
        </div>
        </div>

        {/* Cards de facturas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(f => {
            const hasAction = f.estado === 'Recibida' || f.estado === 'Verificada';
            return (
              <div key={f.id} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-mono font-bold text-text-1">{f.id}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: TEXT4 }}>{f.fecha}</p>
                  </div>
                  <Badge variant={facturaBadge(f.estado)}>{f.estado}</Badge>
                </div>

                {/* PYME + Contrato */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                    <Users className="w-4 h-4" style={{ color: ORA }} />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-text-1 leading-snug">{f.pyme}</p>
                    <p className="text-[10px] font-mono" style={{ color: TEXT4 }}>{f.contrato}</p>
                  </div>
                </div>

                {/* Monto */}
                <div className="bg-page-bg rounded-[10px] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Monto</p>
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                    <p className="text-[15px] font-extrabold leading-none truncate" style={{ color: GREEN }}>
                      {fmt(f.monto)} <span className="text-[10px] font-semibold" style={{ color: GREEN }}>XAF</span>
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-1 flex items-center justify-between">
                  {hasAction ? (
                    <span className="text-[9px] font-semibold flex items-center gap-1" style={{ color: WARN }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: WARN }} />
                      Acción requerida
                    </span>
                  ) : <span />}
                  <button
                    onClick={() => { setFacturaModal(f); setIpiStep(null);}}
                    className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 cursor-pointer transition"
                    style={{ color: ORA }}
                  >
                    Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

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
            <div className="flex items-center justify-between">
              <Badge variant={facturaBadge(modalFac.estado)}>{modalFac.estado}</Badge>
              <span className="text-[12px]" style={{ color: TEXT4 }}>{modalFac.fecha}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow label="Nº Factura"  value={modalFac.id} />
              <InfoRow label="PYME"        value={modalFac.pyme} />
              <InfoRow label="Contrato"    value={modalFac.contrato} />
              <InfoRow label="Monto"       value={`${fmt(modalFac.monto)} XAF`} />
              <InfoRow label="Fecha"       value={modalFac.fecha} />
              <InfoRow label="Concepto"    value={modalFac.concepto} />
            </div>
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

// ── PYMEs ─────────────────────────────────────────────────────────────────────
export function EmpPymes() {
  const [busqueda, setBusqueda] = useState('');
  const [pymeModal, setPymeModal] = useState(null);

  const verde    = pymes.filter(p => p.semaforo === 'Verde').length;
  const amarillo = pymes.filter(p => p.semaforo === 'Amarillo').length;
  const rojo     = pymes.filter(p => p.semaforo === 'Rojo').length;

  const filtradas = busqueda.trim()
    ? pymes.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sector.toLowerCase().includes(busqueda.toLowerCase())
      )
    : pymes;

  return (
    <AppShell active="empPymes" role="contratante" title="PYMEs" sub="Empresas con contrato activo">
      <div className="fade-in space-y-5">

        {/* KPIs de semáforo de riesgo */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { lbl: 'Riesgo bajo',  val: verde,    Icon: CheckCircle, iconBg: '#E3F4EA', iconColor: GREEN },
            { lbl: 'Riesgo medio', val: amarillo, Icon: AlertCircle, iconBg: '#FDF6E8', iconColor: WARN  },
            { lbl: 'Riesgo alto',  val: rojo,     Icon: AlertCircle, iconBg: '#FDEEEB', iconColor: ERR   },
          ].map(({ lbl, val, Icon, iconBg, iconColor }) => (
            <div key={lbl} className="card-lift card-enter bg-white rounded-[12px] border border-border p-2 sm:p-3 flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-[8px] sm:rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: iconColor }} />
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-[8px] sm:text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{lbl}</p>
                <p className="text-[13px] sm:text-[14px] font-extrabold leading-tight" style={{ color: iconColor }}>
                  {val} <span className="text-[9px] sm:text-[10px] font-semibold">PYME{val !== 1 ? 's' : ''}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Header + buscador */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-text-1">PYMEs contratadas</p>
            <p className="text-[11px]" style={{ color: TEXT4 }}>Score crediticio, fondo asignado y semáforo de riesgo</p>
          </div>
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar PYME o sector…"
              className="w-full pl-8 pr-3 py-2 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
            />
          </div>
        </div>

        {/* Grid de PYMEs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map(p => (
            <div key={p.nombre} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <IniAvatar ini={p.ini} size={44} />
                  <div>
                    <p className="text-[13px] font-bold text-text-1 leading-snug">{p.nombre}</p>
                    <p className="text-[11px]" style={{ color: TEXT4 }}>{p.sector}</p>
                  </div>
                </div>
                <Badge variant={semBadge(p.semaforo)}>{p.semaforo}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-page-bg rounded-[10px] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Contratos</p>
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 shrink-0" style={{ color: ORA }} />
                    <p className="text-[15px] font-extrabold leading-none" style={{ color: ORA }}>{p.contratos}</p>
                  </div>
                </div>
                <div className="bg-page-bg rounded-[10px] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Fondo</p>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 shrink-0" style={{ color: RED }} />
                    <div>
                      <p className="text-[13px] font-extrabold leading-tight text-text-1">{fmt(p.montoTotal)}</p>
                      <p className="text-[9px] font-semibold leading-tight" style={{ color: TEXT4 }}>XAF</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-1 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: TEXT4 }} />
                  <span className="text-[10px] font-semibold" style={{ color: TEXT4 }}>Score crediticio</span>
                </div>
                <span className="text-[11px] font-bold" style={{ color: scoreColor(p.score) }}>{p.score}/1000</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: BORDER }}>
                <div className="h-full rounded-full" style={{ width: `${p.score / 10}%`, background: scoreColor(p.score) }} />
              </div>

              <div className="mt-auto pt-1 flex justify-end">
                <button
                  onClick={() => setPymeModal(p)}
                  className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 cursor-pointer transition"
                  style={{ color: ORA }}
                >
                  Ver detalles <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {filtradas.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center gap-2" style={{ color: TEXT4 }}>
              <Search className="w-8 h-8" />
              <p className="text-[13px] font-semibold">Sin resultados para "{busqueda}"</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Modal: Detalle de PYME ── */}
      {pymeModal && (() => {
        const p = pymeModal;
        const pymesContratos = contratos.filter(c => c.ini === p.ini);
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
        return (
          <Modal
            wide
            title={p.nombre}
            onClose={() => setPymeModal(null)}
            footer={<Button variant="ghost" size="sm" className="ml-auto" onClick={() => setPymeModal(null)}>Cerrar</Button>}
          >
            <div className="space-y-6">

              {/* Hero */}
              <div className="flex items-center gap-4 p-4 rounded-[12px]" style={{ background: '#F8F7F5' }}>
                <IniAvatar ini={p.ini} size={52} />
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold text-text-1 leading-snug">{p.nombre}</p>
                  <p className="text-[12px]" style={{ color: TEXT4 }}>{p.nombreComercial} · {p.sector}</p>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: TEXT4 }}>{p.ruc}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant={semBadge(p.semaforo)}>{p.semaforo}</Badge>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-semibold" style={{ background: '#E3F4EA', color: GREEN }}>
                    <Leaf className="w-3 h-3" />ESG Verde CO₂
                  </div>
                </div>
              </div>

              {/* Score crediticio */}
              <div className="rounded-[12px] border border-border p-4">
                <ModalLabel text="Score crediticio" Icon={ShieldCheck} />
                <div className="flex items-end gap-4 mb-3">
                  <span className="text-[42px] font-extrabold leading-none" style={{ color: scoreColor(p.score) }}>{p.score}</span>
                  <div className="pb-1">
                    <p className="text-[13px] font-bold" style={{ color: scoreColor(p.score) }}>
                      {p.score >= 750 ? 'Riesgo Bajo' : p.score >= 500 ? 'Riesgo Medio' : 'Riesgo Alto'}
                    </p>
                    <p className="text-[11px]" style={{ color: TEXT4 }}>sobre 1000 puntos</p>
                  </div>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: BORDER }}>
                  <div className="h-full rounded-full" style={{ width: `${p.score / 10}%`, background: scoreColor(p.score) }} />
                </div>
                <div className="flex justify-between text-[10px] mt-1.5" style={{ color: TEXT4 }}>
                  <span>0 — Alto riesgo</span><span>1000 — Bajo riesgo</span>
                </div>
              </div>

              {/* Datos de identidad */}
              <div>
                <ModalLabel text="Datos de Identidad" Icon={Building2} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Razón Social"      value={p.nombre} />
                  <InfoRow label="Nombre Comercial"  value={p.nombreComercial} />
                  <InfoRow label="RUC / NIF"         value={p.ruc} />
                  <InfoRow label="Sector Productivo" value={p.sector} />
                  <InfoRow label="Teléfono"          value={p.telefono} />
                  <InfoRow label="Correo"            value={p.correo} />
                </div>
              </div>

              {/* Representante Legal */}
              <div>
                <ModalLabel text="Representante Legal" Icon={User} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Nombre y Apellido"    value={p.repNombre} />
                  <InfoRow label="Tipo de Documento"    value={p.repTipoDoc} />
                  <InfoRow label="Nº de Identificación" value={p.repId} />
                  <InfoRow label="Cargo"                value={p.repCargo} />
                  <InfoRow label="Teléfono"             value={p.repTel} />
                  <InfoRow label="Correo"               value={p.repCorreo} />
                </div>
              </div>

              {/* Compliance */}
              <div>
                <ModalLabel text="Compliance & Documentos" Icon={FileCheck} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <ComplianceItem label="KYC"        value="Vigente"    sub="Vence 31/12/2026"         Icon={CheckCircle2} iconBg="#E3F4EA" iconColor={GREEN} />
                  <ComplianceItem label="AML"        value="Aprobado"   sub="Sin alertas"               Icon={Shield}       iconBg="#E3F4EA" iconColor={GREEN} />
                  <ComplianceItem label="Documentos" value="4 / 4"      sub="Todos verificados"         Icon={FileCheck}    iconBg="#EFF6FF" iconColor={BLUE}  />
                  <ComplianceItem label="Nivel"      value="A"          sub="Calificación normativa"    Icon={Star}         iconBg="#EFF6FF" iconColor={BLUE}  />
                  <ComplianceItem label="Auditoría"  value="Mar 2026"   sub="Próx. revisión Sep 2026"  Icon={Clock}        iconBg="#FDF6E8" iconColor={WARN}  />
                  <ComplianceItem label="Semáforo"   value={p.semaforo} sub="Riesgo global asignado"   Icon={ShieldCheck}  iconBg={semColor(p.semaforo) + '20'} iconColor={semColor(p.semaforo)} />
                </div>
              </div>

              {/* Contratos */}
              <div>
                <ModalLabel text={`Contratos con TotalEnerGE (${pymesContratos.length})`} Icon={ClipboardList} />
                {pymesContratos.length === 0 ? (
                  <p className="text-[12px] text-center py-4" style={{ color: TEXT4 }}>Sin contratos activos</p>
                ) : (
                  <div className="space-y-2">
                    {pymesContratos.map(c => {
                      const pctC = Math.round((c.utilizado / c.asignado) * 100);
                      const barC = pctC > 90 ? ERR : pctC > 70 ? WARN : GREEN;
                      return (
                        <div key={c.id} className="flex items-center gap-4 p-3.5 rounded-[12px] border border-border">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[12px] font-bold text-text-1 font-mono">{c.id}</span>
                              <Badge variant={c.estado === 'Activo' ? 'green' : 'gray'}>{c.estado}</Badge>
                            </div>
                            <p className="text-[11px] truncate" style={{ color: TEXT4 }}>{c.objeto}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[13px] font-extrabold text-text-1">{fmt(c.asignado / 1_000_000)}M XAF</p>
                            <p className="text-[10px] font-semibold" style={{ color: barC }}>{pctC}% utilizado</p>
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
    </AppShell>
  );
}

// ── SOLICITUDES ───────────────────────────────────────────────────────────────
const solicIconCfg = {
  'Ampliación de fondo': { Icon: TrendingUp,   iconBg: '#FDEEEB', iconColor: RED  },
  'Nuevo contrato':      { Icon: FilePlus,      iconBg: '#FFF3E0', iconColor: ORA  },
  'Renovación':          { Icon: ClipboardList, iconBg: '#EFF6FF', iconColor: BLUE },
};


export function EmpSolicitudes() {
  const [tab, setTab]         = useState('mis');
  const [solModal, setSolModal] = useState(null);

  const closeModal = () => setSolModal(null);

  const timelineSteps = s => {
    const isAprobada  = s.estado === 'Aprobada';
    const isRechazada = s.estado === 'Rechazada';
    return [
      { lbl: 'Enviada',     done: true,                        active: false,                         isResult: false, isRechazada: false },
      { lbl: 'En revisión', done: isAprobada || isRechazada,   active: s.estado === 'En revisión',    isResult: false, isRechazada: false },
      { lbl: isRechazada ? 'Rechazada' : 'Aprobada',
                            done: isAprobada || isRechazada,   active: false,                         isResult: true,  isRechazada },
    ];
  };

  return (
    <AppShell active="empSolicitudes" role="contratante" title="Solicitudes" sub="Mis solicitudes y oportunidades de PYMEs">
      <div className="fade-in space-y-4">

        {/* Tabs + acción */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Button variant="primary" size="sm" className="w-full sm:w-auto sm:order-last justify-center" onClick={() => window.open('/solicitar-contrato', '_blank')}>
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />Nueva solicitud
          </Button>
          <div className="flex gap-1 bg-page-bg p-1 rounded-xl">
            {[{ id: 'mis', lbl: 'Mis solicitudes' }, { id: 'pymes', lbl: 'Solicitudes de PYMEs' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-2 px-4 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap text-center ${
                  tab === t.id ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
                }`}>{t.lbl}
              </button>
            ))}
          </div>
        </div>

        {/* ── Mis solicitudes ── */}
        {tab === 'mis' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {misSolicitudes.map(s => {
                const cfg = solicIconCfg[s.tipo] ?? { Icon: ClipboardList, iconBg: '#FFF3E0', iconColor: ORA };
                return (
                  <div key={s.id} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.iconBg }}>
                          <cfg.Icon className="w-5 h-5" style={{ color: cfg.iconColor }} />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-text-1">{s.tipo}</p>
                          <p className="text-[10px] font-mono" style={{ color: TEXT4 }}>{s.id}</p>
                        </div>
                      </div>
                      <Badge variant={solicBadge(s.estado)}>{s.estado}</Badge>
                    </div>
                    <p className="text-[12px] text-text-3 leading-snug">{s.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                      <div>
                        <p className="text-[16px] font-extrabold text-text-1 leading-none">{fmt(s.monto)}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: TEXT4 }}>XAF · {s.fecha}</p>
                      </div>
                      <button onClick={() => setSolModal(s)}
                        className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 transition cursor-pointer" style={{ color: ORA }}>
                        Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
        )}

        {/* ── Solicitudes de PYMEs ── */}
        {tab === 'pymes' && (
          <div className="space-y-4">
            <div className="bg-page-bg border border-border rounded-[12px] p-3.5 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ORA }} />
              <p className="text-[12px]" style={{ color: TEXT4 }}>
                Estas PYMEs te han declarado como su empresa contratante. Haz clic en <strong className="text-text-2">Participar</strong> para confirmar tu participación e iniciar el proceso con Bonafide.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {solicitudesPymes.map(s => (
                <div key={s.id} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <IniAvatar ini={s.ini} size={44} />
                    <div>
                      <p className="text-[13px] font-bold text-text-1">{s.pyme}</p>
                      <p className="text-[11px]" style={{ color: TEXT4 }}>{s.sector} · {s.fecha}</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-text-3 leading-snug flex-1">{s.desc}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-[18px] font-extrabold text-text-1 leading-none">{fmt(s.monto)}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: TEXT4 }}>XAF solicitados</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => window.open('/solicitar-contrato', '_blank')}>
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />Participar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Modal detalle solicitud ── */}
      {solModal && (() => {
        const s     = solModal;
        const cfg   = solicIconCfg[s.tipo] ?? { Icon: ClipboardList, iconBg: '#FFF3E0', iconColor: ORA };
        const steps = timelineSteps(s);
        return (
          <Modal title={`Solicitud · ${s.id}`} onClose={closeModal}
            footer={<Button variant="ghost" size="sm" onClick={closeModal} className="ml-auto">Cerrar</Button>}
          >
            <div className="space-y-5">

              {/* Hero */}
              <div className="flex items-start gap-4 p-4 rounded-[12px]" style={{ background: '#F8F7F5' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.iconBg }}>
                  <cfg.Icon className="w-6 h-6" style={{ color: cfg.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-text-1">{s.tipo}</p>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: TEXT4 }}>{s.id} · {s.fecha}</p>
                </div>
                <Badge variant={solicBadge(s.estado)}>{s.estado}</Badge>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><InfoRow label="Descripción" value={s.desc} /></div>
                <InfoRow label="Monto solicitado" value={`${fmt(s.monto)} XAF`} />
                <InfoRow label="Fecha de envío"   value={s.fecha} />
              </div>

              {/* Timeline */}
              <div>
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-4">Estado del proceso</p>
                <div className="flex items-start">
                  {steps.map((step, i) => {
                    const isLast    = i === steps.length - 1;
                    const dotColor  = step.done ? (step.isRechazada ? ERR : GREEN) : step.active ? ORA : BORDER;
                    const lineColor = steps[i + 1]?.done ? GREEN : BORDER;
                    return (
                      <div key={i} className={`flex flex-col items-center ${isLast ? '' : 'flex-1'}`}>
                        <div className="flex items-center w-full">
                          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                            style={{ borderColor: dotColor, background: step.done ? dotColor : 'white' }}>
                            {step.done && !step.isRechazada && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            {step.done &&  step.isRechazada && <AlertCircle  className="w-3.5 h-3.5 text-white" />}
                            {!step.done && step.active      && <div className="w-2 h-2 rounded-full" style={{ background: ORA }} />}
                          </div>
                          {!isLast && <div className="flex-1 h-0.5 mx-1" style={{ background: lineColor }} />}
                        </div>
                        <p className="text-[10px] font-semibold mt-1.5 text-center leading-tight"
                          style={{ color: step.done && step.isRechazada ? ERR : step.done && step.isResult ? GREEN : step.active ? ORA : TEXT4 }}>
                          {step.lbl}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mensaje contextual */}
              {s.estado === 'Aprobada' && (
                <div className="flex items-start gap-3 p-4 rounded-[12px]" style={{ background: '#E3F4EA', border: '1px solid #B6DFC9' }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GREEN }} />
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: GREEN }}>Solicitud aprobada</p>
                    <p className="text-[11px] mt-0.5" style={{ color: GREEN }}>Bonafide ha procesado tu solicitud satisfactoriamente. El equipo de gestión se pondrá en contacto pronto.</p>
                  </div>
                </div>
              )}
              {s.estado === 'Rechazada' && (
                <div className="flex items-start gap-3 p-4 rounded-[12px]" style={{ background: '#FDEEEB', border: '1px solid #F5C3BB' }}>
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: ERR }} />
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: ERR }}>Solicitud rechazada</p>
                    <p className="text-[11px] mt-0.5" style={{ color: ERR }}>No fue posible aprobar esta solicitud en este momento. Para más información, contacta con tu gestor en Bonafide.</p>
                  </div>
                </div>
              )}

            </div>
          </Modal>
        );
      })()}

    </AppShell>
  );
}

// ── DETALLE DE CONTRATO ───────────────────────────────────────────────────────
const TABS_DETALLE = [
  { id: 'contrato', lbl: 'Contrato', Icon: FileText,    iconBg: '#FFF3E0', iconColor: ORA  },
  { id: 'pyme',     lbl: 'PYME',     Icon: Users,       iconBg: '#EFF6FF', iconColor: BLUE },
  { id: 'facturas', lbl: 'Facturas', Icon: Receipt,     iconBg: '#FDF6E8', iconColor: WARN },
];

export function EmpContratoDetalle() {
  const { go } = useApp();
  const [tab, setTab] = useState('contrato');
  const [facturaModal, setFacturaModal] = useState(null);
  const [ipiStep, setIpiStep]           = useState(null);
  const [estadoMap, setEstadoMap]       = useState({});
  const [filtroFac, setFiltroFac]       = useState('Todos');
  const c    = _selectedContrato;
  const pct  = Math.round((c.utilizado / c.asignado) * 100);
  const bar  = pct > 90 ? ERR : pct > 70 ? WARN : GREEN;
  const disp = c.asignado - c.utilizado;
  const facturasContrato = facturas
    .filter(f => f.contrato === c.id)
    .map(f => ({ ...f, estado: estadoMap[f.id] ?? f.estado }));
  const pyme    = pymes.find(p => p.ini === c.ini);
  const modalFac = facturaModal ? (facturasContrato.find(f => f.id === facturaModal.id) ?? facturaModal) : null;

  const closeModal        = () => { setFacturaModal(null); setIpiStep(null); };
  const handleVerificar   = () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'Verificada' })); closeModal(); };
  const handleEnviarCodigo= () => setIpiStep('codigo');
  const handleConfirmarIPI= () => { setEstadoMap(p => ({ ...p, [modalFac.id]: 'IPI emitido' })); closeModal(); };

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

        {/* ── Resumen financiero (como en PYME) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { lbl: 'Fondo Asignado', val: `${fmt(c.asignado)} XAF`,  Icon: TrendingUp,   iconBg: '#FDEEEB', iconColor: RED   },
            { lbl: 'Utilizado',      val: `${fmt(c.utilizado)} XAF`, Icon: CreditCard,   iconBg: '#FDF6E8', iconColor: WARN  },
            { lbl: 'Disponible',     val: `${fmt(disp)} XAF`,        Icon: CheckCircle,  iconBg: '#E3F4EA', iconColor: GREEN },
            { lbl: '% Utilización',  val: `${pct}%`,                 Icon: ClipboardList,iconBg: pct > 90 ? '#FDEEEB' : pct > 70 ? '#FDF6E8' : '#E3F4EA', iconColor: bar },
          ].map(({ lbl, val, Icon, iconBg, iconColor }) => (
            <div key={lbl} className="card-enter bg-white rounded-[12px] border border-border p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{lbl}</p>
                {val.endsWith(' XAF') ? (
                  <>
                    <p className="text-[12px] sm:text-[13px] font-extrabold text-text-1 leading-tight">{val.slice(0, -4)}</p>
                    <p className="text-[9px] font-semibold leading-tight" style={{ color: TEXT4 }}>XAF</p>
                  </>
                ) : (
                  <p className="text-[13px] font-extrabold text-text-1 leading-tight">{val}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs con iconos (como en PYME) ── */}
        <div className="flex gap-1 bg-page-bg p-1 rounded-[10px] overflow-x-auto">
          {TABS_DETALLE.map(({ id, lbl, Icon, iconBg, iconColor }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-[12px] font-medium transition-all whitespace-nowrap cursor-pointer
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
              <SectionHeader title="Condiciones Económicas y Plazos" sub="Montos, fechas de vigencia y plazo de ejecución" Icon={Clock} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoRow label="Monto global"       value={`${fmt(c.asignado)} XAF`} />
                <InfoRow label="Fecha de inicio"    value={c.fechaInicio} />
                <InfoRow label="Fecha de fin"       value={c.fechaFin} />
                <InfoRow label="Plazo de ejecución" value={c.plazo} />
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
        {tab === 'pyme' && pyme && (
          <div className="space-y-4">

            {/* Datos de Identidad */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5">
              <SectionHeader
                title="Datos de Identidad"
                sub="Información legal y fiscal de la PYME"
                Icon={Building2}
                right={
                  <div className="shrink-0 px-2.5 py-1.5 rounded-[8px]" style={{ background: scoreColor(pyme.score) + '20' }}>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold" style={{ color: scoreColor(pyme.score) }}>Score crediticio</span>
                      <span className="text-[15px] font-extrabold" style={{ color: scoreColor(pyme.score) }}>{pyme.score}/1000</span>
                    </div>
                    <div className="flex flex-col items-center sm:hidden">
                      <span className="text-[10px] font-semibold" style={{ color: scoreColor(pyme.score) }}>Score</span>
                      <span className="text-[18px] font-extrabold leading-none mt-0.5" style={{ color: scoreColor(pyme.score) }}>{pyme.score}</span>
                    </div>
                  </div>
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <InfoRow label="Razón Social"      value={pyme.nombre} />
                <InfoRow label="Nombre Comercial"  value={pyme.nombreComercial} />
                <InfoRow label="RUC / NIF"         value={pyme.ruc} />
                <InfoRow label="Sector Productivo" value={pyme.sector} />
                <InfoRow label="Teléfono"          value={pyme.telefono} />
                <InfoRow label="Correo"            value={pyme.correo} />
              </div>
            </div>

            {/* Representante Legal */}
            <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '60ms' }}>
              <SectionHeader title="Representante Legal" sub="Persona autorizada para firmar y representar a la PYME" Icon={User} />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <InfoRow label="Nombre y Apellido"    value={pyme.repNombre} />
                <InfoRow label="Tipo de Documento"    value={pyme.repTipoDoc} />
                <InfoRow label="Nº de Identificación" value={pyme.repId} />
                <InfoRow label="Cargo"                value={pyme.repCargo} />
                <InfoRow label="Teléfono"             value={pyme.repTel} />
                <InfoRow label="Correo"               value={pyme.repCorreo} />
              </div>
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
                  <div key={f.id} onClick={() => { setFacturaModal(f); setIpiStep(null);}} className="cursor-pointer">

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

// ── MI PERFIL — idéntico al estilo de PYME ────────────────────────────────────
const SCORE_CT       = 720;
const KYC_VENC       = '31/12/2026';
const ULTIMA_AUD     = '15/03/2026';

export function EmpPerfil() {
  const [avatar, setAvatar] = useState(null);

  return (
    <AppShell active="empPerfil" role="contratante" title="Mi Perfil" sub="Información de cuenta">
      <div className="fade-in space-y-5">

        {/* ── Hero card ── */}
        <div className="card-enter bg-white rounded-[14px] border border-border p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">

            {/* Avatar */}
            <div className="relative shrink-0 self-center sm:self-start">
              <div className="w-24 h-24 rounded-[20px] overflow-hidden">
                {avatar
                  ? <img src={avatar} alt="Logo empresa" className="w-full h-full object-cover" />
                  : <div className="bona-gradient-bg w-full h-full flex items-center justify-center text-white font-bold text-[28px]">TE</div>
                }
              </div>
              <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white border border-border shadow-sm flex items-center justify-center cursor-pointer hover:bg-page-bg transition"
                     title="Cambiar logo">
                <Camera className="w-3.5 h-3.5 text-text-3" />
                <input type="file" className="hidden" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setAvatar(URL.createObjectURL(file));
                }} />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[20px] font-bold text-text-1 leading-tight">TotalEnerGE S.A.</div>
              <div className="text-[13px] text-text-3 mt-0.5">Marcos Oyono Ntutumu · Director General</div>
              <div className="text-[12px] font-mono text-text-5 mt-0.5">GE-2020-00567</div>
              <div className="text-[11px] text-text-4 mt-1">Energía y Servicios · 150–200 empleados</div>
            </div>

            {/* Score */}
            <div className="shrink-0 flex flex-col items-center sm:items-end">
              <div className="text-[9px] font-bold uppercase tracking-widest text-text-4 mb-1">Score Crediticio</div>
              <div className="text-[32px] sm:text-[48px] font-extrabold leading-none" style={{ color: GREEN }}>{SCORE_CT}</div>
              <div className="text-[11px] text-text-4 mt-1.5">
                / 1000 · <span className="font-semibold" style={{ color: GREEN }}>Riesgo Bajo</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="border-t border-border mt-5 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <HeroBadge label="Nivel de Riesgo"  value="Bajo"      Icon={Shield}       bg="#E3F4EA" color="#2E7D5B" />
            <HeroBadge label="Calificación ESG"  value="Verde CO₂" Icon={Leaf}         bg="#E3F4EA" color="#2E7D5B" />
            <HeroBadge label="Estado KYC"        value="Vigente"   Icon={CheckCircle2} bg="#E3F4EA" color="#2E7D5B" />
          </div>
        </div>

        {/* ── Datos + Compliance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Datos de la empresa */}
          <div className="card-enter bg-white rounded-[14px] border border-border p-6" style={{ animationDelay: '70ms' }}>
            <SectionHeader
              title="Datos de la empresa"
              sub="Información registrada. Contacta con Bonafide para modificaciones."
              Icon={Building2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Razón Social">
                <Input value="TotalEnerGE S.A." disabled />
              </FormGroup>
              <FormGroup label="RUC / NIF">
                <Input value="GE-2020-00567" disabled />
              </FormGroup>
              <FormGroup label="Sector Productivo">
                <Input value="Energía y Servicios" disabled />
              </FormGroup>
              <FormGroup label="Número de empleados">
                <Input value="150 – 200" disabled />
              </FormGroup>
              <FormGroup label="Teléfono corporativo">
                <Input value="+240 222 456 789" disabled />
              </FormGroup>
              <FormGroup label="Correo corporativo">
                <Input value="info@totalenerge.gq" disabled />
              </FormGroup>
            </div>
          </div>

          {/* Compliance / KYC */}
          <div className="card-enter bg-white rounded-[14px] border border-border p-6" style={{ animationDelay: '140ms' }}>
            <SectionHeader
              title="Compliance & KYC"
              sub="Estado regulatorio y de cumplimiento normativo de la empresa."
              Icon={ShieldCheck}
              right={
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-[8px] shrink-0"
                      style={{ background: '#E3F4EA', color: '#2E7D5B', border: '1px solid #A8D5BE' }}>
                  Aprobado
                </span>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ComplianceItem
                label="KYC" value="Vigente"
                sub={<>Vence el <span className="font-semibold text-text-2">{KYC_VENC}</span></>}
                Icon={CheckCircle2} iconBg="#E3F4EA" iconColor="#2E7D5B"
              />
              <ComplianceItem
                label="AML" value="Aprobado"
                sub="Sin alertas de lavado de activos"
                Icon={Shield} iconBg="#E3F4EA" iconColor="#2E7D5B"
              />
              <ComplianceItem
                label="Documentos" value="4 / 4"
                sub="Todos los documentos verificados"
                Icon={FileCheck} iconBg="#EFF6FF" iconColor="#3B82F6"
              />
              <ComplianceItem
                label="Nivel Compliance" value="AA"
                sub="Calificación de cumplimiento normativo"
                Icon={Star} iconBg="#EFF6FF" iconColor="#3B82F6"
              />
              <ComplianceItem
                label="Última Auditoría" value={ULTIMA_AUD}
                sub={<>Próxima revisión en <span className="font-semibold text-text-2">Sep 2026</span></>}
                Icon={Clock} iconBg="#FDF6E8" iconColor="#C68A1D"
              />
              <ComplianceItem
                label="Firma Digital" value="Pendiente"
                sub="Renovación de firma digital requerida"
                Icon={AlertCircle} iconBg="#FDF6E8" iconColor="#C68A1D"
              />
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
