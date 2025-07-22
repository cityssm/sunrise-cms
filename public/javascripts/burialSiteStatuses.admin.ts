import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { BurialSiteStatus } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const exports: {
  sunrise: Sunrise

  burialSiteStatuses?: BurialSiteStatus[]
}

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
;(() => {
  const sunrise = exports.sunrise

  let burialSiteStatuses = exports.burialSiteStatuses as BurialSiteStatus[]
  delete exports.burialSiteStatuses

  type BurialSiteStatusResponseJSON =
    | {
        errorMessage?: string
        success: false
      }
    | {
        success: true

        burialSiteStatuses: BurialSiteStatus[]
      }

  function updateBurialSiteStatus(submitEvent: SubmitEvent): void {
    submitEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doUpdateBurialSiteStatus`,
      submitEvent.currentTarget,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as BurialSiteStatusResponseJSON

        if (responseJSON.success) {
          burialSiteStatuses = responseJSON.burialSiteStatuses

          bulmaJS.alert({
            contextualColorName: 'success',
            message: 'Burial Site Status Updated Successfully'
          })
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Updating Burial Site Status',

            message: responseJSON.errorMessage ?? ''
          })
        }
      }
    )
  }

  function deleteBurialSiteStatus(clickEvent: Event): void {
    const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const burialSiteStatusId = tableRowElement.dataset.burialSiteStatusId

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doDeleteBurialSiteStatus`,
        {
          burialSiteStatusId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as BurialSiteStatusResponseJSON

          if (responseJSON.success) {
            burialSiteStatuses = responseJSON.burialSiteStatuses

            if (burialSiteStatuses.length === 0) {
              renderBurialSiteStatuses()
            } else {
              tableRowElement.remove()
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Burial Site Status Deleted Successfully'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Burial Site Status',

              message: responseJSON.errorMessage ?? ''
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Burial Site Status',

      message: `Are you sure you want to delete this status?<br />
          Note that no burial sites will be removed.`,
      messageIsHtml: true,

      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete Status'
      }
    })
  }

  function moveBurialSiteStatus(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

    const burialSiteStatusId = tableRowElement.dataset.burialSiteStatusId

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveBurialSiteStatusUp'
          : 'doMoveBurialSiteStatusDown'
      }`,
      {
        burialSiteStatusId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as BurialSiteStatusResponseJSON

        if (responseJSON.success) {
          burialSiteStatuses = responseJSON.burialSiteStatuses
          renderBurialSiteStatuses()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Moving Burial Site Status',

            message: responseJSON.errorMessage ?? ''
          })
        }
      }
    )
  }

  function renderBurialSiteStatuses(): void {
    const containerElement = document.querySelector(
      '#container--burialSiteStatuses'
    ) as HTMLTableSectionElement

    if (burialSiteStatuses.length === 0) {
      containerElement.innerHTML = `<tr><td colspan="2">
          <div class="message is-warning">
            <p class="message-body">There are no active burial site statuses.</p>
          </div>
          </td></tr>`

      return
    }

    containerElement.innerHTML = ''

    for (const burialSiteStatus of burialSiteStatuses) {
      const tableRowElement = document.createElement('tr')

      tableRowElement.dataset.burialSiteStatusId =
        burialSiteStatus.burialSiteStatusId.toString()

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = `<td>
        <form>
          <input name="burialSiteStatusId" type="hidden" value="${burialSiteStatus.burialSiteStatusId.toString()}" />
          <div class="field has-addons">
            <div class="control is-expanded">
              <input class="input" name="burialSiteStatus" type="text"
                value="${cityssm.escapeHTML(burialSiteStatus.burialSiteStatus)}"
                aria-label="Burial Site Status" maxlength="100" required />
            </div>
            <div class="control">
              <button class="button is-success" type="submit" aria-label="Save">
                <span class="icon"><i class="fa-solid fa-save"></i></span>
              </button>
            </div>
          </div>
        </form>
      </td><td class="is-nowrap">
        <div class="field is-grouped">
          <div class="control">
            ${sunrise.getMoveUpDownButtonFieldHTML(
              'button--moveBurialSiteStatusUp',
              'button--moveBurialSiteStatusDown',
              false
            )}
          </div>
          <div class="control">
            <button class="button is-danger is-light button--deleteBurialSiteStatus" data-tooltip="Delete Status" type="button" aria-label="Delete Status">
              <span class="icon"><i class="fa-solid fa-trash"></i></span>
            </button>
          </div>
        </div>
      </td>`

      tableRowElement
        .querySelector('form')
        ?.addEventListener('submit', updateBurialSiteStatus)
      ;(
        tableRowElement.querySelector(
          '.button--moveBurialSiteStatusUp'
        ) as HTMLButtonElement
      ).addEventListener('click', moveBurialSiteStatus)
      ;(
        tableRowElement.querySelector(
          '.button--moveBurialSiteStatusDown'
        ) as HTMLButtonElement
      ).addEventListener('click', moveBurialSiteStatus)

      tableRowElement
        .querySelector('.button--deleteBurialSiteStatus')
        ?.addEventListener('click', deleteBurialSiteStatus)

      containerElement.append(tableRowElement)
    }
  }
  ;(
    document.querySelector('#form--addBurialSiteStatus') as HTMLFormElement
  ).addEventListener('submit', (submitEvent: SubmitEvent) => {
    submitEvent.preventDefault()

    const formElement = submitEvent.currentTarget as HTMLFormElement

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doAddBurialSiteStatus`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as BurialSiteStatusResponseJSON

        if (responseJSON.success) {
          burialSiteStatuses = responseJSON.burialSiteStatuses
          renderBurialSiteStatuses()
          formElement.reset()
          formElement.querySelector('input')?.focus()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Adding Burial Site Status',

            message: responseJSON.errorMessage ?? ''
          })
        }
      }
    )
  })

  renderBurialSiteStatuses()
})()
