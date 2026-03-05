import { testView } from '../../../test/_globals.js';
import { ajaxDelayMillis, checkA11yLog, login, logout } from '../../support/index.js';
describe('Cemetery Search', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Has no detectable accessibility issues on the search page', () => {
        cy.visit('/cemeteries');
        cy.location('pathname').should('equal', '/cemeteries');
        cy.wait(ajaxDelayMillis);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, checkA11yLog);
    });
    it('Can view a cemetery from the search results', () => {
        cy.visit('/cemeteries');
        cy.location('pathname').should('equal', '/cemeteries');
        cy.wait(ajaxDelayMillis);
        cy.get('#container--searchResults a.has-text-weight-bold')
            .first()
            .then(($link) => {
            const href = $link.attr('href');
            expect(href).to.include('/cemeteries/');
            cy.wrap($link).click();
            cy.location('pathname').should('include', '/cemeteries/');
            cy.log('Check accessibility on the cemetery view page');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, checkA11yLog);
        });
    });
});
