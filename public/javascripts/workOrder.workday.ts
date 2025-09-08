// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines, sonarjs/no-nested-conditional */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  BurialSite,
  Contract,
  WorkOrder,
  WorkOrderMilestone
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

  let currentDateString = cityssm.dateToString(new Date())

  let workdayDate = cityssm.dateStringToDate(exports.workdayDateString)

  const workdayContainer = document.querySelector(
    '#container--workday'
  ) as HTMLElement

  function toggleWorkOrderMilestoneCompletion(clickEvent: Event): void {
    const toggleButtonElement = clickEvent.currentTarget as HTMLElement

    const workOrderMilestoneId = Number.parseInt(
      toggleButtonElement.dataset.workOrderMilestoneId ?? '',
      10
    )

    const milestoneIsCompleted = toggleButtonElement.ariaChecked === 'true'

    function doToggleMilestone(): void {
      const workdayDateString = cityssm.dateToString(workdayDate)

      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/${milestoneIsCompleted ? 'doReopenWorkdayWorkOrderMilestone' : 'doCompleteWorkdayWorkOrderMilestone'}`,
        {
          workdayDateString,
          workOrderMilestoneId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            workOrders: WorkOrder[]
          }

          if (responseJSON.success) {
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Work Order Milestone updated successfully.'
            })

            renderWorkOrders(workdayDateString, responseJSON.workOrders)
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Milestone',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    if (milestoneIsCompleted) {
      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Reopen Work Order Milestone',

        message: 'Are you sure you want to reopen this milestone?',

        okButton: {
          text: 'Yes, Reopen this Milestone',

          callbackFunction: doToggleMilestone
        }
      })
    } else {
      bulmaJS.confirm({
        contextualColorName: 'info',
        title: 'Complete Work Order Milestone',

        message: 'Are you sure you want to complete this milestone?',

        okButton: {
          text: 'Yes, Complete this Milestone',

          callbackFunction: doToggleMilestone
        }
      })
    }
  }

  function updateMilestoneTime(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLElement

    const workOrderMilestoneId = Number.parseInt(
      buttonElement.dataset.workOrderMilestoneId ?? '',
      10
    )

    const workOrderMilestoneTimeString =
      buttonElement.dataset.workOrderMilestoneTimeString ?? ''

    let closeModalFunction: (() => void) | undefined

    function doUpdateTime(submitEvent: Event): void {
      submitEvent.preventDefault()

      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/doUpdateWorkdayWorkOrderMilestoneTime`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            workOrders: WorkOrder[]
          }

          if (responseJSON.success) {
            closeModalFunction?.()

            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Work Order Milestone Time updated successfully.'
            })

            renderWorkOrders(
              cityssm.dateToString(workdayDate),
              responseJSON.workOrders
            )
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Milestone Time',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('workOrderWorkday-editMilestoneTime', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#workOrderMilestoneUpdate--workdayDateString'
          ) as HTMLInputElement
        ).value = cityssm.dateToString(workdayDate)
        ;(
          modalElement.querySelector(
            '#workOrderMilestoneUpdate--workOrderMilestoneId'
          ) as HTMLInputElement
        ).value = workOrderMilestoneId.toString()
        ;(
          modalElement.querySelector(
            '#workOrderMilestoneUpdate--workOrderMilestoneDateString'
          ) as HTMLInputElement
        ).value = cityssm.dateToString(workdayDate)
        ;(
          modalElement.querySelector(
            '#workOrderMilestoneUpdate--workOrderMilestoneTimeString'
          ) as HTMLInputElement
        ).value = workOrderMilestoneTimeString
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('.is-unlock-button')
          ?.addEventListener('click', (event) => {
            event.preventDefault()

            const dateElement = modalElement.querySelector(
              '#workOrderMilestoneUpdate--workOrderMilestoneDateString'
            ) as HTMLInputElement

            dateElement.removeAttribute('readonly')
            dateElement.focus()
          })

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateTime)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function closeWorkOrder(clickEvent: Event): void {
    const closeButtonElement = clickEvent.currentTarget as HTMLElement

    const workdayDateString = cityssm.dateToString(workdayDate)

    const workOrderId = Number.parseInt(
      closeButtonElement.dataset.workOrderId ?? '',
      10
    )

    function doClose(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/doCloseWorkdayWorkOrder`,
        {
          workdayDateString,
          workOrderId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            workOrders: WorkOrder[]
          }

          if (responseJSON.success) {
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Work Order closed successfully.'
            })

            renderWorkOrders(workdayDateString, responseJSON.workOrders)
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Closing Work Order',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Close Work Order',

      message: 'Are you sure you want to close this work order?',

      okButton: {
        text: 'Yes, Close this Work Order',

        callbackFunction: doClose
      }
    })
  }

  function buildBurialSiteHTML(burialSite: BurialSite | Contract): string {
    return `<li>
      <span class="fa-li"><i class="fa-solid fa-map-pin"></i></span>
      <a href="${sunrise.urlPrefix}/burialSites/${burialSite.burialSiteId}" target="_blank">
        ${cityssm.escapeHTML(burialSite.burialSiteName ?? '')}
      </a><br />
      <span class="is-size-7">${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}</span>
      </li>`
  }

  function buildMilestoneElement(
    milestone: WorkOrderMilestone,
    options: { canUpdateThisWorkOrder: boolean }
  ): HTMLElement {
    const milestoneElement = document.createElement('div')
    milestoneElement.className = 'panel-block is-block'

    const milestoneIsCompleted =
      milestone.workOrderMilestoneCompletionDate !== null

    const milestoneCheckIcon = milestoneIsCompleted
      ? 'fa-solid fa-check'
      : 'fa-regular fa-square'

    const milestoneCheckHTML = options.canUpdateThisWorkOrder
      ? `<button class="button has-tooltip-right button--toggle-milestone"
            data-work-order-milestone-id="${milestone.workOrderMilestoneId}
            data-tooltip="Toggle Milestone Completion"
            aria-checked="${milestoneIsCompleted ? 'true' : 'false'}"
            type="button">
              <span class="icon is-small">
                <i class="${milestoneCheckIcon}"></i>
              </span>
            </button>`
      : `<span class="icon is-small">
            <i class="${milestoneCheckIcon}"></i>
          </span>`

    const milestoneTimeString =
      milestone.workOrderMilestoneTime === null
        ? 'No Set Time'
        : milestone.workOrderMilestoneTimePeriodString

    const milestoneTimeHTML =
      options.canUpdateThisWorkOrder && !milestoneIsCompleted
        ? `<button class="button has-tooltip-right button--edit-milestone-time"
              data-work-order-milestone-id="${milestone.workOrderMilestoneId}"
              data-work-order-milestone-time-string="${milestone.workOrderMilestoneTime === null ? '' : milestone.workOrderMilestoneTimeString}"
              title="Edit Milestone Time"
              type="button">
                ${milestoneTimeString}
              </button>`
        : milestoneTimeString

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
                ${milestoneTimeHTML}
              </div>
            </div>
            <p>${cityssm.escapeHTML(milestone.workOrderMilestoneDescription)}</p>
          </div>
        </div>`

    if (options.canUpdateThisWorkOrder) {
      milestoneElement
        .querySelector('.button--toggle-milestone')
        ?.addEventListener('click', toggleWorkOrderMilestoneCompletion)

      milestoneElement
        .querySelector('.button--edit-milestone-time')
        ?.addEventListener('click', updateMilestoneTime)
    }

    return milestoneElement
  }

  function renderContractsAndBurialSitesOnWorkOrder(
    workOrder: WorkOrder,
    workOrderElement: HTMLElement
  ): void {
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
  }

  function renderMilestonesOnWorkOrder(
    workOrder: WorkOrder,
    workOrderElement: HTMLElement,
    options: {
      canUpdateThisWorkOrder: boolean
      workdayDateString: string
    }
  ): void {
    const workdayDateString = cityssm.dateToString(workdayDate)
    let includesMilestones = false
    let includesIncompleteMilestones = false

    for (const milestone of workOrder.workOrderMilestones ?? []) {
      if (milestone.workOrderMilestoneCompletionDate === null) {
        includesIncompleteMilestones = true
      }

      if (milestone.workOrderMilestoneDateString !== workdayDateString) {
        continue
      }

      includesMilestones = true

      const milestoneElement = buildMilestoneElement(milestone, options)

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

    if (!includesIncompleteMilestones && options.canUpdateThisWorkOrder) {
      workOrderElement
        .querySelector('.panel-heading .level-right')
        ?.insertAdjacentHTML(
          'beforeend',
          `<div class="level-item is-hidden-print">
            <button class="button is-small button--close-work-order"
              data-work-order-id="${cityssm.escapeHTML(workOrder.workOrderId.toString())}"
              type="button">
              <span class="icon is-small">
                <i class="fa-solid fa-stop-circle"></i>
              </span>
              <span>Close Work Order</span>
            </button>
            </div>`
        )

      workOrderElement
        .querySelector('.button--close-work-order')
        ?.addEventListener('click', closeWorkOrder)
    }
  }

  // eslint-disable-next-line complexity
  function renderWorkOrders(
    workdayDateString: string,
    workOrders: WorkOrder[]
  ): void {
    workdayContainer.innerHTML = ''

    currentDateString = cityssm.dateToString(new Date())

    for (const workOrder of workOrders) {
      const workOrderIsClosed = workOrder.workOrderCloseDate !== null

      const canUpdateThisWorkOrder =
        !workOrderIsClosed &&
        canUpdateWorkOrders &&
        cityssm.dateToString(workdayDate) <= currentDateString

      const workOrderElement = document.createElement('div')
      workOrderElement.className = 'panel avoid-page-break'

      let progressTagClassName = ''

      if (
        workOrder.workOrderMilestoneCompletionCount ===
        workOrder.workOrderMilestoneCount
      ) {
        progressTagClassName = 'is-success'
      } else if ((workOrder.workOrderMilestoneOverdueCount ?? 0) > 0) {
        progressTagClassName = 'is-warning'
      }

      // eslint-disable-next-line no-unsanitized/property
      workOrderElement.innerHTML = `<div class="panel-heading p-3">
          <div class="level is-mobile">
            <div class="level-left">
              <div class="level-item">
                <h2>
                  <a class="has-text-white"
                    href="${sunrise.urlPrefix}/workOrders/${workOrder.workOrderId}${canUpdateThisWorkOrder ? '/edit' : ''}"
                    title="Open Work Order #${cityssm.escapeHTML(workOrder.workOrderNumber ?? '')}"
                    target="_blank">
                    #${cityssm.escapeHTML(workOrder.workOrderNumber ?? '')}
                  </a>
                  ${
                    workOrderIsClosed
                      ? `<span class="tag is-info">
                          <span class="icon is-small"><i class="fa-solid fa-stop"></i></span>
                          <span>Closed</span>
                          </span>`
                      : ''
                  }
                </h2>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <div class="tags has-addons">
                  <span class="tag is-dark">Progress</span>
                  <span class="tag ${progressTagClassName}">
                    ${workOrder.workOrderMilestoneCompletionCount ?? 0} / ${workOrder.workOrderMilestoneCount ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-block is-block">
          <p>${cityssm.escapeHTML((workOrder.workOrderDescription ?? '') === '' ? workOrder.workOrderType ?? '' : workOrder.workOrderDescription ?? '')}</p>
          ${
            (workOrder.workOrderContracts ?? []).length > 0 ||
            (workOrder.workOrderBurialSites ?? []).length > 0
              ? `<div class="columns">
                  <div class="column">
                    <ul class="fa-ul list--contacts"></ul>
                  </div>
                  <div class="column column--burialSites">
                    <ul class="fa-ul list--burialSites"></ul>
                  </div>
                </div>`
              : ''
          }
        </div>`

      /*
       * Contracts
       */

      renderContractsAndBurialSitesOnWorkOrder(workOrder, workOrderElement)

      /*
       * Milestones
       */

      renderMilestonesOnWorkOrder(workOrder, workOrderElement, {
        canUpdateThisWorkOrder,
        workdayDateString
      })

      workdayContainer.append(workOrderElement)
    }

    if (workOrders.length === 0) {
      workdayContainer.insertAdjacentHTML(
        'beforeend',
        `<div class="message is-info">
            <p class="message-body">No work orders for this workday.</p>
          </div>`
      )
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

  function updateFiltersAndGetReport(): void {
    ;(
      document.querySelector('#workdayDateStringSpan') as HTMLSpanElement
    ).textContent = cityssm.dateToString(workdayDate)

    document
      .querySelector('#button--workdayToday')
      ?.classList.toggle(
        'is-hidden',
        workdayDate.toDateString() === new Date().toDateString()
      )

    getWorkdayReport()
  }

  document
    .querySelector('#button--workdayToday')
    ?.addEventListener('click', () => {
      workdayDate = new Date()
      updateFiltersAndGetReport()
    })

  document
    .querySelector('#button--workdayPreviousDay')
    ?.addEventListener('click', () => {
      workdayDate.setDate(workdayDate.getDate() - 1)
      updateFiltersAndGetReport()
    })

  document
    .querySelector('#button--workdayNextDay')
    ?.addEventListener('click', () => {
      workdayDate.setDate(workdayDate.getDate() + 1)
      updateFiltersAndGetReport()
    })

  updateFiltersAndGetReport()

  document
    .querySelector('aside.menu')
    ?.closest('.column')
    ?.classList.add('is-hidden-mobile')
})()
