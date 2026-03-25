/* eslint-disable max-nested-callbacks */
import { testAdmin } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { ajaxTimeoutMillis, minimumNavigationDelayMillis, pageLoadTimeoutMillis } from '../../support/timeouts.js';
describe('Admin - User Management', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/users', {
            retryOnNetworkFailure: true,
            timeout: pageLoadTimeoutMillis
        }).wait(minimumNavigationDelayMillis);
        cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should('equal', '/admin/users');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
    it('Adds a new user', () => {
        cy.get('#button--addUser').click();
        cy.get('.modal').should('be.visible');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        cy.fixture('user.json').then((user) => {
            cy.get(".modal input[name='userName']").type(user.userName);
            cy.get(".modal button[type='submit']").click();
            // Verify the user appears in the table
            cy.get('table tbody tr', {
                timeout: ajaxTimeoutMillis
            }).should('contain.text', user.userName);
        });
    });
    it('Updates user permissions', () => {
        cy.fixture('user.json').then((user) => {
            // Find the user row
            cy.get('table tbody tr')
                .contains(user.userName)
                .parent('tr')
                .within(() => {
                // Toggle the isAdmin permission
                cy.get('button[data-permission="isAdmin"]').click();
                // Verify the button changed to active state
                cy.get('button[data-permission="isAdmin"]', {
                    timeout: ajaxTimeoutMillis
                }).should('have.class', 'is-success');
            });
        });
    });
    it('Removes a user', () => {
        cy.fixture('user.json').then((user) => {
            // Find and click the delete button for our test user
            cy.get('table tbody tr')
                .contains(user.userName)
                .parent('tr')
                .find('.delete-user')
                .click();
            // Confirm the deletion in the modal
            cy.get('.modal').should('be.visible');
            cy.get('.modal button[data-cy="ok"]').contains('Delete').click();
            // Verify the user is removed
            cy.get('#container--users', {
                timeout: ajaxTimeoutMillis
            }).should('not.contain.text', user.userName);
        });
    });
});
