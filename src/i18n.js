import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/common.json';
import my from './locales/my/common.json';

const initI18n = async () => {
  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { common: en },
        my: { common: my }
      },
      lng: localStorage.getItem('lng') || 'en',
      fallbackLng: 'en',
      supportedLngs: ['en', 'my'],
      ns: ['common'],
      defaultNS: 'common',
      interpolation: { escapeValue: false }
    });
};

initI18n();

export default i18n;