import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  getDelayMillis,
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'

describe('Work Order iCalendar Integration', () => {
  let pageLoadDelayMillis: number

  beforeEach(() => {
    logout()
    login(testView)
    ;({ pageLoadDelayMillis } = getDelayMillis())
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.visit('/workOrders/ical')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/workOrders/ical'
    )

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })
})
