import { useState, useRef, useEffect } from 'react';
import { X, Mail, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

export default function OTPModal({ isOpen, onClose, onVerify, email }) {
  const [step,      setStep]      = useState('contact');
  const [contact,   setContact]   = useState('');
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [timer,     setTimer]     = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;
    setStep('contact');
    setContact('');
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    setCanResend(false);
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'code') return;
    setTimer(60);
    setCanResend(false);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen) return null;

  const maskEmail = (value) => {
    if (!value) return '···';
    const [name, domain] = value.split('@');
    if (!domain) return `${value.slice(0, 2)}···`;
    return `${name.slice(0, 2)}···@${domain}`;
  };

  const handleSend = () => {
    if (!contact.trim()) return;
    setStep('code');
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    const next = pasted.split('');
    setOtp([...next, ...Array(6 - next.length).fill('')]);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = () => {
    if (otp.join('').length === 6) onVerify(otp.join(''));
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    setCanResend(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-md rounded-2xl p-[2px]"
        style={{
          background: 'linear-gradient(135deg, var(--bonafide-red) 0%, var(--bonafide-orange) 100%)',
          boxShadow: '0 8px 32px rgba(224,32,28,0.18), 0 2px 8px rgba(239,122,44,0.12)',
        }}
      >
      <div className="bg-white rounded-2xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-text-3" />
        </button>

        {/* ── PASO 1: introducir email ── */}
        {step === 'contact' && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange to-orange-dark flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-1 mb-1">Verificación de identidad</h2>
              <p className="text-sm text-text-3">
                Introduce tu correo para recibir el código de acceso
              </p>
            </div>

            <div className="mb-6">
              <label className="text-[12px] font-semibold text-text-2 block mb-1.5">
                Correo
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                <input
                  type="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="correo@ejemplo.com"
                  className="h-12 w-full border-2 border-input-border rounded-lg pl-11 pr-4 text-[14px] text-text-1 bg-[#FAFAFA] outline-none transition-all focus:border-orange focus:bg-white focus:shadow-[0_0_0_3px_rgba(224,32,28,0.12)]"
                />
              </div>
            </div>

            <Button
              onClick={handleSend}
              full
              disabled={!contact.trim()}
              className="h-[48px] gap-2"
            >
              Enviar código <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* ── PASO 2: introducir código OTP ── */}
        {step === 'code' && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange to-orange-dark flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-1 mb-1">Código enviado</h2>
              <p className="text-sm text-text-3">
                Ingresa el código de 6 dígitos enviado a{' '}
                <span className="font-semibold text-text-1">{maskEmail(contact)}</span>
              </p>
            </div>

            <div className="flex gap-2 mb-6 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-11 h-12 text-center text-xl font-bold border-2 border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              full
              disabled={otp.join('').length !== 6}
              className="mb-4 h-[48px]"
            >
              Verificar código
            </Button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('contact')}
                className="text-sm text-text-3 hover:text-orange transition-colors cursor-pointer font-medium"
              >
                ← Volver
              </button>
              <button
                onClick={handleResend}
                disabled={!canResend}
                className={`text-sm font-medium transition-colors ${
                  canResend ? 'text-orange cursor-pointer hover:underline' : 'text-text-4 cursor-not-allowed'
                }`}
              >
                {canResend ? 'Reenviar código' : `Reenviar (${timer}s)`}
              </button>
            </div>
          </>
        )}

      </div>
      </div>
    </div>
  );
}
