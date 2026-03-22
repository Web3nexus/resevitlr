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
      loadPath: () => {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const isCentral = hostname === 'resevit.com' || hostname === 'www.resevit.com' || hostname.includes('.test') && !hostname.includes('.');
        const prefix = isCentral ? '/central-api' : '/api';
        return `${prefix}/public/translations/{{lng}}?v=` + Date.now();
      },
      allowMultiLoading: false,
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
