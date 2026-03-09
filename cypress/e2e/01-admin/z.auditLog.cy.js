import { testAdmin } from '../../../test/_globals.js';
import { checkA11yLog, checkDeadLinks, login, logout } from '../../support/index.js';
describe('Admin - Audit Log Management', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/auditLog');
        cy.location('pathname').should('equal', '/admin/auditLog');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, checkA11yLog);
        checkDeadLinks();
    });
});
