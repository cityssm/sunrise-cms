import { testView } from '../../../test/_globals.js'
import { ajaxDelayMillis, checkA11yLog, login, logout } from '../../support/index.js'

describe('Work Order Search', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Has no detectable accessibility issues on the search page', () => {
    cy.visit('/workOrders')
    cy.location('pathname').should('equal', '/workOrders')
    cy.wait(ajaxDelayMillis)

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, checkA11yLog)
  })

  it('Can view a work order from the search results', () => {
    cy.visit('/workOrders')
    cy.location('pathname').should('equal', '/workOrders')
    cy.wait(ajaxDelayMillis)

    cy.get('#container--searchResults a.has-text-weight-bold')
      .first()
      .then(($link) => {
        const href = $link.attr('href')
        expect(href).to.include('/workOrders/')

        cy.wrap($link).click()

        cy.location('pathname').should('include', '/workOrders/')

        cy.log('Check accessibility on the work order view page')

        cy.injectAxe()
        cy.checkA11y(undefined, undefined, checkA11yLog)
      })
  })
})
