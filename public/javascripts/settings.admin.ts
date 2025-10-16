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

  /*
   * Filter Settings
   */

  const settingsFilterElement = document.querySelector(
    '#settingsFilter'
  ) as HTMLInputElement

  const settingsTableBodyElement = document.querySelector(
    '#settingsTableBody'
  ) as HTMLTableSectionElement

  function applySettingsFilter(): void {
    const filterValue = settingsFilterElement.value.toLowerCase()
    for (const rowElement of settingsTableBodyElement.querySelectorAll('tr')) {
      const searchString = rowElement.dataset.searchString ?? ''
      rowElement.classList.toggle(
        'is-hidden',
        !searchString.includes(filterValue)
      )
    }
  }

  settingsFilterElement.addEventListener('input', applySettingsFilter)

  applySettingsFilter()

  /*
   * Update Settings
   */

  function highlightChangedSettings(changeEvent: Event): void {
    const inputElement = changeEvent.currentTarget as
      | HTMLInputElement
      | HTMLSelectElement

    inputElement.classList.add('has-background-warning-light')
  }

  function updateSetting(formEvent: Event): void {
    formEvent.preventDefault()

    const formElement = formEvent.currentTarget as HTMLFormElement

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doUpdateSetting`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          errorMessage?: string
          success: boolean
        }

        if (responseJSON.success) {
          bulmaJS.alert({
            contextualColorName: 'success',
            title: 'Setting Updated',

            message: 'The setting has been successfully updated.'
          })

          formElement
            .querySelector('.input, select')
            ?.classList.remove('has-background-warning-light')
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Update Failed',

            message:
              responseJSON.errorMessage ??
              'There was an error updating the setting.'
          })
        }
      }
    )
  }

  const settingFormElements = document.querySelectorAll('.settingForm')

  for (const settingFormElement of settingFormElements) {
    settingFormElement.addEventListener('submit', updateSetting)

    settingFormElement
      .querySelector('.input, select')
      ?.addEventListener('change', highlightChangedSettings)
  }
})()
