// import { getCachedSettingValue } from '../../../helpers/cache/settings.cache.js'
import { testUpdate } from '../../../test/_globals.js';
import { checkDeadLinks, logAccessibilityViolations, login, logout, pageLoadDelayMillis } from '../../support/index.js';
describe('Funeral Homes - Update', () => {
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
    it('Creates a new funeral home', () => {
        cy.visit('/funeralHomes/new');
        cy.log('Check the accessibility');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.log('Populate the fields');
        cy.fixture('funeralHome.json').then((funeralHomeData) => {
            cy.get("input[name='funeralHomeName']")
                .clear()
                .type(funeralHomeData.funeralHomeName);
            cy.get("input[name='funeralHomeAddress1']")
                .clear()
                .type(funeralHomeData.funeralHomeAddress1);
            cy.get("input[name='funeralHomeAddress2']")
                .clear()
                .type(funeralHomeData.funeralHomeAddress2);
            cy.get("input[name='funeralHomePostalCode']")
                .clear()
                .type(funeralHomeData.funeralHomePostalCode);
            cy.get("input[name='funeralHomePhoneNumber']")
                .clear()
                .type(funeralHomeData.funeralHomePhoneNumber);
        });
        /*
        cy.log('Ensure the default city and province are used')
    
        cy.get("input[name='funeralHomeCity']").should(
          'have.value',
          getCachedSettingValue('defaults.city')
        )
    
        cy.get("input[name='funeralHomeProvince']").should(
          'have.value',
          getCachedSettingValue('defaults.province')
        )
        */
        cy.log('Submit the form');
        cy.get('#form--funeralHome').submit();
        cy.wait(pageLoadDelayMillis)
            .location('pathname')
            .should('not.contain', '/new')
            .should('contain', '/edit');
        cy.fixture('funeralHome.json').then((funeralHomeData) => {
            cy.get("input[name='funeralHomeName']").should('have.value', funeralHomeData.funeralHomeName);
            cy.get("input[name='funeralHomeAddress1']").should('have.value', funeralHomeData.funeralHomeAddress1);
            cy.get("input[name='funeralHomeAddress2']").should('have.value', funeralHomeData.funeralHomeAddress2);
            /*
            cy.get("input[name='funeralHomeCity']").should(
              'have.value',
              getCachedSettingValue('defaults.city')
            )
      
            cy.get("input[name='funeralHomeProvince']").should(
              'have.value',
              getCachedSettingValue('defaults.province')
            )
            */
            cy.get("input[name='funeralHomePostalCode']").should('have.value', funeralHomeData.funeralHomePostalCode);
            cy.get("input[name='funeralHomePhoneNumber']").should('have.value', funeralHomeData.funeralHomePhoneNumber);
        });
        cy.log('Open the Audit Log modal and verify at least one entry');
        const moreOptionsSelector = '[data-cy="dropdown--moreOptions"]';
        cy.get(moreOptionsSelector).find('.dropdown-trigger button').click();
        cy.get(moreOptionsSelector).find('.is-view-audit-log-button').click();
        cy.wait(ajaxDelayMillis);
        cy.get('#modal--recordAuditLog').should('be.visible');
        cy.get('#container--recordAuditLog tbody tr').should('have.length.at.least', 1);
        cy.get('#modal--recordAuditLog .is-close-modal-button').first().click();
    });
});
