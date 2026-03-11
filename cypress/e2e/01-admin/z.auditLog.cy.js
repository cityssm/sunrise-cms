import { testAdmin } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { getDelayMillis, logAccessibilityViolations, login, logout } from '../../support/index.js';
describe('Admin - Audit Log Management', () => {
    let pageLoadDelayMillis;
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        ({ pageLoadDelayMillis } = getDelayMillis());
        cy.visit('/admin/auditLog');
        cy.location('pathname', { timeout: pageLoadDelayMillis }).should('equal', '/admin/auditLog');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
});
