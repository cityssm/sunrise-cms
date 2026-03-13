import { testUpdate } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import { pageLoadDelayMillis } from '../../support/timeouts.js'

describe('Burial Sites - GPS Capture', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)

    cy.visit('/burialSites/gpsCapture')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/burialSites/gpsCapture'
    )
  })

  afterEach(logout)

  it('Has no detectable accessibility issues', () => {
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })
})
