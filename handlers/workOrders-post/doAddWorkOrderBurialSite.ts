import type { Request, Response } from 'express'

import addWorkOrderBurialSite from '../../database/addWorkOrderBurialSite.js'
import getBurialSites from '../../database/getBurialSites.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteId: string; workOrderId: string }
  >,
  response: Response
): void {
  const success = addWorkOrderBurialSite(
    {
      burialSiteId: request.body.burialSiteId,
      workOrderId: request.body.workOrderId
    },
    request.session.user as User
  )

  const results = getBurialSites(
    {
      workOrderId: request.body.workOrderId
    },
    {
      limit: -1,
      offset: 0,

      includeContractCount: false
    }
  )

  response.json({
    success,
    workOrderBurialSites: results.burialSites
  })
}
