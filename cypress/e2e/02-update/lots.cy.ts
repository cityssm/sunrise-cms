import { testUpdate } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Update - Lots', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
  })

  afterEach(logout)

  it('Has a "Create" link on the Lot Search', () => {
    cy.visit('/lots')
    cy.location('pathname').should('equal', '/lots')
    cy.get("a[href$='/burialSites/new']").should('exist')
  })

  describe('Update a New Lot', () => {
    it('Has no detectable accessibility issues', () => {
      cy.visit('/burialSites/new')
      cy.injectAxe()
      cy.checkA11y()
    })
  })
})
