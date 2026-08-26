import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddIntermentContainerTypeResponse } from '../../handlers/adminPost/doAddIntermentContainerType.js'
import type { DoDeleteIntermentContainerTypeResponse } from '../../handlers/adminPost/doDeleteIntermentContainerType.js'
import type { DoMoveIntermentContainerTypeDownResponse } from '../../handlers/adminPost/doMoveIntermentContainerTypeDown.js'
import type { DoMoveIntermentContainerTypeUpResponse } from '../../handlers/adminPost/doMoveIntermentContainerTypeUp.js'
import type { DoUpdateIntermentContainerTypeResponse } from '../../handlers/adminPost/doUpdateIntermentContainerType.js'
import type { IntermentContainerType } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: CityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise

  intermentContainerTypes?: IntermentContainerType[]
}
;(() => {
  const sunrise = exports.sunrise

  let intermentContainerTypes =
    exports.intermentContainerTypes as IntermentContainerType[]
  delete exports.intermentContainerTypes

  function updateIntermentContainerType(submitEvent: SubmitEvent): void {
    submitEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doUpdateIntermentContainerType`,
      submitEvent.currentTarget as HTMLFormElement,
      (responseJSON: DoUpdateIntermentContainerTypeResponse) => {
        if (responseJSON.success) {
          intermentContainerTypes = responseJSON.intermentContainerTypes

          bulmaJS.alert({
            contextualColorName: 'success',
            message: 'Interment Container Type Updated Successfully'
          })
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'Error Updating Interment Container Type'
          })
        }
      }
    )
  }

  function deleteIntermentContainerType(clickEvent: Event): void {
    const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const intermentContainerTypeId =
      tableRowElement.dataset.intermentContainerTypeId

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doDeleteIntermentContainerType`,
        {
          intermentContainerTypeId
        },
        (responseJSON: DoDeleteIntermentContainerTypeResponse) => {
          if (responseJSON.success) {
            intermentContainerTypes = responseJSON.intermentContainerTypes

            if (intermentContainerTypes.length === 0) {
              renderIntermentContainerTypes()
            } else {
              tableRowElement.remove()
              ;(
                document.querySelector(
                  '#tag--intermentContainerTypes'
                ) as HTMLElement
              ).textContent = intermentContainerTypes.length.toString()
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Interment Container Type Deleted Successfully'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              message: 'Error Deleting Interment Container Type'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Interment Container Type',

      message: `Are you sure you want to delete this type?<br />
          Note that no contracts will be removed.`,
      messageIsHtml: true,
      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete Type'
      }
    })
  }

  function moveIntermentContainerType(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

    const intermentContainerTypeId =
      tableRowElement.dataset.intermentContainerTypeId

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveIntermentContainerTypeUp'
          : 'doMoveIntermentContainerTypeDown'
      }`,
      {
        intermentContainerTypeId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      (
        responseJSON:
          | DoMoveIntermentContainerTypeDownResponse
          | DoMoveIntermentContainerTypeUpResponse
      ) => {
        if (responseJSON.success) {
          intermentContainerTypes = responseJSON.intermentContainerTypes
          renderIntermentContainerTypes()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'Error Moving Interment Container Type'
          })
        }
      }
    )
  }

  function renderIntermentContainerTypes(): void {
    ;(
      document.querySelector('#tag--intermentContainerTypes') as HTMLElement
    ).textContent = intermentContainerTypes.length.toString()

    const containerElement = document.querySelector(
      '#container--intermentContainerTypes'
    ) as HTMLTableSectionElement

    if (intermentContainerTypes.length === 0) {
      containerElement.innerHTML = /* html */ `
        <tr>
          <td colspan="2">
            <div class="message is-warning">
              <p class="message-body">There are no active interment container types.</p>
            </div>
          </td>
        </tr>
      `

      return
    }

    containerElement.innerHTML = ''

    for (const intermentContainerType of intermentContainerTypes) {
      const tableRowElement = document.createElement('tr')

      tableRowElement.dataset.intermentContainerTypeId =
        intermentContainerType.intermentContainerTypeId.toString()

      const formId = `form--updateIntermentContainerType_${intermentContainerType.intermentContainerTypeId.toString()}`

      // eslint-disable-next-line browser-security/no-innerhtml
      tableRowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td>
            <form id="${formId}">
              <input
                name="intermentContainerTypeId" type="hidden"
                value="${cityssm.escapeHTML(intermentContainerType.intermentContainerTypeId.toString())}"
              />
              <div class="field">
                <div class="control">
                  <input
                    class="input"
                    name="intermentContainerType"
                    type="text"
                    value="${cityssm.escapeHTML(intermentContainerType.intermentContainerType)}"
                    maxlength="100"
                    aria-label="Interment Container Type"
                    required
                  />
                </div>
              </div>
            </form>
          </td>
        `
      )

      // eslint-disable-next-line browser-security/no-innerhtml
      tableRowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td>
            <div class="select is-fullwidth">
              <select name="isCremationType" aria-label="Is Cremated" form="${formId}">
                <option value="0" ${intermentContainerType.isCremationType ? '' : 'selected'}>No</option>
                <option value="1" ${intermentContainerType.isCremationType ? 'selected' : ''}>Yes</option>
              </select>
            </div>
          </td>
        `
      )

      // eslint-disable-next-line browser-security/no-innerhtml
      tableRowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td class="is-nowrap">
            <div class="field is-grouped">
              <div class="control">
                <button
                  class="button is-success"
                  type="submit"
                  aria-label="Save"
                  form="${formId}"
                >
                  <span class="icon"><i class="fa-solid fa-save"></i></span>
                </button>
              </div>
              <div class="control">
                ${sunrise.getMoveUpDownButtonFieldHTML(
                  'button--moveIntermentContainerTypeUp',
                  'button--moveIntermentContainerTypeDown',
                  false
                )}
              </div>
              <div class="control">
                <button
                  class="button is-danger is-light button--deleteIntermentContainerType"
                  type="button"
                  title="Delete Type"
                >
                  <span class="icon"><i class="fa-solid fa-trash"></i></span>
                </button>
              </div>
            </div>
          </td>
        `
      )

      tableRowElement
        .querySelector('form')
        ?.addEventListener('submit', updateIntermentContainerType)
      ;(
        tableRowElement.querySelector(
          '.button--moveIntermentContainerTypeUp'
        ) as HTMLButtonElement
      ).addEventListener('click', moveIntermentContainerType)
      ;(
        tableRowElement.querySelector(
          '.button--moveIntermentContainerTypeDown'
        ) as HTMLButtonElement
      ).addEventListener('click', moveIntermentContainerType)

      tableRowElement
        .querySelector('.button--deleteIntermentContainerType')
        ?.addEventListener('click', deleteIntermentContainerType)

      containerElement.append(tableRowElement)
    }
  }
  ;(
    document.querySelector(
      '#form--addIntermentContainerType'
    ) as HTMLFormElement
  ).addEventListener('submit', (submitEvent: SubmitEvent) => {
    submitEvent.preventDefault()

    const formElement = submitEvent.currentTarget as HTMLFormElement

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doAddIntermentContainerType`,
      formElement,
      (responseJSON: DoAddIntermentContainerTypeResponse) => {
        intermentContainerTypes = responseJSON.intermentContainerTypes
        renderIntermentContainerTypes()
        formElement.reset()
        formElement.querySelector('input')?.focus()
      }
    )
  })

  renderIntermentContainerTypes()
})()
