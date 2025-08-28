import { testAdmin } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Admin - User Management', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/users');
        cy.location('pathname').should('equal', '/admin/users');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
});
