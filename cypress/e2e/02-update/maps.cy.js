import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { testUpdate } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Update - Maps', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    it('Has a "Create" link on the Map Search', () => {
        cy.visit('/maps');
        cy.location('pathname').should('equal', '/maps');
        cy.get("a[href$='/maps/new']").should('exist');
    });
    it('Creates a new map', () => {
        cy.visit('/maps/new');
        cy.log('Check the accessibility');
        cy.injectAxe();
        cy.checkA11y();
        cy.log('Populate the fields');
        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.fixture('map.json').then((mapJSON) => {
            cy.get("input[name='mapName']")
                .clear()
                .type(mapJSON.mapName ?? '');
            cy.get("textarea[name='mapDescription']")
                .clear()
                .type(mapJSON.mapDescription ?? '');
            cy.get("input[name='mapAddress1']")
                .clear()
                .type(mapJSON.mapAddress1 ?? '');
            cy.get("input[name='mapAddress2']")
                .clear()
                .type(mapJSON.mapAddress2 ?? '');
            cy.get("input[name='mapPostalCode']")
                .clear()
                .type(mapJSON.mapPostalCode ?? '');
            cy.get("input[name='mapPhoneNumber']")
                .clear()
                .type(mapJSON.mapPhoneNumber ?? '');
            cy.get("input[name='mapLatitude']")
                .clear()
                .type(mapJSON.mapLatitude?.toString() ?? '');
            cy.get("input[name='mapLongitude']")
                .clear()
                .type(mapJSON.mapLongitude?.toString() ?? '');
        });
        cy.log('Ensure the default city and province are used');
        cy.get("input[name='mapCity']").should('have.value', getConfigProperty('settings.map.mapCityDefault'));
        cy.get("input[name='mapProvince']").should('have.value', getConfigProperty('settings.map.mapProvinceDefault'));
        cy.log('Submit the form');
        cy.get('#form--map').submit();
        cy.wait(1000);
        cy.location('pathname')
            .should('not.contain', '/new')
            .should('contain', '/edit');
        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.fixture('map.json').then((mapJSON) => {
            cy.get("input[name='mapName']").should('have.value', mapJSON.mapName);
            cy.get("textarea[name='mapDescription']").should('have.value', mapJSON.mapDescription);
            cy.get("input[name='mapAddress1']").should('have.value', mapJSON.mapAddress1);
            cy.get("input[name='mapAddress2']").should('have.value', mapJSON.mapAddress2);
            cy.get("input[name='mapCity']").should('have.value', getConfigProperty('settings.map.mapCityDefault'));
            cy.get("input[name='mapProvince']").should('have.value', getConfigProperty('settings.map.mapProvinceDefault'));
            cy.get("input[name='mapPostalCode']").should('have.value', mapJSON.mapPostalCode);
            cy.get("input[name='mapPhoneNumber']").should('have.value', mapJSON.mapPhoneNumber);
            cy.get("input[name='mapLatitude']").should('have.value', mapJSON.mapLatitude?.toString());
            cy.get("input[name='mapLongitude']").should('have.value', mapJSON.mapLongitude?.toString());
        });
    });
});
