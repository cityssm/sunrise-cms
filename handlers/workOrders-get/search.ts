import type { Request, Response } from 'express'

import { getWorkOrderTypes } from '../../helpers/cache.helpers.js'

export default function handler(request: Request, response: Response): void {
  const workOrderOpenDateString = request.query.workOrderOpenDateString

  const workOrderTypes = getWorkOrderTypes()

  response.render('workOrder-search', {
    headTitle: 'Work Order Search',

    workOrderOpenDateString,
    workOrderTypes
  })
}
