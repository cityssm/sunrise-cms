import { testView } from '../../../test/_globals.js'
import { checkDeadLinks, login, logout } from '../../support/index.js'

describe('Dashboard', () => {
  beforeEach(() => {
    logout()
    login(testView)
    cy.visit('/dashboard')
  })

  afterEach(logout)

  it('Has no dead links', () => {
    checkDeadLinks()
  })
})
