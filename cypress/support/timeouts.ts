/* eslint-disable @typescript-eslint/no-magic-numbers */

/** Time to wait for AJAX requests to complete */
export const ajaxTimeoutMillis =
  Cypress.expose('useLongerTimeouts') === true ? 3000 : 1500

export const minimumNavigationDelayMillis = 300

/** Time to wait for page loads to complete */
export const pageLoadTimeoutMillis =
  Cypress.expose('useLongerTimeouts') === true ? 4000 : 2000

/** Time to wait for external page loads to complete */
export const externalPageLoadTimeoutMillis = 10_000

/** Time to wait for PDF generation to complete */
export const pdfGenerationDelayMillis = 10_000
