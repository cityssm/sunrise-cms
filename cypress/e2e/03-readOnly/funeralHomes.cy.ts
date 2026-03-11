import { testView } from '../../../test/_globals.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  getDelayMillis,
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'

describe('Funeral Home Search', () => {
  let ajaxDelayMillis: number
  let pageLoadDelayMillis: number

  beforeEach(() => {
    logout()
    login(testView)
    ;({ ajaxDelayMillis, pageLoadDelayMillis } = getDelayMillis())
  })

  afterEach(logout)

  it('Has no detectable accessibility issues on the search page', () => {
    cy.visit('/funeralHomes')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/funeralHomes'
    )
    cy.wait(ajaxDelayMillis)

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()
  })

  it('Can view a funeral home from the search results', () => {
    cy.visit('/funeralHomes')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/funeralHomes'
    )
    cy.wait(ajaxDelayMillis)

    cy.get('#container--searchResults a.has-text-weight-bold')
      .first()
      .then(($link) => {
        const href = $link.attr('href')
        expect(href).to.include('/funeralHomes/')

        cy.wrap($link).click()

        cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
          'include',
          '/funeralHomes/'
        )

        cy.log('Check accessibility on the funeral home view page')

        cy.injectAxe()
        cy.checkA11y(undefined, undefined, logAccessibilityViolations)
        checkDeadLinks()
      })
  })
})
