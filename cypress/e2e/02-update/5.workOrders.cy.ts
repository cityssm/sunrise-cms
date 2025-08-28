import { testUpdate } from '../../../test/_globals.js'
import {
  login,
  logout,
  pageLoadDelayMillis,
  pdfGenerationDelayMillis
} from '../../support/index.js'

describe('Update - Work Orders', () => {
  beforeEach(() => {
    logout()
    login(testUpdate)
  })

  afterEach(logout)

  it('Has a "Create" link on the Work Order Search', () => {
    cy.visit('/workOrders')
    cy.location('pathname').should('equal', '/workOrders')
    cy.get("a[href$='/workOrders/new']").should('exist')
  })

  it('Creates a New Work Order', () => {
    cy.visit('/workOrders/new')
    cy.location('pathname').should('equal', '/workOrders/new')

    cy.injectAxe()
    cy.checkA11y()

    cy.log('Submit the form using defaults')

    cy.get('#form--workOrderEdit').submit()

    cy.wait(pageLoadDelayMillis)
      .location('pathname')
      .should('not.contain', '/new')
      .should('contain', '/edit')

    cy.log('Check for accessibility issues')

    cy.injectAxe()
    cy.checkA11y()

    cy.log('Print the work order')

    cy.get('button[data-cy="print"]').click()

    cy.get('.dropdown.is-active a').first().should('exist').click({
      timeout: pdfGenerationDelayMillis
    })
  })
})
