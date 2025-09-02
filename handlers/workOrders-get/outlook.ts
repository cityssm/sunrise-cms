import type { Request, Response } from 'express'

import { getApplicationUrl } from '../../helpers/application.helpers.js'
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'

export default function handler(request: Request, response: Response): void {
  const workOrderTypes = getCachedWorkOrderTypes()
  const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

  const applicationUrl = getApplicationUrl(request)

  response.render('workOrder-outlook', {
    headTitle: 'Work Order Outlook Integration',

    workOrderMilestoneTypes,
    workOrderTypes,

    applicationUrl
  })
}
