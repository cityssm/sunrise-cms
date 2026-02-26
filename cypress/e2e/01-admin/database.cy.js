import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, checkA11yLog, login, logout } from '../../support/index.js';
describe('Admin - Database Maintenance', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/database');
        cy.location('pathname').should('equal', '/admin/database');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, checkA11yLog);
    });
    it('Backs up the database', () => {
        cy.get("button[data-cy='backup']").click();
        cy.get('.modal').should('be.visible').should('contain.text', 'Backup');
        cy.get(".modal button[data-cy='ok']").click();
        cy.wait(ajaxDelayMillis);
        cy.get('.modal')
            .should('contain.text', 'Backed Up')
            .should('contain.text', 'Success');
        cy.get(".modal button[data-cy='ok']").click();
    });
    it('Cleans up the database', () => {
        cy.get("button[data-cy='cleanup']").click();
        cy.get('.modal').should('be.visible').should('contain.text', 'Cleanup');
        cy.get(".modal button[data-cy='ok']").click();
        cy.wait(ajaxDelayMillis);
        cy.get('.modal')
            .should('contain.text', 'Cleaned Up')
            .should('contain.text', 'Success');
        cy.get(".modal button[data-cy='ok']").click();
    });
});
