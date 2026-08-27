import { dateToInteger, dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'
import { i18next } from '../../helpers/i18n.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

export default function handler(request: Request, response: Response): void {
  const currentDate = new Date()

    const workOrderTypes = getCachedWorkOrderTypes()
    const workOrderStatuses = getCachedWorkOrderStatuses()

  const workOrder: Partial<WorkOrder> = {
    workOrderStatusId: workOrderStatuses.length > 0 ? workOrderStatuses[0].workOrderStatusId : undefined,
    workOrderTypeId: workOrderTypes.length > 0 ? workOrderTypes[0].workOrderTypeId : undefined,

    workOrderOpenDate: dateToInteger(currentDate),
    workOrderOpenDateString: dateToString(currentDate)
  }

  response.render('workOrders/edit', {
    headTitle: i18next.t('workOrders.newWorkOrder', {
      lng: response.locals.lng
    }),

    workOrder,

    isCreate: true,
    workOrderStatuses,
    workOrderTypes
  })
}
