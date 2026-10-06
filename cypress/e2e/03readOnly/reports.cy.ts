import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'

describe('Reports', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.visit('/reports')

    cy.location('pathname').should('equal', '/reports')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })

  // eslint-disable-next-line sonarjs/assertions-in-tests
  it('Exports all reports without parameters', () => {
    cy.visit('/reports')

    cy.get("a:not(.is-hidden)[download][href*='/reports/']").each(
      ($reportLink) => {
        cy.wrap($reportLink).click({
          // eslint-disable-next-line sonarjs/no-forced-browser-interaction
          force: true
        })
      }
    )
  })

  // eslint-disable-next-line sonarjs/assertions-in-tests
  it('Exports all reports with parameters', () => {
    cy.visit('/reports', {
      retryOnNetworkFailure: true
    })

    cy.get("form[action*='/reports/']").each(($reportLink) => {
      cy.wrap($reportLink).invoke('attr', 'target', '_blank').submit({})
    })
  })
})
