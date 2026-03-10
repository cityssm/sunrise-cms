import { testView } from '../../../test/_globals.js';
import { ajaxDelayMillis, checkDeadLinks, logAccessibilityViolations, login, logout } from '../../support/index.js';
describe('Burial Site Search', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Has no detectable accessibility issues on the search page', () => {
        cy.visit('/burialSites');
        cy.location('pathname').should('equal', '/burialSites');
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
    it('Can view a burial site from the search results', () => {
        cy.visit('/burialSites');
        cy.location('pathname').should('equal', '/burialSites');
        cy.wait(ajaxDelayMillis);
        cy.get('#container--searchResults a.has-text-weight-bold')
            .first()
            .then(($link) => {
            const href = $link.attr('href');
            expect(href).to.include('/burialSites/');
            cy.wrap($link).click();
            cy.location('pathname').should('include', '/burialSites/');
            cy.log('Check accessibility on the burial site view page');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, logAccessibilityViolations);
            checkDeadLinks();
        });
    });
});
describe('Burial Site Map', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.visit('/burialSites/map');
        cy.location('pathname').should('equal', '/burialSites/map');
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
});
