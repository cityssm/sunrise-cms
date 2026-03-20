import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import { login, logout } from '../../support/index.js'
import { pageLoadTimeoutMillis } from '../../support/timeouts.js'

describe('Dashboard', () => {
  beforeEach(() => {
    logout()
    login(testView)
    cy.visit('/dashboard', { timeout: pageLoadTimeoutMillis })
  })

  afterEach(logout)

  it('Has no dead links', () => {
    checkDeadLinks()
  })
})
