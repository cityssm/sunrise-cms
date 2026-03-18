import path from 'node:path'
import { fileURLToPath } from 'node:url'

import i18next from 'i18next'
import i18nextFsBackend from 'i18next-fs-backend'
import { LanguageDetector } from 'i18next-http-middleware'

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename: string = fileURLToPath(import.meta.url)

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname: string = path.dirname(__filename)

const localesPath: string = path.join(__dirname, '..', 'locales')

await i18next
  .use(i18nextFsBackend)
  .use(LanguageDetector)
  .init({
    showSupportNotice: false, //hide the funding message

    fallbackLng: 'en',
    preload: ['en', 'de'],
    supportedLngs: ['en', 'de'],

    defaultNS: 'app',
    ns: ['app', 'admin', 'login', 'errors'],

    backend: {
      loadPath: path.join(localesPath, '{{lng}}', '{{ns}}.json')
    },
    detection: {
      caches: ['cookie'],
      order: ['querystring', 'cookie', 'header'],

      lookupCookie: 'i18next',
      lookupQuerystring: 'lng'
    },
    interpolation: {
      escapeValue: false
    }
  })

export { default as i18next } from 'i18next'
export { LanguageDetector } from 'i18next-http-middleware'
