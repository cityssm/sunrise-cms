import { testView } from '../../../test/_globals.js'
import {
  checkDeadLinks,
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'

describe('Read Only User', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Has a Read Only User dashboard', () => {
    cy.visit('/dashboard')

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
    cy.visit('/cemeteries')
    cy.get("a[href*='/new']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to create or update a cemetery', () => {
    cy.visit('/cemeteries/new')
    cy.wait(200)
    cy.location('pathname').should('not.contain', 'new')

    cy.visit('/cemeteries/1/edit')
    cy.wait(200)
    cy.location('pathname').should('not.contain', 'edit')
  })

  // Burial Sites

  it('Has no link to create burial sites on Burial Site Search', () => {
    cy.visit('/burialSites')

    cy.get("a[href*='/new']").should('not.exist')
    cy.get("a[href*='/creator']").should('not.exist')
    cy.get("a[href*='/gpsCapture']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to create or update a burial site', () => {
    cy.visit('/burialSites/new')
    cy.wait(200)
    cy.location('pathname').should('not.contain', 'new')

    cy.visit('/burialSites/1/edit')
    cy.wait(200)
    cy.location('pathname').should('not.contain', 'edit')

    cy.visit('/burialSites/creator')
    cy.wait(200)
    cy.location('pathname').should('not.contain', 'creator')

    cy.visit('/burialSites/gpsCapture')
    cy.wait(200)
    cy.location('pathname').should('not.contain', 'gpsCapture')
  })

  // Contracts

  it('Has no link to create contracts on Contract Search', () => {
    cy.visit('/contracts')
    cy.get("a[href*='/new']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to create or update a contract', () => {
    cy.visit('/contracts/new')
    cy.wait(200)
    cy.location('pathname').should('not.contain', 'new')

    cy.visit('/contracts/1/edit')
    cy.wait(200)
    cy.location('pathname').should('not.contain', 'edit')
  })

  // Work Orders

  it('Has no link to create work orders on Work Order Search', () => {
    cy.visit('/workOrders')
    cy.get("a[href*='/new']").should('not.exist')
  })

  it('Redirects to Dashboard when attempting to create a work order', () => {
    cy.visit('/workOrders/new')
    cy.wait(200)
    cy.location('pathname').should('not.contain', 'new')

    cy.visit('/workOrders/1/edit')
    cy.wait(200)
    cy.location('pathname').should('not.contain', 'edit')
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
      cy.visit(adminPath)
      cy.wait(200)
      cy.location('pathname').should('not.contain', '/admin')
    }
  })

  it('Redirects to Dashboard when attempting to access the login page while authenticated', () => {
    cy.visit('/login')
    cy.wait(200)
    cy.location('pathname').should('not.contain', '/login')
  })
})
