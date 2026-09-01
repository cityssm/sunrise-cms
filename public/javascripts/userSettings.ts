/* eslint-disable runtime-cleanup/no-unmanaged-event-listeners */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoResetApiKeyResponse } from '../../handlers/dashboardPost/doResetApiKey.js'
import type { DoUpdateConsignoCloudUserSettingsResponse } from '../../handlers/dashboardPost/doUpdateConsignoCloudUserSettings.js'

import type { Sunrise } from './types.js'

declare const cityssm: CityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
}

{
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
        (responseJSON: DoUpdateConsignoCloudUserSettingsResponse) => {
          if (!responseJSON.success) {
            return
          }

          bulmaJS.alert({
            message: 'ConsignO Cloud Settings updated successfully.'
          })
          ;(
            formElement.querySelector(
              'input[name="thirdPartyApplicationPassword"]'
            ) as HTMLInputElement
          ).value = ''
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
      (responseJSON: DoResetApiKeyResponse) => {
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
}
