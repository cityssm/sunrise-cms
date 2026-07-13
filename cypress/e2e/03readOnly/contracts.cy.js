import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { minimumNavigationDelayMillis, } from '../../support/timeouts.js';
describe('Contract Search', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Should hide the extra filters by default', () => {
        cy.visit('/contracts');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.get('#searchFilter--cemeteryId').should('not.be.visible');
        cy.get('a[data-cy="location-filters-toggle"]').click();
        cy.get('#searchFilter--cemeteryId').should('be.visible');
        cy.get('#searchFilter--purchaserName').should('not.be.visible');
        cy.get('a[data-cy="contact-filters-toggle"]').click();
        cy.get('#searchFilter--purchaserName').should('be.visible');
    });
    it('Should show location filters when a cemeteryId is a parameter', () => {
        cy.visit('/contracts?cemeteryId=1');
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        cy.get('#searchFilter--cemeteryId').should('be.visible');
    });
    it('Should set recipient name when a deceasedName is a parameter', () => {
        const deceasedName = 'Test';
        cy.visit(`/contracts?deceasedName=${deceasedName}`, {});
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        cy.get('#searchFilter--deceasedName').should('have.value', deceasedName);
    });
    it('Can view a contract from the search results', () => {
        cy.intercept('/contracts/doSearchContracts').as('searchContracts');
        cy.visit('/contracts');
        cy.location('pathname').should('equal', '/contracts');
        cy.wait('@searchContracts')
            .get('#container--searchResults a.has-text-weight-bold', {})
            .first()
            .then(($link) => {
            const href = $link.attr('href');
            expect(href).to.include('/contracts/');
            cy.wrap($link).click().wait(minimumNavigationDelayMillis);
            cy.location('pathname').should('include', '/contracts/');
            cy.log('Check accessibility on the contract view page');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, logAccessibilityViolations);
            checkDeadLinks();
        });
    });
});
