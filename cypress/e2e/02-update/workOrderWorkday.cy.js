import { testUpdate } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { ajaxTimeoutMillis, pageLoadTimeoutMillis } from '../../support/timeouts.js';
describe('Work Orders - Workday Report', () => {
    beforeEach(() => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    const workdayUrl = '/workOrders/workday';
    const dateSpanSelector = '#workdayDateStringSpan';
    it('Should page between days', () => {
        cy.visit(workdayUrl, { timeout: pageLoadTimeoutMillis });
        cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should('equal', workdayUrl);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.get(dateSpanSelector).invoke('text').as('initialDateString');
        cy.get('@initialDateString').then((initialDateString) => {
            cy.get('#button--workdayNextDay').click();
            cy.get(dateSpanSelector, {
                timeout: ajaxTimeoutMillis
            })
                .invoke('text')
                .should('not.equal', initialDateString);
            cy.get('#button--workdayPreviousDay').click();
            cy.get('#button--workdayPreviousDay', {
                timeout: ajaxTimeoutMillis
            }).click();
            cy.get(dateSpanSelector, {
                timeout: ajaxTimeoutMillis
            })
                .invoke('text')
                .should('not.equal', initialDateString);
        });
    });
});
