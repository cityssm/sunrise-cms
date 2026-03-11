import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { getDelayMillis, logAccessibilityViolations, login, logout } from '../../support/index.js';
describe('Work Order Search', () => {
    let ajaxDelayMillis;
    beforeEach(() => {
        logout();
        login(testView);
        ({ ajaxDelayMillis } = getDelayMillis());
    });
    afterEach(logout);
    it('Has no detectable accessibility issues on the search page', () => {
        cy.visit('/workOrders');
        cy.location('pathname').should('equal', '/workOrders');
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
    it('Can view a work order from the search results', () => {
        cy.visit('/workOrders');
        cy.location('pathname').should('equal', '/workOrders');
        cy.wait(ajaxDelayMillis);
        cy.get('#container--searchResults a.has-text-weight-bold')
            .first()
            .then(($link) => {
            const href = $link.attr('href');
            expect(href).to.include('/workOrders/');
            cy.wrap($link).click();
            cy.location('pathname').should('include', '/workOrders/');
            cy.log('Check accessibility on the work order view page');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, logAccessibilityViolations);
            checkDeadLinks();
        });
    });
});
