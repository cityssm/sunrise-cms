import type { Request, Response } from 'express'

import {
  getBurialSiteStatuses,
  getWorkOrderMilestoneTypes,
  getWorkOrderTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const workOrderTypes = await getWorkOrderTypes()
  const workOrderMilestoneTypes = await getWorkOrderMilestoneTypes()
  const burialSiteStatuses = await getBurialSiteStatuses()

  response.render('admin-tables', {
    headTitle: 'Config Table Management',
    workOrderTypes,
    workOrderMilestoneTypes,
    burialSiteStatuses
  })
}
