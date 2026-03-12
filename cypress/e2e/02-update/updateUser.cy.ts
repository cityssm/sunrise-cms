import { testUpdate } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout,
  pageLoadDelayMillis
} from '../../support/index.js'

describe('Update User', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
  })

  afterEach(logout)

  it('Has an Update User dashboard', () => {
    cy.visit('/dashboard')

    cy.log('Has no detectable accessibility issues')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    cy.log('Has no links to admin areas')

    cy.get("a[href*='/admin']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to access admin area', () => {
    cy.visit('/admin/tables')
    cy.wait(200)
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/dashboard/'
    )
  })
})
