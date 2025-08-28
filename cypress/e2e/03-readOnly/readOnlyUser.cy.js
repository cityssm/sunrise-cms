import { testView } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Read Only User', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Has a Read Only User dashboard', () => {
        cy.visit('/dashboard');
        cy.log('Has no detectable accessibility issues');
        cy.injectAxe();
        cy.checkA11y();
        cy.log('Has no links to new areas');
        cy.get("a[href*='/new']").should('not.exist');
        cy.log('Has no links to admin areas');
        cy.get("a[href*='/admin']").should('not.exist');
    });
    it('Has no link to create cemeteries on Cemetery Search', () => {
        cy.visit('/cemeteries');
        cy.get("a[href*='/new']").should('not.exist');
    });
    it('Has no link to create burial sites on Burial Site Search', () => {
        cy.visit('/burialSites');
        cy.get("a[href*='/new']").should('not.exist');
        cy.get("a[href*='/creator']").should('not.exist');
        cy.get("a[href*='/gpsCapture']").should('not.exist');
    });
    it('Has no link to create contracts on Contract Search', () => {
        cy.visit('/contracts');
        cy.get("a[href*='/new']").should('not.exist');
    });
    it('Has no link to create work orders on Work Order Search', () => {
        cy.visit('/workOrders');
        cy.get("a[href*='/new']").should('not.exist');
    });
    it('Redirects to Dashboard when attempting to access the login page while authenticated', () => {
        cy.visit('/login');
        cy.wait(200);
        cy.location('pathname').should('equal', '/dashboard/');
    });
    it('Redirects to Dashboard when attempting to create a work order', () => {
        cy.visit('/workOrders/new');
        cy.wait(200);
        cy.location('pathname').should('equal', '/dashboard/');
    });
    it('Redirects to Dashboard when attempting to alter fees', () => {
        cy.visit('/admin/fees');
        cy.wait(200);
        cy.location('pathname').should('not.contain', '/admin');
    });
});
