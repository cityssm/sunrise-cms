import type { Request, Response } from 'express'

import addWorkOrderBurialSite from '../../database/addWorkOrderBurialSite.js'
import getBurialSites from '../../database/getBurialSites.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteId: string; workOrderId: string; }
  >,
  response: Response
): Promise<void> {
  const success = await addWorkOrderBurialSite(
    {
      burialSiteId: request.body.burialSiteId,
      workOrderId: request.body.workOrderId
    },
    request.session.user as User
  )

  const results = await getBurialSites(
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
