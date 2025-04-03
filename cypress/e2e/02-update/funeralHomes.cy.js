import { testUpdate } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Update - Funeral Homes', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    it('Has a "Create" link on the Funeral Home Search', () => {
        cy.visit('/funeralHomes');
        cy.location('pathname').should('equal', '/funeralHomes');
        cy.get("a[href$='/funeralHomes/new']").should('exist');
    });
    describe('Creates a New Funeral Home', () => {
        it('Has no detectable accessibility issues', () => {
            cy.visit('/funeralHomes/new');
            cy.injectAxe();
            cy.checkA11y();
        });
    });
});
