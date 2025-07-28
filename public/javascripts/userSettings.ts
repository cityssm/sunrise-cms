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
})()
