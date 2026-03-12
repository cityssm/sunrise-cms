import { testAdmin } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout,
  pageLoadDelayMillis
} from '../../support/index.js'

describe('Admin - Settings Management', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)

    cy.visit('/admin/settings')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/admin/settings'
    )
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })
})
