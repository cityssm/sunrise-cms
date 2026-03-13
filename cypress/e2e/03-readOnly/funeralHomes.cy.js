import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { ajaxTimeoutMillis, pageLoadTimeoutMillis } from '../../support/timeouts.js';
describe('Funeral Home Search', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Can view a funeral home from the search results', () => {
        cy.visit('/funeralHomes', { timeout: pageLoadTimeoutMillis });
        cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should('equal', '/funeralHomes');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.get('#container--searchResults a.has-text-weight-bold', {
            timeout: ajaxTimeoutMillis
        })
            .first()
            .then(($link) => {
            const href = $link.attr('href');
            expect(href).to.include('/funeralHomes/');
            cy.wrap($link).click();
            cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should('include', '/funeralHomes/');
            cy.log('Check accessibility on the funeral home view page');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, logAccessibilityViolations);
            checkDeadLinks();
        });
    });
});
