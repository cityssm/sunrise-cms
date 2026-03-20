import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoRestoreFuneralHomeResponse } from '../../handlers/funeralHomes-post/doRestoreFuneralHome.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
}
;(() => {
  const sunrise = exports.sunrise

  document
    .querySelector('button.is-restore-funeral-home-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      const buttonElement = clickEvent.currentTarget as HTMLButtonElement

      const funeralHomeId = buttonElement.dataset.funeralHomeId ?? ''

      if (funeralHomeId === '') {
        return
      }

      function doRestore(): void {
        cityssm.postJSON(
          `${sunrise.urlPrefix}/funeralHomes/doRestoreFuneralHome`,
          { funeralHomeId },
          (responseJSON: DoRestoreFuneralHomeResponse) => {
            if (responseJSON.success) {
              globalThis.location.reload()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                message: 'Error Restoring Funeral Home'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Restore Funeral Home',

        message:
          'Are you sure you want to restore this funeral home? It will be visible again.',

        okButton: {
          callbackFunction: doRestore,
          text: 'Yes, Restore Funeral Home'
        }
      })
    })
})()
