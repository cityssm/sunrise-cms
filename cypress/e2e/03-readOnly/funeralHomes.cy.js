import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { minimumNavigationDelayMillis, } from '../../support/timeouts.js';
describe('Funeral Home Search', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Can view a funeral home from the search results', () => {
        cy.visit('/funeralHomes', {});
        cy.location('pathname', {}).should('equal', '/funeralHomes');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.get('#container--searchResults a.has-text-weight-bold', {})
            .first()
            .then(($link) => {
            const href = $link.attr('href');
            expect(href).to.include('/funeralHomes/');
            cy.wrap($link).click().wait(minimumNavigationDelayMillis);
            cy.location('pathname', {}).should('include', '/funeralHomes/');
            cy.log('Check accessibility on the funeral home view page');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, logAccessibilityViolations);
            checkDeadLinks();
        });
    });
});
