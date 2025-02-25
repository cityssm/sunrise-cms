// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'
import type { WorkOrderMilestone } from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

  const workOrderSearchFiltersFormElement = document.querySelector(
    '#form--searchFilters'
  ) as HTMLFormElement

  const workOrderMilestoneDateFilterElement =
    workOrderSearchFiltersFormElement.querySelector(
      '#searchFilter--workOrderMilestoneDateFilter'
    ) as HTMLSelectElement

  const workOrderMilestoneDateStringElement =
    workOrderSearchFiltersFormElement.querySelector(
      '#searchFilter--workOrderMilestoneDateString'
    ) as HTMLInputElement

  const milestoneCalendarContainerElement = document.querySelector(
    '#container--milestoneCalendar'
  ) as HTMLElement

  function renderMilestones(workOrderMilestones: WorkOrderMilestone[]): void {
    if (workOrderMilestones.length === 0) {
      milestoneCalendarContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no milestones that meet the search criteria.</p>
        </div>`
      return
    }

    milestoneCalendarContainerElement.innerHTML = ''

    const currentDate = cityssm.dateToString(new Date())

    let currentPanelElement: HTMLElement | undefined
    let currentPanelDateString = 'x'

    for (const milestone of workOrderMilestones) {
      if (currentPanelDateString !== milestone.workOrderMilestoneDateString) {
        if (currentPanelElement) {
          milestoneCalendarContainerElement.append(currentPanelElement)
        }

        currentPanelElement = document.createElement('div')
        currentPanelElement.className = 'panel'

        currentPanelElement.innerHTML = `<h2 class="panel-heading">
          ${cityssm.escapeHTML(
            milestone.workOrderMilestoneDate === 0
              ? 'No Set Date'
              : milestone.workOrderMilestoneDateString ?? ''
          )}
          </h2>`

        currentPanelDateString = milestone.workOrderMilestoneDateString ?? ''
      }

      const panelBlockElement = document.createElement('div')

      panelBlockElement.className = 'panel-block is-block'

      if (
        !milestone.workOrderMilestoneCompletionDate &&
        milestone.workOrderMilestoneDateString !== '' &&
        milestone.workOrderMilestoneDateString! < currentDate
      ) {
        panelBlockElement.classList.add('has-background-warning-light')
      }

      let burialSiteContractHTML = ''

      for (const lot of milestone.workOrderLots ?? []) {
        burialSiteContractHTML += `<li class="has-tooltip-left"
          data-tooltip="${cityssm.escapeHTML(lot.cemeteryName ?? '')}">
          <span class="fa-li">
          <i class="fas fa-vector-square"
            aria-label="${los.escapedAliases.Lot}"></i>
          </span>
          ${cityssm.escapeHTML(lot.lotName ?? '')}
          </li>`
      }

      for (const burialSiteContract of milestone.workOrderLotOccupancies ?? []) {
        for (const occupant of burialSiteContract.burialSiteContractOccupants ?? []) {
          burialSiteContractHTML += `<li class="has-tooltip-left"
            data-tooltip="${cityssm.escapeHTML(
              occupant.lotOccupantType ?? ''
            )}">
            <span class="fa-li">
            <i class="fas fa-user"
              aria-label="${los.escapedAliases.Occupancy}"></i>
            </span>
            ${cityssm.escapeHTML(occupant.occupantName ?? '')}
            ${cityssm.escapeHTML(occupant.occupantFamilyName ?? '')}
            </li>`
        }
      }

      // eslint-disable-next-line no-unsanitized/property
      panelBlockElement.innerHTML = `<div class="columns">
        <div class="column is-narrow">
          <span class="icon is-small">
            ${
              milestone.workOrderMilestoneCompletionDate
                ? '<i class="fas fa-check" aria-label="Completed"></i>'
                : '<i class="far fa-square has-text-grey" aria-label="Incomplete"></i>'
            }
          </span>
        </div><div class="column">
          ${
            milestone.workOrderMilestoneTime === 0
              ? ''
              : `${milestone.workOrderMilestoneTimePeriodString}<br />`
          }
          ${
            milestone.workOrderMilestoneTypeId
              ? `<strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong><br />`
              : ''
          }
          <span class="is-size-7">
            ${cityssm.escapeHTML(milestone.workOrderMilestoneDescription ?? '')}
          </span>
        </div><div class="column">
          <i class="fas fa-circle" style="color:${los.getRandomColor(milestone.workOrderNumber ?? '')}" aria-hidden="true"></i>
          <a class="has-text-weight-bold" href="${los.getWorkOrderURL(milestone.workOrderId)}">
            ${cityssm.escapeHTML(milestone.workOrderNumber ?? '')}
          </a><br />
          <span class="is-size-7">${cityssm.escapeHTML(milestone.workOrderDescription ?? '')}</span>
        </div><div class="column is-size-7">
          ${
            burialSiteContractHTML === ''
              ? ''
              : `<ul class="fa-ul ml-4">${burialSiteContractHTML}</ul>`
          }</div></div>`
      ;(currentPanelElement as HTMLElement).append(panelBlockElement)
    }

    milestoneCalendarContainerElement.append(currentPanelElement as HTMLElement)
  }

  function getMilestones(event?: Event): void {
    if (event) {
      event.preventDefault()
    }

    // eslint-disable-next-line no-unsanitized/property
    milestoneCalendarContainerElement.innerHTML = los.getLoadingParagraphHTML(
      'Loading Milestones...'
    )

    cityssm.postJSON(
      `${los.urlPrefix}/workOrders/doGetWorkOrderMilestones`,
      workOrderSearchFiltersFormElement,
      (responseJSON) => {
        renderMilestones(
          (
            responseJSON as {
              workOrderMilestones: WorkOrderMilestone[]
            }
          ).workOrderMilestones
        )
      }
    )
  }

  workOrderMilestoneDateFilterElement.addEventListener('change', () => {
    ;(
      workOrderMilestoneDateStringElement.closest(
        'fieldset'
      ) as HTMLFieldSetElement
    ).disabled = workOrderMilestoneDateFilterElement.value !== 'date'
    getMilestones()
  })

  los.initializeDatePickers(workOrderSearchFiltersFormElement)

  workOrderMilestoneDateStringElement.addEventListener('change', getMilestones)
  workOrderSearchFiltersFormElement.addEventListener('submit', getMilestones)

  getMilestones()
})()
