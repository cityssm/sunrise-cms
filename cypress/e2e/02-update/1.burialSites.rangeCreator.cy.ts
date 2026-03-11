import { testUpdate } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  getDelayMillis,
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'

describe('Burial Sites - Range Creator', () => {
  let pageLoadDelayMillis: number

  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
    ;({ pageLoadDelayMillis } = getDelayMillis())

    cy.visit('/burialSites/creator')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/burialSites/creator'
    )
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })
})
