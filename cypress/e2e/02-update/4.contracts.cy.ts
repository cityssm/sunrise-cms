import { testUpdate } from '../../../test/_globals.js'
import { login, logout } from '../../support/index.js'

describe('Contracts - Update', () => {
  beforeEach(() => {
    logout()
    login(testUpdate)
  })

  afterEach(logout)

  it('Has a "Create" link on the Contract Search', () => {
    cy.visit('/contracts')
    cy.location('pathname').should('equal', '/contracts')
    cy.get("a[href$='/contracts/new']").should('exist')
  })

  describe('Creates a New Contract', () => {
    it('Has no detectable accessibility issues', () => {
      cy.visit('/contracts/new')
      cy.injectAxe()
      cy.checkA11y()
    })
  })
})
