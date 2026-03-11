/* eslint-disable max-nested-callbacks */

import { testUpdate } from '../../../test/_globals.js'
import type { BurialSite } from '../../../types/record.types.js'
import { checkDeadLinks } from '../../support/deadLinks.js'
import {
  getDelayMillis,
  logAccessibilityViolations,
  login,
  logout
} from '../../support/index.js'

const burialSiteNameSegment3Length = 4

describe('Burial Sites - Update', () => {
  let ajaxDelayMillis: number
  let pageLoadDelayMillis: number

  beforeEach('Loads page', () => {
    logout()
    login(testUpdate)
    ;({ ajaxDelayMillis, pageLoadDelayMillis } = getDelayMillis())
  })

  afterEach(logout)

  it('Has a "Create" link on the Burial Site Search', () => {
    cy.visit('/burialSites')
    cy.location('pathname', { timeout: pageLoadDelayMillis }).should('equal', '/burialSites')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    cy.get("a[href$='/burialSites/new']").should('exist')
  })

  it('Creates a New Burial Site', () => {
    cy.visit('/burialSites/new', {
      retryOnStatusCodeFailure: true
    })

    cy.log('Check the accessibility')

    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logAccessibilityViolations)

    checkDeadLinks()

    cy.log('Populate the fields')

    cy.fixture('burialSite.json').then(
      (burialSiteData: Partial<BurialSite>) => {
        // Select the first available cemetery
        cy.get("select[name='cemeteryId'] option")
          .eq(1)
          .then(($option) => {
            cy.get("select[name='cemeteryId']").select($option.val() as string)
          })

        // Select the first available burial site type
        cy.get("select[name='burialSiteTypeId'] option")
          .eq(1)
          .then(($option) => {
            cy.get("select[name='burialSiteTypeId']").select(
              $option.val() as string
            )
          })

        // Fill in burial site name segments
        if (burialSiteData.burialSiteNameSegment1 !== undefined) {
          cy.get("input[name='burialSiteNameSegment1']")
            .clear()
            .type(burialSiteData.burialSiteNameSegment1)
        }

        if (burialSiteData.burialSiteNameSegment2 !== undefined) {
          cy.get("input[name='burialSiteNameSegment2']")
            .clear()
            .type(burialSiteData.burialSiteNameSegment2)
        }

        cy.get("input[name='burialSiteNameSegment3']")
          .clear()
          .type(
            Math.floor(Date.now() / 1000)
              .toString()
              .slice(-burialSiteNameSegment3Length)
          )

        // Fill in capacities
        if (
          burialSiteData.bodyCapacity !== null &&
          burialSiteData.bodyCapacity !== undefined
        ) {
          cy.get("input[name='bodyCapacity']")
            .clear()
            .type(burialSiteData.bodyCapacity.toString())
        }

        if (
          burialSiteData.crematedCapacity !== null &&
          burialSiteData.crematedCapacity !== undefined
        ) {
          cy.get("input[name='crematedCapacity']")
            .clear()
            .type(burialSiteData.crematedCapacity.toString())
        }

        if (
          burialSiteData.burialSiteLatitude !== null &&
          burialSiteData.burialSiteLatitude !== undefined
        ) {
          cy.get("input[name='burialSiteLatitude']")
            .clear()
            .type(burialSiteData.burialSiteLatitude.toString())
        }

        if (
          burialSiteData.burialSiteLongitude !== null &&
          burialSiteData.burialSiteLongitude !== undefined
        ) {
          cy.get("input[name='burialSiteLongitude']")
            .clear()
            .type(burialSiteData.burialSiteLongitude.toString())
        }
      }
    )

    cy.log('Submit the form')

    cy.get('#form--burialSite').submit()

    cy.wait(pageLoadDelayMillis)
      .location('pathname')
      .should('not.contain', '/new')
      .should('contain', '/edit')

    cy.fixture('burialSite.json').then(
      (burialSiteData: Partial<BurialSite>) => {
        // Verify the form values are persisted
        if (burialSiteData.burialSiteNameSegment1 !== undefined) {
          cy.get("input[name='burialSiteNameSegment1']").should(
            'have.value',
            burialSiteData.burialSiteNameSegment1
          )
        }

        if (burialSiteData.burialSiteNameSegment2 !== undefined) {
          cy.get("input[name='burialSiteNameSegment2']").should(
            'have.value',
            burialSiteData.burialSiteNameSegment2
          )
        }

        if (
          burialSiteData.bodyCapacity !== null &&
          burialSiteData.bodyCapacity !== undefined
        ) {
          cy.get("input[name='bodyCapacity']").should(
            'have.value',
            burialSiteData.bodyCapacity.toString()
          )
        }

        if (
          burialSiteData.crematedCapacity !== null &&
          burialSiteData.crematedCapacity !== undefined
        ) {
          cy.get("input[name='crematedCapacity']").should(
            'have.value',
            burialSiteData.crematedCapacity.toString()
          )
        }

        if (
          burialSiteData.burialSiteLatitude !== null &&
          burialSiteData.burialSiteLatitude !== undefined
        ) {
          cy.get("input[name='burialSiteLatitude']").should(
            'have.value',
            burialSiteData.burialSiteLatitude.toString()
          )
        }

        if (
          burialSiteData.burialSiteLongitude !== null &&
          burialSiteData.burialSiteLongitude !== undefined
        ) {
          cy.get("input[name='burialSiteLongitude']").should(
            'have.value',
            burialSiteData.burialSiteLongitude.toString()
          )
        }
      }
    )

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
