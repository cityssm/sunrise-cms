import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { IntermentContainerType } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const exports: {
  sunrise: Sunrise

  intermentContainerTypes?: IntermentContainerType[]
}

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
;(() => {
  const sunrise = exports.sunrise

  let intermentContainerTypes =
    exports.intermentContainerTypes as IntermentContainerType[]
  delete exports.intermentContainerTypes

  type IntermentContainerTypeResponseJSON =
    | {
        success: false
        errorMessage?: string
      }
    | {
        success: true
        intermentContainerTypes: IntermentContainerType[]
      }

  function updateIntermentContainerType(submitEvent: SubmitEvent): void {
    submitEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doUpdateIntermentContainerType`,
      submitEvent.currentTarget,
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as IntermentContainerTypeResponseJSON

        if (responseJSON.success) {
          intermentContainerTypes = responseJSON.intermentContainerTypes

          bulmaJS.alert({
            contextualColorName: 'success',
            message: 'Interment Container Type Updated Successfully'
          })
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Updating Interment Container Type',

            message: responseJSON.errorMessage ?? ''
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
        (rawResponseJSON) => {
          const responseJSON =
            rawResponseJSON as IntermentContainerTypeResponseJSON

          if (responseJSON.success) {
            intermentContainerTypes = responseJSON.intermentContainerTypes

            if (intermentContainerTypes.length === 0) {
              renderIntermentContainerTypes()
            } else {
              tableRowElement.remove()
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Interment Container Type Deleted Successfully'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Interment Container Type',

              message: responseJSON.errorMessage ?? ''
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
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as IntermentContainerTypeResponseJSON

        if (responseJSON.success) {
          intermentContainerTypes = responseJSON.intermentContainerTypes
          renderIntermentContainerTypes()
        } else {
          bulmaJS.alert({
            title: 'Error Moving Interment Container Type',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function renderIntermentContainerTypes(): void {
    const containerElement = document.querySelector(
      '#container--intermentContainerTypes'
    ) as HTMLTableSectionElement

    if (intermentContainerTypes.length === 0) {
      containerElement.innerHTML = `<tr><td colspan="2">
          <div class="message is-warning">
            <p class="message-body">There are no active interment container types.</p>
          </div>
          </td></tr>`

      return
    }

    containerElement.innerHTML = ''

    for (const intermentContainerType of intermentContainerTypes) {
      const tableRowElement = document.createElement('tr')

      tableRowElement.dataset.intermentContainerTypeId =
        intermentContainerType.intermentContainerTypeId.toString()

      const formId = `form--updateIntermentContainerType_${intermentContainerType.intermentContainerTypeId.toString()}`

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = `<td>
        <form id="${formId}">
          <input name="intermentContainerTypeId" type="hidden" value="${intermentContainerType.intermentContainerTypeId.toString()}" />
          <div class="field">
            <div class="control">
              <input class="input" name="intermentContainerType" type="text"
                value="${cityssm.escapeHTML(intermentContainerType.intermentContainerType)}"
                aria-label="Interment Container Type" maxlength="100" required />
            </div>
          </div>
        </form>
      </td>
      <td>
        <div class="select is-fullwidth">
          <select name="isCremationType" form="${formId}" aria-label="Is Cremated">
            <option value="0" ${intermentContainerType.isCremationType ? '' : 'selected'}>No</option>
            <option value="1" ${intermentContainerType.isCremationType ? 'selected' : ''}>Yes</option>
          </select>
        </div>
      </td>
      <td class="is-nowrap">
        <div class="field is-grouped">
          <div class="control">
            <button class="button is-success" type="submit" form="${formId}" aria-label="Save">
              <span class="icon"><i class="fa-solid fa-save" aria-hidden="true"></i></span>
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
            <button class="button is-danger is-light button--deleteIntermentContainerType"
              data-tooltip="Delete Type" type="button" aria-label="Delete Type">
              <span class="icon"><i class="fa-solid fa-trash" aria-hidden="true"></i></span>
            </button>
          </div>
        </div>
      </td>`

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
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as IntermentContainerTypeResponseJSON

        if (responseJSON.success) {
          intermentContainerTypes = responseJSON.intermentContainerTypes
          renderIntermentContainerTypes()
          formElement.reset()
          formElement.querySelector('input')?.focus()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Adding Interment Container Type',

            message: responseJSON.errorMessage ?? ''
          })
        }
      }
    )
  })

  renderIntermentContainerTypes()
})()
