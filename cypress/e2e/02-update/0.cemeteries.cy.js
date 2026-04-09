import { testUpdate } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { minimumNavigationDelayMillis } from '../../support/timeouts.js';
describe('Cemeteries - Update', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    it('Has a "Create" link on the Cemetery Search', () => {
        cy.visit('/cemeteries');
        cy.location('pathname').should('equal', '/cemeteries');
        cy.get("a[href$='/cemeteries/new']").should('exist');
    });
    it('Creates a new cemetery', () => {
        cy.visit('/cemeteries/new', {
            retryOnStatusCodeFailure: true
        });
        cy.log('Check the accessibility');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.log('Populate the fields');
        cy.fixture('cemetery.json').then((cemeteryData) => {
            cy.get("input[name='cemeteryName']")
                .clear()
                .type(cemeteryData.cemeteryName);
            cy.get("textarea[name='cemeteryDescription']")
                .clear()
                .type(cemeteryData.cemeteryDescription);
            cy.get("input[name='cemeteryAddress1']")
                .clear()
                .type(cemeteryData.cemeteryAddress1);
            cy.get("input[name='cemeteryAddress2']")
                .clear()
                .type(cemeteryData.cemeteryAddress2);
            cy.get("input[name='cemeteryPostalCode']")
                .clear()
                .type(cemeteryData.cemeteryPostalCode);
            cy.get("input[name='cemeteryPhoneNumber']")
                .clear()
                .type(cemeteryData.cemeteryPhoneNumber);
            cy.get("input[name='cemeteryLatitude']")
                .clear()
                .type(cemeteryData.cemeteryLatitude?.toString() ?? '');
            cy.get("input[name='cemeteryLongitude']")
                .clear()
                .type(cemeteryData.cemeteryLongitude?.toString() ?? '');
            cy.get("input[name='findagraveCemeteryId']")
                .clear()
                .type(cemeteryData.findagraveCemeteryId?.toString() ?? '');
        });
        cy.log('Submit the form');
        cy.get('#form--cemetery').submit().wait(minimumNavigationDelayMillis);
        cy.location('pathname')
            .should('not.contain', '/new')
            .should('contain', '/edit');
        cy.fixture('cemetery.json').then((cemeteryData) => {
            cy.get("input[name='cemeteryName']").should('have.value', cemeteryData.cemeteryName);
            cy.get("textarea[name='cemeteryDescription']").should('have.value', cemeteryData.cemeteryDescription);
            cy.get("input[name='cemeteryAddress1']").should('have.value', cemeteryData.cemeteryAddress1);
            cy.get("input[name='cemeteryAddress2']").should('have.value', cemeteryData.cemeteryAddress2);
            cy.get("input[name='cemeteryPostalCode']").should('have.value', cemeteryData.cemeteryPostalCode);
            cy.get("input[name='cemeteryPhoneNumber']").should('have.value', cemeteryData.cemeteryPhoneNumber);
            cy.get("input[name='cemeteryLatitude']").should('have.value', cemeteryData.cemeteryLatitude?.toString());
            cy.get("input[name='cemeteryLongitude']").should('have.value', cemeteryData.cemeteryLongitude?.toString());
            cy.get("input[name='findagraveCemeteryId']").should('have.value', cemeteryData.findagraveCemeteryId?.toString());
        });
        cy.log('Test More Options Dropdown');
        const moreOptionsSelector = '[data-cy="dropdown--moreOptions"]';
        cy.get(moreOptionsSelector).should('not.have.class', 'is-active');
        cy.get(moreOptionsSelector).find('.dropdown-trigger button').click();
        cy.get(moreOptionsSelector).should('have.class', 'is-active');
        cy.get(moreOptionsSelector).find('.dropdown-trigger button').click();
        cy.get(moreOptionsSelector).should('not.have.class', 'is-active');
        cy.log('Open the Audit Log modal and verify at least one entry');
        cy.get(moreOptionsSelector).find('.dropdown-trigger button').click();
        cy.get(moreOptionsSelector).find('.is-view-audit-log-button').click();
        cy.get('#modal--recordAuditLog').should('be.visible');
        cy.get('#container--recordAuditLog tbody tr').should('have.length.at.least', 1);
        cy.get('#modal--recordAuditLog .is-close-modal-button').first().click();
    });
});
