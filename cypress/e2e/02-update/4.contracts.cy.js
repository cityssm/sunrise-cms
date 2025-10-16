import { testUpdate } from '../../../test/_globals.js';
import { login, logout, pageLoadDelayMillis } from '../../support/index.js';
describe('Contracts - Update', () => {
    beforeEach(() => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    it('Has a "Create" link on the Contract Search', () => {
        cy.visit('/contracts');
        cy.location('pathname').should('equal', '/contracts');
        cy.get("a[href$='/contracts/new']").should('exist');
    });
    it('Creates a New Contract', () => {
        cy.visit('/contracts/new');
        cy.log('Check the accessibility');
        cy.injectAxe();
        cy.checkA11y();
        cy.log('Populate the fields');
        // Select the first available contract type
        cy.get("select[name='contractTypeId'] option")
            .eq(1)
            .invoke('val')
            .then((contractTypeId) => {
            cy.get("select[name='contractTypeId']").select(contractTypeId);
        });
        // Select the first available burial site
        cy.get("input[name='burialSiteId']").should('exist');
        cy.fixture('contract.json').then((contractData) => {
            const inputPrefix = "input[name='";
            // Fill in purchaser information
            cy.get(inputPrefix + "purchaserName']")
                .clear()
                .type(contractData.purchaserName);
            cy.get(inputPrefix + "purchaserAddress1']")
                .clear()
                .type(contractData.purchaserAddress1);
            cy.get(inputPrefix + "purchaserAddress2']")
                .clear()
                .type(contractData.purchaserAddress2);
            cy.get(inputPrefix + "purchaserCity']")
                .clear()
                .type(contractData.purchaserCity);
            cy.get(inputPrefix + "purchaserProvince']")
                .clear()
                .type(contractData.purchaserProvince);
            cy.get(inputPrefix + "purchaserPostalCode']")
                .clear()
                .type(contractData.purchaserPostalCode);
            cy.get(inputPrefix + "purchaserPhoneNumber']")
                .clear()
                .type(contractData.purchaserPhoneNumber);
            cy.get(inputPrefix + "purchaserEmail']")
                .clear()
                .type(contractData.purchaserEmail);
            cy.get(inputPrefix + "purchaserRelationship']")
                .clear()
                .type(contractData.purchaserRelationship);
        });
        cy.log('Submit the form');
        cy.get('#form--contract').submit();
        cy.wait(pageLoadDelayMillis)
            .location('pathname')
            .should('not.contain', '/new')
            .should('contain', '/edit');
        cy.fixture('contract.json').then((contractData) => {
            const inputPrefix = "input[name='";
            cy.get(inputPrefix + "purchaserName']").should('have.value', contractData.purchaserName);
            cy.get(inputPrefix + "purchaserAddress1']").should('have.value', contractData.purchaserAddress1);
            cy.get(inputPrefix + "purchaserAddress2']").should('have.value', contractData.purchaserAddress2);
            cy.get(inputPrefix + "purchaserCity']").should('have.value', contractData.purchaserCity);
            cy.get(inputPrefix + "purchaserProvince']").should('have.value', contractData.purchaserProvince);
            cy.get(inputPrefix + "purchaserPostalCode']").should('have.value', contractData.purchaserPostalCode);
            cy.get(inputPrefix + "purchaserPhoneNumber']").should('have.value', contractData.purchaserPhoneNumber);
            cy.get(inputPrefix + "purchaserEmail']").should('have.value', contractData.purchaserEmail);
            cy.get(inputPrefix + "purchaserRelationship']").should('have.value', contractData.purchaserRelationship);
        });
    });
});
