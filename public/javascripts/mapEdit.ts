import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

  const cemeteryId = (document.querySelector('#map--cemeteryId') as HTMLInputElement)
    .value
  const isCreate = cemeteryId === ''

  const mapForm = document.querySelector('#form--map') as HTMLFormElement

  function setUnsavedChanges(): void {
    los.setUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--map']")
      ?.classList.remove('is-light')
  }

  function clearUnsavedChanges(): void {
    los.clearUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--map']")
      ?.classList.add('is-light')
  }

  function updateMap(formEvent: SubmitEvent): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${los.urlPrefix}/maps/${isCreate ? 'doCreateMap' : 'doUpdateMap'}`,
      mapForm,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          cemeteryId?: number
          errorMessage?: string
        }

        if (responseJSON.success) {
          clearUnsavedChanges()

          if (isCreate) {
            globalThis.location.href = los.getMapURL(responseJSON.cemeteryId, true)
          } else {
            bulmaJS.alert({
              message: `${los.escapedAliases.Map} Updated Successfully`,
              contextualColorName: 'success'
            })
          }
        } else {
          bulmaJS.alert({
            title: `Error Updating ${los.escapedAliases.Map}`,
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  mapForm.addEventListener('submit', updateMap)

  const inputElements: NodeListOf<HTMLInputElement | HTMLSelectElement> =
    mapForm.querySelectorAll('input, select')

  for (const inputElement of inputElements) {
    inputElement.addEventListener('change', setUnsavedChanges)
  }

  document
    .querySelector('#button--deleteMap')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      function doDelete(): void {
        cityssm.postJSON(
          `${los.urlPrefix}/maps/doDeleteMap`,
          {
            cemeteryId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
            }

            if (responseJSON.success) {
              globalThis.location.href = los.getMapURL()
            } else {
              bulmaJS.alert({
                title: `Error Deleting ${los.escapedAliases.Map}`,
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: `Delete ${los.escapedAliases.Map}`,
        message: `Are you sure you want to delete this ${los.escapedAliases.map} and all related ${los.escapedAliases.lots}?`,
        contextualColorName: 'warning',
        okButton: {
          text: `Yes, Delete ${los.escapedAliases.Map}`,
          callbackFunction: doDelete
        }
      })
    })
})()
