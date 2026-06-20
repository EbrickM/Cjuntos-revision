import { useState, useRef, useEffect } from 'react';
import {
  Zap, CheckCircle2, Clock, Leaf,
  Briefcase, ShieldCheck,
  ArrowLeft, Mail, Smartphone,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';

const features = [
  { Icon: Zap,          title: 'Liquidez rápida',   sub: 'En menos de 72 horas' },
  { Icon: CheckCircle2, title: 'Sin comisiones',     sub: 'Cero costes dentro de la red' },
  { Icon: Clock,        title: 'Siempre disponible', sub: 'Operaciones 24/7' },
  { Icon: Leaf,         title: '100% digital',       sub: 'Paperless · ESG · Bajo carbono' },
];

const roles = [
  { id: 'epHome',    label: 'Empresa Pequeña (PYME)', Icon: Briefcase,   desc: 'Pequeñas y medianas empresas' },
  { id: 'adminDash', label: 'Administrador Bonafide', Icon: ShieldCheck, desc: 'Equipo interno Bonafide Microbank' },
];

/* Datos del cliente — en producción vienen del backend */
const CLIENT_EMAIL = 'operaciones@totalenerge.com';
const CLIENT_PHONE = '+240 555 123 456';

const NAVY = '#1a1a1a';
const SLIDE_TRANSITION = 'transform 0.72s cubic-bezier(0.4, 0, 0.2, 1)';

const maskContact = (contact, type) => {
  if (type === 'email') {
    const [name, domain] = contact.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
  }
  return contact.slice(0, 4) + '***' + contact.slice(-3);
};

export default function Login() {
  const { go } = useApp();
  const [showRoles, setShowRoles] = useState(false);
  const [step,      setStep]      = useState('channel'); // 'channel' | 'code'
  const [method,    setMethod]    = useState('email');
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [timer,     setTimer]     = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

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

  const handleSendCode = () => {
    setOtp(['', '', '', '', '', '']);
    setStep('code');
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
    const data = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(data)) return;
    const next = [...data.split(''), ...Array(6 - data.length).fill('')];
    setOtp(next);
    inputRefs.current[Math.min(data.length, 5)]?.focus();
  };

  const handleVerify = () => {
    if (otp.join('').length === 6) setShowRoles(true);
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    setCanResend(false);
  };

  const contactInfo = method === 'email' ? CLIENT_EMAIL : CLIENT_PHONE;

  return (
    <div className="h-screen w-screen bg-white overflow-hidden relative">

      {/* ─── PANEL IZQUIERDO ─────────────────────────────────────────────────── */}
      <div className="absolute inset-y-0 left-0 w-1/2 flex flex-col justify-center px-16 py-12">
        <div className="w-full max-w-[400px] mx-auto flex flex-col justify-center">

          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img
              src="/bonafide-logo.png"
              alt="Creciendo Juntos"
              className="h-28 w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'inline'; }}
            />
            <span style={{ display: 'none', fontSize: 22, fontWeight: 800, color: NAVY }}>Creciendo Juntos</span>
          </div>

          {step === 'channel' ? (
            /* ── Paso 1: selección de canal ── */
            <>
              <h2 className="text-[26px] font-bold mb-1.5 text-center" style={{ color: NAVY }}>
                Iniciar Sesión
              </h2>
              <p className="text-[14px] text-text-3 mb-7 text-center">
                Selecciona cómo quieres recibir tu código de acceso
              </p>

              {/* Selector de canal */}
              <div className="flex gap-2 mb-5 bg-page-bg p-1 rounded-lg">
                <button
                  onClick={() => setMethod('email')}
                  className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    method === 'email' ? 'bg-white text-text-1 shadow-sm' : 'text-text-3 hover:text-text-1'
                  }`}
                >
                  <Mail className="w-4 h-4" /> Correo
                </button>
                <button
                  onClick={() => setMethod('phone')}
                  className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    method === 'phone' ? 'bg-white text-text-1 shadow-sm' : 'text-text-3 hover:text-text-1'
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> Teléfono
                </button>
              </div>

              {/* Contacto enmascarado */}
              <div className="flex items-center gap-3 bg-[#FAFAFA] rounded-lg px-4 py-3.5 mb-6 border border-input-border">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center shrink-0">
                  {method === 'email'
                    ? <Mail className="w-4 h-4 text-white" />
                    : <Smartphone className="w-4 h-4 text-white" />
                  }
                </div>
                <div>
                  <p className="text-[11px] text-text-4 font-medium uppercase tracking-wide">
                    {method === 'email' ? 'Correo registrado' : 'Teléfono registrado'}
                  </p>
                  <p className="text-[14px] font-semibold text-text-1">
                    {maskContact(contactInfo, method)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSendCode}
                className="w-full h-[52px] text-white font-medium text-[15px] rounded-lg cursor-pointer transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #C62828 0%, #F57C00 100%)', boxShadow: '0 4px 16px rgba(198,40,40,0.28)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(198,40,40,0.42)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(198,40,40,0.28)'; }}
              >
                Enviar código de acceso →
              </button>
            </>
          ) : (
            /* ── Paso 2: ingreso del código ── */
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center">
                  {method === 'email'
                    ? <Mail className="w-8 h-8 text-white" />
                    : <Smartphone className="w-8 h-8 text-white" />
                  }
                </div>
              </div>

              <h2 className="text-[26px] font-bold mb-1.5 text-center" style={{ color: NAVY }}>
                Verificación de código
              </h2>
              <p className="text-[14px] text-text-3 mb-7 text-center">
                Ingresa el código de 6 dígitos enviado a{' '}
                <span className="font-semibold text-text-1">{maskContact(contactInfo, method)}</span>
              </p>

              {/* Inputs OTP */}
              <div className="flex gap-2 mb-6 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-11 h-12 text-center text-xl font-bold border-2 border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                disabled={otp.join('').length !== 6}
                className="w-full h-[52px] text-white font-medium text-[15px] rounded-lg cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #C62828 0%, #F57C00 100%)', boxShadow: '0 4px 16px rgba(198,40,40,0.28)' }}
                onMouseEnter={e => { if (otp.join('').length === 6) e.currentTarget.style.boxShadow = '0 6px 20px rgba(198,40,40,0.42)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(198,40,40,0.28)'; }}
              >
                Verificar código →
              </button>

              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={() => setStep('channel')}
                  className="flex items-center gap-1.5 text-[13px] text-text-3 hover:text-orange transition-colors cursor-pointer font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Cambiar método
                </button>
                <button
                  onClick={handleResend}
                  disabled={!canResend}
                  className={`text-[13px] font-medium transition-colors ${
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

      {/* ─── PANEL DERECHO: SELECCIÓN DE ROL ──────────────────────────────── */}
      <div className="absolute inset-y-0 right-0 w-1/2 flex flex-col justify-center px-16 py-12">
        <div className="w-full max-w-[400px] mx-auto">
          <h2 className="text-[26px] font-bold mb-2 leading-tight" style={{ color: NAVY }}>
            Selecciona tu perfil<br />de acceso
          </h2>
          <p className="text-[14px] text-text-3 mb-8">
            Elige el rol con el que deseas continuar en Creciendo Juntos
          </p>

          <div className="flex flex-col gap-3 mb-8">
            {roles.map(({ id, label, Icon, desc }) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="group w-full flex items-center gap-4 px-4 py-3.5 border-2 border-input-border rounded-[12px] text-left bg-white hover:border-orange hover:bg-orange-tint transition-all duration-200 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-[10px] bg-page-bg group-hover:bg-white flex items-center justify-center shrink-0 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-text-1 group-hover:text-orange transition-colors duration-200">{label}</div>
                  <div className="text-[12px] text-text-4">{desc}</div>
                </div>
                <span className="text-text-4 group-hover:text-orange transition-colors duration-200 text-[16px]">→</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRoles(false)}
            className="flex items-center gap-2 text-[13px] text-text-3 hover:text-orange transition-colors duration-200 cursor-pointer font-medium mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </button>
        </div>
      </div>

      {/* ─── OVERLAY DESLIZANTE ────────────────────────────────────────────── */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 z-10 overflow-hidden flex flex-col items-center justify-center px-10 py-12"
        style={{
          background: 'linear-gradient(135deg, #C62828 0%, #F57C00 100%)',
          transform: showRoles ? 'translateX(0%)' : 'translateX(100%)',
          transition: SLIDE_TRANSITION,
          willChange: 'transform',
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-extrabold text-white leading-tight mb-2">¡Bienvenido!</h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 1.6, maxWidth: 300 }}>
            Impulsa tu negocio sin esperar liquidez.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full" style={{ maxWidth: 500 }}>
          {features.map(({ Icon, title, sub }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center p-4 rounded-[14px]"
              style={{ backgroundColor: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
            >
              <div className="w-15 h-15 rounded-full flex items-center justify-center mb-3">
                <Icon className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              <span className="text-[16px] font-semibold text-white leading-snug mb-0.5">{title}</span>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.45 }}>{sub}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Plataforma regulada · Guinea Ecuatorial
        </p>

        <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(35%, 35%)' }} />
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(-35%, -35%)' }} />
      </div>

    </div>
  );
}
