import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddWorkOrderStatusResponse } from '../../handlers/adminPost/doAddWorkOrderStatus.js'
import type { DoDeleteWorkOrderStatusResponse } from '../../handlers/adminPost/doDeleteWorkOrderStatus.js'
import type { DoMoveWorkOrderStatusDownResponse } from '../../handlers/adminPost/doMoveWorkOrderStatusDown.js'
import type { DoMoveWorkOrderStatusUpResponse } from '../../handlers/adminPost/doMoveWorkOrderStatusUp.js'
import type { DoUpdateWorkOrderStatusResponse } from '../../handlers/adminPost/doUpdateWorkOrderStatus.js'
import type { WorkOrderStatus } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const exports: {
  sunrise: Sunrise

  workOrderStatuses?: WorkOrderStatus[]
}

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
;(() => {
  const sunrise = exports.sunrise

  let workOrderStatuses = exports.workOrderStatuses as WorkOrderStatus[]
  delete exports.workOrderStatuses

  function updateWorkOrderStatus(submitEvent: SubmitEvent): void {
    submitEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doUpdateWorkOrderStatus`,
      submitEvent.currentTarget,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as DoUpdateWorkOrderStatusResponse

        if (responseJSON.success) {
          workOrderStatuses = responseJSON.workOrderStatuses

          bulmaJS.alert({
            contextualColorName: 'success',
            message: 'Work Order Status Updated Successfully'
          })
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'Error Updating Work Order Status'
          })
        }
      }
    )
  }

  function deleteWorkOrderStatus(clickEvent: Event): void {
    const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const workOrderStatusId = tableRowElement.dataset.workOrderStatusId

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doDeleteWorkOrderStatus`,
        {
          workOrderStatusId
        },
        (rawResponseJSON) => {
          const responseJSON =
            rawResponseJSON as DoDeleteWorkOrderStatusResponse

          if (responseJSON.success) {
            workOrderStatuses = responseJSON.workOrderStatuses

            if (workOrderStatuses.length === 0) {
              renderWorkOrderStatuses()
            } else {
              tableRowElement.remove()
              ;(
                document.querySelector('#tag--workOrderStatuses') as HTMLElement
              ).textContent = workOrderStatuses.length.toString()
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Work Order Status Deleted Successfully'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              message: 'Error Deleting Work Order Status'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Work Order Status',

      message: `Are you sure you want to delete this work order status?<br />
          Note that no work orders will be removed.`,
      messageIsHtml: true,

      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete Work Order Status'
      }
    })
  }

  function moveWorkOrderStatus(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

    const workOrderStatusId = tableRowElement.dataset.workOrderStatusId

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveWorkOrderStatusUp'
          : 'doMoveWorkOrderStatusDown'
      }`,
      {
        workOrderStatusId,

        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as
          | DoMoveWorkOrderStatusDownResponse
          | DoMoveWorkOrderStatusUpResponse

        if (responseJSON.success) {
          workOrderStatuses = responseJSON.workOrderStatuses
          renderWorkOrderStatuses()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'Error Moving Work Order Status'
          })
        }
      }
    )
  }

  function renderWorkOrderStatuses(): void {
    ;(
      document.querySelector('#tag--workOrderStatuses') as HTMLElement
    ).textContent = workOrderStatuses.length.toString()

    const containerElement = document.querySelector(
      '#container--workOrderStatuses'
    ) as HTMLTableSectionElement

    if (workOrderStatuses.length === 0) {
      containerElement.innerHTML = /* html */ `
        <tr>
          <td colspan="2">
            <div class="message is-warning">
              <p class="message-body">There are no active work order statuses.</p>
            </div>
          </td>
        </tr>
      `

      return
    }

    containerElement.innerHTML = ''

    for (const workOrderStatus of workOrderStatuses) {
      const tableRowElement = document.createElement('tr')

      tableRowElement.dataset.workOrderStatusId =
        workOrderStatus.workOrderStatusId.toString()

      tableRowElement.innerHTML = /* html */ `
        <td>
          <form>
            <input
              name="workOrderStatusId"
              type="hidden"
              value="${cityssm.escapeHTML(workOrderStatus.workOrderStatusId.toString())}"
            />
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  class="input"
                  name="workOrderStatus"
                  type="text"
                  value="${cityssm.escapeHTML(workOrderStatus.workOrderStatus)}"
                  maxlength="100"
                  aria-label="Work Order Status"
                  required
                />
              </div>
              <div class="control">
                <button
                  class="button is-success"
                  type="submit"
                  aria-label="Save"
                >
                  <span class="icon"><i class="fa-solid fa-save"></i></span>
                </button>
              </div>
            </div>
          </form>
        </td>
        <td class="is-nowrap">
          <div class="field is-grouped">
            <div class="control">
              ${sunrise.getMoveUpDownButtonFieldHTML(
                'button--moveWorkOrderStatusUp',
                'button--moveWorkOrderStatusDown',
                false
              )}
            </div>
            <div class="control">
              <button class="button is-danger is-light button--deleteWorkOrderStatus"
                type="button" title="Delete Work Order Status">
                <span class="icon"><i class="fa-solid fa-trash"></i></span>
              </button>
            </div>
          </div>
        </td>
      `

      tableRowElement
        .querySelector('form')
        ?.addEventListener('submit', updateWorkOrderStatus)
      ;(
        tableRowElement.querySelector(
          '.button--moveWorkOrderStatusUp'
        ) as HTMLButtonElement
      ).addEventListener('click', moveWorkOrderStatus)
      ;(
        tableRowElement.querySelector(
          '.button--moveWorkOrderStatusDown'
        ) as HTMLButtonElement
      ).addEventListener('click', moveWorkOrderStatus)

      tableRowElement
        .querySelector('.button--deleteWorkOrderStatus')
        ?.addEventListener('click', deleteWorkOrderStatus)

      containerElement.append(tableRowElement)
    }
  }

  ;(
    document.querySelector('#form--addWorkOrderStatus') as HTMLFormElement
  ).addEventListener('submit', (submitEvent: SubmitEvent) => {
    submitEvent.preventDefault()

    const formElement = submitEvent.currentTarget as HTMLFormElement

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doAddWorkOrderStatus`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as DoAddWorkOrderStatusResponse

        workOrderStatuses = responseJSON.workOrderStatuses

        renderWorkOrderStatuses()

        formElement.reset()
        formElement.querySelector('input')?.focus()
      }
    )
  })

  renderWorkOrderStatuses()
})()
