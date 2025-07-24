import type { Request, Response } from 'express'

import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'

export default function handler(request: Request, response: Response): void {
  const workOrderOpenDateString = request.query.workOrderOpenDateString

  const workOrderTypes = getCachedWorkOrderTypes()

  response.render('workOrder-search', {
    headTitle: 'Work Order Search',

    workOrderOpenDateString,
    workOrderTypes
  })
}
