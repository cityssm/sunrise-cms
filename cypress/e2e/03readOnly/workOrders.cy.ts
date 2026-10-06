import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import {

  minimumNavigationDelayMillis,

} from '../../support/timeouts.js'

describe('Work Order Search', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Can view a work order from the search results', () => {
    cy.intercept('/workOrders/doSearchWorkOrders').as('searchWorkOrders')

    cy.visit('/workOrders')

    cy.location('pathname').should(
      'equal',
      '/workOrders'
    )

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    cy.wait('@searchWorkOrders')
      .get('#container--searchResults a.has-text-weight-bold', {

      })
      .should('have.length.greaterThan', 0)
      .first()
      .then(($link) => {
        const href = $link.attr('href')

        expect(href, 'link has an href attribute')
          .to.be.a('string')
          .and.to.include('/workOrders/')

        cy.wrap($link).click().wait(minimumNavigationDelayMillis)

        cy.location('pathname').should(
          'include',
          '/workOrders/'
        )

        cy.log('Check accessibility on the work order view page')

        cy.injectAxe()
        cy.checkA11y(undefined, undefined, logAccessibilityViolations)

        checkDeadLinks()
      })
  })
})
