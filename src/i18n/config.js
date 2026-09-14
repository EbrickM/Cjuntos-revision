import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

const LANGUAGE_STORAGE_KEY = 'bmori-language';
const SUPPORTED_LANGUAGES = ['es', 'en', 'fr'];

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored && SUPPORTED_LANGUAGES.includes(stored) ? stored : 'es';
  } catch {
    return 'es';
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // Storage unavailable — el idioma sigue funcionando en esta sesión,
    // solo no persiste tras recargar.
  }
});

export default i18n;
