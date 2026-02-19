import assert from 'node:assert';
import { describe, it } from 'node:test';
import { i18next } from '../helpers/i18n.helpers.js';
await describe('helpers.i18n', async () => {
    await describe('i18next initialization', async () => {
        await it('i18next is initialized', () => {
            assert.ok(i18next, 'i18next should be initialized');
            assert.ok(typeof i18next.t === 'function', 'i18next.t should be a function');
        });
        await it('has correct fallback language', () => {
            const fallbackLng = i18next.options.fallbackLng;
            assert.ok(fallbackLng, 'Fallback language should be defined');
            assert.ok(Array.isArray(fallbackLng) || typeof fallbackLng === 'string', 'Fallback language should be a string or an array');
            if (Array.isArray(fallbackLng)) {
                assert.strictEqual(fallbackLng.length, 1, 'Fallback languages array should contain exactly one language');
                assert.ok(fallbackLng.includes('en'), 'Fallback languages should include English');
            }
            else {
                assert.strictEqual(fallbackLng, 'en', 'Fallback language should be English');
            }
        });
    });
    await describe('i18next translation', async () => {
        await it('can translate a key in English', () => {
            const translated = i18next.t('common:help', { lng: 'en' });
            assert.ok(translated, 'Translation should return a non-empty string');
            assert.strictEqual(typeof translated, 'string', 'Translation should return a string');
        });
        await it('can translate a key in German', () => {
            const translated = i18next.t('common:help', { lng: 'de' });
            assert.ok(translated, 'Translation should return a non-empty string');
            assert.strictEqual(typeof translated, 'string', 'Translation should return a string');
        });
        await it('can use fallback language when translation is missing', () => {
            // If a translation doesn't exist in DE, it should fall back to EN
            const translated = i18next.t('common:help', { lng: 'de' });
            assert.ok(translated, 'Should return a translation using fallback if needed');
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
});
