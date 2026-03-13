import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import { ajaxDelayMillis, pageLoadDelayMillis } from '../../support/timeouts.js'

describe('Reports', () => {
  beforeEach(() => {
    logout()
    login(testView)

    cy.visit('/reports')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.visit('/reports')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/reports'
    )

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })

  it('Exports all reports without parameters', () => {
    cy.get("a:not(.is-hidden)[download][href*='/reports/']").each(
      ($reportLink) => {
        cy.wrap($reportLink).click({ force: true })
        cy.wait(ajaxDelayMillis)
      }
    )
  })

  it('Exports all reports with parameters', () => {
    cy.get("form[action*='/reports/']").each(($reportLink) => {
      cy.wrap($reportLink).invoke('attr', 'target', '_blank').submit()
      cy.wait(ajaxDelayMillis)
    })
  })
})
