import { testUpdate } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Update - Burial Sites', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
  })

  afterEach(logout)

  it('Has a "Create" link on the Burial Site Search', () => {
    cy.visit('/burialSites')
    cy.location('pathname').should('equal', '/burialSites')

    cy.injectAxe()
    cy.checkA11y()

    cy.get("a[href$='/burialSites/new']").should('exist')
  })

  it('Creates a New Burial Site', () => {
    cy.visit('/burialSites/new')

    cy.log('Check the accessibility')
    
    cy.injectAxe()
    cy.checkA11y()
  })
})
