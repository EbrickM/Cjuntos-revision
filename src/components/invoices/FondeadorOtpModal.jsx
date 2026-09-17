// ── Modal OTP del Banco Fondeador (SUBP 1 del BPMN) ──────────────────────────
// Aparece en el portal de la Empresa Contratante cuando una factura está en
// estado "OTP Enviada": el Banco Fondeador (vía Bonafide) generó un código de
// verificación que la Contratante debe validar para confirmar la transferencia.
// Misma estética que OTPModal de login / IpiVerificacionModal.
import { useState, useRef, useEffect } from 'react';
import { Mail, X } from 'lucide-react';
import Button from '../ui/Button';
import { fmt } from '../../pages/empresa-pequena/epData';

export default function FondeadorOtpModal({ factura, email = 'info@totalenerge.gq', onClose, onConfirm }) {
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
            <h2 className="text-2xl font-bold text-text-1 mb-1">Verificar transferencia</h2>
            <p className="text-sm text-text-3">
              El Banco Fondeador envió un código de 6 dígitos a{' '}
              <span className="font-semibold text-text-1">{email}</span>
            </p>
            {factura && (
              <p className="text-[11px] mt-1.5 font-mono" style={{ color: '#A9A6A1' }}>
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
            Confirmar transferencia
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
}