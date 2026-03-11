import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { getDelayMillis, logAccessibilityViolations, login, logout } from '../../support/index.js';
describe('Burial Site Search', () => {
    let ajaxDelayMillis;
    let pageLoadDelayMillis;
    beforeEach(() => {
        logout();
        login(testView);
        ({ ajaxDelayMillis, pageLoadDelayMillis } = getDelayMillis());
    });
    afterEach(logout);
    it('Can view a burial site from the search results', () => {
        cy.visit('/burialSites');
        cy.location('pathname', { timeout: pageLoadDelayMillis }).should('equal', '/burialSites');
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.get('#container--searchResults a.has-text-weight-bold', {
            timeout: ajaxDelayMillis
        })
            .first()
            .then(($link) => {
            const href = $link.attr('href');
            expect(href).to.include('/burialSites/');
            cy.wrap($link).click();
            cy.location('pathname', { timeout: pageLoadDelayMillis }).should('include', '/burialSites/');
            cy.log('Check accessibility on the burial site view page');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, logAccessibilityViolations);
            checkDeadLinks();
        });
    });
});
describe('Burial Site Map', () => {
    let ajaxDelayMillis;
    let pageLoadDelayMillis;
    beforeEach(() => {
        logout();
        login(testView);
        ({ ajaxDelayMillis, pageLoadDelayMillis } = getDelayMillis());
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.visit('/burialSites/map');
        cy.location('pathname', { timeout: pageLoadDelayMillis }).should('equal', '/burialSites/map');
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
    it('Pages through cemeteries on the map', () => {
        cy.visit('/burialSites/map');
        cy.location('pathname', { timeout: pageLoadDelayMillis }).should('equal', '/burialSites/map');
        cy.wait(ajaxDelayMillis);
        cy.get('#filter--cemeteryId').should('exist');
        cy.get('#filter--cemeteryId option').its('length').should('be.gte', 1);
        cy.get('#filter--cemeteryId option').each(($option) => {
            cy.log(`Check cemetery filter option: ${$option.text()}`);
            cy.get('#filter--cemeteryId').select($option.val());
            cy.wait(ajaxDelayMillis);
        });
    });
});
