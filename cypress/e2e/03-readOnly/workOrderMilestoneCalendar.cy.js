import { testView } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
describe('Work Order Milestone Calendar', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    const milestoneCalendarUrl = '/workOrders/milestoneCalendar';
    const monthSelector = '#searchFilter--workOrderMilestoneMonth';
    const yearSelector = '#searchFilter--workOrderMilestoneYear';
    it('Has no detectable accessibility issues', () => {
        cy.visit(milestoneCalendarUrl);
        cy.location('pathname').should('equal', milestoneCalendarUrl);
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
    it('Should page to next month', () => {
        cy.visit(milestoneCalendarUrl);
        cy.location('pathname').should('equal', milestoneCalendarUrl);
        const state = { initialMonth: '', initialYear: '' };
        cy.get(`${monthSelector} option:selected`)
            .invoke('text')
            .then((text) => {
            state.initialMonth = text;
        });
        cy.get(`${yearSelector} option:selected`)
            .invoke('text')
            .then((text) => {
            state.initialYear = text;
        });
        cy.get('#button--nextMonth').click();
        cy.get(`${monthSelector} option:selected`, {})
            .invoke('text')
            .then((nextMonth) => {
            cy.get(`${yearSelector} option:selected`)
                .invoke('text')
                .should((nextYear) => {
                const initialValue = `${state.initialMonth} ${state.initialYear}`;
                const nextValue = `${nextMonth} ${nextYear}`;
                expect(nextValue).to.not.equal(initialValue);
            });
        });
    });
    it('Should page to previous month', () => {
        cy.visit(milestoneCalendarUrl);
        cy.location('pathname').should('equal', milestoneCalendarUrl);
        const state = { initialMonth: '', initialYear: '' };
        cy.get(`${monthSelector} option:selected`)
            .invoke('text')
            .then((text) => {
            state.initialMonth = text;
        });
        cy.get(`${yearSelector} option:selected`)
            .invoke('text')
            .then((text) => {
            state.initialYear = text;
        });
        cy.get('#button--previousMonth').click();
        cy.get(`${monthSelector} option:selected`, {})
            .invoke('text')
            .then((previousMonth) => {
            cy.get(`${yearSelector} option:selected`)
                .invoke('text')
                .should((previousYear) => {
                const initialValue = `${state.initialMonth} ${state.initialYear}`;
                const previousValue = `${previousMonth} ${previousYear}`;
                expect(previousValue).to.not.equal(initialValue);
            });
        });
    });
    it('Should navigate to workday view from calendar date link', () => {
        cy.visit(milestoneCalendarUrl);
        cy.location('pathname').should('equal', milestoneCalendarUrl);
        cy.get('#container--milestoneCalendar td[data-date-string] a', {})
            .first()
            .then(($link) => {
            const href = $link.attr('href');
            expect(href).to.include('/workOrders/workday');
            expect(href).to.include('workdayDateString=');
            const dateString = $link.closest('td').attr('data-date-string');
            cy.wrap($link).click();
            cy.location('pathname').should('include', '/workOrders/workday');
            cy.location('search').should('include', `workdayDateString=${dateString}`);
        });
    });
});
