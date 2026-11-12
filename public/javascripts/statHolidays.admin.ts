import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddStatHolidayDateResponse } from '../../handlers/adminPost/doAddStatHolidayDate.js'
import type { DoGetStatHolidayLocationOptionsResponse } from '../../handlers/adminPost/doGetStatHolidayLocationOptions.js'
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
  const countrySelectElement = statHolidaySettingsFormElement.querySelector(
    '#country'
  ) as HTMLSelectElement
  const stateSelectElement = statHolidaySettingsFormElement.querySelector(
    '#state'
  ) as HTMLSelectElement
  const regionSelectElement = statHolidaySettingsFormElement.querySelector(
    '#region'
  ) as HTMLSelectElement

  function updateSelectOptions(
    selectElement: HTMLSelectElement,
    options: Record<string, string>,
    selectedValue = ''
  ): void {
    selectElement.innerHTML = ''
    selectElement.add(new Option('(None)', ''))

    for (const [optionValue, optionLabel] of Object.entries(options)) {
      selectElement.add(new Option(`${optionLabel} (${optionValue})`, optionValue))
    }

    selectElement.value =
      options[selectedValue] === undefined ? '' : selectedValue
  }

  function refreshLocationOptions(refreshMode: 'country' | 'state'): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doGetStatHolidayLocationOptions`,
      {
        country: countrySelectElement.value,
        state: stateSelectElement.value
      },
      (responseJSON: DoGetStatHolidayLocationOptionsResponse) => {
        if (!responseJSON.success) {
          return
        }

        const selectedState =
          refreshMode === 'country' ? '' : stateSelectElement.value

        updateSelectOptions(
          stateSelectElement,
          responseJSON.states,
          selectedState
        )

        const selectedRegion =
          refreshMode === 'country' || refreshMode === 'state'
            ? ''
            : regionSelectElement.value

        updateSelectOptions(
          regionSelectElement,
          responseJSON.regions,
          selectedRegion
        )
      }
    )
  }

  countrySelectElement.addEventListener('change', () => {
    stateSelectElement.value = ''
    refreshLocationOptions('country')
  })

  stateSelectElement.addEventListener('change', () => {
    regionSelectElement.value = ''
    refreshLocationOptions('state')
  })

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
