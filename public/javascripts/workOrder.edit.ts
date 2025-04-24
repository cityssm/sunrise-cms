// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  WorkOrderMilestone,
  WorkOrderMilestoneType
} from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  const workOrderId = (
    document.querySelector('#workOrderEdit--workOrderId') as HTMLInputElement
  ).value

  const isCreate = workOrderId === ''

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
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          workOrderId?: number
          errorMessage?: string
        }

        if (responseJSON.success) {
          clearUnsavedChanges()

          if (isCreate) {
            globalThis.location.href = sunrise.getWorkOrderURL(
              responseJSON.workOrderId,
              true
            )
          } else {
            bulmaJS.alert({
              message: 'Work Order Updated Successfully',
              contextualColorName: 'success'
            })
          }
        } else {
          bulmaJS.alert({
            title: 'Error Updating Work Order',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
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
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          errorMessage?: string
        }

        if (responseJSON.success) {
          clearUnsavedChanges()
          globalThis.location.href = sunrise.getWorkOrderURL(workOrderId)
        } else {
          bulmaJS.alert({
            title: 'Error Closing Work Order',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
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
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          errorMessage?: string
        }

        if (responseJSON.success) {
          clearUnsavedChanges()
          globalThis.location.href = `${sunrise.urlPrefix}/workOrders`
        } else {
          bulmaJS.alert({
            title: 'Error Deleting Work Order',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
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
        (milestone) => !milestone.workOrderMilestoneCompletionDate
      )

      if (hasOpenMilestones) {
        bulmaJS.alert({
          title: 'Outstanding Milestones',
          message: `You cannot close a work order with outstanding milestones.
            Either complete the outstanding milestones, or remove them from the work order.`,
          contextualColorName: 'warning'
        })

        /*
          // Disable closing work orders with open milestones
          bulmaJS.confirm({
            title: "Close Work Order with Outstanding Milestones",
            message:
              "Are you sure you want to close this work order with outstanding milestones?",
            contextualColorName: "danger",
            okButton: {
              text: "Yes, Close Work Order",
              callbackFunction: doClose
            }
          });
      */
      } else {
        bulmaJS.confirm({
          title: 'Close Work Order',
          message: sunrise.hasUnsavedChanges()
            ? 'Are you sure you want to close this work order with unsaved changes?'
            : 'Are you sure you want to close this work order?',
          contextualColorName: sunrise.hasUnsavedChanges() ? 'warning' : 'info',
          okButton: {
            text: 'Yes, Close Work Order',
            callbackFunction: doClose
          }
        })
      }
    })

  document
    .querySelector('#button--deleteWorkOrder')
    ?.addEventListener('click', (clickEvent: Event) => {
      clickEvent.preventDefault()

      bulmaJS.confirm({
        title: 'Delete Work Order',
        message: 'Are you sure you want to delete this work order?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete Work Order',
          callbackFunction: doDelete
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

    // eslint-disable-next-line no-unsanitized/method
    targetPanelElement.insertAdjacentHTML(
      'beforeend',
      `<div class="panel-block is-block">
      ${sunrise.getLoadingParagraphHTML('Loading conflicting milestones...')}
      </div>`
    )

    cityssm.postJSON(
      `${sunrise.urlPrefix}/workOrders/doGetWorkOrderMilestones`,
      {
        workOrderMilestoneDateFilter: 'date',
        workOrderMilestoneDateString
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          workOrderMilestones: WorkOrderMilestone[]
        }

        const workOrderMilestones = responseJSON.workOrderMilestones.filter(
          (possibleMilestone) =>
            possibleMilestone.workOrderId.toString() !== workOrderId
        )

        clearPanelBlockElements(targetPanelElement)

        for (const milestone of workOrderMilestones) {
          targetPanelElement.insertAdjacentHTML(
            'beforeend',
            `<div class="panel-block is-block">
              <div class="columns">
                <div class="column is-5">
                  ${cityssm.escapeHTML(milestone.workOrderMilestoneTime === 0 ? 'No Time' : milestone.workOrderMilestoneTimePeriodString ?? '')}<br />
                  <strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong>
                </div>
                <div class="column">
                  ${cityssm.escapeHTML(milestone.workOrderNumber ?? '')}<br />
                  <span class="is-size-7">
                    ${cityssm.escapeHTML(milestone.workOrderDescription ?? '')}
                  </span>
                </div>
              </div>
              </div>`
          )
        }

        if (workOrderMilestones.length === 0) {
          targetPanelElement.insertAdjacentHTML(
            'beforeend',
            `<div class="panel-block is-block">
              <div class="message is-info">
                <p class="message-body">
                  There are no milestones on other work orders scheduled for
                  ${cityssm.escapeHTML(workOrderMilestoneDateString)}.
                </p>
              </div>
              </div>`
          )
        }
      }
    )
  }

  function processMilestoneResponse(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as {
      success: boolean
      errorMessage?: string
      workOrderMilestones: WorkOrderMilestone[]
    }

    if (responseJSON.success) {
      workOrderMilestones = responseJSON.workOrderMilestones
      renderMilestones()
    } else {
      bulmaJS.alert({
        title: 'Error Reopening Milestone',
        message: responseJSON.errorMessage ?? '',
        contextualColorName: 'danger'
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
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Complete Milestone',
        callbackFunction: doComplete
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
      title: 'Reopen Milestone',
      message:
        'Are you sure you want to remove the completion status from this milestone, and reopen it?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Reopen Milestone',
        callbackFunction: doReopen
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
          workOrderMilestoneId,
          workOrderId
        },
        processMilestoneResponse
      )
    }

    bulmaJS.confirm({
      title: 'Delete Milestone',
      message: 'Are you sure you want to delete this milestone?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Milestone',
        callbackFunction: doDeleteMilestone
      }
    })
  }

  const workOrderOpenDateStringElement = document.querySelector(
    '#workOrderEdit--workOrderOpenDateString'
  ) as HTMLInputElement

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
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            errorMessage?: string
            workOrderMilestones?: WorkOrderMilestone[]
          }

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
        ).value = workOrderMilestone.workOrderMilestoneId?.toString() ?? ''

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

        if (workOrderMilestone.workOrderMilestoneTime) {
          ;(
            modalElement.querySelector(
              '#milestoneEdit--workOrderMilestoneTimeString'
            ) as HTMLInputElement
          ).value = workOrderMilestone.workOrderMilestoneTimeString ?? ''
        }

        ;(
          modalElement.querySelector(
            '#milestoneEdit--workOrderMilestoneDescription'
          ) as HTMLTextAreaElement
        ).value = workOrderMilestone.workOrderMilestoneDescription ?? ''
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
      const panelBlockElement = document.createElement('div')
      panelBlockElement.className = 'panel-block is-block container--milestone'

      panelBlockElement.dataset.workOrderMilestoneId =
        milestone.workOrderMilestoneId?.toString()

      // eslint-disable-next-line no-unsanitized/property
      panelBlockElement.innerHTML = `<div class="columns is-mobile">
        <div class="column is-narrow">
          ${
            milestone.workOrderMilestoneCompletionDate
              ? `<span class="button is-static"
                  data-tooltip="Completed ${milestone.workOrderMilestoneCompletionDateString}"
                  aria-label="Completed ${milestone.workOrderMilestoneCompletionDateString}">
                  <span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>
                  </span>`
              : `<button class="button button--completeMilestone" data-tooltip="Incomplete" type="button" aria-label="Incomplete">
                  <span class="icon is-small"><i class="far fa-square" aria-hidden="true"></i></span>
                  </button>`
          }
        </div><div class="column">
          ${
            milestone.workOrderMilestoneTypeId
              ? `<strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong><br />`
              : ''
          }
          ${
            milestone.workOrderMilestoneDate === 0
              ? '<span class="has-text-grey">(No Set Date)</span>'
              : milestone.workOrderMilestoneDateString
          }
          ${
            milestone.workOrderMilestoneTime
              ? ` ${milestone.workOrderMilestoneTimePeriodString}`
              : ''
          }<br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(milestone.workOrderMilestoneDescription ?? '')}
          </span>
        </div><div class="column is-narrow">
          <div class="dropdown is-right">
            <div class="dropdown-trigger">
              <button class="button is-small" data-tooltip="Options" type="button" aria-label="Options">
                <span class="icon is-small"><i class="fas fa-ellipsis-v" aria-hidden="true"></i></span>
              </button>
            </div>
            <div class="dropdown-menu">
              <div class="dropdown-content">
                ${
                  milestone.workOrderMilestoneCompletionDate
                    ? `<a class="dropdown-item button--reopenMilestone" href="#">
                        <span class="icon is-small"><i class="fas fa-times" aria-hidden="true"></i></span>
                        <span>Reopen Milestone</span>
                        </a>`
                    : `<a class="dropdown-item button--editMilestone" href="#">
                        <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
                        <span>Edit Milestone</span>
                        </a>`
                }
                <hr class="dropdown-divider" />
                <a class="dropdown-item button--deleteMilestone" href="#">
                  <span class="icon is-small"><i class="fas fa-trash has-text-danger" aria-hidden="true"></i></span>
                  <span>Delete Milestone</span>
                </a>
              </div>
            </div>
          </div>
        </div></div>`

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

      milestonesPanelElement.append(panelBlockElement)
    }

    if (workOrderMilestones.length === 0) {
      milestonesPanelElement.insertAdjacentHTML(
        'beforeend',
        `<div class="panel-block is-block">
          <div class="message is-info">
            <p class="message-body">There are no milestones on this work order.</p>
          </div>
        </div>`
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

      function doAdd(submitEvent?: SubmitEvent): void {
        if (submitEvent) {
          submitEvent.preventDefault()
        }

        const currentDateString = cityssm.dateToString(new Date())

        function _doAdd(): void {
          cityssm.postJSON(
            `${sunrise.urlPrefix}/workOrders/doAddWorkOrderMilestone`,
            addFormElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                errorMessage?: string
                workOrderMilestones?: WorkOrderMilestone[]
              }

              processMilestoneResponse(responseJSON)

              if (responseJSON.success) {
                addCloseModalFunction()
              }
            }
          )
        }

        const milestoneDateString = workOrderMilestoneDateStringElement.value

        if (
          milestoneDateString !== '' &&
          milestoneDateString < currentDateString
        ) {
          bulmaJS.confirm({
            title: 'Milestone Date in the Past',
            message:
              'Are you sure you want to create a milestone with a date in the past?',
            contextualColorName: 'warning',
            okButton: {
              text: 'Yes, Create a Past Milestone',
              callbackFunction: _doAdd
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
          addFormElement.addEventListener('submit', doAdd)

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
