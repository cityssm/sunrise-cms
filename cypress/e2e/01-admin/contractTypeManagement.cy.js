import { testAdmin } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Admin - Contract Type Management', () => {
    const contractTypeTitleSelector = '.container--contractType .panel-heading .title';
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/contractTypes');
        cy.location('pathname').should('equal', '/admin/contractTypes');
    });
    afterEach(logout);
    it('Adds a new contract type', () => {
        cy.injectAxe();
        cy.checkA11y();
        cy.get('#button--addContractType').click();
        cy.get('.modal').should('be.visible');
        cy.injectAxe();
        cy.checkA11y();
        cy.fixture('contractType.json').then((contractType) => {
            cy.get(".modal input[name='contractType']").type(contractType.contractType);
            cy.get(".modal button[type='submit']").click();
            cy.wait(ajaxDelayMillis);
            cy.get(contractTypeTitleSelector).should('contain.text', contractType.contractType);
        });
    });
    it('Updates a contract type', () => {
        cy.fixture('contractType.json').then((contractType) => {
            // Find and click the edit button for our test contract type
            cy.get(contractTypeTitleSelector)
                .contains(contractType.contractType)
                .parents('.container--contractType')
                .find('.button--editContractType')
                .click();
            // Modal should be visible
            cy.get('.modal').should('be.visible');
            cy.injectAxe();
            cy.checkA11y();
            // Update the contract type name
            const updatedName = contractType.contractType + ' Updated';
            cy.get(".modal input[name='contractType']")
                .clear()
                .type(updatedName);
            cy.get(".modal button[type='submit']").click();
            cy.wait(ajaxDelayMillis);
            // Verify the contract type is updated
            cy.get(contractTypeTitleSelector).should('contain.text', updatedName);
            // Update the fixture to use updated name for delete test
            contractType.contractType = updatedName;
        });
    });
    it('Removes a contract type', () => {
        cy.fixture('contractType.json').then((contractType) => {
            const nameToDelete = contractType.contractType + ' Updated';
            // Find and click the delete button for our test contract type
            cy.get(contractTypeTitleSelector)
                .contains(nameToDelete)
                .parents('.container--contractType')
                .find('.button--deleteContractType')
                .click();
            // Confirm the deletion in the modal
            cy.get('.modal').should('be.visible');
            cy.get('.modal').contains('Yes, Delete Contract Type').click();
            cy.wait(ajaxDelayMillis);
            // Verify the contract type is removed
            cy.get(contractTypeTitleSelector).should('not.contain.text', nameToDelete);
        });
    });
});
