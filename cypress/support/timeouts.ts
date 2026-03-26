/* eslint-disable @typescript-eslint/no-magic-numbers */

/** Time to wait for AJAX requests to complete */
export const ajaxTimeoutMillis =
  Cypress.expose('useLongerTimeouts') === true ? 3000 : 1000

export const minimumNavigationDelayMillis =
  Cypress.expose('useLongerTimeouts') === true ? 2000 : 300

/** Time to wait for page loads to complete */
export const pageLoadTimeoutMillis =
  Cypress.expose('useLongerTimeouts') === true ? 15_000 : 2000

/** Time to wait for external page loads to complete */
export const externalPageLoadTimeoutMillis = 10_000

/** Time to wait for PDF generation to complete */
export const pdfGenerationDelayMillis = 10_000
