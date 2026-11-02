import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { i18n } from 'i18next'

import type { DoDeleteOrderFormResponse } from '../../handlers/contractsPost/doDeleteOrderForm.js'
import type { DoProcessOrderFormResponse } from '../../handlers/contractsPost/doProcessOrderForm.js'

import type { Sunrise } from './types.js'

declare const cityssm: CityssmGlobal
declare const bulmaJS: BulmaJS
declare const i18next: i18n

declare const exports: {
  sunrise: Sunrise
}

{
  const sunrise = exports.sunrise

  const orderFormId = (
    document.querySelector('#orderForm--orderFormId') as HTMLInputElement | null
  )?.value

  if (orderFormId === undefined || orderFormId === '') {
    throw new Error('Order form id not found.')
  }

  function doProcess(): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/contracts/orderForms/${orderFormId}/doProcessOrderForm`,
      {},
      (responseJSON: DoProcessOrderFormResponse) => {
        if (responseJSON.success) {
          globalThis.location.reload()
          return
        }

        bulmaJS.alert({
          contextualColorName: 'danger',
          title: i18next.t('error'),
          message: responseJSON.errorMessage
        })
      }
    )
  }

  function doDelete(): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/contracts/orderForms/${orderFormId}/doDeleteOrderForm`,
      {},
      (responseJSON: DoDeleteOrderFormResponse) => {
        if (responseJSON.success) {
          globalThis.location.assign(`${sunrise.urlPrefix}/contracts/orderForms`)
          return
        }

        bulmaJS.alert({
          contextualColorName: 'danger',
          title: i18next.t('error'),
          message: responseJSON.errorMessage
        })
      }
    )
  }

  document
    .querySelector('#button--processOrderForm')
    ?.addEventListener('click', () => {
      bulmaJS.confirm({
        contextualColorName: 'info',
        title: i18next.t('contracts.orderFormsProcess'),
        message: i18next.t('contracts.processOrderFormWarning'),
        okButton: {
          callbackFunction: () => {
            globalThis.location.assign(
              `${sunrise.urlPrefix}/contracts/new?orderFormId=${encodeURIComponent(orderFormId)}`
            )
          },
          text: i18next.t('contracts.processOrderFormInNewContract')
        },
        cancelButton: {
          callbackFunction: doProcess,
          text: i18next.t('contracts.processOrderFormAsProcessed')
        }
      })
    })

  document
    .querySelector('#button--deleteOrderForm')
    ?.addEventListener('click', () => {
      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: i18next.t('contracts.orderFormsDelete'),
        message: i18next.t('contracts.deleteConfirmation'),
        okButton: {
          callbackFunction: doDelete,
          text: i18next.t('delete')
        }
      })
    })
}
