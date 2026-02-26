import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { IntermentDepth } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise

  intermentDepths?: IntermentDepth[]
}

type IntermentDepthResponseJSON =
  | {
      success: false

      errorMessage?: string
    }
  | {
      success: true

      intermentDepths: IntermentDepth[]
    }
;(() => {
  const sunrise = exports.sunrise

  let intermentDepths = exports.intermentDepths as IntermentDepth[]
  delete exports.intermentDepths

  function updateIntermentDepth(submitEvent: Event): void {
    submitEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doUpdateIntermentDepth`,
      submitEvent.currentTarget,
      (responseJSON: IntermentDepthResponseJSON) => {
        if (responseJSON.success) {
          intermentDepths = responseJSON.intermentDepths

          bulmaJS.alert({
            contextualColorName: 'success',
            message: 'Interment Depth Updated Successfully'
          })
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Updating Interment Depth',

            message: responseJSON.errorMessage ?? ''
          })
        }
      }
    )
  }

  function deleteIntermentDepth(clickEvent: Event): void {
    const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const intermentDepthId = tableRowElement.dataset.intermentDepthId

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doDeleteIntermentDepth`,
        {
          intermentDepthId
        },
        (responseJSON: IntermentDepthResponseJSON) => {
          if (responseJSON.success) {
            intermentDepths = responseJSON.intermentDepths

            if (intermentDepths.length === 0) {
              renderIntermentDepths()
            } else {
              tableRowElement.remove()
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Interment Depth Deleted Successfully'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Interment Depth',

              message: responseJSON.errorMessage ?? ''
            })
          }
        }
      )
    }
    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Interment Depth',

      message: `Are you sure you want to delete this depth?<br />
          Note that no contracts will be removed.`,
      messageIsHtml: true,
      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete Depth'
      }
    })
  }

  function moveIntermentDepth(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

    const intermentDepthId = tableRowElement.dataset.intermentDepthId

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveIntermentDepthUp'
          : 'doMoveIntermentDepthDown'
      }`,
      {
        intermentDepthId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      (responseJSON: IntermentDepthResponseJSON) => {
        if (responseJSON.success) {
          intermentDepths = responseJSON.intermentDepths
          renderIntermentDepths()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Moving Interment Depth',

            message: responseJSON.errorMessage ?? ''
          })
        }
      }
    )
  }
  function renderIntermentDepths(): void {
    const containerElement = document.querySelector(
      '#container--intermentDepths'
    ) as HTMLTableSectionElement

    if (intermentDepths.length === 0) {
      containerElement.innerHTML = /* html */ `
        <tr>
          <td colspan="2">
            <div class="message is-warning">
              <p class="message-body">There are no active interment depths.</p>
            </div>
          </td>
        </tr>
      `
      return
    }
    containerElement.innerHTML = ''
    for (const intermentDepth of intermentDepths) {
      const tableRowElement = document.createElement('tr')
      tableRowElement.dataset.intermentDepthId =
        intermentDepth.intermentDepthId.toString()

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = /* html */ `
        <td>
          <form>
            <input name="intermentDepthId" type="hidden" value="${intermentDepth.intermentDepthId.toString()}" />
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  class="input"
                  name="intermentDepth"
                  type="text"
                  value="${cityssm.escapeHTML(intermentDepth.intermentDepth)}"
                  maxlength="100"
                  aria-label="Interment Depth"
                  required
                />
              </div>
              <div class="control">
                <button class="button is-success" type="submit" aria-label="Save">
                  <span class="icon"><i class="fa-solid fa-save"></i></span>
                </button>
              </div>
            </div>
          </form>
        </td>
        <td class="is-nowrap">
          <div class="field is-grouped">
            <div class="control">
              ${sunrise.getMoveUpDownButtonFieldHTML('button--moveIntermentDepthUp', 'button--moveIntermentDepthDown', false)}
            </div>
            <div class="control">
              <button
                class="button is-danger is-light button--deleteIntermentDepth"
                type="button"
                title="Delete Depth"
              >
                <span class="icon"><i class="fa-solid fa-trash"></i></span>
              </button>
            </div>
          </div>
        </td>
      `
      tableRowElement
        .querySelector('form')
        ?.addEventListener('submit', updateIntermentDepth)

      for (const moveButton of tableRowElement.querySelectorAll(
        '.button--moveIntermentDepthUp, .button--moveIntermentDepthDown'
      )) {
        moveButton.addEventListener('click', moveIntermentDepth)
      }

      tableRowElement
        .querySelector('.button--deleteIntermentDepth')
        ?.addEventListener('click', deleteIntermentDepth)

      containerElement.append(tableRowElement)
    }
  }

  document
    .querySelector('#form--addIntermentDepth')
    ?.addEventListener('submit', (submitEvent: SubmitEvent) => {
      submitEvent.preventDefault()

      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doAddIntermentDepth`,
        formElement,
        (responseJSON: IntermentDepthResponseJSON) => {
          if (responseJSON.success) {
            intermentDepths = responseJSON.intermentDepths
            renderIntermentDepths()

            formElement.reset()
            formElement.querySelector('input')?.focus()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Interment Depth',

              message: responseJSON.errorMessage ?? ''
            })
          }
        }
      )
    })

  renderIntermentDepths()
})()
