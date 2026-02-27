import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoReopenWorkOrderResponse } from '../../handlers/workOrders-post/doReopenWorkOrder.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
}
;(() => {
  const sunrise = exports.sunrise

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
          (responseJSON: DoReopenWorkOrderResponse) => {
            if (responseJSON.success) {
              globalThis.location.href = sunrise.getWorkOrderUrl(
                workOrderId,
                true,
                true
              )
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                message: 'Error Reopening Work Order'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Reopen Work Order',

        message:
          'Are you sure you want to remove the close date from this work order and reopen it?',

        okButton: {
          callbackFunction: doReopen,
          text: 'Yes, Reopen Work Order'
        }
      })
    })
})()
