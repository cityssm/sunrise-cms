import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  document
    .querySelector('#button--reopenWorkOrder')
    ?.addEventListener('click', (clickEvent) => {
      const workOrderId =
        (clickEvent.currentTarget as HTMLButtonElement).dataset.workOrderId ??
        ''

      function doReopen(): void {
        cityssm.postJSON(
          `${sunrise.urlPrefix}/workOrders/doReopenWorkOrder`,
          {
            workOrderId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
            }

            if (responseJSON.success) {
              globalThis.location.href = sunrise.getWorkOrderURL(
                workOrderId,
                true,
                true
              )
            } else {
              bulmaJS.alert({
                title: 'Error Reopening Work Order',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        title: 'Reopen Work Order',
        message:
          'Are you sure you want to remove the close date from this work order and reopen it?',
        contextualColorName: 'warning',
        okButton: {
          text: 'Yes, Reopen Work Order',
          callbackFunction: doReopen
        }
      })
    })
})()
