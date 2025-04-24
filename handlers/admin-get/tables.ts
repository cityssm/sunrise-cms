import type { Request, Response } from 'express'

import {
  getBurialSiteStatuses,
  getWorkOrderMilestoneTypes,
  getWorkOrderTypes
} from '../../helpers/functions.cache.js'

export default function handler(_request: Request, response: Response): void {
  const workOrderTypes = getWorkOrderTypes()
  const workOrderMilestoneTypes = getWorkOrderMilestoneTypes()
  const burialSiteStatuses = getBurialSiteStatuses()

  response.render('admin-tables', {
    headTitle: 'Config Table Management',

    burialSiteStatuses,
    workOrderMilestoneTypes,
    workOrderTypes
  })
}
