import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
describe('Dashboard', () => {
    beforeEach(() => {
        logout();
        login(testView);
        cy.visit('/dashboard');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
});
