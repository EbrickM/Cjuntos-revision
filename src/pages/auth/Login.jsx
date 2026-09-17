import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo-color.webp';
import { CreditCard, BarChart3, Users, History, ArrowRight, Shield, Lock } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import OTPModal from '../../components/common/OTPModal';
import LanguageSelector from '../../components/common/LanguageSelector';

export default function Login() {
  const { t } = useTranslation();
  const { go } = useApp();

  const platformFeatures = [
    { Icon: CreditCard, label: t('login.features.credits') },
    { Icon: Users,      label: t('login.features.providers') },
    { Icon: BarChart3,  label: t('login.features.loans') },
    { Icon: History,    label: t('login.features.history') },
  ];
  const [showOTP, setShowOTP] = useState(false);

  const ROLE_BY_EMAIL = {
    'soporte@soportetecnico.org': 'epHome',
    'informatica@lidershore.com': 'empDash',
    'lily.construcciones@gmail.com': 'epHome',
    'lilycg99@icloud.com': 'empDash',
    'fondeador@gmail.com': 'fondDash',
  };

  const handleVerified = (email) => {
    setShowOTP(false);
    const normalized = email?.toLowerCase();
    if (normalized === 'admin@gmail.com') {
      go('adminDash');
    } else {
      go(ROLE_BY_EMAIL[normalized] ?? 'roleSelect');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-6 px-4">
      <LanguageSelector />

      <div
        className="bona-gradient-shadow w-full max-w-md rounded-2xl p-[2px]"
      >
      <div className="bg-white rounded-2xl p-6">

        {/* Logo + título */}
        <div className="flex flex-col items-center text-center mb-4">
          <img
            src={logo}
            alt="Bonafide"
            className="h-20 w-auto object-contain mb-2"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {/* Nombre de marca — se mantiene fijo en español, no forma parte de la traducción */}
          <h1 className="text-3xl font-bold text-text-1">Creciendo Juntos</h1>
        </div>

        {/* Dentro de la plataforma */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wider mb-2">
            {t('login.platformSectionTitle')}
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
          <div className="flex-1 flex flex-col items-center gap-1.5 text-center bg-gray-50 rounded-xl border border-gray-100 py-3 px-2">
            <div className="w-7 h-7 rounded-full bg-orange-tint flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-orange" />
            </div>
            <div>
              <p className="font-medium text-text-1 text-[11px]">{t('login.trust.regulatedTitle')}</p>
              <p className="text-[10px] text-text-3">{t('login.trust.regulatedDesc')}</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1.5 text-center bg-gray-50 rounded-xl border border-gray-100 py-3 px-2">
            <div className="w-7 h-7 rounded-full bg-orange-tint flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-orange" />
            </div>
            <div>
              <p className="font-medium text-text-1 text-[11px]">{t('login.trust.protectedTitle')}</p>
              <p className="text-[10px] text-text-3">{t('login.trust.protectedDesc')}</p>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-100 mb-4" />

        {/* CTA principal: Acceder */}
        <button
          onClick={() => setShowOTP(true)}
          className="w-full h-11 text-white font-semibold text-sm rounded-[8px] cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:brightness-105"
          style={{
            background: 'var(--bonafide-orange)',
            boxShadow: '0 4px 16px rgba(239,122,44,0.32)',
          }}
        >
          {t('login.accessButton')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      </div>

      {showOTP && (
        <OTPModal
          onClose={() => setShowOTP(false)}
          onVerify={handleVerified}
        />
      )}
    </div>
  );
}
