import { testAdmin } from '../../../test/_globals.js'
import type { BurialSiteType } from '../../../types/record.types.js'
import { ajaxDelayMillis, login, logout } from '../../support/index.js'

describe('Admin - Burial Site Type Management', () => {
  const burialSiteTypeTitleSelector =
    '.container--burialSiteType .panel-heading .title'

  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)
    cy.visit('/admin/burialSiteTypes')
    cy.location('pathname').should('equal', '/admin/burialSiteTypes')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Adds a new burial site type', () => {
    cy.get('#button--addBurialSiteType').click()

    cy.get('.modal').should('be.visible')

    cy.injectAxe()
    cy.checkA11y()

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

      cy.wait(ajaxDelayMillis)

      cy.get(burialSiteTypeTitleSelector).should(
        'contain.text',
        burialSiteType.burialSiteType
      )
    })
  })

  it('Updates a burial site type', () => {
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
      cy.checkA11y()

      // Update the burial site type name
      cy.get(".modal input[name='burialSiteType']")
        .clear()
        .type(burialSiteType.burialSiteTypeUpdated ?? '')

      cy.get(".modal button[type='submit']").click()

      cy.wait(ajaxDelayMillis)

      // Verify the burial site type is updated
      cy.get(burialSiteTypeTitleSelector).should(
        'contain.text',
        burialSiteType.burialSiteTypeUpdated
      )
    })
  })

  it('Removes a burial site type', () => {
    cy.fixture('burialSiteType.json').then((burialSiteType: BurialSiteType) => {
      // Find and click the delete button for our test burial site type
      cy.get(burialSiteTypeTitleSelector)
        .contains(burialSiteType.burialSiteTypeUpdated ?? burialSiteType.burialSiteType)
        .parents('.container--burialSiteType')
        .find('.button--deleteBurialSiteType')
        .click()

      // Confirm the deletion in the modal
      cy.get('.modal').should('be.visible')

      cy.get('.modal').contains('Yes, Delete Burial Site Type').click()

      cy.wait(ajaxDelayMillis)

      // Verify the burial site type is removed
      cy.get(burialSiteTypeTitleSelector).should(
        'not.contain.text',
        burialSiteType.burialSiteTypeUpdated ?? burialSiteType.burialSiteType
      )
    })
  })
})
