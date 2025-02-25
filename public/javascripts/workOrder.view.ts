import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

  const reopenWorkOrderButtonElement: HTMLButtonElement | null =
    document.querySelector('#button--reopenWorkOrder')

  if (reopenWorkOrderButtonElement !== null) {
    const workOrderId = reopenWorkOrderButtonElement.dataset.workOrderId ?? ''

    reopenWorkOrderButtonElement.addEventListener('click', () => {
      function doReopen(): void {
        cityssm.postJSON(
          `${los.urlPrefix}/workOrders/doReopenWorkOrder`,
          {
            workOrderId
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
            }

            if (responseJSON.success) {
              globalThis.location.href = los.getWorkOrderURL(
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
  }
})()
