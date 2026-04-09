import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import {
  minimumNavigationDelayMillis,
  pageLoadTimeoutMillis
} from '../../support/timeouts.js'

describe('Read Only User', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Has a Read Only User dashboard', () => {
    cy.visit('/dashboard', { timeout: pageLoadTimeoutMillis })

    cy.log('Has no detectable accessibility issues')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    cy.log('Has no links to new areas')

    cy.get("a[href*='/new']").should('not.exist')

    cy.log('Has no links to admin areas')

    cy.get("a[href*='/admin']").should('not.exist')
  })

  // Cemeteries

  it('Has no link to create cemeteries on Cemetery Search', () => {
    cy.visit('/cemeteries', { timeout: pageLoadTimeoutMillis })

    cy.get("a[href*='/new']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to create or update a cemetery', () => {
    cy.visit('/cemeteries/new', { timeout: pageLoadTimeoutMillis }).wait(
      minimumNavigationDelayMillis
    )

    cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should(
      'not.contain',
      'new'
    )

    cy.visit('/cemeteries/1/edit', { timeout: pageLoadTimeoutMillis }).wait(
      minimumNavigationDelayMillis
    )

    cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should(
      'not.contain',
      'edit'
    )
  })

  // Burial Sites

  it('Has no link to create burial sites on Burial Site Search', () => {
    cy.visit('/burialSites', { timeout: pageLoadTimeoutMillis })

    cy.get("a[href*='/new']").should('not.exist')
    cy.get("a[href*='/creator']").should('not.exist')
    cy.get("a[href*='/gpsCapture']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to create or update a burial site', () => {
    cy.visit('/burialSites/new', { timeout: pageLoadTimeoutMillis })

    cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
      'not.contain',
      'new'
    )

    cy.visit('/burialSites/1/edit', { timeout: pageLoadTimeoutMillis })
    cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
      'not.contain',
      'edit'
    )

    cy.visit('/burialSites/creator', { timeout: pageLoadTimeoutMillis })
    cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
      'not.contain',
      'creator'
    )

    cy.visit('/burialSites/gpsCapture', { timeout: pageLoadTimeoutMillis })
    cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
      'not.contain',
      'gpsCapture'
    )
  })

  // Contracts

  it('Has no link to create contracts on Contract Search', () => {
    cy.visit('/contracts', { timeout: pageLoadTimeoutMillis })
    cy.get("a[href*='/new']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to create or update a contract', () => {
    cy.visit('/contracts/new', { timeout: pageLoadTimeoutMillis })
    cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
      'not.contain',
      'new'
    )

    cy.visit('/contracts/1/edit', { timeout: pageLoadTimeoutMillis })
    cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
      'not.contain',
      'edit'
    )
  })

  // Work Orders

  it('Has no link to create work orders on Work Order Search', () => {
    cy.visit('/workOrders', { timeout: pageLoadTimeoutMillis })
    cy.get("a[href*='/new']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to create a work order', () => {
    cy.visit('/workOrders/new', { timeout: pageLoadTimeoutMillis })
    cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
      'not.contain',
      'new'
    )

    cy.visit('/workOrders/1/edit', { timeout: pageLoadTimeoutMillis })
    cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
      'not.contain',
      'edit'
    )
  })

  it('Redirects to Dashboard when attempting to access admin sections', () => {
    const adminPaths = [
      '/admin/fees',
      '/admin/contractTypes',
      '/admin/burialSiteTypes',
      '/admin/tables',
      '/admin/users',
      '/admin/settings',
      '/admin/database',
      '/admin/auditLog'
    ]

    for (const adminPath of adminPaths) {
      cy.visit(adminPath, {
        retryOnNetworkFailure: true,
        timeout: pageLoadTimeoutMillis
      }).wait(minimumNavigationDelayMillis)

      cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
        'not.contain',
        '/admin'
      )
    }
  })

  it('Redirects to Dashboard when attempting to access the login page while authenticated', () => {
    cy.visit('/login', { timeout: pageLoadTimeoutMillis })
    cy.location('pathname', { timeout: minimumNavigationDelayMillis }).should(
      'not.contain',
      '/login'
    )
  })
})
