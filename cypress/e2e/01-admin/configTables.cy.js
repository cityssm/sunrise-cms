import { testAdmin } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { ajaxTimeoutMillis, minimumNavigationDelayMillis, pageLoadTimeoutMillis } from '../../support/timeouts.js';
describe('Admin - Config Table Management', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/tables', {
            retryOnNetworkFailure: true,
            timeout: pageLoadTimeoutMillis
        }).wait(minimumNavigationDelayMillis);
        cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should('equal', '/admin/tables');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.get('button.is-toggle-button').each(($expandButton) => {
            cy.wrap($expandButton).click({ force: true });
        });
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
    describe('Work Order Types', () => {
        const firstWorkOrderTypeInputSelector = '#container--workOrderTypes tr:first input[name="workOrderType"]';
        beforeEach(() => {
            cy.contains('h2', 'Work Order Types')
                .parents('.panel')
                .find('.is-toggle-button')
                .click();
        });
        it('Adds a new work order type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get('#form--addWorkOrderType input[name="workOrderType"]').type(configTables.workOrderType);
                cy.get('#form--addWorkOrderType button[type="submit"]').click();
                cy.get(firstWorkOrderTypeInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.workOrderType);
            });
        });
        it('Updates a work order type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstWorkOrderTypeInputSelector)
                    .should('have.value', configTables.workOrderType)
                    .clear()
                    .type(configTables.workOrderTypeUpdated)
                    .parents('tr')
                    .find('button[type="submit"]')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get(firstWorkOrderTypeInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.workOrderTypeUpdated);
            });
        });
        it('Deletes a work order type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstWorkOrderTypeInputSelector)
                    .should('have.value', configTables.workOrderTypeUpdated)
                    .parents('tr')
                    .find('.button--deleteWorkOrderType')
                    .click();
                cy.get('.modal').should('be.visible');
                cy.get('.modal button[data-cy="ok"]')
                    .contains('Delete Work Order Type')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get('.modal button[data-cy="ok"]', {
                    timeout: ajaxTimeoutMillis
                }).click();
                cy.get(firstWorkOrderTypeInputSelector).should('not.have.value', configTables.workOrderTypeUpdated);
            });
        });
    });
    describe('Work Order Milestone Types', () => {
        const firstWorkOrderMilestoneTypeInputSelector = '#container--workOrderMilestoneTypes tr:first input[name="workOrderMilestoneType"]';
        beforeEach(() => {
            cy.contains('h2', 'Work Order Milestone Types')
                .parents('.panel')
                .find('.is-toggle-button')
                .click();
        });
        it('Adds a new work order milestone type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get('#form--addWorkOrderMilestoneType input[name="workOrderMilestoneType"]').type(configTables.workOrderMilestoneType);
                cy.get('#form--addWorkOrderMilestoneType button[type="submit"]').click();
                cy.get(firstWorkOrderMilestoneTypeInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.workOrderMilestoneType);
            });
        });
        it('Updates a work order milestone type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstWorkOrderMilestoneTypeInputSelector)
                    .should('have.value', configTables.workOrderMilestoneType)
                    .clear()
                    .type(configTables.workOrderMilestoneTypeUpdated)
                    .parents('tr')
                    .find('button[type="submit"]')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get(firstWorkOrderMilestoneTypeInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.workOrderMilestoneTypeUpdated);
            });
        });
        it('Deletes a work order milestone type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstWorkOrderMilestoneTypeInputSelector)
                    .should('have.value', configTables.workOrderMilestoneTypeUpdated)
                    .parents('tr')
                    .find('.button--deleteWorkOrderMilestoneType')
                    .click();
                cy.get('.modal').should('be.visible');
                cy.get('.modal button[data-cy="ok"]')
                    .contains('Delete Work Order Milestone Type')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get('.modal button[data-cy="ok"]', {
                    timeout: ajaxTimeoutMillis
                }).click();
                cy.get(firstWorkOrderMilestoneTypeInputSelector).should('not.have.value', configTables.workOrderMilestoneTypeUpdated);
            });
        });
    });
    describe('Burial Site Statuses', () => {
        const firstBurialSiteStatusInputSelector = '#container--burialSiteStatuses tr:first input[name="burialSiteStatus"]';
        beforeEach(() => {
            cy.contains('h2', 'Burial Site Statuses')
                .parents('.panel')
                .find('.is-toggle-button')
                .click();
        });
        it('Adds a new burial site status', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get('#form--addBurialSiteStatus input[name="burialSiteStatus"]').type(configTables.burialSiteStatus);
                cy.get('#form--addBurialSiteStatus button[type="submit"]').click();
                cy.get(firstBurialSiteStatusInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.burialSiteStatus);
            });
        });
        it('Updates a burial site status', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstBurialSiteStatusInputSelector)
                    .should('have.value', configTables.burialSiteStatus)
                    .clear()
                    .type(configTables.burialSiteStatusUpdated)
                    .parents('tr')
                    .find('button[type="submit"]')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get(firstBurialSiteStatusInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.burialSiteStatusUpdated);
            });
        });
        it('Deletes a burial site status', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstBurialSiteStatusInputSelector)
                    .should('have.value', configTables.burialSiteStatusUpdated)
                    .parents('tr')
                    .find('.button--deleteBurialSiteStatus')
                    .click();
                cy.get('.modal').should('be.visible');
                cy.get('.modal button[data-cy="ok"]')
                    .contains('Delete Status')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get('.modal button[data-cy="ok"]', {
                    timeout: ajaxTimeoutMillis
                }).click();
                cy.get(firstBurialSiteStatusInputSelector).should('not.have.value', configTables.burialSiteStatusUpdated);
            });
        });
    });
    describe('Committal Types', () => {
        const firstCommittalTypeInputSelector = '#container--committalTypes tr:first input[name="committalType"]';
        beforeEach(() => {
            cy.contains('h2', 'Committal Types')
                .parents('.panel')
                .find('.is-toggle-button')
                .click();
        });
        it('Adds a new committal type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get('#form--addCommittalType input[name="committalType"]').type(configTables.committalType);
                cy.get('#form--addCommittalType button[type="submit"]').click();
                cy.get(firstCommittalTypeInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.committalType);
            });
        });
        it('Updates a committal type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstCommittalTypeInputSelector)
                    .should('have.value', configTables.committalType)
                    .clear()
                    .type(configTables.committalTypeUpdated)
                    .parents('tr')
                    .find('button[type="submit"]')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get(firstCommittalTypeInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.committalTypeUpdated);
            });
        });
        it('Deletes a committal type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstCommittalTypeInputSelector)
                    .should('have.value', configTables.committalTypeUpdated)
                    .parents('tr')
                    .find('.button--deleteCommittalType')
                    .click();
                cy.get('.modal').should('be.visible');
                cy.get('.modal button[data-cy="ok"]')
                    .contains('Delete Type')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get('.modal button[data-cy="ok"]', {
                    timeout: ajaxTimeoutMillis
                }).click();
                cy.get(firstCommittalTypeInputSelector).should('not.have.value', configTables.committalTypeUpdated);
            });
        });
    });
    describe('Interment Container Types', () => {
        const firstIntermentContainerTypeInputSelector = '#container--intermentContainerTypes tr:first input[name="intermentContainerType"]';
        beforeEach(() => {
            cy.contains('h2', 'Interment Container Types')
                .parents('.panel')
                .find('.is-toggle-button')
                .click();
        });
        it('Adds a new interment container type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get('#form--addIntermentContainerType input[name="intermentContainerType"]').type(configTables.intermentContainerType);
                cy.get('button[form="form--addIntermentContainerType"][type="submit"]').click();
                cy.get(firstIntermentContainerTypeInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.intermentContainerType);
            });
        });
        it('Updates an interment container type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstIntermentContainerTypeInputSelector)
                    .should('have.value', configTables.intermentContainerType)
                    .clear()
                    .type(configTables.intermentContainerTypeUpdated)
                    .parents('tr')
                    .find('button[type="submit"]')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get(firstIntermentContainerTypeInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.intermentContainerTypeUpdated);
            });
        });
        it('Deletes an interment container type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstIntermentContainerTypeInputSelector)
                    .should('have.value', configTables.intermentContainerTypeUpdated)
                    .parents('tr')
                    .find('.button--deleteIntermentContainerType')
                    .click();
                cy.get('.modal').should('be.visible');
                cy.get('.modal button[data-cy="ok"]')
                    .contains('Delete Type')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get('.modal button[data-cy="ok"]', {
                    timeout: ajaxTimeoutMillis
                }).click();
                cy.get(firstIntermentContainerTypeInputSelector).should('not.have.value', configTables.intermentContainerTypeUpdated);
            });
        });
    });
    describe('Service Types', () => {
        const firstServiceTypeInputSelector = '#container--serviceTypes tr:first input[name="serviceType"]';
        beforeEach(() => {
            cy.contains('h2', 'Service Types')
                .parents('.panel')
                .find('.is-toggle-button')
                .click();
        });
        it('Adds a new service type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get('#form--addServiceType input[name="serviceType"]').type(configTables.serviceType);
                cy.get('#form--addServiceType button[type="submit"]').click();
                cy.get(firstServiceTypeInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.serviceType);
            });
        });
        it('Updates a service type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstServiceTypeInputSelector)
                    .should('have.value', configTables.serviceType)
                    .clear()
                    .type(configTables.serviceTypeUpdated)
                    .parents('tr')
                    .find('button[type="submit"]')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get(firstServiceTypeInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.serviceTypeUpdated);
            });
        });
        it('Deletes a service type', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstServiceTypeInputSelector)
                    .should('have.value', configTables.serviceTypeUpdated)
                    .parents('tr')
                    .find('.button--deleteServiceType')
                    .click();
                cy.get('.modal').should('be.visible');
                cy.get('.modal button[data-cy="ok"]')
                    .contains('Delete Type')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get('.modal button[data-cy="ok"]', {
                    timeout: ajaxTimeoutMillis
                }).click();
                cy.get(firstServiceTypeInputSelector).should('not.have.value', configTables.serviceTypeUpdated);
            });
        });
    });
    describe('Interment Depths', () => {
        const firstIntermentDepthInputSelector = '#container--intermentDepths tr:first input[name="intermentDepth"]';
        beforeEach(() => {
            cy.contains('h2', 'Interment Depths')
                .parents('.panel')
                .find('.is-toggle-button')
                .click();
        });
        it('Adds a new interment depth', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get('#form--addIntermentDepth input[name="intermentDepth"]').type(configTables.intermentDepth);
                cy.get('#form--addIntermentDepth button[type="submit"]').click();
                cy.get(firstIntermentDepthInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.intermentDepth);
            });
        });
        it('Updates an interment depth', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstIntermentDepthInputSelector)
                    .should('have.value', configTables.intermentDepth)
                    .clear()
                    .type(configTables.intermentDepthUpdated)
                    .parents('tr')
                    .find('button[type="submit"]')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get(firstIntermentDepthInputSelector, {
                    timeout: ajaxTimeoutMillis
                }).should('have.value', configTables.intermentDepthUpdated);
            });
        });
        it('Deletes an interment depth', () => {
            cy.fixture('configTables.json').then((configTables) => {
                cy.get(firstIntermentDepthInputSelector)
                    .should('have.value', configTables.intermentDepthUpdated)
                    .parents('tr')
                    .find('.button--deleteIntermentDepth')
                    .click();
                cy.get('.modal').should('be.visible');
                cy.get('.modal button[data-cy="ok"]')
                    .contains('Delete Depth')
                    .click()
                    .wait(ajaxTimeoutMillis);
                cy.get('.modal button[data-cy="ok"]', {
                    timeout: ajaxTimeoutMillis
                }).click();
                cy.get(firstIntermentDepthInputSelector).should('not.have.value', configTables.intermentDepthUpdated);
            });
        });
    });
});
