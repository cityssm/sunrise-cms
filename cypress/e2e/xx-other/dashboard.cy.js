import { testView } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Dashboard', () => {
    beforeEach(() => {
        logout();
        login(testView);
        cy.visit('/dashboard');
    });
    afterEach(logout);
    it('Has working help documentation and GitHub links', () => {
        cy.get('a[href^="https://cityssm.github.io"], a[href^="https://github.com"]').each(($link) => {
            const href = $link.attr('href');
            cy.request({
                url: href,
                failOnStatusCode: false
            }).its('status').should('be.lessThan', 400);
        });
    });
});
