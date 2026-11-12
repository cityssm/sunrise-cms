import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddStatHolidayDateResponse } from '../../handlers/adminPost/doAddStatHolidayDate.js'
import type { DoRemoveStatHolidayDateResponse } from '../../handlers/adminPost/doRemoveStatHolidayDate.js'
import type { DoUpdateStatHolidaysResponse } from '../../handlers/adminPost/doUpdateStatHolidays.js'

import type { Sunrise } from './types.js'

declare const cityssm: CityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
}

{
  const sunrise = exports.sunrise

  const statHolidaySettingsFormElement = document.querySelector(
    '#form--statHolidaySettings'
  ) as HTMLFormElement

  statHolidaySettingsFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doUpdateStatHolidays`,
      statHolidaySettingsFormElement,
      (responseJSON: DoUpdateStatHolidaysResponse) => {
        if (responseJSON.success) {
          globalThis.location.reload()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Unable to Save',
            message: 'There was an error saving the stat holiday settings.'
          })
        }
      }
    )
  })

  const actionFormElements = document.querySelectorAll('.statHolidayActionForm')

  for (const actionFormElement of actionFormElements) {
    actionFormElement.addEventListener('submit', (formEvent) => {
      formEvent.preventDefault()

      const formElement = formEvent.currentTarget as HTMLFormElement
      const requestUrl = formElement.dataset.url

      if (requestUrl === undefined) {
        return
      }

      cityssm.postJSON(
        requestUrl,
        formElement,
        (
          responseJSON:
            | DoAddStatHolidayDateResponse
            | DoRemoveStatHolidayDateResponse
        ) => {
          if (responseJSON.success) {
            globalThis.location.reload()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Unable to Save',
              message: 'There was an error saving the stat holiday settings.'
            })
          }
        }
      )
    })
  }
}
