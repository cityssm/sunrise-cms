import { dateToInteger, dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'
import type { WorkOrder } from '../../types/record.types.js'

export default function handler(request: Request, response: Response): void {
  const currentDate = new Date()

  const workOrder: Partial<WorkOrder> = {
    workOrderOpenDate: dateToInteger(currentDate),
    workOrderOpenDateString: dateToString(currentDate)
  }

  const workOrderTypes = getCachedWorkOrderTypes()

  response.render('workOrders/edit', {
    headTitle: 'New Work Order',

    workOrder,

    isCreate: true,
    workOrderTypes
  })
}
