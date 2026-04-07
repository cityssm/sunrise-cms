import 'cypress-axe';
import { minimumNavigationDelayMillis, pageLoadTimeoutMillis } from './timeouts.js';
export function logout() {
    cy.visit('/logout', {
        timeout: pageLoadTimeoutMillis * 2,
        retryOnNetworkFailure: true,
        retryOnStatusCodeFailure: true
    });
    cy.clearCookies();
}
export function login(userName) {
    cy.visit('/login', {
        retryOnNetworkFailure: true,
        timeout: pageLoadTimeoutMillis
    });
    cy.get('.message').contains('Testing', {
        matchCase: false
    });
    cy.get("form [name='userName']").type(userName);
    cy.get("form [name='password']").type(userName);
    cy.get('form').submit().wait(minimumNavigationDelayMillis);
    cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should('not.contain', '/login');
    cy.get('.navbar').should('have.length', 1);
}
export function logAccessibilityViolations(violations) {
    if (violations.length > 0) {
        cy.log('Accessibility violations found:');
        for (const violation of violations) {
            cy.log(`- ${violation.id}: ${violation.description}`);
            cy.log(`  Context: ${JSON.stringify(violation.nodes)}`);
        }
    }
}
