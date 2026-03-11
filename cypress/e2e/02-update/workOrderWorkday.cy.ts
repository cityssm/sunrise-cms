import { testUpdate } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  getDelayMillis,
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'

describe('Work Orders - Workday Report', () => {
  let ajaxDelayMillis: number

  beforeEach(() => {
    logout()
    login(testUpdate)
    ;({ ajaxDelayMillis } = getDelayMillis())
  })

  afterEach(logout)

  const workdayUrl = '/workOrders/workday'
  const dateSpanSelector = '#workdayDateStringSpan'

  it('Should page between days', () => {
    cy.visit(workdayUrl)
    cy.location('pathname').should('equal', workdayUrl)

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    // Get the initial date string
    cy.get(dateSpanSelector).invoke('text').as('initialDateString')

    // Verify the date changes when clicking next day
    cy.get('@initialDateString').then((initialDateString) => {
      // Click the next day button
      cy.get('#button--workdayNextDay').click()
      cy.wait(ajaxDelayMillis)

      cy.get(dateSpanSelector)
        .invoke('text')
        .should('not.equal', initialDateString)

      // Click the previous day button twice to go before the initial date
      cy.get('#button--workdayPreviousDay').click()
      cy.wait(ajaxDelayMillis)
      cy.get('#button--workdayPreviousDay').click()
      cy.wait(ajaxDelayMillis)

      // Verify we're on a different date than the initial
      cy.get(dateSpanSelector)
        .invoke('text')
        .should('not.equal', initialDateString)
    })
  })
})
