/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddWorkOrderMilestoneResponse } from '../../handlers/workOrders-post/doAddWorkOrderMilestone.js'
import type { DoCloseWorkOrderResponse } from '../../handlers/workOrders-post/doCloseWorkOrder.js'
import type { DoCreateWorkOrderResponse } from '../../handlers/workOrders-post/doCreateWorkOrder.js'
import type { DoDeleteWorkOrderResponse } from '../../handlers/workOrders-post/doDeleteWorkOrder.js'
import type { DoGetWorkOrderMilestonesResponse } from '../../handlers/workOrders-post/doGetWorkOrderMilestones.js'
import type { DoUpdateWorkOrderResponse } from '../../handlers/workOrders-post/doUpdateWorkOrder.js'
import type { DoUpdateWorkOrderMilestoneResponse } from '../../handlers/workOrders-post/doUpdateWorkOrderMilestone.js'
import type {
  WorkOrderMilestone,
  WorkOrderMilestoneType
} from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise

  workOrderMilestones?: WorkOrderMilestone[]
  workOrderMilestoneTypes?: WorkOrderMilestoneType[]
  workOrderWorkDayRanges?: Record<
    number,
    { endHour: number; startHour: number }
  >
}
;(() => {
  const sunrise = exports.sunrise

  const workOrderId = (
    document.querySelector('#workOrderEdit--workOrderId') as HTMLInputElement
  ).value

  const isCreate = workOrderId === ''

  // eslint-disable-next-line require-unicode-regexp
  if (!isCreate && !/^\d+$/.test(workOrderId)) {
    globalThis.location.href = `${sunrise.urlPrefix}/workOrders`
  }

  const workOrderFormElement = document.querySelector(
    '#form--workOrderEdit'
  ) as HTMLFormElement

  sunrise.initializeUnlockFieldButtons(workOrderFormElement)

  function setUnsavedChanges(): void {
    sunrise.setUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--workOrderEdit']")
      ?.classList.remove('is-light')
  }

  function clearUnsavedChanges(): void {
    sunrise.clearUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--workOrderEdit']")
      ?.classList.add('is-light')
  }

  workOrderFormElement.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/workOrders/${isCreate ? 'doCreateWorkOrder' : 'doUpdateWorkOrder'}`,
      submitEvent.currentTarget,
      (responseJSON: DoCreateWorkOrderResponse | DoUpdateWorkOrderResponse) => {
        if (responseJSON.success) {
          clearUnsavedChanges()
          if (isCreate) {
            globalThis.location.href = sunrise.getWorkOrderUrl(
              responseJSON.workOrderId,
              true
            )
          } else {
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Work Order Updated Successfully'
            })
          }
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'Error Updating Work Order'
          })
        }
      }
    )
  })

  const inputElements: NodeListOf<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = workOrderFormElement.querySelectorAll('input, select, textarea')

  for (const inputElement of inputElements) {
    inputElement.addEventListener('change', setUnsavedChanges)
  }

  /*
   * Work Order Options
   */

  function doClose(): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/workOrders/doCloseWorkOrder`,
      {
        workOrderId
      },
      (responseJSON: DoCloseWorkOrderResponse) => {
        if (responseJSON.success) {
          clearUnsavedChanges()
          globalThis.location.href = sunrise.getWorkOrderUrl(
            responseJSON.workOrderId
          )
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'Error Closing Work Order'
          })
        }
      }
    )
  }

  function doDelete(): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/workOrders/doDeleteWorkOrder`,
      {
        workOrderId
      },
      (responseJSON: DoDeleteWorkOrderResponse) => {
        if (responseJSON.success) {
          clearUnsavedChanges()
          globalThis.location.href = `${sunrise.urlPrefix}/workOrders`
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'Error Deleting Work Order'
          })
        }
      }
    )
  }

  let workOrderMilestones: WorkOrderMilestone[]

  document
    .querySelector('#button--closeWorkOrder')
    ?.addEventListener('click', () => {
      const hasOpenMilestones = workOrderMilestones.some(
        (milestone) => milestone.workOrderMilestoneCompletionDate === null
      )

      if (hasOpenMilestones) {
        bulmaJS.alert({
          contextualColorName: 'warning',
          title: 'Outstanding Milestones',

          message: `You cannot close a work order with outstanding milestones.
            Either complete the outstanding milestones, or remove them from the work order.`
        })
      } else {
        bulmaJS.confirm({
          contextualColorName: sunrise.hasUnsavedChanges() ? 'warning' : 'info',
          title: 'Close Work Order',

          message: sunrise.hasUnsavedChanges()
            ? 'Are you sure you want to close this work order with unsaved changes?'
            : 'Are you sure you want to close this work order?',

          okButton: {
            callbackFunction: doClose,
            text: 'Yes, Close Work Order'
          }
        })
      }
    })

  document
    .querySelector('#button--deleteWorkOrder')
    ?.addEventListener('click', (clickEvent: Event) => {
      clickEvent.preventDefault()

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Delete Work Order',

        message: 'Are you sure you want to delete this work order?',

        okButton: {
          callbackFunction: doDelete,
          text: 'Yes, Delete Work Order'
        }
      })
    })

  /*
   * Milestones
   */

  function clearPanelBlockElements(panelElement: HTMLElement): void {
    for (const panelBlockElement of panelElement.querySelectorAll(
      '.panel-block'
    )) {
      panelBlockElement.remove()
    }
  }

  function refreshConflictingMilestones(
    workOrderMilestoneDateString: string,
    targetPanelElement: HTMLElement
  ): void {
    // Clear panel-block elements
    clearPanelBlockElements(targetPanelElement)

    targetPanelElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <div class="panel-block is-block">
          ${sunrise.getLoadingParagraphHTML('Loading conflicting milestones...')}
        </div>
      `
    )

    cityssm.postJSON(
      `${sunrise.urlPrefix}/workOrders/doGetWorkOrderMilestones`,
      {
        workOrderMilestoneDateFilter: 'date',
        workOrderMilestoneDateString
      },
      (responseJSON: DoGetWorkOrderMilestonesResponse) => {
        const conflictingWorkOrderMilestones =
          responseJSON.workOrderMilestones.filter(
            (possibleMilestone) =>
              possibleMilestone.workOrderId.toString() !== workOrderId
          )

        clearPanelBlockElements(targetPanelElement)

        for (const milestone of conflictingWorkOrderMilestones) {
          targetPanelElement.insertAdjacentHTML(
            'beforeend',
            /* html */ `
              <div class="panel-block is-block">
                <div class="columns">
                  <div class="column is-5">
                    ${cityssm.escapeHTML(milestone.workOrderMilestoneTime === null ? 'No Time' : (milestone.workOrderMilestoneTimePeriodString ?? ''))}<br />
                    <strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong>
                  </div>
                  <div class="column">
                    ${cityssm.escapeHTML(milestone.workOrderNumber ?? '')}<br />
                    <span class="is-size-7">
                      ${cityssm.escapeHTML(milestone.workOrderDescription ?? '')}
                    </span>
                  </div>
                </div>
              </div>
            `
          )
        }

        if (conflictingWorkOrderMilestones.length === 0) {
          targetPanelElement.insertAdjacentHTML(
            'beforeend',
            /* html */ `
              <div class="panel-block is-block">
                <div class="message is-info">
                  <p class="message-body">
                    There are no milestones on other work orders scheduled for
                    ${cityssm.escapeHTML(workOrderMilestoneDateString)}.
                  </p>
                </div>
              </div>
            `
          )
        }
      }
    )
  }

  function processMilestoneResponse(
    responseJSON:
      | DoAddWorkOrderMilestoneResponse
      | DoUpdateWorkOrderMilestoneResponse
  ): void {
    if (responseJSON.success) {
      workOrderMilestones = responseJSON.workOrderMilestones
      renderMilestones()
    } else {
      bulmaJS.alert({
        contextualColorName: 'danger',
        title: 'Error Updating Milestone',

        message: responseJSON.errorMessage
      })
    }
  }

  function completeMilestone(clickEvent: Event): void {
    clickEvent.preventDefault()

    const currentDateString = cityssm.dateToString(new Date())

    const workOrderMilestoneId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--milestone'
        ) as HTMLElement
      ).dataset.workOrderMilestoneId ?? '',
      10
    )

    const workOrderMilestone = workOrderMilestones.find(
      (currentMilestone) =>
        currentMilestone.workOrderMilestoneId === workOrderMilestoneId
    ) as WorkOrderMilestone

    function doComplete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/doCompleteWorkOrderMilestone`,
        {
          workOrderId,
          workOrderMilestoneId
        },
        processMilestoneResponse
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Complete Milestone',

      message: `Are you sure you want to complete this milestone?
        ${
          workOrderMilestone.workOrderMilestoneDateString !== undefined &&
          workOrderMilestone.workOrderMilestoneDateString !== '' &&
          workOrderMilestone.workOrderMilestoneDateString > currentDateString
            ? '<br /><strong>Note that this milestone is expected to be completed in the future.</strong>'
            : ''
        }`,
      messageIsHtml: true,
      okButton: {
        callbackFunction: doComplete,
        text: 'Yes, Complete Milestone'
      }
    })
  }

  function reopenMilestone(clickEvent: Event): void {
    clickEvent.preventDefault()

    const workOrderMilestoneId = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--milestone'
      ) as HTMLElement
    ).dataset.workOrderMilestoneId

    function doReopen(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/doReopenWorkOrderMilestone`,
        {
          workOrderId,
          workOrderMilestoneId
        },
        processMilestoneResponse
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Reopen Milestone',

      message:
        'Are you sure you want to remove the completion status from this milestone, and reopen it?',

      okButton: {
        callbackFunction: doReopen,
        text: 'Yes, Reopen Milestone'
      }
    })
  }

  function deleteMilestone(clickEvent: Event): void {
    clickEvent.preventDefault()

    const workOrderMilestoneId = (
      (clickEvent.currentTarget as HTMLElement).closest(
        '.container--milestone'
      ) as HTMLElement
    ).dataset.workOrderMilestoneId

    function doDeleteMilestone(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/doDeleteWorkOrderMilestone`,
        {
          workOrderId,
          workOrderMilestoneId
        },
        processMilestoneResponse
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Milestone',

      message: 'Are you sure you want to delete this milestone?',
      okButton: {
        callbackFunction: doDeleteMilestone,
        text: 'Yes, Delete Milestone'
      }
    })
  }

  const workOrderOpenDateStringElement = document.querySelector(
    '#workOrderEdit--workOrderOpenDateString'
  ) as HTMLInputElement

  function refreshWorkOrderMilestoneDateTimeMessage(
    elementIdPrefix: 'milestoneAdd' | 'milestoneEdit'
  ): void {
    const workOrderMilestoneDateStringElement = document.querySelector(
      `#${elementIdPrefix}--workOrderMilestoneDateString`
    ) as HTMLInputElement

    const workOrderMilestoneTimeStringElement = document.querySelector(
      `#${elementIdPrefix}--workOrderMilestoneTimeString`
    ) as HTMLInputElement

    const workOrderMilestoneDateTimeMessageElement = document.querySelector(
      `#${elementIdPrefix}--workOrderMilestoneDateTimeMessage`
    ) as HTMLParagraphElement

    const dateValueString = workOrderMilestoneDateStringElement.value

    if (dateValueString === '') {
      workOrderMilestoneDateTimeMessageElement.textContent = ''
      return
    }

    const dateValue = new Date(`${dateValueString}T00:00:00`)

    const timeRange =
      exports.workOrderWorkDayRanges?.[dateValue.getDay()] === undefined
        ? {
            endHour: 24,
            startHour: 0
          }
        : exports.workOrderWorkDayRanges[dateValue.getDay()]

    const setHourString = workOrderMilestoneTimeStringElement.value

    const setHour =
      setHourString === ''
        ? -1
        : Number.parseInt(setHourString.split(':')[0], 10)

    if (
      timeRange.startHour === -1 ||
      (setHour !== -1 && setHour < timeRange.startHour) ||
      timeRange.endHour === -1 ||
      (setHour !== -1 && setHour >= timeRange.endHour)
    ) {
      workOrderMilestoneDateTimeMessageElement.textContent =
        'Milestone time is outside of regular work hours.'
      return
    }

    workOrderMilestoneDateTimeMessageElement.textContent = ''
  }

  function editMilestone(clickEvent: Event): void {
    clickEvent.preventDefault()

    const workOrderMilestoneId = Number.parseInt(
      (
        (clickEvent.currentTarget as HTMLElement).closest(
          '.container--milestone'
        ) as HTMLElement
      ).dataset.workOrderMilestoneId ?? '',
      10
    )

    const workOrderMilestone = workOrderMilestones.find(
      (currentMilestone) =>
        currentMilestone.workOrderMilestoneId === workOrderMilestoneId
    ) as WorkOrderMilestone

    let editCloseModalFunction: () => void
    let workOrderMilestoneDateStringElement: HTMLInputElement

    function doEdit(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${sunrise.urlPrefix}/workOrders/doUpdateWorkOrderMilestone`,
        submitEvent.currentTarget,
        (responseJSON: DoUpdateWorkOrderMilestoneResponse) => {
          processMilestoneResponse(responseJSON)
          if (responseJSON.success) {
            editCloseModalFunction()
          }
        }
      )
    }

    cityssm.openHtmlModal('workOrder-editMilestone', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#milestoneEdit--workOrderId'
          ) as HTMLInputElement
        ).value = workOrderId
        ;(
          modalElement.querySelector(
            '#milestoneEdit--workOrderMilestoneId'
          ) as HTMLInputElement
        ).value = workOrderMilestone.workOrderMilestoneId.toString()

        const milestoneTypeElement = modalElement.querySelector(
          '#milestoneEdit--workOrderMilestoneTypeId'
        ) as HTMLSelectElement

        let milestoneTypeFound = false

        for (const milestoneType of exports.workOrderMilestoneTypes as WorkOrderMilestoneType[]) {
          const optionElement = document.createElement('option')

          optionElement.value =
            milestoneType.workOrderMilestoneTypeId.toString()
          optionElement.textContent = milestoneType.workOrderMilestoneType

          if (
            milestoneType.workOrderMilestoneTypeId ===
            workOrderMilestone.workOrderMilestoneTypeId
          ) {
            optionElement.selected = true
            milestoneTypeFound = true
          }

          milestoneTypeElement.append(optionElement)
        }

        if (
          !milestoneTypeFound &&
          workOrderMilestone.workOrderMilestoneTypeId
        ) {
          const optionElement = document.createElement('option')

          optionElement.value =
            workOrderMilestone.workOrderMilestoneTypeId.toString()

          optionElement.textContent =
            workOrderMilestone.workOrderMilestoneType ?? ''

          optionElement.selected = true

          milestoneTypeElement.append(optionElement)
        }

        workOrderMilestoneDateStringElement = modalElement.querySelector(
          '#milestoneEdit--workOrderMilestoneDateString'
        ) as HTMLInputElement

        workOrderMilestoneDateStringElement.value =
          workOrderMilestone.workOrderMilestoneDateString ?? ''

        workOrderMilestoneDateStringElement.min =
          workOrderOpenDateStringElement.value

        workOrderMilestoneDateStringElement.addEventListener('change', () => {
          refreshWorkOrderMilestoneDateTimeMessage('milestoneEdit')
        })

        const workOrderMilestoneTimeStringElement = modalElement.querySelector(
          '#milestoneEdit--workOrderMilestoneTimeString'
        ) as HTMLInputElement

        if (
          workOrderMilestone.workOrderMilestoneTime !== null &&
          workOrderMilestone.workOrderMilestoneTime !== undefined
        ) {
          workOrderMilestoneTimeStringElement.value =
            workOrderMilestone.workOrderMilestoneTimeString ?? ''
        }

        workOrderMilestoneTimeStringElement.addEventListener('change', () => {
          refreshWorkOrderMilestoneDateTimeMessage('milestoneEdit')
        })

        refreshWorkOrderMilestoneDateTimeMessage('milestoneEdit')
        ;(
          modalElement.querySelector(
            '#milestoneEdit--workOrderMilestoneDescription'
          ) as HTMLTextAreaElement
        ).value = workOrderMilestone.workOrderMilestoneDescription
      },
      onshown(modalElement, closeModalFunction) {
        editCloseModalFunction = closeModalFunction

        bulmaJS.toggleHtmlClipped()

        modalElement.querySelector('form')?.addEventListener('submit', doEdit)

        const conflictingMilestonePanelElement = document.querySelector(
          '#milestoneEdit--conflictingMilestonesPanel'
        ) as HTMLElement

        workOrderMilestoneDateStringElement.addEventListener('change', () => {
          refreshConflictingMilestones(
            workOrderMilestoneDateStringElement.value,
            conflictingMilestonePanelElement
          )
        })

        refreshConflictingMilestones(
          workOrderMilestoneDateStringElement.value,
          conflictingMilestonePanelElement
        )
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function buildMilestoneElement(milestone: WorkOrderMilestone): HTMLElement {
    const currentDateString = cityssm.dateToString(new Date())

    const panelBlockElement = document.createElement('div')
    panelBlockElement.className = 'panel-block is-block container--milestone'

    if (
      milestone.workOrderMilestoneCompletionDate === null &&
      (milestone.workOrderMilestoneDateString ?? '') < currentDateString
    ) {
      panelBlockElement.classList.add('has-background-warning-light')
    }

    panelBlockElement.dataset.workOrderMilestoneId =
      milestone.workOrderMilestoneId.toString()

    // eslint-disable-next-line no-unsanitized/property
    panelBlockElement.innerHTML = /* html */ `
      <div class="columns is-mobile">
        <div class="column is-narrow">
          ${
            milestone.workOrderMilestoneCompletionDate === null ||
            milestone.workOrderMilestoneCompletionDate === undefined
              ? /* html */ `
                <button class="button button--completeMilestone" type="button" title="Incomplete">
                  <span class="icon is-small"><i class="fa-regular fa-square"></i></span>
                </button>
              `
              : /* html */ `
                <span
                  class="button is-static"
                  title="Completed ${cityssm.escapeHTML(milestone.workOrderMilestoneCompletionDateString ?? '')}"
                >
                  <span class="icon is-small"><i class="fa-solid fa-check"></i></span>
                </span>
              `
          }
        </div>
        <div class="column">
          ${
            milestone.workOrderMilestoneTypeId === null ||
            milestone.workOrderMilestoneTypeId === undefined
              ? ''
              : /* html */ `
                <strong>
                  ${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}
                </strong><br />
              `
          }
          ${
            milestone.workOrderMilestoneDate === 0
              ? '<span class="has-text-grey">(No Set Date)</span>'
              : milestone.workOrderMilestoneDateString
          }
          ${
            milestone.workOrderMilestoneTime === null
              ? ''
              : ` ${milestone.workOrderMilestoneTimePeriodString}`
          }<br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(milestone.workOrderMilestoneDescription)}
          </span>
        </div>
        <div class="column is-narrow">
          <div class="dropdown is-right">
            <div class="dropdown-trigger">
              <button class="button is-small" type="button" title="Options">
                <span class="icon is-small"><i class="fa-solid fa-ellipsis-v"></i></span>
              </button>
            </div>
            <div class="dropdown-menu">
              <div class="dropdown-content">
                ${
                  milestone.workOrderMilestoneCompletionDate
                    ? /* html */ `
                      <a class="dropdown-item button--reopenMilestone" href="#">
                        <span class="icon"><i class="fa-solid fa-times"></i></span>
                        <span>Reopen Milestone</span>
                      </a>
                    `
                    : /* html */ `
                      <a class="dropdown-item button--editMilestone" href="#">
                        <span class="icon"><i class="fa-solid fa-pencil-alt"></i></span>
                        <span>Edit Milestone</span>
                      </a>
                    `
                }
                <hr class="dropdown-divider" />
                <a class="dropdown-item button--deleteMilestone" href="#">
                  <span class="icon"><i class="fa-solid fa-trash has-text-danger"></i></span>
                  <span>Delete Milestone</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    panelBlockElement
      .querySelector('.button--reopenMilestone')
      ?.addEventListener('click', reopenMilestone)

    panelBlockElement
      .querySelector('.button--editMilestone')
      ?.addEventListener('click', editMilestone)

    panelBlockElement
      .querySelector('.button--completeMilestone')
      ?.addEventListener('click', completeMilestone)

    panelBlockElement
      .querySelector('.button--deleteMilestone')
      ?.addEventListener('click', deleteMilestone)

    return panelBlockElement
  }

  function renderMilestones(): void {
    // Clear milestones panel
    const milestonesPanelElement = document.querySelector(
      '#panel--milestones'
    ) as HTMLElement

    const panelBlockElementsToDelete =
      milestonesPanelElement.querySelectorAll('.panel-block')

    for (const panelBlockToDelete of panelBlockElementsToDelete) {
      panelBlockToDelete.remove()
    }

    for (const milestone of workOrderMilestones) {
      const panelBlockElement = buildMilestoneElement(milestone)

      milestonesPanelElement.append(panelBlockElement)
    }

    if (workOrderMilestones.length === 0) {
      milestonesPanelElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <div class="panel-block is-block">
            <div class="message is-info">
              <p class="message-body">There are no milestones on this work order.</p>
            </div>
          </div>
        `
      )
    }

    bulmaJS.init(milestonesPanelElement)
  }

  if (!isCreate) {
    workOrderMilestones = exports.workOrderMilestones as WorkOrderMilestone[]
    delete exports.workOrderMilestones

    renderMilestones()
  }

  document
    .querySelector('#button--addMilestone')
    ?.addEventListener('click', () => {
      let addFormElement: HTMLFormElement
      let workOrderMilestoneDateStringElement: HTMLInputElement
      let addCloseModalFunction: () => void

      function _doAdd(): void {
        cityssm.postJSON(
          `${sunrise.urlPrefix}/workOrders/doAddWorkOrderMilestone`,
          addFormElement,
          (responseJSON: DoAddWorkOrderMilestoneResponse) => {
            processMilestoneResponse(responseJSON)

            if (responseJSON.success) {
              addCloseModalFunction()
            }
          }
        )
      }

      function doAddFormSubmit(submitEvent?: SubmitEvent): void {
        if (submitEvent !== undefined) {
          submitEvent.preventDefault()
        }

        const currentDateString = cityssm.dateToString(new Date())

        const milestoneDateString = workOrderMilestoneDateStringElement.value

        if (
          milestoneDateString !== '' &&
          milestoneDateString < currentDateString
        ) {
          bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Milestone Date in the Past',

            message:
              'Are you sure you want to create a milestone with a date in the past?',

            okButton: {
              callbackFunction: _doAdd,
              text: 'Yes, Create a Past Milestone'
            }
          })
        } else {
          _doAdd()
        }
      }

      cityssm.openHtmlModal('workOrder-addMilestone', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector(
              '#milestoneAdd--workOrderId'
            ) as HTMLInputElement
          ).value = workOrderId

          const milestoneTypeElement = modalElement.querySelector(
            '#milestoneAdd--workOrderMilestoneTypeId'
          ) as HTMLSelectElement

          for (const milestoneType of exports.workOrderMilestoneTypes as WorkOrderMilestoneType[]) {
            const optionElement = document.createElement('option')

            optionElement.value =
              milestoneType.workOrderMilestoneTypeId.toString()
            optionElement.textContent = milestoneType.workOrderMilestoneType

            milestoneTypeElement.append(optionElement)
          }

          workOrderMilestoneDateStringElement = modalElement.querySelector(
            '#milestoneAdd--workOrderMilestoneDateString'
          ) as HTMLInputElement

          workOrderMilestoneDateStringElement.valueAsDate = new Date()

          workOrderMilestoneDateStringElement.min =
            workOrderOpenDateStringElement.value

          workOrderMilestoneDateStringElement.addEventListener('change', () => {
            refreshWorkOrderMilestoneDateTimeMessage('milestoneAdd')
          })

          modalElement
            .querySelector('#milestoneAdd--workOrderMilestoneTimeString')
            ?.addEventListener('change', () => {
              refreshWorkOrderMilestoneDateTimeMessage('milestoneAdd')
            })
        },
        onshown(modalElement, closeModalFunction) {
          addCloseModalFunction = closeModalFunction

          bulmaJS.toggleHtmlClipped()
          ;(
            modalElement.querySelector(
              '#milestoneAdd--workOrderMilestoneTypeId'
            ) as HTMLSelectElement
          ).focus()

          addFormElement = modalElement.querySelector('form') as HTMLFormElement
          addFormElement.addEventListener('submit', doAddFormSubmit)

          const conflictingMilestonePanelElement = document.querySelector(
            '#milestoneAdd--conflictingMilestonesPanel'
          ) as HTMLElement

          workOrderMilestoneDateStringElement.addEventListener('change', () => {
            refreshConflictingMilestones(
              workOrderMilestoneDateStringElement.value,
              conflictingMilestonePanelElement
            )
          })

          refreshConflictingMilestones(
            workOrderMilestoneDateStringElement.value,
            conflictingMilestonePanelElement
          )
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
          ;(
            document.querySelector('#button--addMilestone') as HTMLButtonElement
          ).focus()
        }
      })
    })
})()
