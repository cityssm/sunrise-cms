import { testView } from '../../../test/_globals.js'
import { checkA11yLog, login, logout } from '../../support/index.js'

describe('User Settings', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.visit('/dashboard/userSettings')
    cy.location('pathname').should('equal', '/dashboard/userSettings')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, checkA11yLog)
  })
})
