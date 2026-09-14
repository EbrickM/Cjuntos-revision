import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

// Banderas dibujadas a mano en vez de emoji — los pares de indicador
// regional (🇪🇸/🇬🇧/🇫🇷) no siempre renderizan como bandera en Windows.
function FlagES(props) {
  return (
    <svg viewBox="0 0 30 20" {...props}>
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </svg>
  );
}

function FlagGB(props) {
  return (
    <svg viewBox="0 0 30 20" {...props}>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0L30 20M30 0L0 20" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" strokeWidth="2" />
      <path d="M15 0V20M0 10H30" stroke="#FFFFFF" strokeWidth="7" />
      <path d="M15 0V20M0 10H30" stroke="#C8102E" strokeWidth="4" />
    </svg>
  );
}

function FlagFR(props) {
  return (
    <svg viewBox="0 0 30 20" {...props}>
      <rect width="10" height="20" fill="#0055A4" />
      <rect x="10" width="10" height="20" fill="#FFFFFF" />
      <rect x="20" width="10" height="20" fill="#EF4135" />
    </svg>
  );
}

const LANGUAGES = [
  { code: 'es', name: 'Español', abbr: 'ES', Flag: FlagES },
  { code: 'en', name: 'English', abbr: 'EN', Flag: FlagGB },
  { code: 'fr', name: 'Français', abbr: 'FR', Flag: FlagFR },
];

// Selector de idioma flotante para la pantalla de login — igual patrón que
// bonafide-kappa/bonafide-identity-frontend: i18next es una única instancia
// global, así que cambiar el idioma aquí aplica al resto de la sesión y
// persiste tras recargar (ver src/i18n/config.js).
export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  return (
    <>
      <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-2">
        {open && (
          <div className="order-last origin-top-right bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {LANGUAGES.map((lang) => {
              const active = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-orange-tint cursor-pointer ${
                    active ? 'font-semibold' : 'text-text-2'
                  }`}
                  style={active ? { color: 'var(--bonafide-red)' } : {}}
                >
                  <lang.Flag className="w-6 rounded-sm shrink-0" />
                  <span className="flex-1 text-left">{lang.name}</span>
                  <span className="text-xs font-bold tracking-wider opacity-50">{lang.abbr}</span>
                </button>
              );
            })}
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={t('nav.selectLanguage')}
          className="h-11 px-4 rounded-full flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
          style={{ background: 'var(--bonafide-orange)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
        >
          <Globe className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-bold tracking-wider">{currentLang.abbr}</span>
        </button>
      </div>

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </>
  );
}
