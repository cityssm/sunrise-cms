import { testUpdate } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import {
  minimumNavigationDelayMillis,
  pageLoadTimeoutMillis
} from '../../support/timeouts.js'

describe('Update User', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
  })

  afterEach(logout)

  it('Has an Update User dashboard', () => {
    cy.visit('/dashboard', { timeout: pageLoadTimeoutMillis })

    cy.log('Has no detectable accessibility issues')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    cy.log('Has no links to admin areas')

    cy.get("a[href*='/admin']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to access admin area', () => {
    cy.visit('/admin/tables', { timeout: pageLoadTimeoutMillis })

    cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
      'not.contain',
      'admin'
    )
  })
})
