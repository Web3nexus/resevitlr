import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';

i18next
  .use(HttpBackend)
  .init({
    load: 'languageOnly',
    fallbackLng: 'en',
    lng: 'en',
    interpolation: { escapeValue: false },
    keySeparator: '.',
    nsSeparator: false,
    backend: {
      loadPath: 'http://localhost:5173/api/public/translations/{{lng}}'
    }
  }).then(() => {
    console.log("SUCCESS Translation:", i18next.t('auth.adminLogin.title'));
  }).catch(err => {
    console.error("ERROR:", err);
  });
