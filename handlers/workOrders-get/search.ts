import type { Request, Response } from 'express'

import { getWorkOrderTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const workOrderOpenDateString = request.query.workOrderOpenDateString

  const workOrderTypes = await getWorkOrderTypes()

  response.render('workOrder-search', {
    headTitle: 'Work Order Search',

    workOrderOpenDateString,
    workOrderTypes
  })
}
