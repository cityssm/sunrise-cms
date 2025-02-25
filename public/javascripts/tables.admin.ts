import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'
import type {
  LotOccupantType,
  LotStatus,
  WorkOrderMilestoneType,
  WorkOrderType
} from '../../types/recordTypes.js'

declare const exports: Record<string, unknown>

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
;(() => {
  const los = exports.los as LOS

  function refreshFontAwesomeIcon(changeEvent: Event): void {
    const inputElement = changeEvent.currentTarget as HTMLInputElement

    const fontAwesomeIconClass = inputElement.value

    // eslint-disable-next-line no-unsanitized/property
    ;(
      inputElement
        .closest('.field')
        ?.querySelectorAll('.button.is-static') as NodeListOf<HTMLButtonElement>
    )[1].innerHTML =
      `<i class="fas fa-fw fa-${fontAwesomeIconClass}" aria-hidden="true"></i>`
  }

  /**
   * Work Order Types
   */
  ;(() => {
    let workOrderTypes = exports.workOrderTypes as WorkOrderType[]
    delete exports.workOrderTypes

    type ResponseJSON =
      | {
          success: true
          workOrderTypes: WorkOrderType[]
        }
      | {
          success: false
          errorMessage: string
        }

    function updateWorkOrderType(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doUpdateWorkOrderType`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            workOrderTypes = responseJSON.workOrderTypes

            bulmaJS.alert({
              message: 'Work Order Type Updated Successfully',
              contextualColorName: 'success'
            })
          } else {
            bulmaJS.alert({
              title: 'Error Updating Work Order Type',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    function deleteWorkOrderType(clickEvent: Event): void {
      const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
        'tr'
      ) as HTMLTableRowElement

      const workOrderTypeId = tableRowElement.dataset.workOrderTypeId

      function doDelete(): void {
        cityssm.postJSON(
          `${los.urlPrefix}/admin/doDeleteWorkOrderType`,
          {
            workOrderTypeId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as ResponseJSON

            if (responseJSON.success) {
              workOrderTypes = responseJSON.workOrderTypes

              if (workOrderTypes.length === 0) {
                renderWorkOrderTypes()
              } else {
                tableRowElement.remove()
              }

              bulmaJS.alert({
                message: 'Work Order Type Deleted Successfully',
                contextualColorName: 'success'
              })
            } else {
              bulmaJS.alert({
                title: 'Error Deleting Work Order Type',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: 'Delete Work Order Type',
        message: `Are you sure you want to delete this work order type?<br />
          Note that no work orders will be removed.`,
        messageIsHtml: true,
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete Work Order Type',
          callbackFunction: doDelete
        }
      })
    }

    function moveWorkOrderType(clickEvent: MouseEvent): void {
      const buttonElement = clickEvent.currentTarget as HTMLButtonElement

      const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

      const workOrderTypeId = tableRowElement.dataset.workOrderTypeId

      cityssm.postJSON(
        `${los.urlPrefix}/admin/${
          buttonElement.dataset.direction === 'up'
            ? 'doMoveWorkOrderTypeUp'
            : 'doMoveWorkOrderTypeDown'
        }`,
        {
          workOrderTypeId,
          moveToEnd: clickEvent.shiftKey ? '1' : '0'
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            workOrderTypes = responseJSON.workOrderTypes
            renderWorkOrderTypes()
          } else {
            bulmaJS.alert({
              title: 'Error Moving Work Order Type',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    function renderWorkOrderTypes(): void {
      const containerElement = document.querySelector(
        '#container--workOrderTypes'
      ) as HTMLTableSectionElement

      if (workOrderTypes.length === 0) {
        containerElement.innerHTML = `<tr><td colspan="2">
          <div class="message is-warning"><p class="message-body">There are no active work order types.</p></div>
          </td></tr>`

        return
      }

      containerElement.innerHTML = ''

      for (const workOrderType of workOrderTypes) {
        const tableRowElement = document.createElement('tr')

        tableRowElement.dataset.workOrderTypeId =
          workOrderType.workOrderTypeId.toString()

        // eslint-disable-next-line no-unsanitized/property
        tableRowElement.innerHTML = `<td>
        <form>
          <input name="workOrderTypeId" type="hidden" value="${workOrderType.workOrderTypeId.toString()}" />
          <div class="field has-addons">
            <div class="control">
              <input class="input" name="workOrderType" type="text"
                value="${cityssm.escapeHTML(workOrderType.workOrderType ?? '')}" maxlength="100" aria-label="Work Order Type" required />
            </div>
            <div class="control">
              <button class="button is-success" type="submit" aria-label="Save">
                <i class="fas fa-save" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </form>
      </td><td class="is-nowrap">
        <div class="field is-grouped">
          <div class="control">
            ${los.getMoveUpDownButtonFieldHTML(
              'button--moveWorkOrderTypeUp',
              'button--moveWorkOrderTypeDown',
              false
            )}
          </div>
          <div class="control">
            <button class="button is-danger is-light button--deleteWorkOrderType" data-tooltip="Delete Work Order Type" type="button" aria-label="Delete Work Order Type">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </td>`

        tableRowElement
          .querySelector('form')
          ?.addEventListener('submit', updateWorkOrderType)
        ;(
          tableRowElement.querySelector(
            '.button--moveWorkOrderTypeUp'
          ) as HTMLButtonElement
        ).addEventListener('click', moveWorkOrderType)
        ;(
          tableRowElement.querySelector(
            '.button--moveWorkOrderTypeDown'
          ) as HTMLButtonElement
        ).addEventListener('click', moveWorkOrderType)

        tableRowElement
          .querySelector('.button--deleteWorkOrderType')
          ?.addEventListener('click', deleteWorkOrderType)

        containerElement.append(tableRowElement)
      }
    }
    ;(
      document.querySelector('#form--addWorkOrderType') as HTMLFormElement
    ).addEventListener('submit', (submitEvent: SubmitEvent) => {
      submitEvent.preventDefault()

      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doAddWorkOrderType`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            workOrderTypes = responseJSON.workOrderTypes
            renderWorkOrderTypes()
            formElement.reset()
            formElement.querySelector('input')?.focus()
          } else {
            bulmaJS.alert({
              title: 'Error Adding Work Order Type',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    })

    renderWorkOrderTypes()
  })()

  /**
   * Work Order Milestone Types
   */
  ;(() => {
    let workOrderMilestoneTypes =
      exports.workOrderMilestoneTypes as WorkOrderMilestoneType[]
    delete exports.workOrderMilestoneTypes

    type ResponseJSON =
      | {
          success: true
          workOrderMilestoneTypes: WorkOrderMilestoneType[]
        }
      | {
          success: false
          errorMessage: string
        }

    function updateWorkOrderMilestoneType(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doUpdateWorkOrderMilestoneType`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            workOrderMilestoneTypes = responseJSON.workOrderMilestoneTypes

            bulmaJS.alert({
              message: 'Work Order Milestone Type Updated Successfully',
              contextualColorName: 'success'
            })
          } else {
            bulmaJS.alert({
              title: 'Error Updating Work Order Milestone Type',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    function deleteWorkOrderMilestoneType(clickEvent: Event): void {
      const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
        'tr'
      ) as HTMLTableRowElement

      const workOrderMilestoneTypeId =
        tableRowElement.dataset.workOrderMilestoneTypeId

      function doDelete(): void {
        cityssm.postJSON(
          `${los.urlPrefix}/admin/doDeleteWorkOrderMilestoneType`,
          {
            workOrderMilestoneTypeId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as ResponseJSON

            if (responseJSON.success) {
              workOrderMilestoneTypes = responseJSON.workOrderMilestoneTypes

              if (workOrderMilestoneTypes.length === 0) {
                renderWorkOrderMilestoneTypes()
              } else {
                tableRowElement.remove()
              }

              bulmaJS.alert({
                message: 'Work Order Milestone Type Deleted Successfully',
                contextualColorName: 'success'
              })
            } else {
              bulmaJS.alert({
                title: 'Error Deleting Work Order Milestone Type',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: 'Delete Work Order Milestone Type',
        message: `Are you sure you want to delete this work order milestone type?<br />
          Note that no work orders will be removed.`,
        messageIsHtml: true,
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete Work Order Milestone Type',
          callbackFunction: doDelete
        }
      })
    }

    function moveWorkOrderMilestoneType(clickEvent: MouseEvent): void {
      const buttonElement = clickEvent.currentTarget as HTMLButtonElement

      const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

      const workOrderMilestoneTypeId =
        tableRowElement.dataset.workOrderMilestoneTypeId

      cityssm.postJSON(
        `${los.urlPrefix}/admin/${
          buttonElement.dataset.direction === 'up'
            ? 'doMoveWorkOrderMilestoneTypeUp'
            : 'doMoveWorkOrderMilestoneTypeDown'
        }`,
        {
          workOrderMilestoneTypeId,
          moveToEnd: clickEvent.shiftKey ? '1' : '0'
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            workOrderMilestoneTypes = responseJSON.workOrderMilestoneTypes
            renderWorkOrderMilestoneTypes()
          } else {
            bulmaJS.alert({
              title: 'Error Moving Work Order Milestone Type',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    function renderWorkOrderMilestoneTypes(): void {
      const containerElement = document.querySelector(
        '#container--workOrderMilestoneTypes'
      ) as HTMLTableSectionElement

      if (workOrderMilestoneTypes.length === 0) {
        containerElement.innerHTML = `<tr><td colspan="2">
          <div class="message is-warning">
            <p class="message-body">There are no active work order milestone types.</p>
          </div>
          </td></tr>`

        return
      }

      containerElement.innerHTML = ''

      for (const workOrderMilestoneType of workOrderMilestoneTypes) {
        const tableRowElement = document.createElement('tr')

        tableRowElement.dataset.workOrderMilestoneTypeId =
          workOrderMilestoneType.workOrderMilestoneTypeId.toString()

        // eslint-disable-next-line no-unsanitized/property, no-secrets/no-secrets
        tableRowElement.innerHTML = `<td>
        <form>
          <input name="workOrderMilestoneTypeId" type="hidden" value="${workOrderMilestoneType.workOrderMilestoneTypeId.toString()}" />
          <div class="field has-addons">
            <div class="control">
              <input class="input" name="workOrderMilestoneType" type="text"
                value="${cityssm.escapeHTML(workOrderMilestoneType.workOrderMilestoneType)}" maxlength="100" aria-label="Work Order Milestone Type" required />
            </div>
            <div class="control">
              <button class="button is-success" type="submit" aria-label="Save">
                <i class="fas fa-save" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </form>
      </td><td class="is-nowrap">
        <div class="field is-grouped">
          <div class="control">
            ${los.getMoveUpDownButtonFieldHTML(
              'button--moveWorkOrderMilestoneTypeUp',
              'button--moveWorkOrderMilestoneTypeDown',
              false
            )}
          </div>
          <div class="control">
            <button class="button is-danger is-light button--deleteWorkOrderMilestoneType" data-tooltip="Delete Mielstone Type" type="button" aria-label="Delete Milestone Type">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </td>`

        tableRowElement
          .querySelector('form')
          ?.addEventListener('submit', updateWorkOrderMilestoneType)
        ;(
          tableRowElement.querySelector(
            '.button--moveWorkOrderMilestoneTypeUp'
          ) as HTMLButtonElement
        ).addEventListener('click', moveWorkOrderMilestoneType)
        ;(
          tableRowElement.querySelector(
            '.button--moveWorkOrderMilestoneTypeDown'
          ) as HTMLButtonElement
        ).addEventListener('click', moveWorkOrderMilestoneType)

        tableRowElement
          .querySelector('.button--deleteWorkOrderMilestoneType')
          ?.addEventListener('click', deleteWorkOrderMilestoneType)

        containerElement.append(tableRowElement)
      }
    }
    ;(
      document.querySelector(
        '#form--addWorkOrderMilestoneType'
      ) as HTMLFormElement
    ).addEventListener('submit', (submitEvent: SubmitEvent) => {
      submitEvent.preventDefault()

      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doAddWorkOrderMilestoneType`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            workOrderMilestoneTypes = responseJSON.workOrderMilestoneTypes
            renderWorkOrderMilestoneTypes()
            formElement.reset()
            formElement.querySelector('input')?.focus()
          } else {
            bulmaJS.alert({
              title: 'Error Adding Work Order Milestone Type',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    })

    renderWorkOrderMilestoneTypes()
  })()

  /**
   * Lot Statuses
   */
  ;(() => {
    let lotStatuses = exports.lotStatuses as LotStatus[]
    delete exports.lotStatuses

    type ResponseJSON =
      | {
          success: true
          lotStatuses: LotStatus[]
        }
      | {
          success: false
          errorMessage: string
        }

    function updateBurialSiteStatus(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doUpdateBurialSiteStatus`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            lotStatuses = responseJSON.lotStatuses

            bulmaJS.alert({
              message: `${los.escapedAliases.Lot} Status Updated Successfully`,
              contextualColorName: 'success'
            })
          } else {
            bulmaJS.alert({
              title: `Error Updating ${los.escapedAliases.Lot} Status`,
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    function deleteLotStatus(clickEvent: Event): void {
      const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
        'tr'
      ) as HTMLTableRowElement

      const burialSiteStatusId = tableRowElement.dataset.burialSiteStatusId

      function doDelete(): void {
        cityssm.postJSON(
          `${los.urlPrefix}/admin/doDeleteBurialSiteStatus`,
          {
            burialSiteStatusId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as ResponseJSON

            if (responseJSON.success) {
              lotStatuses = responseJSON.lotStatuses

              if (lotStatuses.length === 0) {
                renderLotStatuses()
              } else {
                tableRowElement.remove()
              }

              bulmaJS.alert({
                message: `${los.escapedAliases.Lot} Status Deleted Successfully`,
                contextualColorName: 'success'
              })
            } else {
              bulmaJS.alert({
                title: `Error Deleting ${los.escapedAliases.Lot} Status`,
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: `Delete ${los.escapedAliases.Lot} Status`,
        message: `Are you sure you want to delete this status?<br />
          Note that no ${los.escapedAliases.lot} will be removed.`,
        messageIsHtml: true,
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete Status',
          callbackFunction: doDelete
        }
      })
    }

    function moveLotStatus(clickEvent: MouseEvent): void {
      const buttonElement = clickEvent.currentTarget as HTMLButtonElement

      const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

      const burialSiteStatusId = tableRowElement.dataset.burialSiteStatusId

      cityssm.postJSON(
        `${los.urlPrefix}/admin/${
          buttonElement.dataset.direction === 'up'
            ? 'doMoveBurialSiteStatusUp'
            : 'doMoveBurialSiteStatusDown'
        }`,
        {
          burialSiteStatusId,
          moveToEnd: clickEvent.shiftKey ? '1' : '0'
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            lotStatuses = responseJSON.lotStatuses
            renderLotStatuses()
          } else {
            bulmaJS.alert({
              title: `Error Moving ${los.escapedAliases.Lot} Status`,
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    function renderLotStatuses(): void {
      const containerElement = document.querySelector(
        '#container--lotStatuses'
      ) as HTMLTableSectionElement

      if (lotStatuses.length === 0) {
        // eslint-disable-next-line no-unsanitized/property
        containerElement.innerHTML = `<tr><td colspan="2">
          <div class="message is-warning">
            <p class="message-body">There are no active ${los.escapedAliases.lot} statuses.</p>
          </div>
          </td></tr>`

        return
      }

      containerElement.innerHTML = ''

      for (const lotStatus of lotStatuses) {
        const tableRowElement = document.createElement('tr')

        tableRowElement.dataset.burialSiteStatusId = lotStatus.burialSiteStatusId.toString()

        // eslint-disable-next-line no-unsanitized/property
        tableRowElement.innerHTML = `<td>
        <form>
          <input name="burialSiteStatusId" type="hidden" value="${lotStatus.burialSiteStatusId.toString()}" />
          <div class="field has-addons">
            <div class="control">
              <input class="input" name="lotStatus" type="text"
                value="${cityssm.escapeHTML(lotStatus.lotStatus)}"
                aria-label="${los.escapedAliases.Lot} Status" maxlength="100" required />
            </div>
            <div class="control">
              <button class="button is-success" type="submit" aria-label="Save">
                <i class="fas fa-save" aria-hidden="true"></i>\
              </button>
            </div>
          </div>
        </form>
      </td><td class="is-nowrap">
        <div class="field is-grouped">
          <div class="control">
            ${los.getMoveUpDownButtonFieldHTML(
              'button--moveLotStatusUp',
              'button--moveLotStatusDown',
              false
            )}
          </div>
          <div class="control">
            <button class="button is-danger is-light button--deleteLotStatus" data-tooltip="Delete Status" type="button" aria-label="Delete Status">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </td>`

        tableRowElement
          .querySelector('form')
          ?.addEventListener('submit', updateBurialSiteStatus)
        ;(
          tableRowElement.querySelector(
            '.button--moveLotStatusUp'
          ) as HTMLButtonElement
        ).addEventListener('click', moveLotStatus)
        ;(
          tableRowElement.querySelector(
            '.button--moveLotStatusDown'
          ) as HTMLButtonElement
        ).addEventListener('click', moveLotStatus)

        tableRowElement
          .querySelector('.button--deleteLotStatus')
          ?.addEventListener('click', deleteLotStatus)

        containerElement.append(tableRowElement)
      }
    }
    ;(
      document.querySelector('#form--addBurialSiteStatus') as HTMLFormElement
    ).addEventListener('submit', (submitEvent: SubmitEvent) => {
      submitEvent.preventDefault()

      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doAddBurialSiteStatus`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            lotStatuses = responseJSON.lotStatuses
            renderLotStatuses()
            formElement.reset()
            formElement.querySelector('input')?.focus()
          } else {
            bulmaJS.alert({
              title: `Error Adding ${los.escapedAliases.Lot} Status`,
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    })

    renderLotStatuses()
  })()

  /**
   * Lot Occupant Types
   */
  ;(() => {
    let lotOccupantTypes = exports.lotOccupantTypes as LotOccupantType[]
    delete exports.lotOccupantTypes

    type ResponseJSON =
      | {
          success: true
          lotOccupantTypes: LotOccupantType[]
        }
      | {
          success: false
          errorMessage: string
        }

    function updateBurialSiteOccupantType(submitEvent: SubmitEvent): void {
      submitEvent.preventDefault()

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doUpdateBurialSiteOccupantType`,
        submitEvent.currentTarget,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            lotOccupantTypes = responseJSON.lotOccupantTypes

            bulmaJS.alert({
              message: `${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type Updated Successfully`,
              contextualColorName: 'success'
            })
          } else {
            bulmaJS.alert({
              title: `Error Updating ${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type`,
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    function deleteLotOccupantType(clickEvent: Event): void {
      const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
        'tr'
      ) as HTMLTableRowElement

      const lotOccupantTypeId = tableRowElement.dataset.lotOccupantTypeId

      function doDelete(): void {
        cityssm.postJSON(
          `${los.urlPrefix}/admin/doDeleteBurialSiteOccupantType`,
          {
            lotOccupantTypeId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as ResponseJSON

            if (responseJSON.success) {
              lotOccupantTypes = responseJSON.lotOccupantTypes

              if (lotOccupantTypes.length === 0) {
                renderLotOccupantTypes()
              } else {
                tableRowElement.remove()
              }

              bulmaJS.alert({
                message: `${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type Deleted Successfully`,
                contextualColorName: 'success'
              })
            } else {
              bulmaJS.alert({
                title: `Error Deleting ${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type`,
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: `Delete ${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type`,
        message: `Are you sure you want to delete this ${los.escapedAliases.lot} ${los.escapedAliases.occupant} type?<br />
            Note that no ${los.escapedAliases.lot} ${los.escapedAliases.occupants} will be removed.`,
        messageIsHtml: true,
        contextualColorName: 'warning',
        okButton: {
          text: `Yes, Delete ${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type`,
          callbackFunction: doDelete
        }
      })
    }

    function moveLotOccupantType(clickEvent: MouseEvent): void {
      const buttonElement = clickEvent.currentTarget as HTMLButtonElement

      const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

      const lotOccupantTypeId = tableRowElement.dataset.lotOccupantTypeId

      cityssm.postJSON(
        `${los.urlPrefix}/admin/${
          buttonElement.dataset.direction === 'up'
            ? 'doMoveLotOccupantTypeUp'
            : 'doMoveLotOccupantTypeDown'
        }`,
        {
          lotOccupantTypeId,
          moveToEnd: clickEvent.shiftKey ? '1' : '0'
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            lotOccupantTypes = responseJSON.lotOccupantTypes
            renderLotOccupantTypes()
          } else {
            bulmaJS.alert({
              title: `Error Moving ${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type`,
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    function renderLotOccupantTypes(): void {
      const containerElement = document.querySelector(
        '#container--lotOccupantTypes'
      ) as HTMLTableSectionElement

      if (lotOccupantTypes.length === 0) {
        // eslint-disable-next-line no-unsanitized/property
        containerElement.innerHTML = `<tr><td colspan="3">
          <div class="message is-warning">
          <p class="message-body">There are no active ${los.escapedAliases.lot} ${los.escapedAliases.occupant} types.</p>
          </div>
          </td></tr>`

        return
      }

      containerElement.innerHTML = ''

      for (const lotOccupantType of lotOccupantTypes) {
        const tableRowElement = document.createElement('tr')

        tableRowElement.dataset.lotOccupantTypeId =
          lotOccupantType.lotOccupantTypeId.toString()

        const formId = `form--lotOccupantType-${lotOccupantType.lotOccupantTypeId.toString()}`

        // eslint-disable-next-line no-unsanitized/property
        tableRowElement.innerHTML = `<td>
        <div class="field">
          <div class="control">
            <input class="input" name="lotOccupantType" type="text"
              value="${cityssm.escapeHTML(lotOccupantType.lotOccupantType)}"
              form="${formId}"
              aria-label="${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type" maxlength="100" required />
          </div>
        </div>
      </td><td>
        <div class="field has-addons">
          <div class="control">
            <span class="button is-static">fa-</span>
          </div>
          <div class="control">
            <input class="input" name="fontAwesomeIconClass" type="text"
              value="${cityssm.escapeHTML(lotOccupantType.fontAwesomeIconClass)}"
              form="${formId}"
              list="datalist--fontAwesomeIconClass" aria-label="Icon Name" maxlength="50" />
          </div>
          <div class="control">
            <span class="button is-static">
              <i class="fas fa-fw fa-${cityssm.escapeHTML(lotOccupantType.fontAwesomeIconClass)}"></i>
            </span>
          </div>
        </div>
      </td><td>
        <div class="field">
          <div class="control">
            <input class="input" name="occupantCommentTitle" type="text"
              value="${cityssm.escapeHTML(lotOccupantType.occupantCommentTitle)}"
              form="${formId}"
              aria-label="${los.escapedAliases.Occupant} Comment Title" maxlength="50" />
          </div>
        </div>
      </td><td>
        <form id="${formId}">
          <input name="lotOccupantTypeId" type="hidden"
            value="${lotOccupantType.lotOccupantTypeId.toString()}" />
          <button class="button is-success" type="submit" aria-label="Save">
            <i class="fas fa-save" aria-hidden="true"></i>
          </button>
        </form>
      </td><td class="is-nowrap">
        <div class="field is-grouped">
          <div class="control">
            ${los.getMoveUpDownButtonFieldHTML(
              'button--moveLotOccupantTypeUp',
              'button--moveLotOccupantTypeDown',
              false
            )}
          </div>
          <div class="control">
            <button class="button is-danger is-light button--deleteLotOccupantType"
              data-tooltip="Delete ${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type"
              type="button"
              aria-label="Delete ${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </td>`

        const fontAwesomeInputElement = tableRowElement.querySelector(
          "input[name='fontAwesomeIconClass']"
        ) as HTMLInputElement

        fontAwesomeInputElement.addEventListener(
          'keyup',
          refreshFontAwesomeIcon
        )
        fontAwesomeInputElement.addEventListener(
          'change',
          refreshFontAwesomeIcon
        )

        tableRowElement
          .querySelector('form')
          ?.addEventListener('submit', updateBurialSiteOccupantType)
        ;(
          tableRowElement.querySelector(
            '.button--moveLotOccupantTypeUp'
          ) as HTMLButtonElement
        ).addEventListener('click', moveLotOccupantType)
        ;(
          tableRowElement.querySelector(
            '.button--moveLotOccupantTypeDown'
          ) as HTMLButtonElement
        ).addEventListener('click', moveLotOccupantType)

        tableRowElement
          .querySelector('.button--deleteLotOccupantType')
          ?.addEventListener('click', deleteLotOccupantType)

        containerElement.append(tableRowElement)
      }
    }
    ;(
      document.querySelector('#form--addBurialSiteOccupantType') as HTMLFormElement
    ).addEventListener('submit', (submitEvent: SubmitEvent) => {
      submitEvent.preventDefault()

      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${los.urlPrefix}/admin/doAddLotOccupantType`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as ResponseJSON

          if (responseJSON.success) {
            lotOccupantTypes = responseJSON.lotOccupantTypes
            renderLotOccupantTypes()
            formElement.reset()
            formElement.querySelector('input')?.focus()
          } else {
            bulmaJS.alert({
              title: `Error Adding ${los.escapedAliases.Lot} ${los.escapedAliases.Occupant} Type`,
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    })

    renderLotOccupantTypes()
  })()
})()
