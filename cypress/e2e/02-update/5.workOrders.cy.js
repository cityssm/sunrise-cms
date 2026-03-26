import { testUpdate } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { ajaxTimeoutMillis, minimumNavigationDelayMillis, pageLoadTimeoutMillis, pdfGenerationDelayMillis } from '../../support/timeouts.js';
describe('Work Orders - Update', () => {
    beforeEach(() => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    it('Has a "Create" link on the Work Order Search', () => {
        cy.visit('/workOrders', {
            retryOnNetworkFailure: true,
            timeout: pageLoadTimeoutMillis
        });
        cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should('equal', '/workOrders');
        cy.get("a[href$='/workOrders/new']").should('exist');
    });
    it('Creates a New Work Order', () => {
        cy.visit('/workOrders/new', {
            retryOnNetworkFailure: true,
            timeout: pageLoadTimeoutMillis
        });
        cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should('equal', '/workOrders/new');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.log('Submit the form using defaults');
        cy.get('#form--workOrderEdit')
            .submit()
            .wait(ajaxTimeoutMillis)
            .wait(minimumNavigationDelayMillis);
        cy.location('pathname', { timeout: pageLoadTimeoutMillis })
            .should('not.contain', '/new')
            .should('contain', '/edit');
        cy.log('Check for accessibility issues');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.log('Print the work order');
        cy.get('button[data-cy="print"]').click();
        cy.get('.dropdown.is-active a').first().should('exist').click({
            timeout: pdfGenerationDelayMillis
        });
        cy.log('Open the Audit Log modal and verify at least one entry');
        const moreOptionsSelector = '[data-cy="dropdown--moreOptions"]';
        cy.get(moreOptionsSelector).find('.dropdown-trigger button').click();
        cy.get(moreOptionsSelector)
            .find('.is-view-audit-log-button')
            .click()
            .wait(ajaxTimeoutMillis);
        cy.get('#modal--recordAuditLog', {
            timeout: ajaxTimeoutMillis
        }).should('be.visible');
        cy.wait(ajaxTimeoutMillis)
            .get('#container--recordAuditLog tbody tr', {
            timeout: ajaxTimeoutMillis
        })
            .should('have.length.at.least', 1);
        cy.get('#modal--recordAuditLog .is-close-modal-button').first().click();
    });
});
