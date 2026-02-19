import path from 'node:path';
import { fileURLToPath } from 'node:url';
import i18next from 'i18next';
import i18nextFsBackend from 'i18next-fs-backend';
import * as i18nextMiddleware from 'i18next-http-middleware';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesPath = path.join(__dirname, '..', 'locales');
// init i18next
await i18next
    .use(i18nextFsBackend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    preload: ['en', 'de'],
    ns: ['common', 'login', 'dashboard', 'navigation', 'errors'],
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
export { i18next, i18nextMiddleware };
