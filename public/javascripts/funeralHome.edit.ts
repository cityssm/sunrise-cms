import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

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
          success: boolean
          funeralHomeId?: number
          errorMessage?: string
        }

        if (responseJSON.success) {
          clearUnsavedChanges()

          if (isCreate) {
            globalThis.location.href = sunrise.getFuneralHomeURL(
              responseJSON.funeralHomeId,
              true
            )
          } else {
            bulmaJS.alert({
              message: "Funeral Home Updated Successfully",
              contextualColorName: 'success'
            })
          }
        } else {
          bulmaJS.alert({
            title: "Error Updating Funeral Home",
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
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
              success: boolean
              errorMessage?: string
            }

            if (responseJSON.success) {
              globalThis.location.href = sunrise.getFuneralHomeURL()
            } else {
              bulmaJS.alert({
                title: "Error Deleting Funeral Home",
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: "Delete Funeral Home",
        message: "Are you sure you want to delete this funeral home?",
        contextualColorName: 'warning',
        okButton: {
          text: "Yes, Delete Funeral Home",
          callbackFunction: doDelete
        }
      })
    })
})()
