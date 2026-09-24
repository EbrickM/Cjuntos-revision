import { useState, useRef, useEffect } from 'react';
import { Mail, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { RED, ORA, TEXT4, fmt, suministradores as suministradoresSeed } from './provData';
import { localDb } from '../../lib/localDb';

// ── Directorio de Suministradores (persistido) ────────────────────────────────
// Suministradores.jsx (directorio) y ContratoDetalle.jsx (botón "Agregar
// Suministrador" dentro de un contrato) comparten el mismo directorio vía
// localDb, para que un suministrador registrado desde cualquiera de las dos
// pantallas aparezca en ambas.
const SUMINISTRADORES_KEY = 'prov_suministradores';
const SUMINISTRADORES_VERSION = 1;

// eslint-disable-next-line react-refresh/only-export-components
export function useSuministradores() {
  const [lista, setLista] = useState(() => localDb.get(SUMINISTRADORES_KEY, suministradoresSeed, SUMINISTRADORES_VERSION));
  useEffect(() => { localDb.set(SUMINISTRADORES_KEY, lista); }, [lista]);
  return [lista, setLista];
}

// ── Helpers de Perfil (idénticos a Contratante/PYME) ──────────────────────────
export const HeroBadge = ({ label, value, Icon, bg, color }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-[12px]" style={{ background: bg }}>
    <div className="w-9 h-9 flex items-center justify-center shrink-0">
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

export const ComplianceItem = ({ label, value, sub, Icon, iconColor }) => (
  <div className="rounded-[12px] border border-border p-4">
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className="w-9 h-9 flex items-center justify-center shrink-0">
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
      <div className="bona-gradient-shadow w-full max-w-md rounded-2xl p-[2px]">
        <div className="bg-white rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
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
              <span className="font-semibold text-text-1">info@transge.gq</span>
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

// ── InfoRow ────────────────────────────────────────────────────────────────────
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
