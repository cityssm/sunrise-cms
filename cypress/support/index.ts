import type { Result as AxeResult } from 'axe-core'
import 'cypress-axe'

import { minimumNavigationDelayMillis } from './timeouts.js'

export function logout(): void {
  // Logout redirects to the login page, which can take double time
  cy.visit('/logout', {
    retryOnNetworkFailure: true,
    retryOnStatusCodeFailure: true
  })

  cy.clearCookies()
}

export function login(userName: string): void {
  cy.visit('/login', {
    retryOnNetworkFailure: true
  })

  cy.get('.message').contains('Testing', {
    matchCase: false
  })

  cy.get("form [name='userName']").type(userName)
  cy.get("form [name='password']").type(userName)

  cy.get('form').submit().wait(minimumNavigationDelayMillis)

  cy.location('pathname').should('not.contain', '/login')

  // Logged in pages have a navbar
  cy.get('.navbar').should('have.length', 1)
}

export function logAccessibilityViolations(violations: AxeResult[]): void {
  if (violations.length > 0) {
    cy.log('Accessibility violations found:')
    for (const violation of violations) {
      cy.log(`- ${violation.id}: ${violation.description}`)
      cy.log(`  Context: ${JSON.stringify(violation.nodes)}`)
    }
  }
}
