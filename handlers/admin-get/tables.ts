import type { Request, Response } from 'express'

import {
  getBurialSiteStatuses,
  getCommittalTypes,
  getIntermentContainerTypes,
  getWorkOrderMilestoneTypes,
  getWorkOrderTypes
} from '../../helpers/cache.helpers.js'

export default function handler(_request: Request, response: Response): void {
  const burialSiteStatuses = getBurialSiteStatuses()
  const committalTypes = getCommittalTypes()
  const intermentContainerTypes = getIntermentContainerTypes()
  const workOrderMilestoneTypes = getWorkOrderMilestoneTypes()
  const workOrderTypes = getWorkOrderTypes()

  response.render('admin-tables', {
    headTitle: 'Config Table Management',

    burialSiteStatuses,
    committalTypes,
    intermentContainerTypes,
    workOrderMilestoneTypes,
    workOrderTypes
  })
}
