/** Time to wait for AJAX requests to complete */
export const ajaxDelayMillis =
  Cypress.expose('useLongerTimeouts') === true ? 1500 : 800

/** Time to wait for page loads to complete */
export const pageLoadDelayMillis =
  Cypress.expose('useLongerTimeouts') === true ? 2000 : 1200

/** Time to wait for external page loads to complete */
export const externalPageLoadMillis = 10_000

/** Time to wait for PDF generation to complete */
export const pdfGenerationDelayMillis = 10_000
