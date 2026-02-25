import type { Request, Response } from 'express'

import getWorkOrder from '../../database/getWorkOrder.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { i18next } from '../../helpers/i18n.helpers.js'
import { getWorkOrderWorkDayRanges } from '../../helpers/settings.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const workOrder = await getWorkOrder(request.params.workOrderId, {
    includeBurialSites: true,
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

  const workOrderTypes = getCachedWorkOrderTypes()

  const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

  const burialSiteStatuses = getCachedBurialSiteStatuses()

  const workOrderWorkDayRanges = getWorkOrderWorkDayRanges()

  response.render('workOrders/edit', {
    headTitle: i18next.t('workOrders:workOrderTitle', {
      number: workOrder.workOrderNumber,
      lng: response.locals.lng
    }),

    workOrder,

    burialSiteStatuses,
    isCreate: false,
    workOrderMilestoneTypes,
    workOrderTypes,
    workOrderWorkDayRanges
  })
}
