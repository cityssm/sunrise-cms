/* eslint-disable @typescript-eslint/no-magic-numbers */

const useLongerTimeouts = Cypress.expose('useLongerTimeouts') === true

if (useLongerTimeouts) {
  // eslint-disable-next-line no-console
  console.warn('Using longer timeouts for Cypress tests')
}

/** Time to wait for AJAX requests to complete */
export const ajaxTimeoutMillis = useLongerTimeouts ? 3000 : 1000

export const minimumNavigationDelayMillis = useLongerTimeouts ? 2000 : 300

/** Time to wait for page loads to complete */
export const pageLoadTimeoutMillis = useLongerTimeouts ? 15_000 : 2000

/** Time to wait for external page loads to complete */
export const externalPageLoadTimeoutMillis = 10_000

/** Time to wait for PDF generation to complete */
export const pdfGenerationDelayMillis = 10_000
