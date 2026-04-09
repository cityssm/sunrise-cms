import { testAdmin } from '../../../test/_globals.js'
import type { BurialSiteType } from '../../../types/record.types.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import { minimumNavigationDelayMillis } from '../../support/timeouts.js'

describe('Admin - Burial Site Type Management', () => {
  const burialSiteTypeTitleSelector =
    '.container--burialSiteType .panel-heading .title'

  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)

    cy.visit('/admin/burialSiteTypes', {
      retryOnNetworkFailure: true
    }).wait(minimumNavigationDelayMillis)

    cy.location('pathname').should('equal', '/admin/burialSiteTypes')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })

  it('Adds a new burial site type', () => {
    cy.get('#button--addBurialSiteType').click()

    cy.get('.modal').should('be.visible')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    cy.fixture('burialSiteType.json').then((burialSiteType: BurialSiteType) => {
      cy.get(".modal input[name='burialSiteType']").type(
        burialSiteType.burialSiteType
      )

      cy.get(".modal input[name='bodyCapacityMax']")
        .clear()
        .type(burialSiteType.bodyCapacityMax?.toString() ?? '')

      cy.get(".modal input[name='crematedCapacityMax']")
        .clear()
        .type(burialSiteType.crematedCapacityMax?.toString() ?? '')

      cy.get(".modal button[type='submit']").click()

      cy.get(burialSiteTypeTitleSelector).should('contain.text', burialSiteType.burialSiteType)
    })
  })

  it('Updates a burial site type', () => {
    cy.intercept('/admin/doUpdateBurialSiteType').as('updateBurialSiteType')

    cy.fixture('burialSiteType.json').then((burialSiteType: BurialSiteType) => {
      // Find and click the edit button for our test burial site type
      cy.get(burialSiteTypeTitleSelector)
        .contains(burialSiteType.burialSiteType)
        .parents('.container--burialSiteType')
        .find('.button--editBurialSiteType')
        .click()

      // Modal should be visible
      cy.get('.modal').should('be.visible')

      cy.injectAxe()
      cy.checkA11y(undefined, undefined, logAccessibilityViolations)

      // Update the burial site type name
      const updatedName = `${burialSiteType.burialSiteType} Updated`

      cy.get(".modal input[name='burialSiteType']").clear().type(updatedName)

      cy.get(".modal button[type='submit']")
        .click()
        .wait('@updateBurialSiteType')

      // Verify the burial site type is updated
      cy.get(burialSiteTypeTitleSelector).should('contain.text', updatedName)
    })
  })

  it('Removes a burial site type', () => {
    cy.intercept('/admin/doDeleteBurialSiteType').as('deleteBurialSiteType')

    cy.fixture('burialSiteType.json').then((burialSiteType: BurialSiteType) => {
      const nameToDelete = `${burialSiteType.burialSiteType} Updated`

      // Find and click the delete button for our test burial site type
      cy.get(burialSiteTypeTitleSelector)
        .contains(nameToDelete)
        .parents('.container--burialSiteType')
        .find('.button--deleteBurialSiteType')
        .click()

      // Confirm the deletion in the modal
      cy.get('.modal').should('be.visible')

      cy.get('.modal')
        .contains('Yes, Delete Burial Site Type')
        .click()
        .wait('@deleteBurialSiteType')

      // Verify the burial site type is removed
      cy.get(burialSiteTypeTitleSelector).should(
        'not.contain.text',
        nameToDelete
      )
    })
  })
})
