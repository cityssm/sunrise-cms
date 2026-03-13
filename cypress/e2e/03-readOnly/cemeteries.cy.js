import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { ajaxDelayMillis, pageLoadDelayMillis } from '../../support/timeouts.js';
describe('Cemetery Search', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    it('Can view a cemetery from the search results', () => {
        cy.visit('/cemeteries');
        cy.location('pathname', { timeout: pageLoadDelayMillis }).should('equal', '/cemeteries');
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
            expect(href).to.include('/cemeteries/');
            cy.wrap($link).click();
            cy.location('pathname', { timeout: pageLoadDelayMillis }).should('include', '/cemeteries/');
            cy.log('Check accessibility on the cemetery view page');
            cy.injectAxe();
            cy.checkA11y(undefined, undefined, logAccessibilityViolations);
            checkDeadLinks();
            /*
            cy.log('Navigate to the next cemetery')
    
            cy.get("a[rel='next']").click()
    
            cy.location('pathname', { timeout: pageLoadDelayMillis }).should('include', '/cemeteries/')
    
            cy.log('Navigate back to the previous cemetery')
    
            cy.get("a[rel='prev']").click()
    
            cy.location('pathname', { timeout: pageLoadDelayMillis }).should('include', '/cemeteries/')
            */
        });
    });
});
