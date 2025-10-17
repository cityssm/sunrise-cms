// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-nested-callbacks, no-secrets/no-secrets */

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
    const firstWorkOrderTypeInputSelector =
      '#container--workOrderTypes tr:first input[name="workOrderType"]'

    beforeEach(() => {
      // Expand the Work Order Types panel
      cy.contains('h2', 'Work Order Types')
        .parents('.panel')
        .find('.is-toggle-button')
        .click()
    })

    it('Adds a new work order type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#form--addWorkOrderType input[name="workOrderType"]').type(
          configTables.workOrderType
        )

        cy.get('#form--addWorkOrderType button[type="submit"]').click()

        cy.wait(ajaxDelayMillis)

        cy.get(firstWorkOrderTypeInputSelector).should(
          'have.value',
          configTables.workOrderType
        )
      })
    })

    it('Updates a work order type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        // Find the work order type row and update it
        cy.get(firstWorkOrderTypeInputSelector)
          .should('have.value', configTables.workOrderType)
          .clear()
          .type(configTables.workOrderTypeUpdated)
          .parents('tr')
          .find('button[type="submit"]')
          .click()

        cy.wait(ajaxDelayMillis)

        // Verify update was successful by checking for updated text
        cy.get(firstWorkOrderTypeInputSelector).should(
          'have.value',
          configTables.workOrderTypeUpdated
        )
      })
    })

    it('Deletes a work order type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        // Find and click the delete button
        cy.get(firstWorkOrderTypeInputSelector)
          .should('have.value', configTables.workOrderTypeUpdated)
          .parents('tr')
          .find('.button--deleteWorkOrderType')
          .click()

        // Confirm deletion in modal
        cy.get('.modal').should('be.visible')
        cy.get('.modal button[data-cy="ok"]')
          .contains('Delete Work Order Type')
          .click()

        cy.wait(ajaxDelayMillis)
        cy.get('.modal button[data-cy="ok"]').click()

        // Verify the work order type was deleted
        cy.get(firstWorkOrderTypeInputSelector).should(
          'not.have.value',
          configTables.workOrderTypeUpdated
        )
      })
    })
  })

  describe('Work Order Milestone Types', () => {
    const firstWorkOrderMilestoneTypeInputSelector =
      '#container--workOrderMilestoneTypes tr:first input[name="workOrderMilestoneType"]'

    beforeEach(() => {
      // Expand the Work Order Milestone Types panel
      cy.contains('h2', 'Work Order Milestone Types')
        .parents('.panel')
        .find('.is-toggle-button')
        .click()
    })

    it('Adds a new work order milestone type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get(
          '#form--addWorkOrderMilestoneType input[name="workOrderMilestoneType"]'
        ).type(configTables.workOrderMilestoneType)

        cy.get('#form--addWorkOrderMilestoneType button[type="submit"]').click()

        cy.wait(ajaxDelayMillis)

        cy.get(firstWorkOrderMilestoneTypeInputSelector).should(
          'have.value',
          configTables.workOrderMilestoneType
        )
      })
    })

    it('Updates a work order milestone type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        // Find the work order milestone type row and update it
        cy.get(firstWorkOrderMilestoneTypeInputSelector)
          .should('have.value', configTables.workOrderMilestoneType)
          .clear()
          .type(configTables.workOrderMilestoneTypeUpdated)
          .parents('tr')
          .find('button[type="submit"]')
          .click()

        cy.wait(ajaxDelayMillis)

        // Verify update was successful by checking for updated text
        cy.get(firstWorkOrderMilestoneTypeInputSelector).should(
          'have.value',
          configTables.workOrderMilestoneTypeUpdated
        )
      })
    })

    it('Deletes a work order milestone type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        // Find and click the delete button
        cy.get(firstWorkOrderMilestoneTypeInputSelector)
          .should('have.value', configTables.workOrderMilestoneTypeUpdated)
          .parents('tr')
          .find('.button--deleteWorkOrderMilestoneType')
          .click()

        // Confirm deletion in modal
        cy.get('.modal').should('be.visible')
        cy.get('.modal button[data-cy="ok"]')
          .contains('Delete Work Order Milestone Type')
          .click()

        cy.wait(ajaxDelayMillis)
        cy.get('.modal button[data-cy="ok"]').click()

        // Verify the work order milestone type was deleted
        cy.get(firstWorkOrderMilestoneTypeInputSelector).should(
          'not.have.value',
          configTables.workOrderMilestoneTypeUpdated
        )
      })
    })
  })

  describe('Burial Site Statuses', () => {
    const firstBurialSiteStatusInputSelector =
      '#container--burialSiteStatuses tr:first input[name="burialSiteStatus"]'

    beforeEach(() => {
      // Expand the Burial Site Statuses panel
      cy.contains('h2', 'Burial Site Statuses')
        .parents('.panel')
        .find('.is-toggle-button')
        .click()
    })

    it('Adds a new burial site status', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get(
          '#form--addBurialSiteStatus input[name="burialSiteStatus"]'
        ).type(configTables.burialSiteStatus)

        cy.get('#form--addBurialSiteStatus button[type="submit"]').click()

        cy.wait(ajaxDelayMillis)

        cy.get(firstBurialSiteStatusInputSelector).should(
          'have.value',
          configTables.burialSiteStatus
        )
      })
    })

    it('Updates a burial site status', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get(firstBurialSiteStatusInputSelector)
          .should('have.value', configTables.burialSiteStatus)
          .clear()
          .type(configTables.burialSiteStatusUpdated)
          .parents('tr')
          .find('button[type="submit"]')
          .click()

        cy.wait(ajaxDelayMillis)

        cy.get(firstBurialSiteStatusInputSelector).should(
          'have.value',
          configTables.burialSiteStatusUpdated
        )
      })
    })

    it('Deletes a burial site status', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get(firstBurialSiteStatusInputSelector)
          .should('have.value', configTables.burialSiteStatusUpdated)
          .parents('tr')
          .find('.button--deleteBurialSiteStatus')
          .click()

        cy.get('.modal').should('be.visible')
        cy.get('.modal button[data-cy="ok"]').contains('Delete Status').click()

        cy.wait(ajaxDelayMillis)
        cy.get('.modal button[data-cy="ok"]').click()

        cy.get(firstBurialSiteStatusInputSelector).should(
          'not.have.value',
          configTables.burialSiteStatusUpdated
        )
      })
    })
  })

  describe('Committal Types', () => {
    const firstCommittalTypeInputSelector =
      '#container--committalTypes tr:first input[name="committalType"]'

    beforeEach(() => {
      // Expand the Committal Types panel
      cy.contains('h2', 'Committal Types')
        .parents('.panel')
        .find('.is-toggle-button')
        .click()
    })

    it('Adds a new committal type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get('#form--addCommittalType input[name="committalType"]').type(
          configTables.committalType
        )

        cy.get('#form--addCommittalType button[type="submit"]').click()

        cy.wait(ajaxDelayMillis)

        cy.get(firstCommittalTypeInputSelector).should(
          'have.value',
          configTables.committalType
        )
      })
    })

    it('Updates a committal type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get(firstCommittalTypeInputSelector)
          .should('have.value', configTables.committalType)
          .clear()
          .type(configTables.committalTypeUpdated)
          .parents('tr')
          .find('button[type="submit"]')
          .click()

        cy.wait(ajaxDelayMillis)

        cy.get(firstCommittalTypeInputSelector).should(
          'have.value',
          configTables.committalTypeUpdated
        )
      })
    })

    it('Deletes a committal type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get(firstCommittalTypeInputSelector)
          .should('have.value', configTables.committalTypeUpdated)
          .parents('tr')
          .find('.button--deleteCommittalType')
          .click()

        cy.get('.modal').should('be.visible')
        cy.get('.modal button[data-cy="ok"]').contains('Delete Type').click()

        cy.wait(ajaxDelayMillis)
        cy.get('.modal button[data-cy="ok"]').click()

        cy.get(firstCommittalTypeInputSelector).should(
          'not.have.value',
          configTables.committalTypeUpdated
        )
      })
    })
  })

  describe('Interment Container Types', () => {
    const firstIntermentContainerTypeInputSelector =
      '#container--intermentContainerTypes tr:first input[name="intermentContainerType"]'

    beforeEach(() => {
      // Expand the Interment Container Types panel
      cy.contains('h2', 'Interment Container Types')
        .parents('.panel')
        .find('.is-toggle-button')
        .click()
    })

    it('Adds a new interment container type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get(
          '#form--addIntermentContainerType input[name="intermentContainerType"]'
        ).type(configTables.intermentContainerType)

        cy.get(
          'button[form="form--addIntermentContainerType"][type="submit"]'
        ).click()

        cy.wait(ajaxDelayMillis)

        cy.get(firstIntermentContainerTypeInputSelector).should(
          'have.value',
          configTables.intermentContainerType
        )
      })
    })

    it('Updates an interment container type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get(firstIntermentContainerTypeInputSelector)
          .should('have.value', configTables.intermentContainerType)
          .clear()
          .type(configTables.intermentContainerTypeUpdated)
          .parents('tr')
          .find('button[type="submit"]')
          .click()

        cy.wait(ajaxDelayMillis)

        cy.get(firstIntermentContainerTypeInputSelector).should(
          'have.value',
          configTables.intermentContainerTypeUpdated
        )
      })
    })

    it('Deletes an interment container type', () => {
      cy.fixture('configTables.json').then((configTables) => {
        cy.get(firstIntermentContainerTypeInputSelector)
          .should('have.value', configTables.intermentContainerTypeUpdated)
          .parents('tr')
          .find('.button--deleteIntermentContainerType')
          .click()

        cy.get('.modal').should('be.visible')
        cy.get('.modal button[data-cy="ok"]').contains('Delete Type').click()

        cy.wait(ajaxDelayMillis)
        cy.get('.modal button[data-cy="ok"]').click()

        cy.get(firstIntermentContainerTypeInputSelector).should(
          'not.have.value',
          configTables.intermentContainerTypeUpdated
        )
      })
    })
  })
})
