import path from 'node:path';
import { fileURLToPath } from 'node:url';
import i18next from 'i18next';
import i18nextFsBackend from 'i18next-fs-backend';
import { LanguageDetector } from 'i18next-http-middleware';
// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename);
const localesPath = path.join(__dirname, '..', 'locales');
await i18next
    .use(i18nextFsBackend)
    .use(LanguageDetector)
    .init({
    showSupportNotice: false, //hide the funding message
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    preload: ['en', 'de'],
    ns: ['admin', 'cemeteries', 'common', 'contracts', 'workOrders', 'login', 'dashboard', 'navigation', 'errors'],
    defaultNS: 'common',
    backend: {
        loadPath: path.join(localesPath, '{{lng}}', '{{ns}}.json')
    },
    detection: {
        order: ['querystring', 'cookie', 'header'],
        lookupQuerystring: 'lng',
        lookupCookie: 'i18next',
        caches: ['cookie']
    },
    interpolation: {
        escapeValue: false
    }
});
export { default as i18next } from 'i18next';
export { LanguageDetector } from 'i18next-http-middleware';
