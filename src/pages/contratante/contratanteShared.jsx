import { useState, useRef, useEffect } from 'react';
import { Mail, X } from 'lucide-react';
import Button from '../../components/ui/Button';

// ── Brand tokens ──────────────────────────────────────────────────────────────
export const RED    = '#E0201C';
export const ORA    = '#EF7A2C';
export const GREEN  = '#2E7D5B';
export const WARN   = '#C68A1D';
export const ERR    = '#B8352A';
export const TEXT4  = '#A9A6A1';
export const BORDER = '#ECEAE7';
export const BLUE   = '#3B82F6';

export const fmt = n => new Intl.NumberFormat('de-DE').format(n);

// ── Helpers de Perfil (idénticos al PYME) ─────────────────────────────────────
export const HeroBadge = ({ label, value, Icon, bg, color }) => (
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

export const SectionHeader = ({ title, sub, Icon, right }) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5"
           style={{ background: 'linear-gradient(135deg, #E0201C, #EF7A2C)' }}>
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

export const ComplianceItem = ({ label, value, sub, Icon, iconBg, iconColor }) => (
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
export const IpiVerificacionModal = ({ factura, onClose, onConfirm }) => {
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
      <div className="w-full max-w-md rounded-2xl p-[2px]"
           style={{ background: 'linear-gradient(135deg, #E0201C 0%, #EF7A2C 100%)', boxShadow: '0 8px 32px rgba(224,32,28,0.18)' }}>
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
export const contratos = [
  { id: 'CT-2026-0041', pyme: 'Const. Silva Ltd.',  ini: 'CS', sector: 'Construcción',    asignado: 180_000_000, utilizado: 120_000_000, facturas: 14, estado: 'Activo',
    objeto: 'Construcción de sede corporativa en el Paseo Luba, Malabo — estructura, instalaciones y acabados interiores.', fechaInicio: '01/03/2026', fechaFin: '28/02/2027', plazo: '12 meses' },
  { id: 'CT-2026-0038', pyme: 'TechBata PYME S.L.', ini: 'TB', sector: 'Tecnología',      asignado: 120_000_000, utilizado: 75_000_000,  facturas: 8,  estado: 'Activo',
    objeto: 'Desarrollo e implementación de sistemas TI corporativos y mantenimiento de infraestructura digital.', fechaInicio: '01/04/2026', fechaFin: '31/03/2027', plazo: '12 meses' },
  { id: 'CT-2026-0031', pyme: 'AgriEco PYME',       ini: 'AE', sector: 'Agroindustria',   asignado: 90_000_000,  utilizado: 60_000_000,  facturas: 6,  estado: 'Activo',
    objeto: 'Suministro de productos agrícolas y servicios de agroindustria para operaciones de la empresa durante la campaña 2026.', fechaInicio: '01/02/2026', fechaFin: '31/01/2027', plazo: '12 meses' },
  { id: 'CT-2026-0028', pyme: 'LogiGE S.A.',        ini: 'LG', sector: 'Logística',       asignado: 75_000_000,  utilizado: 45_000_000,  facturas: 5,  estado: 'Activo',
    objeto: 'Gestión logística y transporte de materiales industriales entre Malabo y Bata, incluyendo almacenamiento y distribución.', fechaInicio: '01/01/2026', fechaFin: '31/12/2026', plazo: '12 meses' },
  { id: 'CT-2026-0019', pyme: 'ServLog GE',         ini: 'SL', sector: 'Servicios',       asignado: 60_000_000,  utilizado: 27_000_000,  facturas: 4,  estado: 'Activo',
    objeto: 'Prestación de servicios de mantenimiento preventivo y correctivo en instalaciones y equipos corporativos.', fechaInicio: '15/02/2026', fechaFin: '14/02/2027', plazo: '12 meses' },
  { id: 'CT-2025-0087', pyme: 'InfraBata S.L.',     ini: 'IB', sector: 'Infraestructura', asignado: 45_000_000,  utilizado: 45_000_000,  facturas: 5,  estado: 'Cerrado',
    objeto: 'Obras de infraestructura vial y civil en la zona sur de Bata — pavimentación y drenaje de 8 km de vía.', fechaInicio: '01/06/2025', fechaFin: '30/11/2025', plazo: '6 meses' },
];

export const facturas = [
  { id: 'FAC-2026-0911', contrato: 'CT-2026-0041', pyme: 'Const. Silva Ltd.',  monto: 21_500_000, fecha: '28/06/2026', estado: 'Verificada',  concepto: 'Obras de estructura fase 2 — planta baja y primer piso' },
  { id: 'FAC-2026-0908', contrato: 'CT-2026-0038', pyme: 'TechBata PYME S.L.', monto: 15_200_000, fecha: '25/06/2026', estado: 'Recibida',    concepto: 'Licencias de software y configuración de servidores' },
  { id: 'FAC-2026-0901', contrato: 'CT-2026-0031', pyme: 'AgriEco PYME',       monto: 8_750_000,  fecha: '20/06/2026', estado: 'IPI emitido', concepto: 'Suministro de fertilizantes y semillas — lote junio' },
  { id: 'FAC-2026-0897', contrato: 'CT-2026-0028', pyme: 'LogiGE S.A.',        monto: 12_300_000, fecha: '18/06/2026', estado: 'Pagada',      concepto: 'Transporte de materiales Malabo–Bata — semana 24' },
  { id: 'FAC-2026-0892', contrato: 'CT-2026-0041', pyme: 'Const. Silva Ltd.',  monto: 28_700_000, fecha: '15/06/2026', estado: 'Pagada',      concepto: 'Obras de cimentación y estructura principal' },
  { id: 'FAC-2026-0885', contrato: 'CT-2026-0019', pyme: 'ServLog GE',         monto: 6_800_000,  fecha: '10/06/2026', estado: 'En revisión', concepto: 'Mantenimiento preventivo instalaciones eléctricas' },
  { id: 'FAC-2026-0878', contrato: 'CT-2026-0038', pyme: 'TechBata PYME S.L.', monto: 9_400_000,  fecha: '05/06/2026', estado: 'Pagada',      concepto: 'Soporte técnico y actualización de sistemas TI' },
];

export const pymes = [
  { ini: 'CS', nombre: 'Const. Silva Ltd.',  sector: 'Construcción',    contratos: 3, montoTotal: 225_000_000, score: 87, semaforo: 'Verde',
    nombreComercial: 'Construsilva GE',    ruc: 'GE-2018-04512', telefono: '+240 222 301 458', correo: 'info@constsilva.gq',
    repNombre: 'Carlos Silva Mba',         repTipoDoc: 'DNI', repId: 'GE-19820314-CS', repCargo: 'Gerente General',      repTel: '+240 551 120 001', repCorreo: 'c.silva@constsilva.gq'       },
  { ini: 'TB', nombre: 'TechBata PYME S.L.', sector: 'Tecnología',      contratos: 2, montoTotal: 165_000_000, score: 82, semaforo: 'Verde',
    nombreComercial: 'TechBata',           ruc: 'GE-2020-07834', telefono: '+240 333 215 099', correo: 'contacto@techbata.gq',
    repNombre: 'Ana Nguema Ondo',          repTipoDoc: 'DNI', repId: 'GE-19900521-AN', repCargo: 'Directora Ejecutiva',  repTel: '+240 551 440 220', repCorreo: 'a.nguema@techbata.gq'        },
  { ini: 'AE', nombre: 'AgriEco PYME',       sector: 'Agroindustria',   contratos: 2, montoTotal: 118_000_000, score: 61, semaforo: 'Amarillo',
    nombreComercial: 'AgriEco',            ruc: 'GE-2019-03167', telefono: '+240 222 554 811', correo: 'admin@agriecopyme.gq',
    repNombre: 'Jean Mbang Esono',         repTipoDoc: 'Pasaporte', repId: 'PA-20041198-JM', repCargo: 'Administrador',     repTel: '+240 551 302 774', repCorreo: 'j.mbang@agriecopyme.gq'    },
  { ini: 'LG', nombre: 'LogiGE S.A.',        sector: 'Logística',       contratos: 1, montoTotal: 75_000_000,  score: 79, semaforo: 'Verde',
    nombreComercial: 'LogiGE',             ruc: 'GE-2021-09245', telefono: '+240 222 678 334', correo: 'logige@logige.gq',
    repNombre: 'Pablo Ondo Abeso',         repTipoDoc: 'DNI', repId: 'GE-19751128-PO', repCargo: 'Director de Logística', repTel: '+240 551 875 003', repCorreo: 'p.ondo@logige.gq'           },
  { ini: 'SL', nombre: 'ServLog GE',         sector: 'Servicios',       contratos: 1, montoTotal: 60_000_000,  score: 32, semaforo: 'Rojo',
    nombreComercial: 'ServLog',            ruc: 'GE-2022-01578', telefono: '+240 222 412 667', correo: 'info@servlogge.gq',
    repNombre: 'Martín Nchama Edu',        repTipoDoc: 'DNI', repId: 'GE-19881005-MN', repCargo: 'Representante Legal',  repTel: '+240 551 010 558', repCorreo: 'm.nchama@servlogge.gq'     },
  { ini: 'IB', nombre: 'InfraBata S.L.',     sector: 'Infraestructura', contratos: 1, montoTotal: 45_000_000,  score: 75, semaforo: 'Verde',
    nombreComercial: 'InfraBata',          ruc: 'GE-2017-06341', telefono: '+240 333 890 123', correo: 'infrabata@infrabata.gq',
    repNombre: 'Sofía Maye Eneida',        repTipoDoc: 'DNI', repId: 'GE-19930622-SM', repCargo: 'CEO',                   repTel: '+240 551 663 442', repCorreo: 's.maye@infrabata.gq'        },
];

export const misSolicitudes = [
  { id: 'SOL-2026-0142', tipo: 'Nuevo contrato', desc: 'Contrato con ConstCentro PYME · Construcción', monto: 50_000_000, fecha: '01/07/2026', estado: 'En revisión' },
  { id: 'SOL-2026-0138', tipo: 'Nuevo contrato', desc: 'Contrato con MaderGE PYME S.L.',               monto: 80_000_000, fecha: '25/06/2026', estado: 'Aprobada'    },
  { id: 'SOL-2026-0119', tipo: 'Nuevo contrato', desc: 'Contrato con InfraBata S.L.',                   monto: 45_000_000, fecha: '10/06/2026', estado: 'Rechazada'   },
];

export const solicitudesPymes = [
  { id: 'SOLP-2026-0051', ini: 'CC', pyme: 'ConstCentro PYME', sector: 'Construcción',  desc: 'Obras de infraestructura vial — Bata Norte',    monto: 95_000_000, fecha: '05/07/2026' },
  { id: 'SOLP-2026-0048', ini: 'AS', pyme: 'AgroSur GE S.L.',  sector: 'Agroindustria', desc: 'Suministro productos agrícolas — campaña 2026', monto: 60_000_000, fecha: '03/07/2026' },
  { id: 'SOLP-2026-0044', ini: 'TM', pyme: 'TechMalabo Ltd.',  sector: 'Tecnología',    desc: 'Mantenimiento sistemas TI corporativos',        monto: 35_000_000, fecha: '28/06/2026' },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────
export const facturaBadge = e => ({ 'Recibida': 'orange', 'En revisión': 'yellow', 'Verificada': 'blue', 'IPI emitido': 'green', 'Pagada': 'green' }[e] ?? 'gray');
export const solicBadge   = e => ({ 'En revisión': 'yellow', 'Aprobada': 'green', 'Rechazada': 'red' }[e] ?? 'gray');
export const semBadge     = s => s === 'Verde' ? 'green' : s === 'Amarillo' ? 'yellow' : 'red';
export const semColor     = s => s === 'Verde' ? GREEN : s === 'Amarillo' ? WARN : ERR;
export const scoreColor   = n => n >= 75 ? GREEN : n >= 55 ? WARN : ERR;

// ── InfoRow (igual que en PYME) ───────────────────────────────────────────────
export const InfoRow = ({ label, value }) => (
  <div>
    <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1">{label}</div>
    <div className="text-[13px] text-text-1">{value || '—'}</div>
  </div>
);

// ── Ini Avatar ────────────────────────────────────────────────────────────────
export const IniAvatar = ({ ini, size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg, ${RED}, ${ORA})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: size * 0.36 }}>
    {ini}
  </div>
);

// ── Estado compartido entre pantallas (selección de contrato / solicitud) ─────
export const contratanteState = {
  selectedContrato: contratos[0],
  solicitudPyme: null,
};
