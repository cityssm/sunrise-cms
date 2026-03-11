import { testUpdate } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  getDelayMillis,
  logAccessibilityViolations,
  login,
  logout,
  pdfGenerationDelayMillis
} from '../../support/index.js'

describe('Work Orders - Update', () => {
  let ajaxDelayMillis: number
  let pageLoadDelayMillis: number

  beforeEach(() => {
    logout()
    login(testUpdate)
    ;({ ajaxDelayMillis, pageLoadDelayMillis } = getDelayMillis())
  })

  afterEach(logout)

  it('Has a "Create" link on the Work Order Search', () => {
    cy.visit('/workOrders')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should('equal', '/workOrders')
    cy.get("a[href$='/workOrders/new']").should('exist')
  })

  it('Creates a New Work Order', () => {
    cy.visit('/workOrders/new')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should('equal', '/workOrders/new')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    cy.log('Submit the form using defaults')

    cy.get('#form--workOrderEdit').submit()

    cy.wait(pageLoadDelayMillis)
      .location('pathname')
      .should('not.contain', '/new')
      .should('contain', '/edit')

    cy.log('Check for accessibility issues')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)
    checkDeadLinks()

    cy.log('Print the work order')

    cy.get('button[data-cy="print"]').click()

    cy.get('.dropdown.is-active a').first().should('exist').click({
      timeout: pdfGenerationDelayMillis
    })

    cy.log('Open the Audit Log modal and verify at least one entry')

    const moreOptionsSelector = '[data-cy="dropdown--moreOptions"]'

    cy.get(moreOptionsSelector).find('.dropdown-trigger button').click()

    cy.get(moreOptionsSelector).find('.is-view-audit-log-button').click()

    cy.wait(ajaxDelayMillis)

    cy.get('#modal--recordAuditLog').should('be.visible')

    cy.get('#container--recordAuditLog tbody tr').should(
      'have.length.at.least',
      1
    )

    cy.get('#modal--recordAuditLog .is-close-modal-button').first().click()
  })
})
