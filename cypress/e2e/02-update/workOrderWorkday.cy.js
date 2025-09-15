import { testUpdate } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Work Orders - Workday Report', () => {
    beforeEach(() => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.visit('/workOrders/workday');
        cy.location('pathname').should('equal', '/workOrders/workday');
        cy.injectAxe();
        cy.checkA11y();
    });
});
