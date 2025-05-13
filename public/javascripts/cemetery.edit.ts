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
          setUnsavedChanges()
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
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Cemetery Updated Successfully',
            })
          }
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Updating Cemetery',

            message: responseJSON.errorMessage ?? '',
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
                contextualColorName: 'danger',
                title: 'Error Deleting Cemetery',

                message: responseJSON.errorMessage ?? ''
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Delete Cemetery',

        message: 'Are you sure you want to delete this cemetery <strong>and all related burial sites</strong>?',
        messageIsHtml: true,

        okButton: {
          callbackFunction: doDelete,
          text: 'Yes, Delete Cemetery and Burial Sites'
        }
      })
    })

  /*
   * Directions of Arrival
   */

  function toggleDirectionOfArrivalDescription(clickEvent: Event): void {
    const checkboxElement = clickEvent.currentTarget as HTMLInputElement

    const descriptionElement = document.querySelector(
      `#cemetery--directionOfArrivalDescription_${checkboxElement.value}`
    ) as HTMLInputElement

    if (checkboxElement.checked) {
      descriptionElement.removeAttribute('disabled')
      descriptionElement.focus()
    } else {
      descriptionElement.setAttribute('disabled', 'disabled')
      // descriptionElement.value = ''
    }

    setUnsavedChanges()
  }

  const directionOfArrivalCheckboxElements: NodeListOf<HTMLInputElement> =
    // eslint-disable-next-line no-secrets/no-secrets
    document.querySelectorAll('input[name^="directionOfArrival_"]')

  for (const checkboxElement of directionOfArrivalCheckboxElements) {
    checkboxElement.addEventListener(
      'change',
      toggleDirectionOfArrivalDescription
    )
  }
})()
