import { dateToInteger, dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'
import type { WorkOrder } from '../../types/record.types.js'
import { i18next } from '../../helpers/i18n.helpers.js'

export default function handler(request: Request, response: Response): void {
  const currentDate = new Date()

  const workOrder: Partial<WorkOrder> = {
    workOrderOpenDate: dateToInteger(currentDate),
    workOrderOpenDateString: dateToString(currentDate)
  }

  const workOrderTypes = getCachedWorkOrderTypes()

  response.render('workOrders/edit', {
    headTitle: i18next.t('workOrders:newWorkOrder', { lng: response.locals.lng }),

    workOrder,

    isCreate: true,
    workOrderTypes
  })
}
