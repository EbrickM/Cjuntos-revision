import { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { requestAdminOtp, verifyAdminOtp, AuthApiError } from '../../lib/authApi';
import { useAuthStore } from '../../stores/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 10 * 60;

const formatTimer = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

// Mirrors OTPModal's email + code shell, but talks to the dedicated
// `/auth/admin/*` endpoints — a fully separate login flow from the client
// one (its own account directory, no username/password on the backend).
//
// Mounted only while open (see Login.jsx: `{showAdmin && <AdminLoginModal ... />}`)
// so every open starts from fresh state via the useState initializers below —
// no separate reset-on-open effect needed.
export default function AdminLoginModal({ onClose, onVerify }) {
  const setAdminSession = useAuthStore((s) => s.setAdminSession);
  const [step,      setStep]      = useState('contact');
  const [contact,   setContact]   = useState('');
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [timer,     setTimer]     = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [codeError,  setCodeError]  = useState('');
  const [codeInvalid, setCodeInvalid] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);

  const clearCodeError = () => {
    setCodeError('');
    setCodeInvalid(false);
  };

  useEffect(() => {
    if (step !== 'code') return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const maskEmail = (value) => {
    if (!value) return '···';
    const [name, domain] = value.split('@');
    if (!domain) return `${value.slice(0, 2)}···`;
    return `${name.slice(0, 2)}···@${domain}`;
  };

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  };

  const handleSend = async () => {
    const email = contact.trim();
    if (!email || sending) return;

    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Introduce un correo válido.');
      return;
    }

    setEmailError('');
    setSending(true);
    try {
      await requestAdminOtp(email);
      setOtp(['', '', '', '', '', '']);
      clearCodeError();
      setTimer(RESEND_SECONDS);
      setCanResend(false);
      setStep('code');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      let message = 'No se pudo enviar el código. Inténtalo de nuevo.';
      if (err instanceof AuthApiError) {
        if (err.reason === 'network') message = 'No se pudo conectar con el servidor.';
        else if (err.reason === 'server') message = 'El servidor tuvo un problema. Inténtalo más tarde.';
        else if (err.status === 404) message = 'No encontramos una cuenta de administrador con ese correo.';
        else message = err.message || message;
      }
      setEmailError(message);
    } finally {
      setSending(false);
    }
  };

  const handleChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    clearCodeError();
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
    clearCodeError();
    const next = pasted.split('');
    setOtp([...next, ...Array(6 - next.length).fill('')]);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6 || verifying) return;

    clearCodeError();
    setVerifying(true);
    try {
      const result = await verifyAdminOtp(contact.trim(), code);
      setAdminSession(result);
      onVerify();
    } catch (err) {
      if (err instanceof AuthApiError && err.reason === 'network') {
        setCodeError('No se pudo conectar con el servidor.');
      } else if (err instanceof AuthApiError && err.reason === 'server') {
        setCodeError('El servidor tuvo un problema. Inténtalo más tarde.');
      } else {
        setCodeError('El código es incorrecto o ha expirado.');
        setCodeInvalid(true);
        setOtp(['', '', '', '', '', '']);
        triggerShake();
        inputRefs.current[0]?.focus();
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    if (!canResend || sending) return;
    void handleSend();
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

        {/* Cerrar */}
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
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-1 mb-1">Acceso Administrador</h2>
              <p className="text-sm text-text-3">
                Introduce tu correo de administrador para recibir el código de acceso
              </p>
            </div>

            <div className="mb-6">
              <label className="text-[12px] font-semibold text-text-2 block mb-1.5">Correo</label>
              <input
                type="email"
                value={contact}
                onChange={(e) => { setContact(e.target.value); if (emailError) setEmailError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
                placeholder="admin@bonafide.gq"
                className={`h-12 w-full border-2 rounded-lg px-4 text-[14px] text-text-1 bg-[#FAFAFA] outline-none transition-all focus:bg-white ${
                  emailError ? 'border-red text-red-text' : 'border-input-border focus:border-orange focus:shadow-[0_0_0_3px_rgba(198,40,40,0.12)]'
                }`}
              />
              {emailError && (
                <p className="text-xs font-medium text-red-text mt-1.5">{emailError}</p>
              )}
            </div>

            <Button
              onClick={() => void handleSend()}
              full
              disabled={!contact.trim() || sending}
              className="h-[48px] gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Enviar código <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>

            <div className="text-center mt-5">
              <button
                onClick={onClose}
                className="text-sm text-text-3 hover:text-orange transition-colors cursor-pointer font-medium"
              >
                ← Volver
              </button>
            </div>
          </>
        )}

        {/* ── PASO 2: introducir código OTP ── */}
        {step === 'code' && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange to-orange-dark flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-1 mb-1">Código enviado</h2>
              <p className="text-sm text-text-3">
                Ingresa el código de 6 dígitos enviado a{' '}
                <span className="font-semibold text-text-1">{maskEmail(contact)}</span>
              </p>
            </div>

            {codeError && (
              <p className="text-center text-xs font-semibold text-red-text bg-red-bg border border-red/20 rounded-lg px-3 py-2 mb-4">
                {codeError}
              </p>
            )}

            <div className={`flex gap-2 mb-6 justify-center ${shake ? 'animate-[shake_0.45s_ease]' : ''}`}>
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
                  disabled={verifying}
                  className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent ${
                    codeInvalid ? 'border-red bg-red-bg text-red-text' : 'border-input-border'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={() => void handleVerify()}
              full
              disabled={otp.join('').length !== 6 || verifying}
              className="mb-4 h-[48px]"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar código'}
            </Button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setStep('contact'); clearCodeError(); }}
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
                {canResend ? 'Reenviar código' : `Reenviar (${formatTimer(timer)})`}
              </button>
            </div>
          </>
        )}

      </div>
      </div>
    </div>
  );
}
