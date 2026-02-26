import { testView } from '../../../test/_globals.js'
import { checkA11yLog, login, logout } from '../../support/index.js'

describe('Contract Search', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Should hide the extra filters by default', () => {
    cy.visit('/contracts')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, checkA11yLog)

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
    cy.checkA11y(undefined, undefined, checkA11yLog)

    cy.get('#searchFilter--cemeteryId').should('be.visible')
  })

  it('Should show contact filters when a deceasedName is a parameter', () => {
    const deceasedName = 'Test'

    cy.visit(`/contracts?deceasedName=${deceasedName}`)

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, checkA11yLog)

    cy.get('#searchFilter--deceasedName')
      .should('be.visible')
      .should('have.value', deceasedName)
  })
})
