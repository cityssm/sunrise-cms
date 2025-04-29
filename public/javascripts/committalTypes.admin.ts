import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { CommittalType } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const exports: {
  sunrise: Sunrise

  committalTypes?: CommittalType[]
}

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
;(() => {
  const sunrise = exports.sunrise as Sunrise

  let committalTypes = exports.committalTypes as CommittalType[]
  delete exports.committalTypes

  type CommittalTypeResponseJSON =
    | {
        success: false
        errorMessage?: string
      }
    | {
        success: true
        committalTypes: CommittalType[]
      }

  function updateCommittalType(submitEvent: SubmitEvent): void {
    submitEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doUpdateCommittalType`,
      submitEvent.currentTarget,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as CommittalTypeResponseJSON

        if (responseJSON.success) {
          committalTypes = responseJSON.committalTypes

          bulmaJS.alert({
            message: 'Committal Type Updated Successfully',
            contextualColorName: 'success'
          })
        } else {
          bulmaJS.alert({
            title: 'Error Updating Committal Type',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function deleteCommittalType(clickEvent: Event): void {
    const tableRowElement = (clickEvent.currentTarget as HTMLElement).closest(
      'tr'
    ) as HTMLTableRowElement

    const committalTypeId = tableRowElement.dataset.committalTypeId

    function doDelete(): void {
      cityssm.postJSON(
        `${sunrise.urlPrefix}/admin/doDeleteCommittalType`,
        {
          committalTypeId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as CommittalTypeResponseJSON

          if (responseJSON.success) {
            committalTypes = responseJSON.committalTypes

            if (committalTypes.length === 0) {
              renderCommittalTypes()
            } else {
              tableRowElement.remove()
            }

            bulmaJS.alert({
              message: 'Committal Type Deleted Successfully',
              contextualColorName: 'success'
            })
          } else {
            bulmaJS.alert({
              title: 'Error Deleting Committal Type',
              message: responseJSON.errorMessage ?? '',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete Committal Type',
      message: `Are you sure you want to delete this type?<br />
          Note that no contracts will be removed.`,
      messageIsHtml: true,
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Type',
        callbackFunction: doDelete
      }
    })
  }

  function moveCommittalType(clickEvent: MouseEvent): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const tableRowElement = buttonElement.closest('tr') as HTMLTableRowElement

    const committalTypeId = tableRowElement.dataset.committalTypeId

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/${
        buttonElement.dataset.direction === 'up'
          ? 'doMoveCommittalTypeUp'
          : 'doMoveCommittalTypeDown'
      }`,
      {
        committalTypeId,
        moveToEnd: clickEvent.shiftKey ? '1' : '0'
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as CommittalTypeResponseJSON

        if (responseJSON.success) {
          committalTypes = responseJSON.committalTypes
          renderCommittalTypes()
        } else {
          bulmaJS.alert({
            title: 'Error Moving Committal Type',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function renderCommittalTypes(): void {
    const containerElement = document.querySelector(
      '#container--committalTypes'
    ) as HTMLTableSectionElement

    if (committalTypes.length === 0) {
      containerElement.innerHTML = `<tr><td colspan="2">
          <div class="message is-warning">
            <p class="message-body">There are no active committal types.</p>
          </div>
          </td></tr>`

      return
    }

    containerElement.innerHTML = ''

    for (const committalType of committalTypes) {
      const tableRowElement = document.createElement('tr')

      tableRowElement.dataset.committalTypeId =
        committalType.committalTypeId.toString()

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = `<td>
        <form>
          <input name="committalTypeId" type="hidden" value="${committalType.committalTypeId.toString()}" />
          <div class="field has-addons">
            <div class="control is-expanded">
              <input class="input" name="committalType" type="text"
                value="${cityssm.escapeHTML(committalType.committalType)}"
                aria-label="Committal Type" maxlength="100" required />
            </div>
            <div class="control">
              <button class="button is-success" type="submit" aria-label="Save">
                <span class="icon"><i class="fas fa-save" aria-hidden="true"></i></span>
              </button>
            </div>
          </div>
        </form>
      </td><td class="is-nowrap">
        <div class="field is-grouped">
          <div class="control">
            ${sunrise.getMoveUpDownButtonFieldHTML(
              'button--moveCommittalTypeUp',
              'button--moveCommittalTypeDown',
              false
            )}
          </div>
          <div class="control">
            <button class="button is-danger is-light button--deleteCommittalType" data-tooltip="Delete Type" type="button" aria-label="Delete Type">
              <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
            </button>
          </div>
        </div>
      </td>`

      tableRowElement
        .querySelector('form')
        ?.addEventListener('submit', updateCommittalType)
      ;(
        tableRowElement.querySelector(
          '.button--moveCommittalTypeUp'
        ) as HTMLButtonElement
      ).addEventListener('click', moveCommittalType)
      ;(
        tableRowElement.querySelector(
          '.button--moveCommittalTypeDown'
        ) as HTMLButtonElement
      ).addEventListener('click', moveCommittalType)

      tableRowElement
        .querySelector('.button--deleteCommittalType')
        ?.addEventListener('click', deleteCommittalType)

      containerElement.append(tableRowElement)
    }
  }
  ;(
    document.querySelector('#form--addCommittalType') as HTMLFormElement
  ).addEventListener('submit', (submitEvent: SubmitEvent) => {
    submitEvent.preventDefault()

    const formElement = submitEvent.currentTarget as HTMLFormElement

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doAddCommittalType`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as CommittalTypeResponseJSON

        if (responseJSON.success) {
          committalTypes = responseJSON.committalTypes
          renderCommittalTypes()
          formElement.reset()
          formElement.querySelector('input')?.focus()
        } else {
          bulmaJS.alert({
            title: 'Error Adding Committal Type',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  })

  renderCommittalTypes()
})()
