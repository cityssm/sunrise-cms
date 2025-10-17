import { testView } from '../../../test/_globals.js'
import { ajaxDelayMillis, login, logout } from '../../support/index.js'

describe('Work Order Milestone Calendar', () => {
  beforeEach(() => {
    logout()
    login(testView)
  })

  afterEach(logout)

  const milestoneCalendarUrl = '/workOrders/milestoneCalendar'
  const monthSelector = '#searchFilter--workOrderMilestoneMonth'
  const yearSelector = '#searchFilter--workOrderMilestoneYear'

  it('Has no detectable accessibility issues', () => {
    cy.visit(milestoneCalendarUrl)
    cy.location('pathname').should('equal', milestoneCalendarUrl)
    cy.wait(ajaxDelayMillis)
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Should page to next month', () => {
    cy.visit(milestoneCalendarUrl)
    cy.location('pathname').should('equal', milestoneCalendarUrl)
    cy.wait(ajaxDelayMillis)

    // Store the initial month and year
    const state = { initialMonth: '', initialYear: '' }

    cy.get(`${monthSelector} option:selected`)
      .invoke('text')
      .then((text) => {
        state.initialMonth = text
      })

    cy.get(`${yearSelector} option:selected`)
      .invoke('text')
      .then((text) => {
        state.initialYear = text
      })

    // Click the next month button
    cy.get('#button--nextMonth').click()
    cy.wait(ajaxDelayMillis)

    // Verify the month or year has changed
    cy.get(`${monthSelector} option:selected`)
      .invoke('text')
      .then((nextMonth) => {
        cy.get(`${yearSelector} option:selected`)
          .invoke('text')
          // eslint-disable-next-line max-nested-callbacks
          .should((nextYear) => {
            const initialValue = `${state.initialMonth} ${state.initialYear}`
            const nextValue = `${nextMonth} ${nextYear}`
            expect(nextValue).to.not.equal(initialValue)
          })
      })
  })

  it('Should page to previous month', () => {
    cy.visit(milestoneCalendarUrl)
    cy.location('pathname').should('equal', milestoneCalendarUrl)
    cy.wait(ajaxDelayMillis)

    // Store the initial month and year
    const state = { initialMonth: '', initialYear: '' }

    cy.get(`${monthSelector} option:selected`)
      .invoke('text')
      .then((text) => {
        state.initialMonth = text
      })

    cy.get(`${yearSelector} option:selected`)
      .invoke('text')
      .then((text) => {
        state.initialYear = text
      })

    // Click the previous month button
    cy.get('#button--previousMonth').click()
    cy.wait(ajaxDelayMillis)

    // Verify the month or year has changed
    cy.get(`${monthSelector} option:selected`)
      .invoke('text')
      .then((previousMonth) => {
        cy.get(`${yearSelector} option:selected`)
          .invoke('text')
          // eslint-disable-next-line max-nested-callbacks
          .should((previousYear) => {
            const initialValue = `${state.initialMonth} ${state.initialYear}`
            const previousValue = `${previousMonth} ${previousYear}`
            expect(previousValue).to.not.equal(initialValue)
          })
      })
  })

  it('Should navigate to workday view from calendar date link', () => {
    cy.visit(milestoneCalendarUrl)
    cy.location('pathname').should('equal', milestoneCalendarUrl)
    cy.wait(ajaxDelayMillis)

    // Find a calendar date link and click it
    cy.get('#container--milestoneCalendar td[data-date-string] a')
      .first()
      .then(($link) => {
        // Get the href to verify it contains the workday path
        const href = $link.attr('href')
        expect(href).to.include('/workOrders/workday')
        expect(href).to.include('workdayDateString=')

        // Extract the date string from the link's parent td element
        const dateString = $link.closest('td').attr('data-date-string')

        // Click the link
        $link[0].click()

        // Verify we navigated to the workday page
        cy.location('pathname').should('equal', '/workOrders/workday')
        cy.location('search').should('include', `workdayDateString=${dateString}`)
      })
  })
})
