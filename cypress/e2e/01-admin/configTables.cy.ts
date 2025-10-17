import { testAdmin } from '../../../test/_globals.js'
import { ajaxDelayMillis, login, logout } from '../../support/index.js'

describe('Admin - Config Table Management', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)
    cy.visit('/admin/tables')
    cy.location('pathname').should('equal', '/admin/tables')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.get('button.is-toggle-button').each(($expandButton) => {
      cy.wrap($expandButton).click({ force: true })
    })
    
    cy.injectAxe()
    cy.checkA11y()
  })

  describe('Work Order Types', () => {
    it('Adds a new work order type', () => {
      // Expand the Work Order Types panel
      cy.contains('h2', 'Work Order Types')
        .parents('.panel')
        .find('.is-toggle-button')
        .click()

      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#form--addWorkOrderType input[name="workOrderType"]').type(
          configTables.workOrderType
        )

        cy.get('#form--addWorkOrderType button[type="submit"]').click()

        cy.wait(ajaxDelayMillis)

        cy.get('#container--workOrderTypes').should(
          'contain.text',
          configTables.workOrderType
        )
      })
    })

    it('Updates a work order type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        // Find the work order type row and update it
        cy.get('#container--workOrderTypes tr')
          .contains(configTables.workOrderType)
          .parents('tr')
          .within(() => {
            cy.get('input[name="workOrderType"]')
              .clear()
              .type(configTables.workOrderTypeUpdated)

            cy.get('button[type="submit"]').click()

            cy.wait(ajaxDelayMillis)
          })

        // Verify update was successful by checking for updated text
        cy.get('#container--workOrderTypes').should(
          'contain.text',
          configTables.workOrderTypeUpdated
        )
      })
    })

    it('Deletes a work order type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        // Find and click the delete button
        cy.get('#container--workOrderTypes tr')
          .contains(configTables.workOrderTypeUpdated)
          .parents('tr')
          .find('.button--deleteWorkOrderType')
          .click()

        // Confirm deletion in modal
        cy.get('.modal').should('be.visible')
        cy.get('.modal').contains('Delete Work Order Type').click()

        cy.wait(ajaxDelayMillis)

        // Verify the work order type was deleted
        cy.get('#container--workOrderTypes').should(
          'not.contain.text',
          configTables.workOrderTypeUpdated
        )
      })
    })
  })

  describe('Burial Site Statuses', () => {
    it('Adds a new burial site status', () => {
      // Expand the Burial Site Statuses panel
      cy.contains('h2', 'Burial Site Statuses')
        .parents('.panel')
        .find('.is-toggle-button')
        .click()

      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#form--addBurialSiteStatus input[name="burialSiteStatus"]').type(
          configTables.burialSiteStatus
        )

        cy.get('#form--addBurialSiteStatus button[type="submit"]').click()

        cy.wait(ajaxDelayMillis)

        cy.get('#container--burialSiteStatuses').should(
          'contain.text',
          configTables.burialSiteStatus
        )
      })
    })

    it('Updates a burial site status', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#container--burialSiteStatuses tr')
          .contains(configTables.burialSiteStatus)
          .parents('tr')
          .within(() => {
            cy.get('input[name="burialSiteStatus"]')
              .clear()
              .type(configTables.burialSiteStatusUpdated)

            cy.get('button[type="submit"]').click()

            cy.wait(ajaxDelayMillis)
          })

        cy.get('#container--burialSiteStatuses').should(
          'contain.text',
          configTables.burialSiteStatusUpdated
        )
      })
    })

    it('Deletes a burial site status', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#container--burialSiteStatuses tr')
          .contains(configTables.burialSiteStatusUpdated)
          .parents('tr')
          .find('.button--deleteBurialSiteStatus')
          .click()

        cy.get('.modal').should('be.visible')
        cy.get('.modal').contains('Delete Burial Site Status').click()

        cy.wait(ajaxDelayMillis)

        cy.get('#container--burialSiteStatuses').should(
          'not.contain.text',
          configTables.burialSiteStatusUpdated
        )
      })
    })
  })

  describe('Committal Types', () => {
    it('Adds a new committal type', () => {
      cy.contains('h2', 'Committal Types')
        .parents('.panel')
        .find('.is-toggle-button')
        .click()

      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#form--addCommittalType input[name="committalType"]').type(
          configTables.committalType
        )

        cy.get('#form--addCommittalType button[type="submit"]').click()

        cy.wait(ajaxDelayMillis)

        cy.get('#container--committalTypes').should(
          'contain.text',
          configTables.committalType
        )
      })
    })

    it('Updates a committal type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#container--committalTypes tr')
          .contains(configTables.committalType)
          .parents('tr')
          .within(() => {
            cy.get('input[name="committalType"]')
              .clear()
              .type(configTables.committalTypeUpdated)

            cy.get('button[type="submit"]').click()

            cy.wait(ajaxDelayMillis)
          })

        cy.get('#container--committalTypes').should(
          'contain.text',
          configTables.committalTypeUpdated
        )
      })
    })

    it('Deletes a committal type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#container--committalTypes tr')
          .contains(configTables.committalTypeUpdated)
          .parents('tr')
          .find('.button--deleteCommittalType')
          .click()

        cy.get('.modal').should('be.visible')
        cy.get('.modal').contains('Delete Committal Type').click()

        cy.wait(ajaxDelayMillis)

        cy.get('#container--committalTypes').should(
          'not.contain.text',
          configTables.committalTypeUpdated
        )
      })
    })
  })

  describe('Interment Container Types', () => {
    it('Adds a new interment container type', () => {
      cy.contains('h2', 'Interment Container Types')
        .parents('.panel')
        .find('.is-toggle-button')
        .click()

      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#form--addIntermentContainerType input[name="intermentContainerType"]').type(
          configTables.intermentContainerType
        )

        cy.get('#form--addIntermentContainerType button[type="submit"]').click()

        cy.wait(ajaxDelayMillis)

        cy.get('#container--intermentContainerTypes').should(
          'contain.text',
          configTables.intermentContainerType
        )
      })
    })

    it('Updates an interment container type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#container--intermentContainerTypes tr')
          .contains(configTables.intermentContainerType)
          .parents('tr')
          .within(() => {
            cy.get('input[name="intermentContainerType"]')
              .clear()
              .type(configTables.intermentContainerTypeUpdated)

            cy.get('button[type="submit"]').click()

            cy.wait(ajaxDelayMillis)
          })

        cy.get('#container--intermentContainerTypes').should(
          'contain.text',
          configTables.intermentContainerTypeUpdated
        )
      })
    })

    it('Deletes an interment container type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#container--intermentContainerTypes tr')
          .contains(configTables.intermentContainerTypeUpdated)
          .parents('tr')
          .find('.button--deleteIntermentContainerType')
          .click()

        cy.get('.modal').should('be.visible')
        cy.get('.modal').contains('Delete Interment Container Type').click()

        cy.wait(ajaxDelayMillis)

        cy.get('#container--intermentContainerTypes').should(
          'not.contain.text',
          configTables.intermentContainerTypeUpdated
        )
      })
    })
  })
})
