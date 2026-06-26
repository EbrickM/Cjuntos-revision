import { useState } from 'react';
import { CreditCard, BarChart3, Users, History, ArrowRight, Shield, Lock } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import OTPModal from '../../components/common/OTPModal';
import AdminLoginModal from '../../components/common/AdminLoginModal';

const DEMO_EMAIL = 'operaciones@totalenerge.com';
const DEMO_PHONE = '+240 555 123 456';

const platformFeatures = [
  { Icon: CreditCard, label: 'Gestiona tus créditos' },
  { Icon: Users,      label: 'Administra proveedores' },
  { Icon: BarChart3,  label: 'Planifica tus préstamos' },
  { Icon: History,    label: 'Consulta el historial de operaciones' },
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
    <div className="min-h-screen bg-white flex items-center justify-center py-6 px-4">

      <div
        className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6"
        style={{ boxShadow: '0 8px 32px rgba(224,32,28,0.15), 0 2px 8px rgba(239,122,44,0.10)' }}
      >

        {/* Logo + título */}
        <div className="flex flex-col items-center text-center mb-4">
          <img
            src="/bonafide-logo.png"
            alt="Bonafide"
            className="h-14 w-auto object-contain mb-2"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="text-2xl font-bold text-text-1">Creciendo Juntos</h1>
        </div>

        {/* Dentro de la plataforma */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wider mb-2">
            Dentro de la plataforma
          </p>
          <div className="space-y-1.5">
            {platformFeatures.map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 py-1.5 px-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--bonafide-red) 0%, var(--bonafide-orange) 100%)' }}
                >
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-text-2">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-tint flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-orange" />
            </div>
            <div>
              <p className="font-medium text-text-1 text-[11px]">Plataforma regulada</p>
              <p className="text-[10px] text-text-3">Normativa de Guinea Ecuatorial</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-tint flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5 text-orange" />
            </div>
            <div>
              <p className="font-medium text-text-1 text-[11px]">Datos protegidos</p>
              <p className="text-[10px] text-text-3">Cifrado de extremo<br/> a extremo</p>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-100 mb-4" />

        {/* CTA principal: Acceder */}
        <button
          onClick={() => setShowOTP(true)}
          className="w-full h-11 text-white font-semibold text-sm rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, var(--bonafide-red) 0%, var(--bonafide-orange) 100%)',
            boxShadow: '0 4px 16px rgba(224,32,28,0.28)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(224,32,28,0.42)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(224,32,28,0.28)'; }}
        >
          Acceder
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Divider o */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-4 font-medium">o</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* CTA secundario: Solicitar Contrato */}
        <button
          onClick={() => go('roleSelect')}
          className="w-full h-11 font-semibold text-sm rounded-xl cursor-pointer transition-all duration-200 border-2 flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--bonafide-red)', color: 'var(--bonafide-red)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bonafide-red)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--bonafide-red)';
          }}
        >
          Solicitar Contrato
        </button>

        {/* Acceso administrador */}
        <p className="text-center mt-3">
          <button
            onClick={() => setShowAdmin(true)}
            className="text-xs text-orange font-medium hover:underline cursor-pointer"
          >
            Acceso como administrador
          </button>
        </p>
      </div>

      <OTPModal
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        onVerify={handleVerified}
        email={DEMO_EMAIL}
        phone={DEMO_PHONE}
      />

      <AdminLoginModal
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        onVerify={() => { setShowAdmin(false); go('adminDash'); }}
      />
    </div>
  );
}
