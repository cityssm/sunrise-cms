import { testUpdate } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
describe('Work Orders - Workday Report', () => {
    beforeEach(() => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    const workdayUrl = '/workOrders/workday';
    const dateSpanSelector = '#workdayDateStringSpan';
    it('Should page between days', () => {
        cy.visit(workdayUrl);
        cy.location('pathname').should('equal', workdayUrl);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
        cy.get(dateSpanSelector).invoke('text').as('initialDateString');
        cy.get('@initialDateString').then((initialDateString) => {
            cy.get('#button--workdayNextDay').click();
            cy.get(dateSpanSelector, {})
                .invoke('text')
                .should('not.equal', initialDateString);
            cy.get('#button--workdayPreviousDay').click();
            cy.get('#button--workdayPreviousDay', {}).click();
            cy.get(dateSpanSelector, {})
                .invoke('text')
                .should('not.equal', initialDateString);
        });
    });
});
