/* eslint-disable @typescript-eslint/no-magic-numbers */

// eslint-disable-next-line unicorn/consistent-boolean-name
export const useLongerTimeouts = Cypress.expose('useLongerTimeouts') === true

if (useLongerTimeouts) {
  // eslint-disable-next-line no-console
  console.warn('Using longer timeouts for Cypress tests')
}

export const minimumNavigationDelayMillis = useLongerTimeouts ? 2000 : 300

/**
 * Time to wait for external page loads to complete
 */
export const externalPageLoadTimeoutMillis = 60_000 * 1.5
