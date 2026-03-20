import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, logout } from '../../support/index.js';
import { minimumNavigationDelayMillis, pageLoadTimeoutMillis } from '../../support/timeouts.js';
describe('Login Page', () => {
    beforeEach(() => {
        logout();
    });
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
    it('Contains a login form', () => {
        cy.get('form').should('have.length', 1);
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
        cy.visit('/dashboard', { timeout: pageLoadTimeoutMillis });
        cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should('contain', '/login');
    });
    it('Redirects to login when invalid credentials are used', () => {
        cy.get("form [name='userName']").type('*testUser');
        // eslint-disable-next-line @cspell/spellchecker
        cy.get("form [name='password']").type('b@dP@ssword');
        cy.get('form').submit();
        cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should('contain', '/login');
        cy.get('form').contains('Login Failed', {
            matchCase: false
        });
    });
});
