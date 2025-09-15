import { testUpdate } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Burial Sites - Range Creator', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
    cy.visit('/burialSites/creator')
    cy.location('pathname').should('equal', '/burialSites/creator')
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y()
  })
})
