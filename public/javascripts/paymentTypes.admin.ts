import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddPaymentTypeResponse } from '../../handlers/adminPost/doAddPaymentType.js'
import type { DoDeletePaymentTypeResponse } from '../../handlers/adminPost/doDeletePaymentType.js'
import type { DoMovePaymentTypeDownResponse } from '../../handlers/adminPost/doMovePaymentTypeDown.js'
import type { DoMovePaymentTypeUpResponse } from '../../handlers/adminPost/doMovePaymentTypeUp.js'
import type { DoUpdatePaymentTypeResponse } from '../../handlers/adminPost/doUpdatePaymentType.js'
import type { PaymentType } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: CityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
}

{
  const sunrise = exports.sunrise

  const containerElement = document.querySelector(
    '#container--paymentTypes'
  ) as HTMLTableSectionElement

  let paymentTypes = JSON.parse(
    containerElement.dataset.paymentTypes ?? '[]'
  ) as PaymentType[]

  function updatePaymentType(submitEvent: SubmitEvent): void {
    submitEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doUpdatePaymentType`,
      submitEvent.currentTarget as HTMLFormElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as DoUpdatePaymentTypeResponse

        if (responseJSON.success) {
          paymentTypes = responseJSON.paymentTypes

          bulmaJS.alert({
            contextualColorName: 'success',
            message: 'Payment Type Updated Successfully'
          })
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'Error Updating Payment Type'
          })
        }
      }
    )
  }

  function deletePaymentType(clickEvent: Event): void {
    const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const paymentTypeId = tableRowElement.dataset.paymentTypeId

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doDeletePaymentType`,
        {
          paymentTypeId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as DoDeletePaymentTypeResponse

          if (responseJSON.success) {
            paymentTypes = responseJSON.paymentTypes

            if (paymentTypes.length === 0) {
              renderPaymentTypes()
            } else {
              tableRowElement.remove()
              ;(document.querySelector('#tag--paymentTypes') as HTMLElement).textContent =
                paymentTypes.length.toString()
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Payment Type Deleted Successfully'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              message: 'Error Deleting Payment Type'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Payment Type',

      message: `Are you sure you want to delete this payment type?<br />
          Note that no contract transactions will be removed.`,
      messageIsHtml: true,

      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete Payment Type'
      }
    })
  }

  function movePaymentType(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

    const paymentTypeId = tableRowElement.dataset.paymentTypeId

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMovePaymentTypeUp'
          : 'doMovePaymentTypeDown'
      }`,
      {
        paymentTypeId,

        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as
          | DoMovePaymentTypeDownResponse
          | DoMovePaymentTypeUpResponse

        if (responseJSON.success) {
          paymentTypes = responseJSON.paymentTypes
          renderPaymentTypes()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'Error Moving Payment Type'
          })
        }
      }
    )
  }

  function renderPaymentTypes(): void {
    ;(document.querySelector('#tag--paymentTypes') as HTMLElement).textContent =
      paymentTypes.length.toString()

    if (paymentTypes.length === 0) {
      containerElement.innerHTML = /* html */ `
        <tr>
          <td colspan="2">
            <div class="message is-warning">
              <p class="message-body">There are no active payment types.</p>
            </div>
          </td>
        </tr>
      `

      return
    }

    containerElement.replaceChildren()

    for (const paymentType of paymentTypes) {
      const tableRowElement = document.createElement('tr')

      tableRowElement.dataset.paymentTypeId = paymentType.paymentTypeId.toString()

      tableRowElement.innerHTML = /* html */ `
        <td>
          <form>
            <input
              name="paymentTypeId"
              type="hidden"
              value="${cityssm.escapeHTML(paymentType.paymentTypeId.toString())}"
            />
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  class="input"
                  name="paymentType"
                  type="text"
                  value="${cityssm.escapeHTML(paymentType.paymentType)}"
                  maxlength="100"
                  aria-label="Payment Type"
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
                'button--movePaymentTypeUp',
                'button--movePaymentTypeDown',
                false
              )}
            </div>
            <div class="control">
              <button class="button is-danger is-light button--deletePaymentType"
                type="button" title="Delete Payment Type">
                <span class="icon"><i class="fa-solid fa-trash"></i></span>
              </button>
            </div>
          </div>
        </td>
      `

      tableRowElement
        .querySelector('form')
        ?.addEventListener('submit', updatePaymentType)

      tableRowElement
        .querySelector<HTMLButtonElement>('.button--movePaymentTypeUp')
        ?.addEventListener('click', movePaymentType)

      tableRowElement
        .querySelector<HTMLButtonElement>('.button--movePaymentTypeDown')
        ?.addEventListener('click', movePaymentType)

      tableRowElement
        .querySelector('.button--deletePaymentType')
        ?.addEventListener('click', deletePaymentType)

      containerElement.append(tableRowElement)
    }
  }

  ;(
    document.querySelector('#form--addPaymentType') as HTMLFormElement
  ).addEventListener('submit', (submitEvent: SubmitEvent) => {
    submitEvent.preventDefault()

    const formElement = submitEvent.currentTarget as HTMLFormElement

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doAddPaymentType`,
      formElement,
      (responseJSON: DoAddPaymentTypeResponse) => {
        paymentTypes = responseJSON.paymentTypes

        renderPaymentTypes()

        formElement.reset()
        formElement.querySelector('input')?.focus()
      }
    )
  })

  renderPaymentTypes()
}
