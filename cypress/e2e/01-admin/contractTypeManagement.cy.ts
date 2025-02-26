import { testAdmin } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Admin - Contract Type Management', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testAdmin)
    cy.visit('/admin/contractTypes')
    cy.location('pathname').should('equal', '/admin/contractTypes')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })
})
