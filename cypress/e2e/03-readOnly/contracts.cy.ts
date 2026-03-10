import { testView } from '../../../test/_globals.js'
import {
  checkDeadLinks,
  getDelayMillis,
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'

describe('Contract Search', () => {
  let ajaxDelayMillis: number

  beforeEach(() => {
    logout()
    login(testView)
    ;({ ajaxDelayMillis } = getDelayMillis())
  })

  afterEach(logout)

  it('Should hide the extra filters by default', () => {
    cy.visit('/contracts')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    cy.get('#searchFilter--cemeteryId').should('not.be.visible')
    cy.get('a[data-cy="location-filters-toggle"]').click()
    cy.get('#searchFilter--cemeteryId').should('be.visible')

    cy.get('#searchFilter--deceasedName').should('not.be.visible')
    cy.get('a[data-cy="contact-filters-toggle"]').click()
    cy.get('#searchFilter--deceasedName').should('be.visible')
  })

  it('Should show location filters when a cemeteryId is a parameter', () => {
    cy.visit('/contracts?cemeteryId=1')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    cy.get('#searchFilter--cemeteryId').should('be.visible')
  })

  it('Should show contact filters when a deceasedName is a parameter', () => {
    const deceasedName = 'Test'

    cy.visit(`/contracts?deceasedName=${deceasedName}`)

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    cy.get('#searchFilter--deceasedName')
      .should('be.visible')
      .should('have.value', deceasedName)
  })

  it('Can view a contract from the search results', () => {
    cy.visit('/contracts')
    cy.location('pathname').should('equal', '/contracts')
    cy.wait(ajaxDelayMillis)

    cy.get('#container--searchResults a.has-text-weight-bold')
      .first()
      .then(($link) => {
        const href = $link.attr('href')
        expect(href).to.include('/contracts/')

        cy.wrap($link).click()

        cy.location('pathname').should('include', '/contracts/')

        cy.log('Check accessibility on the contract view page')

        cy.injectAxe()
        cy.checkA11y(undefined, undefined, logAccessibilityViolations)
        checkDeadLinks()
      })
  })
})
