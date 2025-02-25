import type { Request, Response } from 'express'

import deleteWorkOrderBurialSite from '../../database/deleteWorkOrderBurialSite.js'
import getBurialSites from '../../database/getBurialSites.js'

export default async function handler(
  request: Request<unknown, unknown, { workOrderId: string; burialSiteId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteWorkOrderBurialSite(
    request.body.workOrderId,
    request.body.burialSiteId,
    request.session.user as User
  )

  const results = await getBurialSites(
    {
      workOrderId: request.body.workOrderId
    },
    {
      limit: -1,
      offset: 0,
      includeBurialSiteContractCount: false
    }
  )

  response.json({
    success,
    workOrderBurialSites: results.burialSites
  })
}
