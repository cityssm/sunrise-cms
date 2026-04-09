import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
describe('Update Log', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.visit('/dashboard/updateLog');
        cy.location('pathname').should('equal', '/dashboard/updateLog');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
});
