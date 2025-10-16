import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
}
;(() => {
  const sunrise = exports.sunrise

  const funeralHomeId = (
    document.querySelector('#funeralHome--funeralHomeId') as HTMLInputElement
  ).value
  const isCreate = funeralHomeId === ''

  const funeralHomeForm = document.querySelector(
    '#form--funeralHome'
  ) as HTMLFormElement

  function setUnsavedChanges(): void {
    sunrise.setUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--funeralHome']")
      ?.classList.remove('is-light')
  }

  function clearUnsavedChanges(): void {
    sunrise.clearUnsavedChanges()
    document
      .querySelector("button[type='submit'][form='form--funeralHome']")
      ?.classList.add('is-light')
  }

  function updateFuneralHome(formEvent: SubmitEvent): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/funeralHomes/${isCreate ? 'doCreateFuneralHome' : 'doUpdateFuneralHome'}`,
      funeralHomeForm,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          errorMessage?: string
          success: boolean

          funeralHomeId?: number
        }

        if (responseJSON.success) {
          clearUnsavedChanges()

          if (isCreate) {
            globalThis.location.href = sunrise.getFuneralHomeUrl(
              responseJSON.funeralHomeId,
              true
            )
          } else {
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Funeral Home Updated Successfully'
            })
          }
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Updating Funeral Home',

            message: responseJSON.errorMessage ?? ''
          })
        }
      }
    )
  }

  funeralHomeForm.addEventListener('submit', updateFuneralHome)

  const inputElements: NodeListOf<HTMLInputElement | HTMLSelectElement> =
    funeralHomeForm.querySelectorAll('input, select')

  for (const inputElement of inputElements) {
    inputElement.addEventListener('change', setUnsavedChanges)
  }

  document
    .querySelector('#button--deleteFuneralHome')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      function doDelete(): void {
        cityssm.postJSON(
          `${sunrise.urlPrefix}/funeralHomes/doDeleteFuneralHome`,
          {
            funeralHomeId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              errorMessage?: string
              success: boolean
            }

            if (responseJSON.success) {
              globalThis.location.href = sunrise.getFuneralHomeUrl()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Deleting Funeral Home',

                message: responseJSON.errorMessage ?? ''
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Delete Funeral Home',

        message: 'Are you sure you want to delete this funeral home?',
        okButton: {
          callbackFunction: doDelete,
          text: 'Yes, Delete Funeral Home'
        }
      })
    })
})()
