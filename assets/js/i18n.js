import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import plTranslation from '../../public/locales/pl/translation.json';
import enTranslation from '../../public/locales/en/translation.json';

const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
const isInfoHost = currentHost.includes('info.');

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'pl',
        supportedLngs: ['pl', 'en'],
        debug: false,
        resources: {
            pl: { translation: plTranslation },
            en: { translation: enTranslation },
        },
        react: {
            useSuspense: false,
        },
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
            lookupCookie: '_locale',
            caches: isInfoHost ? ['cookie'] : [],
        },
    });

export default i18n;
