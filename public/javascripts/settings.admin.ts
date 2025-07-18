import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

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
          success: boolean
          errorMessage?: string
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
