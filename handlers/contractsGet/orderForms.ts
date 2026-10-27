import type { Request, Response } from 'express'

import { getUnprocessedOrderFormCount } from '../../database/getOrderForms.js'
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js'
import { getCachedSetting } from '../../helpers/cache/settings.cache.js'
import { i18next } from '../../helpers/i18n.helpers.js'

export default function handler(request: Request, response: Response): void {
  const syncError = getCachedSetting('integrations.portal.syncError')

  const unprocessedOrderFormCount = getUnprocessedOrderFormCount()
  const contractTypes = getCachedContractTypes()

  response.render('contracts/orderForms', {
    headTitle: i18next.t('contracts.orderForms', {
      lng: response.locals.lng
    }),

    contractTypes,
    unprocessedOrderFormCount,

    syncError
  })
}
