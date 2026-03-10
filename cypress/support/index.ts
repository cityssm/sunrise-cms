import type axe from 'axe-core'
import 'cypress-axe'

export function logout(): void {
  cy.visit('/logout')

  cy.clearCookies()
}

export function login(userName: string): void {
  cy.visit('/login')

  cy.get('.message').contains('Testing', {
    matchCase: false
  })

  cy.get("form [name='userName']").type(userName)
  cy.get("form [name='password']").type(userName)

  cy.get('form').submit()

  cy.location('pathname').should('not.contain', '/login')

  // Logged in pages have a navbar
  cy.get('.navbar').should('have.length', 1)
}

export let ajaxDelayMillis = 800
export let pageLoadDelayMillis = 1200

if ( process.env.USE_LONGER_TEST_TIMEOUTS === 'true') {
  // eslint-disable-next-line no-console
  console.warn('Using longer timeouts for Cypress tests due to USE_LONGER_TEST_TIMEOUTS environment variable being set to true')
  ajaxDelayMillis = 1500
  pageLoadDelayMillis = 2000
}

export const pdfGenerationDelayMillis = 10_000

export function logAccessibilityViolations(violations: axe.Result[]): void {
  if (violations.length > 0) {
    cy.log('Accessibility violations found:')
    for (const violation of violations) {
      cy.log(`- ${violation.id}: ${violation.description}`)
      cy.log(`  Context: ${JSON.stringify(violation.nodes)}`)
    }
  }
}

export function checkDeadLinks(): void {
  cy.get('a[href^="https://"]').each(($link) => {
    const href = $link.attr('href') as string
    cy.request({
      url: href,
      failOnStatusCode: false,
      timeout: 10_000
    })
      .its('status')
      .should('be.lessThan', 400)
  })
}
