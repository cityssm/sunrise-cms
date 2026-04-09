import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { minimumNavigationDelayMillis, } from '../../support/timeouts.js';
describe('Cemetery Search', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Can view a cemetery from the search results', () => {
        cy.visit('/cemeteries', {}).wait(minimumNavigationDelayMillis);
        cy.location('pathname', {}).should('equal', '/cemeteries');
        cy.wait(ajaxTimeoutMillis);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.get('#container--searchResults a.has-text-weight-bold', {})
            .should('have.length.greaterThan', 0)
            .first()
            .then(($link) => {
            const href = $link.attr('href');
            expect(href).to.include('/cemeteries/');
            cy.wrap($link).click().wait(minimumNavigationDelayMillis);
            cy.location('pathname', {}).should('include', '/cemeteries/');
            cy.log('Check accessibility on the cemetery view page');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, logAccessibilityViolations);
            checkDeadLinks();
        });
    });
});
