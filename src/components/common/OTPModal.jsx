import { useState, useRef, useEffect } from 'react';
import { X, Mail, ShieldCheck, KeyRound, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 10 * 60;

const formatTimer = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

// Prototipo sin backend: no hay servicio de OTP real, así que derivamos un
// nombre de cortesía a partir del correo para mostrarlo en el Topbar.
const nameFromEmail = (email) => {
  const local = email.split('@')[0] ?? '';
  const name = local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return name || 'Usuario';
};

const METHOD_META = {
  email:  { Icon: Mail,        title: 'Correo electrónico',      hint: null },
  totp:   { Icon: ShieldCheck, title: 'Aplicación autenticadora', hint: 'Google Authenticator u otra app' },
  backup: { Icon: KeyRound,    title: 'Código de respaldo',       hint: 'Usa uno de tus códigos guardados' },
};

// Mounted only while open (see Login.jsx: `{showOTP && <OTPModal ... />}`) so
// every open starts from fresh state via the useState initializers below —
// no separate reset-on-open effect needed.
//
// Prototipo sin backend: no hay servicio de OTP/TOTP/backup-codes real detrás
// de esto. El flujo de 3 pasos (correo → método → código) replica el de
// bonafide-kappa solo visualmente — cualquier método lleva al mismo paso de
// código simulado, y cualquier código de 6 dígitos se acepta como válido.
export default function OTPModal({ onClose, onVerify }) {
  const setSession = useAuthStore((s) => s.setSession);
  const [step,      setStep]      = useState('contact'); // 'contact' | 'method' | 'code'
  const [contact,   setContact]   = useState('');
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [timer,     setTimer]     = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [sending,   setSending]   = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeMethod, setActiveMethod] = useState('email'); // 'email' | 'totp' | 'backup'
  const inputRefs = useRef([]);

  useEffect(() => {
    if (step !== 'code' || activeMethod !== 'email') return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, activeMethod]);

  const maskEmail = (value) => {
    if (!value) return '···';
    const [name, domain] = value.split('@');
    if (!domain) return `${value.slice(0, 2)}···`;
    return `${name.slice(0, 2)}···@${domain}`;
  };

  // Paso 1 → 2: solo valida el formato del correo y pasa a la selección de
  // método (no se envía nada todavía, igual que en kappa).
  const handleSend = () => {
    const email = contact.trim();
    if (!email || sending) return;

    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Introduce un correo válido.');
      return;
    }

    setEmailError('');
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep('method');
    }, 400);
  };

  const focusFirstDigit = () => setTimeout(() => inputRefs.current[0]?.focus(), 100);

  const goToCode = (method) => {
    setOtp(['', '', '', '', '', '']);
    setActiveMethod(method);
    setStep('code');
    focusFirstDigit();
  };

  // Selección de método: "Correo" simula el envío (con su propio timer de
  // reenvío); "Autenticador"/"Código de respaldo" pasan directo al paso de
  // código, igual que en kappa (no envían nada).
  const selectEmailMethod = () => {
    if (sending) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setTimer(RESEND_SECONDS);
      setCanResend(false);
      goToCode('email');
    }, 400);
  };

  const selectTotpMethod = () => goToCode('totp');
  const selectBackupMethod = () => goToCode('backup');

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

  // Prototipo sin backend: cualquier código de 6 dígitos se acepta como
  // válido, sin importar el método elegido.
  const handleVerify = () => {
    const code = otp.join('');
    if (code.length !== 6 || verifying) return;

    setVerifying(true);
    setTimeout(() => {
      const email = contact.trim();
      setSession({
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token',
        expiresIn: 3600,
        user: { fullName: nameFromEmail(email), email },
      });
      setVerifying(false);
      onVerify(email);
    }, 500);
  };

  const handleResend = () => {
    if (!canResend || sending) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setTimer(RESEND_SECONDS);
      setCanResend(false);
    }, 400);
  };

  const { Icon: MethodIcon } = METHOD_META[activeMethod];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bona-gradient-shadow w-full max-w-md rounded-2xl p-[2px]"
      >
      <div className="bg-white rounded-2xl p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-text-3" />
        </button>

        {/* ── PASO 1: introducir correo ── */}
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
                  onChange={(e) => { setContact(e.target.value); if (emailError) setEmailError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="correo@ejemplo.com"
                  className={`h-12 w-full border-2 rounded-lg pl-11 pr-4 text-[14px] text-text-1 bg-[#FAFAFA] outline-none transition-all focus:bg-white ${
                    emailError ? 'border-red text-red-text' : 'border-input-border focus:border-orange focus:shadow-[0_0_0_3px_rgba(224,32,28,0.12)]'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-xs font-medium text-red-text mt-1.5">{emailError}</p>
              )}
            </div>

            <Button
              onClick={handleSend}
              full
              disabled={!contact.trim() || sending}
              className="h-[48px] gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Continuar <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </>
        )}

        {/* ── PASO 2: elegir método de verificación ── */}
        {step === 'method' && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange to-orange-dark flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-1 mb-1">Verificación de identidad</h2>
              <p className="text-sm text-text-3">Elige cómo quieres verificar tu identidad</p>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <button
                onClick={selectEmailMethod}
                disabled={sending}
                className="w-full flex items-center gap-3 border-2 border-gray-200 rounded-lg px-4 py-3 text-left hover:border-orange transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Mail className="w-5 h-5 text-text-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-1">Correo electrónico</p>
                  <p className="text-xs text-text-4 truncate">{maskEmail(contact)}</p>
                </div>
                {sending ? (
                  <Loader2 className="w-4 h-4 text-text-4 shrink-0 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-4 shrink-0" />
                )}
              </button>

              <button
                onClick={selectTotpMethod}
                disabled={sending}
                className="w-full flex items-center gap-3 border-2 border-gray-200 rounded-lg px-4 py-3 text-left hover:border-orange transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-5 h-5 text-text-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-1">{METHOD_META.totp.title}</p>
                  <p className="text-xs text-text-4 truncate">{METHOD_META.totp.hint}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-4 shrink-0" />
              </button>

              <button
                onClick={selectBackupMethod}
                disabled={sending}
                className="w-full flex items-center gap-3 border-2 border-gray-200 rounded-lg px-4 py-3 text-left hover:border-orange transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <KeyRound className="w-5 h-5 text-text-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-1">{METHOD_META.backup.title}</p>
                  <p className="text-xs text-text-4 truncate">{METHOD_META.backup.hint}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-4 shrink-0" />
              </button>
            </div>

            <button
              onClick={() => setStep('contact')}
              className="text-sm text-text-3 hover:text-orange transition-colors cursor-pointer font-medium inline-flex items-center gap-1"
            >
              ← Volver
            </button>
          </>
        )}

        {/* ── PASO 3: introducir código ── */}
        {step === 'code' && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange to-orange-dark flex items-center justify-center">
                <MethodIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-1 mb-1">Código enviado</h2>
              {activeMethod === 'email' ? (
                <p className="text-sm text-text-3">
                  Ingresa el código de 6 dígitos enviado a{' '}
                  <span className="font-semibold text-text-1">{maskEmail(contact)}</span>
                </p>
              ) : activeMethod === 'totp' ? (
                <p className="text-sm text-text-3">Ingresa el código de tu aplicación autenticadora</p>
              ) : (
                <p className="text-sm text-text-3">Ingresa uno de tus códigos de respaldo</p>
              )}
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
                  disabled={verifying}
                  className="w-11 h-12 text-center text-xl font-bold border-2 border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              full
              disabled={otp.join('').length !== 6 || verifying}
              className="mb-4 h-[48px]"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar código'}
            </Button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('method')}
                className="text-sm text-text-3 hover:text-orange transition-colors cursor-pointer font-medium"
              >
                ← Volver
              </button>
              {activeMethod === 'email' && (
                <button
                  onClick={handleResend}
                  disabled={!canResend || sending}
                  className={`text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                    canResend ? 'text-orange cursor-pointer hover:underline' : 'text-text-4 cursor-not-allowed'
                  }`}
                >
                  {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {canResend ? 'Reenviar código' : `Reenviar (${formatTimer(timer)})`}
                </button>
              )}
            </div>
          </>
        )}

      </div>
      </div>
    </div>
  );
}
