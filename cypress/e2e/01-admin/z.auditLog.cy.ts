import { testAdmin } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import { pageLoadDelayMillis } from '../../support/timeouts.js'

describe('Admin - Audit Log Management', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)

    cy.visit('/admin/auditLog')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/admin/auditLog'
    )
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })
})
