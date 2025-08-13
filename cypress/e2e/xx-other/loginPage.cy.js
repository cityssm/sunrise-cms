import { checkA11yLog, logout } from '../../support/index.js';
describe('Login Page', () => {
    beforeEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, checkA11yLog);
    });
    it('Contains a login form', () => {
        cy.get('form').should('have.length', 1);
    });
    it('Contains a _csrf field', () => {
        cy.get("form [name='_csrf']").should('exist');
    });
    it('Contains a userName field', () => {
        cy.get("form [name='userName']").should('exist');
    });
    it('Contains a password field', () => {
        cy.get("form [name='password']")
            .should('have.length', 1)
            .invoke('attr', 'type')
            .should('equal', 'password');
    });
    it('Contains a help link', () => {
        cy.get('a').contains('help', {
            matchCase: false
        });
    });
    it('Redirects to login when attempting to access dashboard', () => {
        cy.visit('/dashboard');
        cy.wait(200);
        cy.location('pathname').should('contain', '/login');
    });
    it('Redirects to login when invalid credentials are used', () => {
        cy.get("form [name='userName']").type('*testUser');
        cy.get("form [name='password']").type('b@dP@ssword');
        cy.get('form').submit();
        cy.location('pathname').should('contain', '/login');
        cy.get('form').contains('Login Failed', {
            matchCase: false
        });
    });
});
