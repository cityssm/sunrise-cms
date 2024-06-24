import type { Request, Response } from 'express'

import { getWorkOrder } from '../../database/getWorkOrder.js'
import { getConfigProperty } from '../../helpers/functions.config.js'

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

  response.render('workOrder-view', {
    headTitle: `Work Order #${workOrder.workOrderNumber}`,
    workOrder
  })
}
