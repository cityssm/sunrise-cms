import { testView } from '../../../test/_globals.js'
import { ajaxDelayMillis, checkA11yLog, login, logout } from '../../support/index.js'

describe('Reports', () => {
  beforeEach(() => {
    logout()
    login(testView)
    cy.visit('/reports')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.visit('/reports')
    cy.location('pathname').should('equal', '/reports')
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, checkA11yLog)
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
