import cypressConfig from '../../cypress.config.js';
export const useLongerTimeouts = Cypress.expose('useLongerTimeouts') === true;
if (useLongerTimeouts) {
    console.warn('Using longer timeouts for Cypress tests');
}
export const minimumNavigationDelayMillis = useLongerTimeouts ? 2000 : 300;
export const externalPageLoadTimeoutMillis = (cypressConfig.e2e?.pageLoadTimeout ?? 60_000) * 1.5;
