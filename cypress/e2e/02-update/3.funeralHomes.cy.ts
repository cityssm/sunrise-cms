import config from '../../../data/config.js'
import { testUpdate } from '../../../test/_globals.js'
import type { FuneralHome } from '../../../types/record.types.js'
import { login, logout, pageLoadDelayMillis } from '../../support/index.js'

describe('Update - Funeral Homes', () => {
  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
  })

  afterEach(logout)

  it('Has a "Create" link on the Funeral Home Search', () => {
    cy.visit('/funeralHomes')
    cy.location('pathname').should('equal', '/funeralHomes')
    cy.get("a[href$='/funeralHomes/new']").should('exist')
  })

  it('Creates a new funeral home', () => {
    cy.visit('/funeralHomes/new')

    cy.log('Check the accessibility')

    cy.injectAxe()
    cy.checkA11y()

    cy.log('Populate the fields')

    cy.fixture('funeralHome.json').then((funeralHomeData: FuneralHome) => {
      cy.get("input[name='funeralHomeName']")
        .clear()
        .type(funeralHomeData.funeralHomeName)

      cy.get("input[name='funeralHomeAddress1']")
        .clear()
        .type(funeralHomeData.funeralHomeAddress1)

      cy.get("input[name='funeralHomeAddress2']")
        .clear()
        .type(funeralHomeData.funeralHomeAddress2)

      cy.get("input[name='funeralHomePostalCode']")
        .clear()
        .type(funeralHomeData.funeralHomePostalCode)

      cy.get("input[name='funeralHomePhoneNumber']")
        .clear()
        .type(funeralHomeData.funeralHomePhoneNumber)
    })

    cy.log('Ensure the default city and province are used')

    cy.get("input[name='funeralHomeCity']").should(
      'have.value',
      config.settings.cityDefault ?? ''
    )

    cy.get("input[name='funeralHomeProvince']").should(
      'have.value',
      config.settings.provinceDefault ?? ''
    )

    cy.log('Submit the form')

    cy.get('#form--funeralHome').submit()

    cy.wait(pageLoadDelayMillis)
      .location('pathname')
      .should('not.contain', '/new')
      .should('contain', '/edit')

    cy.fixture('funeralHome.json').then((funeralHomeData: FuneralHome) => {
      cy.get("input[name='funeralHomeName']").should(
        'have.value',
        funeralHomeData.funeralHomeName
      )

      cy.get("input[name='funeralHomeAddress1']").should(
        'have.value',
        funeralHomeData.funeralHomeAddress1
      )

      cy.get("input[name='funeralHomeAddress2']").should(
        'have.value',
        funeralHomeData.funeralHomeAddress2
      )

      cy.get("input[name='funeralHomeCity']").should(
        'have.value',
        config.settings.cityDefault ?? ''
      )

      cy.get("input[name='funeralHomeProvince']").should(
        'have.value',
        config.settings.provinceDefault ?? ''
      )
      
      cy.get("input[name='funeralHomeProvince']").should(
        'have.value',
        config.settings.provinceDefault ?? ''
      )

      cy.get("input[name='funeralHomePostalCode']").should(
        'have.value',
        funeralHomeData.funeralHomePostalCode
      )

      cy.get("input[name='funeralHomePhoneNumber']").should(
        'have.value',
        funeralHomeData.funeralHomePhoneNumber
      )
    })
  })
})
