import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
}
;(() => {
  const sunrise = exports.sunrise

  /*
   * ConsignO Cloud
   */

  document
    .querySelector('#userSettingsForm--consignoCloud')
    ?.addEventListener('submit', (event) => {
      event.preventDefault()

      const formElement = event.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${sunrise.urlPrefix}/dashboard/doUpdateConsignoCloudUserSettings`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (responseJSON.success) {
            bulmaJS.alert({
              message: 'ConsignO Cloud Settings updated successfully.'
            })
            ;(
              formElement.querySelector(
                // eslint-disable-next-line no-secrets/no-secrets
                'input[name="thirdPartyApplicationPassword"]'
              ) as HTMLInputElement
            ).value = ''
          }
        }
      )
    })

  /*
   * API Key
   */

  function doResetApiKey(): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/dashboard/doResetApiKey`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { apiKey?: string; success: boolean, }

        if (responseJSON.success) {
          bulmaJS.alert({
            contextualColorName: 'success',
            title: 'API Key Reset Successfully',

            message: 'Remember to update any applications using your API key.'
          })
        }
      }
    )
  }

  document
    .querySelector('#button--resetApiKey')
    ?.addEventListener('click', (event) => {
      event.preventDefault()

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Reset API Key',

        message: 'Are you sure you want to reset your API key?',

        okButton: {
          callbackFunction: doResetApiKey,
          text: 'Yes, Reset My API Key'
        }
      })
    })
})()
