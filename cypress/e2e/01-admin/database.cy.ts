import { testAdmin } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  getDelayMillis,
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'

describe('Admin - Database Maintenance', () => {
  let ajaxDelayMillis: number

  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)
    ;({ ajaxDelayMillis } = getDelayMillis())

    cy.visit('/admin/database')
    cy.location('pathname').should('equal', '/admin/database')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })

  it('Backs up the database', () => {
    cy.get("button[data-cy='backup']").click()

    cy.get('.modal').should('be.visible').should('contain.text', 'Backup')

    cy.get(".modal button[data-cy='ok']").click()

    cy.wait(ajaxDelayMillis)

    cy.get('.modal')
      .should('contain.text', 'Backed Up')
      .should('contain.text', 'Success')

    cy.get(".modal button[data-cy='ok']").click()
  })

  it('Cleans up the database', () => {
    cy.get("button[data-cy='cleanup']").click()

    cy.get('.modal').should('be.visible').should('contain.text', 'Cleanup')

    cy.get(".modal button[data-cy='ok']").click()

    cy.wait(ajaxDelayMillis)

    cy.get('.modal')
      .should('contain.text', 'Cleaned Up')
      .should('contain.text', 'Success')

    cy.get(".modal button[data-cy='ok']").click()
  })
})
