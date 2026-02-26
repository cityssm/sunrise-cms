import type axe from 'axe-core'
import 'cypress-axe'

export function logout(): void {
  cy.visit('/logout')
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

export const ajaxDelayMillis = 800

export const pageLoadDelayMillis = 1200

export const pdfGenerationDelayMillis = 10_000

export function checkA11yLog(violations: axe.Result[]): void {
  if (violations.length > 0) {
    cy.log('Accessibility violations found:')
    for (const violation of violations) {
      cy.log(`- ${violation.id}: ${violation.description}`)
      cy.log(`  Context: ${JSON.stringify(violation.nodes)}`)
    }
  }
}
