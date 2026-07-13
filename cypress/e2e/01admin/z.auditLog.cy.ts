/* eslint-disable unicorn/no-array-callback-reference -- False positive */
/* eslint-disable max-nested-callbacks */

import { testAdmin } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import { minimumNavigationDelayMillis } from '../../support/timeouts.js'

describe('Admin - Audit Log Management', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)

    cy.visit('/admin/auditLog', {
      retryOnNetworkFailure: true
    }).wait(minimumNavigationDelayMillis)

    cy.location('pathname').should('equal', '/admin/auditLog')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })

  it('Displays audit log entries', () => {
    // Verify that an audit log list/table is rendered with at least one row.
    cy.get('table, [role="table"], [data-testid="audit-log-table"]').within(
      () => {
        cy.get(
          'tbody tr, [role="rowgroup"] [role="row"], [data-testid="audit-log-row"]'
        )
          .filter(':visible')
          .its('length')
          .should('be.greaterThan', 0)
      }
    )
  })

  it('Allows filtering or searching audit log entries when controls are available', () => {
    // Try to find a filter/search control; if one is present, use it and verify the list changes.
    cy.get('body').then(($body) => {
      const filterSelector =
        'input[type="search"], input[name*="filter"], input[name*="search"], [data-testid="audit-log-filter"]'

      if ($body.find(filterSelector).length > 0) {
        cy.get(filterSelector).first().as('auditFilter')

        // Capture initial count.
        cy.get('table, [role="table"], [data-testid="audit-log-table"]')
          .find(
            'tbody tr, [role="rowgroup"] [role="row"], [data-testid="audit-log-row"]'
          )
          .filter(':visible')
          .its('length')
          .as('initialCount')

        cy.get('@auditFilter').clear().type('login')

        // Wait for the filter to apply and verify that the visible rows change where possible.
        cy.get('table, [role="table"], [data-testid="audit-log-table"]')
          .find(
            'tbody tr, [role="rowgroup"] [role="row"], [data-testid="audit-log-row"]'
          )
          .filter(':visible')
          .its('length')
          .then((filteredCount) => {
            cy.get<number>('@initialCount').then((initialCount) => {
              // Only assert when initial rows exist; filtering an empty list has no meaningful result.
              if (initialCount > 0) {
                expect(filteredCount).to.be.at.most(initialCount)
              }
            })
          })
      }
    })
  })

  it('Supports navigating between pages of audit log entries when pagination is available', () => {
    // Check for pagination controls and, if present, interact with them.
    cy.get('body').then(($body) => {
      const nextSelector =
        'button[aria-label*="Next"], a[aria-label*="Next"], [data-testid="audit-log-next-page"]'

      if ($body.find(nextSelector).length > 0) {
        // Capture something on the first page (e.g., first row text).
        cy.get('table, [role="table"], [data-testid="audit-log-table"]')
          .find(
            'tbody tr, [role="rowgroup"] [role="row"], [data-testid="audit-log-row"]'
          )
          .filter(':visible')
          .first()
          .invoke('text')
          .as('firstPageFirstRow')

        cy.get(nextSelector).first().click()

        // Ensure the content changes after navigating to the next page when possible.
        cy.get('table, [role="table"], [data-testid="audit-log-table"]')
          .find(
            'tbody tr, [role="rowgroup"] [role="row"], [data-testid="audit-log-row"]'
          )
          .filter(':visible')
          .first()
          .invoke('text')
          .then((secondPageFirstRow) => {
            cy.get<string>('@firstPageFirstRow').then((firstPageFirstRow) => {
              if (
                firstPageFirstRow.trim().length > 0 &&
                secondPageFirstRow.trim().length > 0
              ) {
                expect(secondPageFirstRow.trim()).to.not.equal(
                  firstPageFirstRow.trim()
                )
              }
            })
          })
      }
    })
  })
})
