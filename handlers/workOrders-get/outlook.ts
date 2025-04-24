import type { Request, Response } from 'express'

import {
  getWorkOrderMilestoneTypes,
  getWorkOrderTypes
} from '../../helpers/functions.cache.js'

export default function handler(request: Request, response: Response): void {
  const workOrderTypes = getWorkOrderTypes()
  const workOrderMilestoneTypes = getWorkOrderMilestoneTypes()

  response.render('workOrder-outlook', {
    headTitle: 'Work Order Outlook Integration',

    workOrderMilestoneTypes,
    workOrderTypes
  })
}
