import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import {
  ajaxTimeoutMillis,
  minimumNavigationDelayMillis,
  pageLoadTimeoutMillis
} from '../../support/timeouts.js'

describe('Burial Site Search', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Can view a burial site from the search results', () => {
    cy.visit('/burialSites', { timeout: pageLoadTimeoutMillis }).wait(
      minimumNavigationDelayMillis
    )

    cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should(
      'equal',
      '/burialSites'
    )

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    cy.get('#container--searchResults a.has-text-weight-bold', {
      timeout: ajaxTimeoutMillis
    })
      .first()
      .then(($link) => {
        const href = $link.attr('href')
        expect(href).to.include('/burialSites/')

        cy.wrap($link).click()

        cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should(
          'include',
          '/burialSites/'
        )

        cy.log('Check accessibility on the burial site view page')

        cy.injectAxe()
        cy.checkA11y(undefined, undefined, logAccessibilityViolations)
        checkDeadLinks()
      })
  })
})

describe('Burial Site Map', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.visit('/burialSites/map', { timeout: pageLoadTimeoutMillis })
    cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should(
      'equal',
      '/burialSites/map'
    )

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })

  it('Pages through cemeteries on the map', () => {
    cy.visit('/burialSites/map', { timeout: pageLoadTimeoutMillis })
    cy.location('pathname', { timeout: pageLoadTimeoutMillis }).should(
      'equal',
      '/burialSites/map'
    )

    cy.get('#filter--cemeteryId', {
      timeout: ajaxTimeoutMillis
    }).should('exist')

    cy.get('#filter--cemeteryId option').its('length').should('be.gte', 1)

    cy.get('#filter--cemeteryId option').each(($option) => {
      cy.log(`Check cemetery filter option: ${$option.text()}`)

      cy.get('#filter--cemeteryId', {
        timeout: ajaxTimeoutMillis
      }).select($option.val() as string)
    })
  })
})
