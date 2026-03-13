import { testUpdate } from '../../../test/_globals.js'
import type { Contract } from '../../../types/record.types.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'
import { ajaxDelayMillis, pageLoadDelayMillis } from '../../support/timeouts.js'

describe('Contracts - Update', () => {
  beforeEach(() => {
    logout()
    login(testUpdate)
  })

  afterEach(logout)

  it('Has a "Create" link on the Contract Search', () => {
    cy.visit('/contracts')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should(
      'equal',
      '/contracts'
    )
    cy.get("a[href$='/contracts/new']").should('exist')
  })

  it('Creates a New Contract', () => {
    cy.visit('/contracts/new')

    cy.log('Check the accessibility')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    cy.log('Populate the fields')

    // Select the first available contract type
    cy.get("select[name='contractTypeId'] option")
      .eq(1)
      .invoke('val')
      .then((contractTypeId) => {
        cy.get("select[name='contractTypeId']").select(contractTypeId as string)
      })

    // Select the first available burial site
    cy.get("input[name='burialSiteId']").should('exist')

    cy.fixture('contract.json').then((contractData: Contract) => {
      // Fill in purchaser information
      cy.get("input[name='purchaserName']")
        .clear()
        .type(contractData.purchaserName)

      cy.get("input[name='purchaserAddress1']")
        .clear()
        .type(contractData.purchaserAddress1)

      cy.get("input[name='purchaserAddress2']")
        .clear()
        .type(contractData.purchaserAddress2)

      cy.get("input[name='purchaserCity']")
        .clear()
        .type(contractData.purchaserCity)

      cy.get("input[name='purchaserProvince']")
        .clear()
        .type(contractData.purchaserProvince)

      cy.get("input[name='purchaserPostalCode']")
        .clear()
        .type(contractData.purchaserPostalCode)

      cy.get("input[name='purchaserPhoneNumber']")
        .clear()
        .type(contractData.purchaserPhoneNumber)

      cy.get("input[name='purchaserEmail']")
        .clear()
        .type(contractData.purchaserEmail)

      cy.get("input[name='purchaserRelationship']")
        .clear()
        .type(contractData.purchaserRelationship)
    })

    cy.log('Submit the form')

    cy.get('#form--contract').submit()

    cy.wait(pageLoadDelayMillis)
      .location('pathname')
      .should('not.contain', '/new')
      .should('contain', '/edit')

    cy.fixture('contract.json').then((contractData: Contract) => {
      cy.get("input[name='purchaserName']").should(
        'have.value',
        contractData.purchaserName
      )

      cy.get("input[name='purchaserAddress1']").should(
        'have.value',
        contractData.purchaserAddress1
      )

      cy.get("input[name='purchaserAddress2']").should(
        'have.value',
        contractData.purchaserAddress2
      )

      cy.get("input[name='purchaserCity']").should(
        'have.value',
        contractData.purchaserCity
      )

      cy.get("input[name='purchaserProvince']").should(
        'have.value',
        contractData.purchaserProvince
      )

      cy.get("input[name='purchaserPostalCode']").should(
        'have.value',
        contractData.purchaserPostalCode
      )

      cy.get("input[name='purchaserPhoneNumber']").should(
        'have.value',
        contractData.purchaserPhoneNumber
      )

      cy.get("input[name='purchaserEmail']").should(
        'have.value',
        contractData.purchaserEmail
      )

      cy.get("input[name='purchaserRelationship']").should(
        'have.value',
        contractData.purchaserRelationship
      )
    })

    cy.log('Open the Audit Log modal and verify at least one entry')

    const moreOptionsSelector = '[data-cy="dropdown--moreOptions"]'

    cy.get(moreOptionsSelector).find('.dropdown-trigger button').click()

    cy.get(moreOptionsSelector).find('.is-view-audit-log-button').click()

    cy.wait(ajaxDelayMillis)

    cy.get('#modal--recordAuditLog').should('be.visible')

    cy.get('#container--recordAuditLog tbody tr').should(
      'have.length.at.least',
      1
    )

    cy.get('#modal--recordAuditLog .is-close-modal-button').first().click()
  })
})
