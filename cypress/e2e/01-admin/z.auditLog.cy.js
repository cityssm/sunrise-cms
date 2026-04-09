import { testAdmin } from '../../../test/_globals.js';
import { checkDeadLinks } from '../../support/deadLinks.js';
import { logAccessibilityViolations, login, logout } from '../../support/index.js';
import { minimumNavigationDelayMillis } from '../../support/timeouts.js';
describe('Admin - Audit Log Management', () => {
    beforeEach('Loads page', () => {
        logout();
        login(testAdmin);
        cy.visit('/admin/auditLog', {
            retryOnNetworkFailure: true
        }).wait(minimumNavigationDelayMillis);
        cy.location('pathname', {}).should('equal', '/admin/auditLog');
    });
    afterEach(logout);
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y(undefined, undefined, logAccessibilityViolations);
        checkDeadLinks();
    });
    it('Displays audit log entries', () => {
        cy.get('table, [role="table"], [data-testid="audit-log-table"]').within(() => {
            cy.get('tbody tr, [role="rowgroup"] [role="row"], [data-testid="audit-log-row"]')
                .filter(':visible')
                .its('length')
                .should('be.greaterThan', 0);
        });
    });
    it('Allows filtering or searching audit log entries when controls are available', () => {
        cy.get('body').then(($body) => {
            const filterSelector = 'input[type="search"], input[name*="filter"], input[name*="search"], [data-testid="audit-log-filter"]';
            if ($body.find(filterSelector).length > 0) {
                cy.get(filterSelector).first().as('auditFilter');
                cy.get('table, [role="table"], [data-testid="audit-log-table"]')
                    .find('tbody tr, [role="rowgroup"] [role="row"], [data-testid="audit-log-row"]')
                    .filter(':visible')
                    .its('length')
                    .as('initialCount');
                cy.get('@auditFilter').clear().type('login');
                cy.get('table, [role="table"], [data-testid="audit-log-table"]')
                    .find('tbody tr, [role="rowgroup"] [role="row"], [data-testid="audit-log-row"]')
                    .filter(':visible')
                    .its('length')
                    .then((filteredCount) => {
                    cy.get('@initialCount').then((initialCount) => {
                        if (initialCount > 0) {
                            expect(filteredCount).to.be.at.most(initialCount);
                        }
                    });
                });
            }
        });
    });
    it('Supports navigating between pages of audit log entries when pagination is available', () => {
        cy.get('body').then(($body) => {
            const nextSelector = 'button[aria-label*="Next"], a[aria-label*="Next"], [data-testid="audit-log-next-page"]';
            if ($body.find(nextSelector).length > 0) {
                cy.get('table, [role="table"], [data-testid="audit-log-table"]')
                    .find('tbody tr, [role="rowgroup"] [role="row"], [data-testid="audit-log-row"]')
                    .filter(':visible')
                    .first()
                    .invoke('text')
                    .as('firstPageFirstRow');
                cy.get(nextSelector).first().click();
                cy.get('table, [role="table"], [data-testid="audit-log-table"]')
                    .find('tbody tr, [role="rowgroup"] [role="row"], [data-testid="audit-log-row"]')
                    .filter(':visible')
                    .first()
                    .invoke('text')
                    .then((secondPageFirstRow) => {
                    cy.get('@firstPageFirstRow').then((firstPageFirstRow) => {
                        if (firstPageFirstRow.trim().length > 0 &&
                            secondPageFirstRow.trim().length > 0) {
                            expect(secondPageFirstRow.trim()).to.not.equal(firstPageFirstRow.trim());
                        }
                    });
                });
            }
        });
    });
});
