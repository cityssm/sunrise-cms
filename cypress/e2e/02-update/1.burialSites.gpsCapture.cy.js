import { testAdmin } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Admin - User Management', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/burialSites/gpsCapture');
        cy.location('pathname').should('equal', '/burialSites/gpsCapture');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
});
