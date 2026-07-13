import { useState } from 'react';
import {
  ChevronRight, CheckCircle, CheckCircle2, Clock, Zap, Building2,
  Users, Receipt, User, Phone, Mail, MapPin, FileText, ShieldCheck,
  TrendingUp, FilePlus, CreditCard, FileCheck, Camera, Shield,
  Leaf, AlertCircle, Star, ClipboardList, ArrowUpRight, Search,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import FormGroup, { Input } from '../../components/ui/FormGroup';

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
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
           style={{ background: 'linear-gradient(135deg, #E0201C, #EF7A2C)' }}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
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

// ── Datos ─────────────────────────────────────────────────────────────────────
const contratos = [
  { id: 'CT-2026-0041', pyme: 'Const. Silva Ltd.',  ini: 'CS', sector: 'Construcción',    asignado: 180_000_000, utilizado: 120_000_000, facturas: 14, estado: 'Activo'  },
  { id: 'CT-2026-0038', pyme: 'TechBata PYME S.L.', ini: 'TB', sector: 'Tecnología',      asignado: 120_000_000, utilizado: 75_000_000,  facturas: 8,  estado: 'Activo'  },
  { id: 'CT-2026-0031', pyme: 'AgriEco PYME',       ini: 'AE', sector: 'Agroindustria',   asignado: 90_000_000,  utilizado: 60_000_000,  facturas: 6,  estado: 'Activo'  },
  { id: 'CT-2026-0028', pyme: 'LogiGE S.A.',        ini: 'LG', sector: 'Logística',       asignado: 75_000_000,  utilizado: 45_000_000,  facturas: 5,  estado: 'Activo'  },
  { id: 'CT-2026-0019', pyme: 'ServLog GE',         ini: 'SL', sector: 'Servicios',       asignado: 60_000_000,  utilizado: 27_000_000,  facturas: 4,  estado: 'Activo'  },
  { id: 'CT-2025-0087', pyme: 'InfraBata S.L.',     ini: 'IB', sector: 'Infraestructura', asignado: 45_000_000,  utilizado: 45_000_000,  facturas: 5,  estado: 'Cerrado' },
];

const facturas = [
  { id: 'FAC-2026-0911', contrato: 'CT-2026-0041', pyme: 'Const. Silva Ltd.',  monto: 21_500_000, fecha: '28/06/2026', estado: 'Verificada'  },
  { id: 'FAC-2026-0908', contrato: 'CT-2026-0038', pyme: 'TechBata PYME S.L.', monto: 15_200_000, fecha: '25/06/2026', estado: 'Recibida'    },
  { id: 'FAC-2026-0901', contrato: 'CT-2026-0031', pyme: 'AgriEco PYME',       monto: 8_750_000,  fecha: '20/06/2026', estado: 'IPI emitido' },
  { id: 'FAC-2026-0897', contrato: 'CT-2026-0028', pyme: 'LogiGE S.A.',        monto: 12_300_000, fecha: '18/06/2026', estado: 'Pagada'      },
  { id: 'FAC-2026-0892', contrato: 'CT-2026-0041', pyme: 'Const. Silva Ltd.',  monto: 28_700_000, fecha: '15/06/2026', estado: 'Pagada'      },
  { id: 'FAC-2026-0885', contrato: 'CT-2026-0019', pyme: 'ServLog GE',         monto: 6_800_000,  fecha: '10/06/2026', estado: 'En revisión' },
  { id: 'FAC-2026-0878', contrato: 'CT-2026-0038', pyme: 'TechBata PYME S.L.', monto: 9_400_000,  fecha: '05/06/2026', estado: 'Pagada'      },
];

const pymes = [
  { ini: 'CS', nombre: 'Const. Silva Ltd.',  sector: 'Construcción',    contratos: 3, montoTotal: 225_000_000, score: 87, semaforo: 'Verde'    },
  { ini: 'TB', nombre: 'TechBata PYME S.L.', sector: 'Tecnología',      contratos: 2, montoTotal: 165_000_000, score: 82, semaforo: 'Verde'    },
  { ini: 'AE', nombre: 'AgriEco PYME',       sector: 'Agroindustria',   contratos: 2, montoTotal: 118_000_000, score: 61, semaforo: 'Amarillo' },
  { ini: 'LG', nombre: 'LogiGE S.A.',        sector: 'Logística',       contratos: 1, montoTotal: 75_000_000,  score: 79, semaforo: 'Verde'    },
  { ini: 'SL', nombre: 'ServLog GE',         sector: 'Servicios',       contratos: 1, montoTotal: 60_000_000,  score: 32, semaforo: 'Rojo'     },
  { ini: 'IB', nombre: 'InfraBata S.L.',     sector: 'Infraestructura', contratos: 1, montoTotal: 45_000_000,  score: 75, semaforo: 'Verde'    },
];

const misSolicitudes = [
  { id: 'SOL-2026-0142', tipo: 'Ampliación de fondo', desc: 'Ampliar límite CT-2026-0041 · Const. Silva', monto: 50_000_000, fecha: '01/07/2026', estado: 'En revisión' },
  { id: 'SOL-2026-0138', tipo: 'Nuevo contrato',      desc: 'Contrato con MaderGE PYME S.L.',              monto: 80_000_000, fecha: '25/06/2026', estado: 'Aprobada'    },
  { id: 'SOL-2026-0119', tipo: 'Renovación',          desc: 'Renovar CT-2025-0087 · InfraBata S.L.',       monto: 45_000_000, fecha: '10/06/2026', estado: 'Rechazada'   },
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
const scoreColor   = n => n >= 75 ? GREEN : n >= 55 ? WARN : ERR;

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
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{lbl}</p>
                <p className="text-[14px] font-extrabold text-text-1 leading-tight truncate">{val}</p>
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
            <Button variant="primary" size="sm" onClick={() => go('empNuevaSolicitud')}>
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />Nueva solicitud
            </Button>
          </div>
        </div>

        {/* Cards de contratos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                      <p className="text-[15px] font-extrabold leading-none truncate" style={{ color: GREEN }}>
                        {fmt(disp)} <span className="text-[10px] font-semibold" style={{ color: GREEN }}>XAF</span>
                      </p>
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
                <button
                  onClick={() => { _selectedContrato = c; go('empContratoDetalle'); }}
                  className="mt-auto text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 transition"
                  style={{ color: ORA }}
                >
                  Ver contrato <ChevronRight className="w-3.5 h-3.5" />
                </button>
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
  const [filtro, setFiltro] = useState('Todas');

  const filtered = filtro === 'Todas'      ? facturas
    : filtro === 'Recibidas'               ? facturas.filter(f => f.estado === 'Recibida' || f.estado === 'En revisión')
    : filtro === 'Verificadas'             ? facturas.filter(f => f.estado === 'Verificada' || f.estado === 'IPI emitido')
    : facturas.filter(f => f.estado === 'Pagada');

  const pendientes  = facturas.filter(f => f.estado === 'Recibida').length;
  const verificadas = facturas.filter(f => f.estado === 'Verificada').length;
  const pagadas     = facturas.filter(f => f.estado === 'Pagada').length;
  const totalMonto  = facturas.reduce((a, f) => a + f.monto, 0);

  return (
    <AppShell active="empFacturas" role="contratante" title="Mis Facturas" sub="Facturas emitidas por PYMEs contratadas">
      <div className="fade-in space-y-5">

        {/* KPI cards — compactas, sin acción */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { lbl: 'Total facturas',     val: String(facturas.length),  Icon: Receipt,    iconBg: '#FFF3E0', iconColor: ORA   },
            { lbl: 'Pendientes validar', val: String(pendientes),        Icon: Clock,      iconBg: '#FDF6E8', iconColor: WARN  },
            { lbl: 'Listas para IPI',    val: String(verificadas),       Icon: FileCheck,  iconBg: '#EFF6FF', iconColor: BLUE  },
            { lbl: 'Monto total',        val: `${fmt(totalMonto)} XAF`,  Icon: TrendingUp, iconBg: '#E3F4EA', iconColor: GREEN },
          ].map(({ lbl, val, Icon, iconBg, iconColor }) => (
            <div key={lbl} className="card-lift card-enter bg-white rounded-[12px] border border-border p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{lbl}</p>
                <p className="text-[14px] font-extrabold text-text-1 leading-tight truncate">{val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-1 bg-page-bg p-1 rounded-xl w-fit">
          {FILTROS_FAC.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filtro === f ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
              }`}>{f}
            </button>
          ))}
        </div>

        {/* Cards de facturas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(f => {
            const needsAction = f.estado === 'Recibida' || f.estado === 'Verificada';
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: '#FFF3E0' }}>
                      <Users className="w-4 h-4" style={{ color: ORA }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-text-1 leading-snug">{f.pyme}</p>
                      <p className="text-[10px] font-mono" style={{ color: TEXT4 }}>{f.contrato}</p>
                    </div>
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

                {/* Acción */}
                <div className="mt-auto pt-1">
                  {f.estado === 'Recibida' && (
                    <Button variant="primary" size="sm" className="w-full justify-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />Validar factura
                    </Button>
                  )}
                  {f.estado === 'Verificada' && (
                    <Button variant="primary" size="sm" className="w-full justify-center">
                      <Zap className="w-3.5 h-3.5 mr-1" />Emitir IPI
                    </Button>
                  )}
                  {!needsAction && (
                    <button className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 transition" style={{ color: ORA }}>
                      Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-5 px-1">
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: TEXT4 }}>
            <CheckCircle className="w-3.5 h-3.5" style={{ color: GREEN }} />
            <span><strong className="text-text-2">Validar</strong> — Confirmar que la factura es correcta</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: TEXT4 }}>
            <Zap className="w-3.5 h-3.5" style={{ color: ORA }} />
            <span><strong className="text-text-2">Emitir IPI</strong> — Instrucción de Pago Inmediato a Bonafide</span>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

// ── PYMEs ─────────────────────────────────────────────────────────────────────
export function EmpPymes() {
  const totalContratos = pymes.reduce((a, p) => a + p.contratos, 0);
  const totalFondo     = pymes.reduce((a, p) => a + p.montoTotal, 0);

  return (
    <AppShell active="empPymes" role="contratante" title="PYMEs" sub="Empresas con contrato activo">
      <div className="fade-in space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { lbl: 'PYMEs contratadas',   val: pymes.length,    sub: 'empresas activas',         Icon: Users,       iconBg: '#FFF3E0', iconColor: ORA   },
            { lbl: 'Contratos vigentes',  val: totalContratos,  sub: 'en total entre todas',      Icon: ClipboardList, iconBg: '#E3F4EA', iconColor: GREEN },
            { lbl: 'Fondo comprometido',  val: `${fmt(totalFondo / 1_000_000)}M`, sub: 'XAF asignado a PYMEs', Icon: TrendingUp, iconBg: '#FDEEEB', iconColor: RED },
          ].map(({ lbl, val, sub, Icon, iconBg, iconColor }) => (
            <div key={lbl} className="card-lift card-enter bg-white rounded-[14px] border border-border p-4 flex flex-col">
              <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2 min-h-[2.4rem] leading-tight">{lbl}</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <p className="text-[26px] font-extrabold leading-none text-text-1">{val}</p>
              </div>
              <p className="text-[10px] flex-1" style={{ color: TEXT4 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Grid de PYMEs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pymes.map(p => (
            <div key={p.nombre} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 cursor-pointer hover:shadow-sm transition-shadow flex flex-col">
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
                <div className="bg-page-bg rounded-[10px] p-3 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5" style={{ color: ORA }} />
                    <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Contratos</p>
                  </div>
                  <p className="text-[22px] font-extrabold leading-none" style={{ color: ORA }}>{p.contratos}</p>
                </div>
                <div className="bg-page-bg rounded-[10px] p-3 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: RED }} />
                    <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: TEXT4 }}>Fondo</p>
                  </div>
                  <p className="text-[16px] font-extrabold leading-none text-text-1">{fmt(p.montoTotal / 1_000_000)}M <span className="text-[10px] font-normal" style={{ color: TEXT4 }}>XAF</span></p>
                </div>
              </div>

              <div className="mb-1 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: TEXT4 }} />
                  <span className="text-[10px] font-semibold" style={{ color: TEXT4 }}>Score crediticio</span>
                </div>
                <span className="text-[11px] font-bold" style={{ color: scoreColor(p.score) }}>{p.score}/100</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: BORDER }}>
                <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: scoreColor(p.score) }} />
              </div>

              <button className="mt-auto text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 transition" style={{ color: ORA }}>
                Ver contratos <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
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
  const [tab, setTab] = useState('mis');

  return (
    <AppShell active="empSolicitudes" role="contratante" title="Solicitudes" sub="Mis solicitudes y oportunidades de PYMEs">
      <div className="fade-in space-y-4">

        {/* Tabs */}
        <div className="flex gap-1 bg-page-bg p-1 rounded-xl w-fit">
          {[{ id: 'mis', lbl: 'Mis solicitudes' }, { id: 'pymes', lbl: 'Solicitudes de PYMEs' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                tab === t.id ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
              }`}>{t.lbl}
            </button>
          ))}
        </div>

        {/* ── Mis solicitudes ── */}
        {tab === 'mis' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" size="sm">
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" />Nueva solicitud
              </Button>
            </div>
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
                        <p className="text-[16px] font-extrabold text-text-1 leading-none">{fmt(s.monto / 1_000_000)}M</p>
                        <p className="text-[10px] mt-0.5" style={{ color: TEXT4 }}>XAF · {s.fecha}</p>
                      </div>
                      <button className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 transition" style={{ color: ORA }}>
                        Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Solicitudes de PYMEs ── */}
        {tab === 'pymes' && (
          <div className="space-y-4">
            <div className="bg-page-bg border border-border rounded-[12px] p-3.5 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ORA }} />
              <p className="text-[12px]" style={{ color: TEXT4 }}>
                PYMEs buscando un contratante. Al hacer clic en <strong className="text-text-2">Participar</strong> se inicia el proceso de contrato con Bonafide.
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
                      <p className="text-[18px] font-extrabold text-text-1 leading-none">{fmt(s.monto / 1_000_000)}M</p>
                      <p className="text-[10px] mt-0.5" style={{ color: TEXT4 }}>XAF solicitados</p>
                    </div>
                    <Button variant="primary" size="sm">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />Participar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}

// ── DETALLE DE CONTRATO ───────────────────────────────────────────────────────
export function EmpContratoDetalle() {
  const { go } = useApp();
  const c = _selectedContrato;
  const pct  = Math.round((c.utilizado / c.asignado) * 100);
  const bar  = pct > 90 ? ERR : pct > 70 ? WARN : GREEN;
  const disp = c.asignado - c.utilizado;
  const facturasContrato = facturas.filter(f => f.contrato === c.id);
  const pyme = pymes.find(p => p.ini === c.ini);

  return (
    <AppShell active="empContratos" role="contratante" title="Detalle de Contrato" sub={c.id}>
      <div className="fade-in space-y-5">

        <button onClick={() => go('empContratos')} className="flex items-center gap-1.5 text-[12px] font-semibold hover:opacity-75 transition" style={{ color: ORA }}>
          <ChevronRight className="w-4 h-4 rotate-180" /> Volver a Mis Contratos
        </button>

        {/* Hero */}
        <div className="card-enter bg-white rounded-[14px] border border-border p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
            <IniAvatar ini={c.ini} size={52} />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-[18px] font-bold text-text-1">{c.pyme}</h2>
                <Badge variant={c.estado === 'Activo' ? 'green' : 'gray'}>{c.estado}</Badge>
              </div>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: TEXT4 }}>{c.id}</p>
              <p className="text-[12px]" style={{ color: TEXT4 }}>{c.sector}</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => go('empNuevaSolicitud')}>
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />Solicitar ampliación
            </Button>
          </div>

          {/* Cifras */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border mb-4">
            {[
              { lbl: 'Fondo Asignado', val: fmt(c.asignado),  iconBg: '#FDEEEB', iconColor: RED,   Icon: TrendingUp  },
              { lbl: 'Utilizado',      val: fmt(c.utilizado), iconBg: '#FDF6E8', iconColor: WARN,  Icon: CreditCard  },
              { lbl: 'Disponible',     val: fmt(disp),        iconBg: '#E3F4EA', iconColor: GREEN, Icon: CheckCircle },
            ].map(({ lbl, val, iconBg, iconColor, Icon }) => (
              <div key={lbl} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                  <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide">{lbl}</p>
                  <p className="text-[14px] font-extrabold text-text-1 leading-tight">{val} <span className="text-[10px] font-normal" style={{ color: TEXT4 }}>XAF</span></p>
                </div>
              </div>
            ))}
          </div>

          {/* Barra */}
          <div>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="font-semibold" style={{ color: TEXT4 }}>Utilización del fondo</span>
              <span className="font-bold" style={{ color: bar }}>{pct}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: BORDER }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bar }} />
            </div>
          </div>
        </div>

        {/* Info PYME */}
        {pyme && (
          <div className="card-enter bg-white rounded-[14px] border border-border p-5" style={{ animationDelay: '60ms' }}>
            <SectionHeader title="Información de la PYME" sub="Perfil crediticio y de riesgo" Icon={Users} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: TEXT4 }} />
                    <span className="text-[11px] font-semibold" style={{ color: TEXT4 }}>Score crediticio</span>
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: scoreColor(pyme.score) }}>{pyme.score}/100</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: BORDER }}>
                  <div className="h-full rounded-full" style={{ width: `${pyme.score}%`, background: scoreColor(pyme.score) }} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: '#E3F4EA' }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: GREEN }} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-text-4 uppercase tracking-wide">Semáforo de riesgo</p>
                  <p className="text-[15px] font-bold" style={{ color: semColor(pyme.semaforo) }}>{pyme.semaforo}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Facturas del contrato */}
        <div className="card-enter bg-white rounded-[14px] border border-border overflow-hidden" style={{ animationDelay: '120ms' }}>
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[13px] font-bold text-text-1">Facturas del contrato</p>
            <p className="text-[11px]" style={{ color: TEXT4 }}>{facturasContrato.length} facturas registradas en este contrato</p>
          </div>
          {facturasContrato.length === 0 ? (
            <p className="text-[13px] text-center py-8" style={{ color: TEXT4 }}>No hay facturas en este contrato aún.</p>
          ) : (
            <div className="divide-y divide-border">
              {facturasContrato.map(f => (
                <div key={f.id} className="p-4 flex items-center justify-between gap-3 hover:bg-page-bg/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: '#E3F4EA' }}>
                      <Receipt className="w-4 h-4" style={{ color: GREEN }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-mono font-semibold text-text-1">{f.id}</p>
                      <p className="text-[10px]" style={{ color: TEXT4 }}>{f.fecha}</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-text-1 hidden sm:block">
                    {fmt(f.monto)} <span className="text-[10px] font-normal" style={{ color: TEXT4 }}>XAF</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge variant={facturaBadge(f.estado)}>{f.estado}</Badge>
                    {f.estado === 'Recibida' && (
                      <Button variant="primary" size="sm"><CheckCircle className="w-3.5 h-3.5 mr-1" />Validar</Button>
                    )}
                    {f.estado === 'Verificada' && (
                      <Button variant="primary" size="sm"><Zap className="w-3.5 h-3.5 mr-1" />Emitir IPI</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}

// ── NUEVA SOLICITUD ───────────────────────────────────────────────────────────
export function EmpNuevaSolicitud() {
  const { go } = useApp();
  const [tipo, setTipo] = useState('Nuevo contrato');
  const [pymeName, setPymeName] = useState('');
  const [monto, setMonto] = useState('');
  const [plazo, setPlazo] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <AppShell active="empSolicitudes" role="contratante" title="Nueva Solicitud" sub="Empresa Contratante · TotalEnerGE S.A.">
      <div className="fade-in space-y-5 max-w-2xl">

        <button onClick={() => go('empContratos')} className="flex items-center gap-1.5 text-[12px] font-semibold hover:opacity-75 transition" style={{ color: ORA }}>
          <ChevronRight className="w-4 h-4 rotate-180" /> Volver
        </button>

        <div className="card-enter bg-white rounded-[14px] border border-border p-6 space-y-5">
          <SectionHeader title="Datos de la solicitud" sub="Completa los campos para iniciar el proceso con Bonafide" Icon={FilePlus} />

          <FormGroup label="Tipo de solicitud">
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-[8px] border border-border bg-white text-text-1 focus:outline-none focus:border-orange"
            >
              {['Nuevo contrato', 'Ampliación de fondo', 'Renovación'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="PYME a contratar">
              <Input value={pymeName} onChange={e => setPymeName(e.target.value)} placeholder="Nombre o RUC de la PYME" />
            </FormGroup>
            <FormGroup label="Monto solicitado (XAF)">
              <Input value={monto} onChange={e => setMonto(e.target.value)} placeholder="Ej. 50.000.000" />
            </FormGroup>
            <FormGroup label="Plazo (meses)">
              <Input value={plazo} onChange={e => setPlazo(e.target.value)} placeholder="Ej. 12" />
            </FormGroup>
          </div>

          <FormGroup label="Justificación / descripción">
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={4}
              placeholder="Describe el objeto del contrato y la necesidad…"
              className="w-full px-3 py-2 text-[13px] rounded-[8px] border border-border bg-white text-text-1 focus:outline-none focus:border-orange resize-none"
            />
          </FormGroup>

          {/* Adjuntos */}
          <div className="rounded-[10px] border-2 border-dashed border-border p-5 text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-text-4" />
            <p className="text-[12px] font-semibold text-text-3">Adjuntar documentos</p>
            <p className="text-[11px] text-text-4">Contrato borrador, estados financieros, etc.</p>
            <button className="mt-2 text-[11px] font-semibold px-3 py-1.5 rounded-[8px] border border-border hover:bg-page-bg transition" style={{ color: ORA }}>
              Seleccionar archivos
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => go('empContratos')}>Cancelar</Button>
            <Button variant="primary" size="sm">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />Enviar solicitud
            </Button>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

// ── MI PERFIL — idéntico al estilo de PYME ────────────────────────────────────
const SCORE_CT       = 820;
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
                  : <div className="w-full h-full flex items-center justify-center text-white font-bold text-[28px]"
                         style={{ background: 'linear-gradient(135deg, #E0201C, #EF7A2C)' }}>TE</div>
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
