import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import {  } from '../../support/timeouts.js'

describe('Work Order iCalendar Integration', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.visit('/workOrders/ical')
    cy.location('pathname').should(
      'equal',
      '/workOrders/ical'
    )

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })
})
