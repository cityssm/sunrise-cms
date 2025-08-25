// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-nested-callbacks */
import { testUpdate } from '../../../test/_globals.js';
import { login, logout, pageLoadDelayMillis } from '../../support/index.js';
describe('Update - Burial Sites', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    it('Has a "Create" link on the Burial Site Search', () => {
        cy.visit('/burialSites');
        cy.location('pathname').should('equal', '/burialSites');
        cy.injectAxe();
        cy.checkA11y();
        cy.get("a[href$='/burialSites/new']").should('exist');
    });
    it('Creates a New Burial Site', () => {
        cy.visit('/burialSites/new', {
            retryOnStatusCodeFailure: true
        });
        cy.log('Check the accessibility');
        cy.injectAxe();
        cy.checkA11y();
        cy.log('Populate the fields');
        cy.fixture('burialSite.json').then((burialSiteData) => {
            // Select the first available cemetery
            cy.get("select[name='cemeteryId'] option").eq(1).then(($option) => {
                cy.get("select[name='cemeteryId']").select($option.val());
            });
            // Select the first available burial site type
            cy.get("select[name='burialSiteTypeId'] option").eq(1).then(($option) => {
                cy.get("select[name='burialSiteTypeId']").select($option.val());
            });
            // Fill in burial site name segments
            if (burialSiteData.burialSiteNameSegment1) {
                cy.get("input[name='burialSiteNameSegment1']")
                    .clear()
                    .type(burialSiteData.burialSiteNameSegment1);
            }
            if (burialSiteData.burialSiteNameSegment2) {
                cy.get("input[name='burialSiteNameSegment2']")
                    .clear()
                    .type(burialSiteData.burialSiteNameSegment2);
            }
            // Fill in capacities
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (burialSiteData.bodyCapacity !== null && burialSiteData.bodyCapacity !== undefined) {
                cy.get("input[name='bodyCapacity']")
                    .clear()
                    .type(burialSiteData.bodyCapacity.toString());
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (burialSiteData.crematedCapacity !== null && burialSiteData.crematedCapacity !== undefined) {
                cy.get("input[name='crematedCapacity']")
                    .clear()
                    .type(burialSiteData.crematedCapacity.toString());
            }
        });
        cy.log('Submit the form');
        cy.get('#form--burialSite').submit();
        cy.wait(pageLoadDelayMillis)
            .location('pathname')
            .should('not.contain', '/new')
            .should('contain', '/edit');
        cy.fixture('burialSite.json').then((burialSiteData) => {
            // Verify the form values are persisted
            if (burialSiteData.burialSiteNameSegment1) {
                cy.get("input[name='burialSiteNameSegment1']").should('have.value', burialSiteData.burialSiteNameSegment1);
            }
            if (burialSiteData.burialSiteNameSegment2) {
                cy.get("input[name='burialSiteNameSegment2']").should('have.value', burialSiteData.burialSiteNameSegment2);
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (burialSiteData.bodyCapacity !== null && burialSiteData.bodyCapacity !== undefined) {
                cy.get("input[name='bodyCapacity']").should('have.value', burialSiteData.bodyCapacity.toString());
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (burialSiteData.crematedCapacity !== null && burialSiteData.crematedCapacity !== undefined) {
                cy.get("input[name='crematedCapacity']").should('have.value', burialSiteData.crematedCapacity.toString());
            }
        });
    });
});
