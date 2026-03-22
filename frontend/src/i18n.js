import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    load: 'languageOnly',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    keySeparator: '.',
    nsSeparator: false,
    backend: {
      loadPath: '/api/public/translations/{{lng}}?v=' + Date.now(),
      allowMultiLoading: false,
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
