import assert from 'node:assert';
import { describe, it } from 'node:test';
import { i18next, i18nextMiddleware } from '../helpers/i18n.helpers.js';
await describe('helpers.i18n', async () => {
    await describe('i18next initialization', async () => {
        await it('i18next is initialized', () => {
            assert.ok(i18next, 'i18next should be initialized');
            assert.ok(typeof i18next.t === 'function', 'i18next.t should be a function');
        });
        await it('has correct fallback language', () => {
            const fallbackLng = i18next.options.fallbackLng;
            if (Array.isArray(fallbackLng)) {
                assert.ok(fallbackLng.includes('en'), 'Fallback language should include English');
            }
            else {
                assert.strictEqual(fallbackLng, 'en', 'Fallback language should be English');
            }
        });
        await it('supports configured languages', () => {
            const supportedLngs = i18next.options.supportedLngs;
            assert.ok(Array.isArray(supportedLngs), 'supportedLngs should be an array');
            assert.ok(supportedLngs?.includes('en'), 'English should be supported');
            assert.ok(supportedLngs?.includes('de'), 'German should be supported');
        });
        await it('has correct default namespace', () => {
            assert.strictEqual(i18next.options.defaultNS, 'common', 'Default namespace should be common');
        });
        await it('has configured namespaces', () => {
            const ns = i18next.options.ns;
            assert.ok(Array.isArray(ns), 'ns should be an array');
            assert.ok(ns.includes('common'), 'common namespace should exist');
            assert.ok(ns.includes('login'), 'login namespace should exist');
            assert.ok(ns.includes('dashboard'), 'dashboard namespace should exist');
            assert.ok(ns.includes('navigation'), 'navigation namespace should exist');
            assert.ok(ns.includes('errors'), 'errors namespace should exist');
        });
        await it('has language detection enabled', () => {
            const detection = i18next.options.detection;
            assert.ok(detection, 'Detection should be configured');
            assert.ok(Array.isArray(detection.order), 'Detection order should be an array');
            assert.strictEqual(detection.order[0], 'querystring', 'First detection method should be querystring');
            assert.strictEqual(detection.lookupQuerystring, 'lng', 'Query string lookup should use lng');
            assert.strictEqual(detection.lookupCookie, 'i18next', 'Cookie lookup should use i18next');
        });
        await it('has correct interpolation settings', () => {
            const interpolation = i18next.options.interpolation;
            assert.ok(interpolation, 'Interpolation should be configured');
            assert.strictEqual(interpolation.escapeValue, false, 'Escape value should be false for HTML support');
        });
    });
    await describe('i18next translation', async () => {
        await it('can translate a key in English', () => {
            const translated = i18next.t('common:appName', { lng: 'en' });
            assert.ok(translated, 'Translation should return a non-empty string');
            assert.strictEqual(typeof translated, 'string', 'Translation should return a string');
        });
        await it('can translate a key in German', () => {
            const translated = i18next.t('common:appName', { lng: 'de' });
            assert.ok(translated, 'Translation should return a non-empty string');
            assert.strictEqual(typeof translated, 'string', 'Translation should return a string');
        });
        await it('handles missing translation keys gracefully', () => {
            // Missing keys should return the key itself or a fallback
            const translated = i18next.t('nonexistent:key', { lng: 'en' });
            assert.ok(typeof translated === 'string', 'Should always return a string');
        });
        await it('can access different namespaces', () => {
            const loginTranslation = i18next.t('login:appTitle', { lng: 'en' });
            assert.ok(typeof loginTranslation === 'string', 'Should return a string');
        });
        await it('can use fallback language when translation is missing', () => {
            // If a translation doesn't exist in DE, it should fall back to EN
            const translated = i18next.t('common:appName', { lng: 'de' });
            assert.ok(translated, 'Should return a translation using fallback if needed');
        });
    });
    await describe('i18nextMiddleware', async () => {
        await it('i18nextMiddleware is exported', () => {
            assert.ok(i18nextMiddleware, 'i18nextMiddleware should be exported');
        });
        await it('has LanguageDetector', () => {
            assert.ok(i18nextMiddleware.LanguageDetector, 'LanguageDetector should be available');
        });
        await it('has handle middleware function', () => {
            assert.ok(typeof i18nextMiddleware.handle === 'function', 'handle should be a function');
        });
    });
    await describe('i18next language changing', async () => {
        await it('can change the current language', async () => {
            const originalLng = i18next.language;
            await i18next.changeLanguage('de');
            assert.strictEqual(i18next.language, 'de', 'Language should change to German');
            await i18next.changeLanguage('en');
            assert.strictEqual(i18next.language, 'en', 'Language should change back to English');
            // Restore original
            await i18next.changeLanguage(originalLng);
        });
        await it('defaults to fallback language for invalid language code', async () => {
            const originalLng = i18next.language;
            await i18next.changeLanguage('invalid');
            // Should fall back to en or keep the language
            assert.ok(i18next.language === 'en' || i18next.language === originalLng, 'Should use fallback language or keep original');
            await i18next.changeLanguage(originalLng);
        });
    });
    await describe('i18next backend configuration', async () => {
        await it('has file system backend configured', () => {
            const backend = i18next.options.backend;
            assert.ok(backend, 'Backend should be configured');
            assert.ok(typeof backend.loadPath === 'string', 'Backend should have a loadPath');
            assert.ok(backend.loadPath.includes('{{lng}}'), 'loadPath should contain {{lng}} placeholder');
            assert.ok(backend.loadPath.includes('{{ns}}'), 'loadPath should contain {{ns}} placeholder');
        });
        await it('preloads all supported languages', () => {
            const preload = i18next.options.preload;
            assert.ok(Array.isArray(preload), 'preload should be an array');
            assert.ok(preload.includes('en'), 'English should be preloaded');
            assert.ok(preload.includes('de'), 'German should be preloaded');
        });
    });
    await describe('i18next module exports', async () => {
        await it('exports both i18next and i18nextMiddleware', () => {
            assert.ok(i18next, 'i18next should be exported');
            assert.ok(i18nextMiddleware, 'i18nextMiddleware should be exported');
        });
        await it('i18next has required methods', () => {
            assert.ok(typeof i18next.t === 'function', 'i18next.t should exist');
            assert.ok(typeof i18next.changeLanguage === 'function', 'i18next.changeLanguage should exist');
            assert.ok(typeof i18next.use === 'function', 'i18next.use should exist');
            assert.ok(typeof i18next.init === 'function', 'i18next.init should exist');
        });
    });
});
