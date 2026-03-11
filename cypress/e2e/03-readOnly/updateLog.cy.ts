import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  getDelayMillis,
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'

describe('Update Log', () => {
  let ajaxDelayMillis: number

  beforeEach(() => {
    logout()
    login(testView)
    ;({ ajaxDelayMillis } = getDelayMillis())
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.visit('/dashboard/updateLog')
    cy.location('pathname').should('equal', '/dashboard/updateLog')
    cy.wait(ajaxDelayMillis)

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })
})
