import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  BurialSite,
  Contract,
  WorkOrder
} from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise

  workdayDateString: string
}
;(() => {
  const sunrise = exports.sunrise

  const canUpdateWorkOrders =
    document.querySelector('main')?.dataset.canUpdateWorkOrders === 'true'

  const workdayDate = cityssm.dateStringToDate(exports.workdayDateString)

  const workdayContainer = document.querySelector(
    '#container--workday'
  ) as HTMLElement

  function toggleWorkOrderMilestoneCompletion(clickEvent: Event): void {}

  function buildBurialSiteHTML(burialSite: BurialSite | Contract): string {
    return `<li>
      <span class="fa-li"><i class="fa-solid fa-map-pin"></i></span>
      <a href="${sunrise.urlPrefix}/burialSites/${burialSite.burialSiteId}" target="_blank">
        ${cityssm.escapeHTML(burialSite.burialSiteName ?? '')}
      </a><br />
      <span class="is-size-7">${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}</span>
      </li>`
  }

  // eslint-disable-next-line complexity
  function renderWorkOrders(
    workdayDateString: string,
    workOrders: WorkOrder[]
  ): void {
    workdayContainer.innerHTML = ''

    for (const workOrder of workOrders) {
      const workOrderElement = document.createElement('div')
      workOrderElement.className = 'panel'

      // eslint-disable-next-line no-unsanitized/property
      workOrderElement.innerHTML = `<div class="panel-heading p-3">
        <h2>
          <a class="has-text-white" href="${sunrise.urlPrefix}/workOrders/${workOrder.workOrderId}" target="_blank">
          #${cityssm.escapeHTML(workOrder.workOrderNumber ?? '')}
          </a>
          ${
            workOrder.workOrderCloseDate === null
              ? ''
              : '<span class="tag">Closed</span>'
          }
        </h2>
        </div>
        <div class="panel-block is-block">
          <p>${cityssm.escapeHTML(workOrder.workOrderDescription ?? '')}</p>
          <div class="columns">
            <div class="column">
              <ul class="fa-ul list--contacts"></ul>
            </div>
            <div class="column column--burialSites">
              <ul class="fa-ul list--burialSites"></ul>
            </div>
          </div>
        </div>`

      /*
       * Contracts
       */

      const usedFuneralHomeIds = new Set<number>()
      const usedBurialSiteIds = new Set<number>()

      const contactContainerElement = workOrderElement.querySelector(
        '.list--contacts'
      ) as HTMLElement

      const burialSitesContainerElement = workOrderElement.querySelector(
        '.list--burialSites'
      ) as HTMLElement

      for (const contract of workOrder.workOrderContracts ?? []) {
        if (
          contract.funeralHomeId !== null &&
          !usedFuneralHomeIds.has(contract.funeralHomeId)
        ) {
          usedFuneralHomeIds.add(contract.funeralHomeId)

          // eslint-disable-next-line no-unsanitized/method
          workOrderElement.insertAdjacentHTML(
            'beforeend',
            `<div class="panel-block is-block">
              <div class="columns is-mobile">
                <div class="column is-narrow">
                  <span class="icon"><i class="fa-solid fa-place-of-worship"></i></span>
                </div>
                <div class="column">
                  <div class="columns is-mobile mb-0">
                    <div class="column">
                      <a href="${sunrise.urlPrefix}/funeralHomes/${cityssm.escapeHTML(contract.funeralHomeId.toString())}" target="_blank">
                        ${cityssm.escapeHTML(contract.funeralHomeName ?? '')}
                      </a>
                    </div>
                    <div class="column is-narrow">
                      ${cityssm.escapeHTML(contract.funeralDateString ?? '')}
                      ${cityssm.escapeHTML(contract.funeralTimePeriodString ?? '')}
                    </div>
                  </div>
                  <p>
                    <strong>Direction of Arrival:</strong> ${cityssm.escapeHTML(contract.directionOfArrival ?? '')}<br />
                    <strong>Committal Type:</strong> ${cityssm.escapeHTML(contract.committalType ?? '')}
                  </p>
                </div>
              </div>`
          )
        }

        for (const interment of contract.contractInterments ?? []) {
          // eslint-disable-next-line no-unsanitized/method
          contactContainerElement.insertAdjacentHTML(
            'beforeend',
            `<li>
              <span class="fa-li"><i class="fa-solid fa-user"></i></span>
              ${cityssm.escapeHTML(interment.deceasedName ?? '')}<br />
              <a class="is-size-7" href="${sunrise.urlPrefix}/contracts/${cityssm.escapeHTML(contract.contractId.toString())}" target="_blank">
              Contract #${cityssm.escapeHTML(contract.contractId.toString())}
              </a>
              </li>`
          )
        }

        if (
          contract.burialSiteId !== undefined &&
          contract.burialSiteId !== null &&
          !usedBurialSiteIds.has(contract.burialSiteId)
        ) {
          usedBurialSiteIds.add(contract.burialSiteId)

          // eslint-disable-next-line no-unsanitized/method
          burialSitesContainerElement.insertAdjacentHTML(
            'beforeend',
            buildBurialSiteHTML(contract)
          )
        }
      }

      for (const burialSite of workOrder.workOrderBurialSites ?? []) {
        if (usedBurialSiteIds.has(burialSite.burialSiteId)) {
          continue
        }

        // eslint-disable-next-line no-unsanitized/method
        burialSitesContainerElement.insertAdjacentHTML(
          'beforeend',
          buildBurialSiteHTML(burialSite)
        )
      }

      /*
       * Milestones
       */

      let includesMilestones = false

      const canUpdateThisWorkOrder =
        canUpdateWorkOrders && workOrder.workOrderCloseDate === null

      for (const milestone of workOrder.workOrderMilestones ?? []) {
        if (milestone.workOrderMilestoneDateString !== workdayDateString) {
          continue
        }

        includesMilestones = true

        const milestoneElement = document.createElement('div')
        milestoneElement.className = 'panel-block is-block'

        const milestoneCheckIcon =
          milestone.workOrderMilestoneCompletionDate === null
            ? 'fa-regular fa-square'
            : 'fa-solid fa-check'

        const milestoneCheckHTML = canUpdateThisWorkOrder
          ? `<button class="button has-tooltip-right"
              data-work-order-milestone-id="${milestone.workOrderMilestoneId}
              data-tooltip="Toggle Milestone Completion"
              type="button">
                <span class="icon is-small">
                  <i class="${milestoneCheckIcon}"></i>
                </span>
              </button>`
          : `<span class="icon is-small">
              <i class="${milestoneCheckIcon}"></i>
            </span>`

        // eslint-disable-next-line no-unsanitized/property
        milestoneElement.innerHTML = `<div class="columns is-mobile">
            <div class="column is-narrow">
              ${milestoneCheckHTML}
            </div>
            <div class="column">
              <div class="columns is-mobile mb-0">
                <div class="column">
                  <strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong>
                </div>
                <div class="column is-narrow">
                  ${milestone.workOrderMilestoneTime === 0 ? 'No Set Time' : milestone.workOrderMilestoneTimePeriodString}
                </div>
              </div>
              <p>${cityssm.escapeHTML(milestone.workOrderMilestoneDescription ?? '')}</p>
            </div>
          </div>`

        workOrderElement.append(milestoneElement)
      }

      if (!includesMilestones) {
        workOrderElement.insertAdjacentHTML(
          'beforeend',
          `<div class="panel-block is-block">
              <p class="has-text-grey">No individual milestones for this work order.</p>
            </div>`
        )
      }

      workdayContainer.append(workOrderElement)
    }
  }

  function getWorkdayReport(): void {
    // eslint-disable-next-line no-unsanitized/property
    workdayContainer.innerHTML = sunrise.getLoadingParagraphHTML(
      'Loading workday report...'
    )

    const workdayDateString = cityssm.dateToString(workdayDate)

    cityssm.postJSON(
      `${sunrise.urlPrefix}/workOrders/doGetWorkdayReport`,
      {
        workdayDateString
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { workOrders: WorkOrder[] }
        renderWorkOrders(workdayDateString, responseJSON.workOrders)
      }
    )
  }

  document
    .querySelector('#button--workdayPreviousDay')
    ?.addEventListener('click', () => {
      workdayDate.setDate(workdayDate.getDate() - 1)
      ;(
        document.querySelector('#workdayDateStringSpan') as HTMLSpanElement
      ).textContent = cityssm.dateToString(workdayDate)

      getWorkdayReport()
    })

  document
    .querySelector('#button--workdayNextDay')
    ?.addEventListener('click', () => {
      workdayDate.setDate(workdayDate.getDate() + 1)
      ;(
        document.querySelector('#workdayDateStringSpan') as HTMLSpanElement
      ).textContent = cityssm.dateToString(workdayDate)

      getWorkdayReport()
    })

  getWorkdayReport()
})()
