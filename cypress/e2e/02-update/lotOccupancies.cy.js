import { testUpdate } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Update - Lot Occupancies', () => {
    beforeEach(() => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    it('Has a "Create" link on the Lot Occupancy Search', () => {
        cy.visit('/lotOccupancies');
        cy.location('pathname').should('equal', '/lotOccupancies');
        cy.get("a[href$='/contracts/new']").should('exist');
    });
    describe('Update a New Lot Occupancy', () => {
        it('Has no detectable accessibility issues', () => {
            cy.visit('/contracts/new');
            cy.injectAxe();
            cy.checkA11y();
        });
    });
});
