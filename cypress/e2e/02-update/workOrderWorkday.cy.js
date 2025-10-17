import { testUpdate } from '../../../test/_globals.js';
import { ajaxDelayMillis, login, logout } from '../../support/index.js';
describe('Work Orders - Workday Report', () => {
    beforeEach(() => {
        logout();
        login(testUpdate);
    });
    afterEach(logout);
    const workdayUrl = '/workOrders/workday';
    const dateSpanSelector = '#workdayDateStringSpan';
    it('Has no detectable accessibility issues', () => {
        cy.visit(workdayUrl);
        cy.location('pathname').should('equal', workdayUrl);
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Should page between days', () => {
        cy.visit(workdayUrl);
        cy.location('pathname').should('equal', workdayUrl);
        // Get the initial date string
        cy.get(dateSpanSelector)
            .invoke('text')
            .as('initialDateString');
        // Click the next day button
        cy.get('#button--workdayNextDay').click();
        cy.wait(ajaxDelayMillis);
        // Verify the date has changed
        cy.get('@initialDateString').then((initialDateString) => {
            cy.get(dateSpanSelector)
                .invoke('text')
                .should('not.equal', initialDateString);
        });
        // Click the previous day button twice to go before the initial date
        cy.get('#button--workdayPreviousDay').click();
        cy.wait(ajaxDelayMillis);
        cy.get('#button--workdayPreviousDay').click();
        cy.wait(ajaxDelayMillis);
        // Verify we're on a different date than the initial
        cy.get('@initialDateString').then((initialDateString) => {
            cy.get(dateSpanSelector)
                .invoke('text')
                .should('not.equal', initialDateString);
        });
    });
});
