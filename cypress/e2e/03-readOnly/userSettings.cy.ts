import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout,
  pageLoadDelayMillis
} from '../../support/index.js'

describe('User Settings', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.visit('/dashboard/userSettings')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/dashboard/userSettings'
    )

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })
})
