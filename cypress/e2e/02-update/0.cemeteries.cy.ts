import config from '../../../data/config.js'
import { testUpdate } from '../../../test/_globals.js'
import type { Cemetery } from '../../../types/record.types.js'
import { login, logout, pageLoadDelayMillis } from '../../support/index.js'

describe('Cemeteries - Update', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
  })

  afterEach(logout)

  it('Has a "Create" link on the Cemetery Search', () => {
    cy.visit('/cemeteries')
    cy.location('pathname').should('equal', '/cemeteries')
    cy.get("a[href$='/cemeteries/new']").should('exist')
  })

  it('Creates a new cemetery', () => {
    cy.visit('/cemeteries/new', {
      retryOnStatusCodeFailure: true
    })

    cy.log('Check the accessibility')

    cy.injectAxe()
    cy.checkA11y()

    cy.log('Populate the fields')

    cy.fixture('cemetery.json').then((cemeteryData: Cemetery) => {
      cy.get("input[name='cemeteryName']")
        .clear()
        .type(cemeteryData.cemeteryName)

      cy.get("textarea[name='cemeteryDescription']")
        .clear()
        .type(cemeteryData.cemeteryDescription)

      cy.get("input[name='cemeteryAddress1']")
        .clear()
        .type(cemeteryData.cemeteryAddress1)

      cy.get("input[name='cemeteryAddress2']")
        .clear()
        .type(cemeteryData.cemeteryAddress2)

      cy.get("input[name='cemeteryPostalCode']")
        .clear()
        .type(cemeteryData.cemeteryPostalCode)

      cy.get("input[name='cemeteryPhoneNumber']")
        .clear()
        .type(cemeteryData.cemeteryPhoneNumber)

      cy.get("input[name='cemeteryLatitude']")
        .clear()
        .type(cemeteryData.cemeteryLatitude?.toString() ?? '')

      cy.get("input[name='cemeteryLongitude']")
        .clear()
        .type(cemeteryData.cemeteryLongitude?.toString() ?? '')
    })

    cy.log('Ensure the default city and province are used')

    cy.get("input[name='cemeteryCity']").should(
      'have.value',
      config.settings.cityDefault ?? ''
    )

    cy.get("input[name='cemeteryProvince']").should(
      'have.value',
      config.settings.provinceDefault ?? ''
    )

    cy.log('Submit the form')

    cy.get('#form--cemetery').submit()

    cy.wait(pageLoadDelayMillis)
      .location('pathname')
      .should('not.contain', '/new')
      .should('contain', '/edit')

    cy.fixture('cemetery.json').then((cemeteryData: Cemetery) => {
      cy.get("input[name='cemeteryName']").should(
        'have.value',
        cemeteryData.cemeteryName
      )

      cy.get("textarea[name='cemeteryDescription']").should(
        'have.value',
        cemeteryData.cemeteryDescription
      )

      cy.get("input[name='cemeteryAddress1']").should(
        'have.value',
        cemeteryData.cemeteryAddress1
      )

      cy.get("input[name='cemeteryAddress2']").should(
        'have.value',
        cemeteryData.cemeteryAddress2
      )

      cy.get("input[name='cemeteryCity']").should(
        'have.value',
        config.settings.cityDefault ?? ''
      )

      cy.get("input[name='cemeteryProvince']").should(
        'have.value',
        config.settings.provinceDefault ?? ''
      )

      cy.get("input[name='cemeteryPostalCode']").should(
        'have.value',
        cemeteryData.cemeteryPostalCode
      )

      cy.get("input[name='cemeteryPhoneNumber']").should(
        'have.value',
        cemeteryData.cemeteryPhoneNumber
      )

      cy.get("input[name='cemeteryLatitude']").should(
        'have.value',
        cemeteryData.cemeteryLatitude?.toString()
      )

      cy.get("input[name='cemeteryLongitude']").should(
        'have.value',
        cemeteryData.cemeteryLongitude?.toString()
      )
    })

    cy.log('Test More Options Dropdown')

    const moreOptionsSelector = '[data-cy="dropdown--moreOptions"]'

    cy.get(moreOptionsSelector).should('not.have.class', 'is-active')

    cy.get(moreOptionsSelector).find('.dropdown-trigger button').click()

    cy.get(moreOptionsSelector).should('have.class', 'is-active')

    cy.get(moreOptionsSelector).find('.dropdown-trigger button').click()

    cy.get(moreOptionsSelector).should('not.have.class', 'is-active')

  })
})
