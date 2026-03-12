import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { ajaxDelayMillis, logAccessibilityViolations, login, logout, pageLoadDelayMillis } from '../../support/index.js';
describe('Work Order Search', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Can view a work order from the search results', () => {
        cy.visit('/workOrders');
        cy.location('pathname', { timeout: pageLoadDelayMillis }).should('equal', '/workOrders');
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.get('#container--searchResults a.has-text-weight-bold', {
            timeout: ajaxDelayMillis
        })
            .first()
            .then(($link) => {
            const href = $link.attr('href');
            expect(href).to.include('/workOrders/');
            cy.wrap($link).click();
            cy.location('pathname', { timeout: pageLoadDelayMillis }).should('include', '/workOrders/');
            cy.log('Check accessibility on the work order view page');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, logAccessibilityViolations);
            checkDeadLinks();
        });
    });
});
