import type { Request, Response } from 'express'

import getWorkOrder from '../../database/getWorkOrder.js'
import {
  getBurialSiteStatuses,
  getWorkOrderMilestoneTypes,
  getWorkOrderTypes
} from '../../helpers/functions.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const workOrder = await getWorkOrder(request.params.workOrderId, {
    includeLotsAndLotOccupancies: true,
    includeComments: true,
    includeMilestones: true
  })

  if (workOrder === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/workOrders/?error=workOrderIdNotFound`
    )
    return
  }

  if (workOrder.workOrderCloseDate) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/workOrders/${workOrder.workOrderId.toString()}/?error=workOrderIsClosed`
    )
    return
  }

  const workOrderTypes = await getWorkOrderTypes()

  const workOrderMilestoneTypes = await getWorkOrderMilestoneTypes()

  const lotStatuses = await getBurialSiteStatuses()

  response.render('workOrder-edit', {
    headTitle: `Work Order #${workOrder.workOrderNumber}`,
    workOrder,
    isCreate: false,
    workOrderTypes,
    workOrderMilestoneTypes,
    lotStatuses
  })
}
