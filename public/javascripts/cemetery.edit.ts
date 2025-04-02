import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  const cemeteryId = (
    document.querySelector('#cemetery--cemeteryId') as HTMLInputElement
  ).value

  const isCreate = cemeteryId === ''

  /*
   * Cemetery Map
   */

  document
    .querySelector('#button--selectCoordinate')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      sunrise.openLeafletCoordinateSelectorModal({
        latitudeElement: document.querySelector(
          '#cemetery--cemeteryLatitude'
        ) as HTMLInputElement,
        longitudeElement: document.querySelector(
          '#cemetery--cemeteryLongitude'
        ) as HTMLInputElement,

        callbackFunction: () => {
          sunrise.setUnsavedChanges()
        }
      })
    })

  /*
   * Cemetery Form
   */

  const cemeteryForm = document.querySelector(
    '#form--cemetery'
  ) as HTMLFormElement

  function setUnsavedChanges(): void {
    sunrise.setUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--cemetery']")
      ?.classList.remove('is-light')
  }

  function clearUnsavedChanges(): void {
    sunrise.clearUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--cemetery']")
      ?.classList.add('is-light')
  }

  function updateCemetery(formEvent: SubmitEvent): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/cemeteries/${isCreate ? 'doCreateCemetery' : 'doUpdateCemetery'}`,
      cemeteryForm,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          cemeteryId?: number
          doRebuildBurialSiteNames?: boolean
          errorMessage?: string
        }

        if (responseJSON.success) {
          clearUnsavedChanges()

          if (isCreate) {
            globalThis.location.href = sunrise.getCemeteryURL(
              responseJSON.cemeteryId,
              true
            )
          } else {
            if (responseJSON.doRebuildBurialSiteNames ?? false) {
              bulmaJS.alert({
                message: `<strong>Cemetery Updated Successfully</strong><br />
                  Note that rebuilding burial site names may take a few minutes.`,
                messageIsHtml: true,
                contextualColorName: 'warning'
              })
            } else {

              bulmaJS.alert({
                message: 'Cemetery Updated Successfully',
                contextualColorName: 'success'
              })
            }
          }
        } else {
          bulmaJS.alert({
            title: 'Error Updating Cemetery',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  cemeteryForm.addEventListener('submit', updateCemetery)

  const inputElements: NodeListOf<HTMLInputElement | HTMLSelectElement> =
    cemeteryForm.querySelectorAll('input, select')

  for (const inputElement of inputElements) {
    inputElement.addEventListener('change', setUnsavedChanges)
  }

  document
    .querySelector('#button--deleteCemetery')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      function doDelete(): void {
        cityssm.postJSON(
          `${sunrise.urlPrefix}/cemeteries/doDeleteCemetery`,
          {
            cemeteryId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
            }

            if (responseJSON.success) {
              globalThis.location.href = sunrise.getCemeteryURL()
            } else {
              bulmaJS.alert({
                title: 'Error Deleting Cemetery',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: 'Delete Cemetery',
        message:
          'Are you sure you want to delete this cemetery and all related burial sites?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Delete Cemetery',
          callbackFunction: doDelete
        }
      })
    })
})()
