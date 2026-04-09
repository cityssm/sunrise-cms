import { testAdmin } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { minimumNavigationDelayMillis } from '../../support/timeouts.js';
describe('Admin - Contract Type Management', () => {
    const contractTypeTitleSelector = '.container--contractType .panel-heading .title';
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/contractTypes', {
            retryOnNetworkFailure: true
        }).wait(minimumNavigationDelayMillis);
        cy.location('pathname', {}).should('equal', '/admin/contractTypes');
    });
    afterEach(logout);
    it('Adds a new contract type', () => {
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.get('#button--addContractType').click();
        cy.get('.modal').should('be.visible');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        cy.fixture('contractType.json').then((contractType) => {
            cy.get(".modal input[name='contractType']").type(contractType.contractType);
            cy.get(".modal button[type='submit']").click();
            cy.get(contractTypeTitleSelector, {}).should('contain.text', contractType.contractType);
        });
    });
    it('Updates a contract type', () => {
        cy.intercept('/admin/doUpdateContractType').as('updateContractType');
        cy.fixture('contractType.json').then((contractType) => {
            cy.get(contractTypeTitleSelector)
                .contains(contractType.contractType)
                .parents('.container--contractType')
                .find('.button--editContractType')
                .click();
            cy.get('.modal').should('be.visible');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, logAccessibilityViolations);
            const updatedName = `${contractType.contractType} Updated`;
            cy.get(".modal input[name='contractType']").clear().type(updatedName);
            cy.get(".modal button[type='submit']").click().wait('@updateContractType');
            cy.get(contractTypeTitleSelector, {}).should('contain.text', updatedName);
            contractType.contractType = updatedName;
        });
    });
    it('Removes a contract type', () => {
        cy.intercept('/admin/doDeleteContractType').as('deleteContractType');
        cy.fixture('contractType.json').then((contractType) => {
            const nameToDelete = `${contractType.contractType} Updated`;
            cy.get(contractTypeTitleSelector)
                .contains(nameToDelete)
                .parents('.container--contractType')
                .find('.button--deleteContractType')
                .click();
            cy.get('.modal').should('be.visible');
            cy.get('.modal')
                .contains('Yes, Delete Contract Type')
                .click()
                .wait('@deleteContractType');
            cy.get(contractTypeTitleSelector, {}).should('not.contain.text', nameToDelete);
        });
    });
});
