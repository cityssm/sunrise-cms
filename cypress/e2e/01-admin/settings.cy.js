import { testAdmin } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Admin - Settings Management', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/settings');
        cy.location('pathname').should('equal', '/admin/settings');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
});
