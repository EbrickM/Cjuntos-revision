import { useState } from 'react';
import { Zap, FileCheck, Clock, Leaf, Shield, Lock, ArrowRight, CreditCard, BarChart3, Users, History } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import OTPModal from '../../components/common/OTPModal';
import AdminLoginModal from '../../components/common/AdminLoginModal';

const DEMO_EMAIL = 'operaciones@totalenerge.com';
const DEMO_PHONE = '+240 555 123 456';

const benefits = [
  {
    Icon: Zap,
    title: 'Liquidez rápida',
    description: 'Accede a fondos en menos de 72 horas sin trámites presenciales.',
  },
  {
    Icon: FileCheck,
    title: 'Transparencia total',
    description: 'Conoce en todo momento las tarifas y condiciones de cada operación.',
  },
  {
    Icon: Clock,
    title: 'Siempre disponible',
    description: 'Gestiona tus operaciones financieras las 24 horas, los 7 días.',
  },
  {
    Icon: Leaf,
    title: '100% digital',
    description: 'Proceso completamente paperless, ESG y de bajo carbono.',
  },
];

const platformFeatures = [
  { Icon: CreditCard, label: 'Gestiona tus contratos de crédito' },
  { Icon: Users,      label: 'Administra proveedores y pagos' },
  { Icon: BarChart3,  label: 'Distribuye fondos: nómina, reservas y proveedores' },
  { Icon: History,    label: 'Consulta el historial completo de operaciones' },
];

export default function Login() {
  const { go } = useApp();
  const [showOTP,   setShowOTP]   = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleVerified = () => {
    setShowOTP(false);
    go('roleSelect');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-8 py-6 sm:py-8 w-full flex items-center">
        <div className="w-full grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">

          {/* ─── COLUMNA IZQUIERDA ─────────────────────────────────────────── */}
          <div className="h-full space-y-5">

            {/* Logo + título */}
            <div className="flex flex-col items-center text-center ">
              <img
                src="/bonafide-logo.png"
                alt="Creciendo Juntos"
                className="h-28 w-auto object-contain mb-4"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <h1 className="text-3xl sm:text-5xl font-bold text-text-1">
                Creciendo Juntos
              </h1>
            </div>

            {/* Descripción */}
            <p className="text-base text-text-3 leading-relaxed text-center">
              La plataforma de{' '}
              <strong className="text-text-1">crédito empresarial digital</strong>{' '}
              que impulsa tu negocio sin esperar liquidez. Operaciones{' '}
              <strong className="text-text-1">rápidas, seguras y transparentes</strong>{' '}
              dentro de la red <strong className="text-text-1">Bonafide Microbank</strong>.
            </p>

            {/* Grid de beneficios */}
            <div className="grid grid-cols-2 gap-3">
              {benefits.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#C62828] to-[#F57C00] flex items-center justify-center text-white mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-text-1 mb-1">{title}</h3>
                  <p className="text-xs text-text-3 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="flex gap-4">
              <div className="flex-1 flex items-center gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-full bg-orange-tint flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-orange" />
                </div>
                <div>
                  <p className="font-medium text-text-1 text-xs">Plataforma regulada</p>
                  <p className="text-[11px] text-text-3">Normativa financiera de Guinea Ecuatorial</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-full bg-blue-bg flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-blue-text" />
                </div>
                <div>
                  <p className="font-medium text-text-1 text-xs">Datos protegidos</p>
                  <p className="text-[11px] text-text-3">Cifrado de extremo a extremo</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── COLUMNA DERECHA: CARD DE ACCESO ──────────────────────────── */}
          <div className='h-full'>
            <div className="bg-white h-full flex flex-col justify-center rounded-2xl border border-gray-200 shadow-lg p-5 sm:p-8">

              {/* Header centrado */}
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-text-1 mb-2">Acceso a la plataforma</h2>
                <p className="text-sm text-text-3 leading-relaxed">
                  Verifica tu identidad de forma segura con un código que se envía a tu contacto registrado.
                </p>
              </div>

              {/* Dentro de la plataforma */}
              <div className="mb-6">
                <p className="text-[11px] font-semibold text-text-4 uppercase tracking-wider mb-3">
                  Dentro de la plataforma
                </p>
                <div className="space-y-2">
                  {platformFeatures.map(({ Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-r from-[#C62828] to-[#F57C00] flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm text-text-2">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
          

              {/* Divisor */}
              <div className="border-t border-gray-100 mb-5" />

              {/* CTA principal: Acceder */}
              <button
                onClick={() => setShowOTP(true)}
                className="w-full h-[52px] text-white font-semibold text-[15px] rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #C62828 0%, #F57C00 100%)',
                  boxShadow: '0 4px 16px rgba(198,40,40,0.28)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(198,40,40,0.42)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(198,40,40,0.28)'; }}
              >
                Acceder
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Divider o */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-4 font-medium">o</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* CTA secundario: Solicitar Contrato */}
              <button
                onClick={() => go('roleSelect')}
                className="w-full h-[52px] font-semibold text-[15px] rounded-xl cursor-pointer transition-all duration-200 border-2 border-[#C62828] text-[#C62828] hover:bg-[#C62828] hover:text-white flex items-center justify-center gap-2"
              >
                Solicitar Contrato
              </button>

              {/* Acceso administrador */}
              <p className="text-center text-xs text-text-4 mt-5">
                ¿Eres del equipo Bonafide?{' '}
                <button
                  onClick={() => setShowAdmin(true)}
                  className="text-orange font-medium hover:underline cursor-pointer"
                >
                  Acceso como administrador
                </button>
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* ─── MODAL OTP ─────────────────────────────────────────────────────── */}
      <OTPModal
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        onVerify={handleVerified}
        email={DEMO_EMAIL}
        phone={DEMO_PHONE}
      />

      {/* ─── MODAL ADMINISTRADOR ───────────────────────────────────────────── */}
      <AdminLoginModal
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        onVerify={() => { setShowAdmin(false); go('adminDash'); }}
      />
    </div>
  );
}
