import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { getDelayMillis, logAccessibilityViolations, login, logout } from '../../support/index.js';
describe('User Settings', () => {
    let pageLoadDelayMillis;
    beforeEach(() => {
        logout();
        login(testView);
        ({ pageLoadDelayMillis } = getDelayMillis());
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.visit('/dashboard/userSettings');
        cy.location('pathname', { timeout: pageLoadDelayMillis }).should('equal', '/dashboard/userSettings');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
});
