import type { Request, Response } from 'express'

import getBurialSites from '../../database/getBurialSites.js'
import { updateBurialSiteStatus } from '../../database/updateBurialSite.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteId: string; burialSiteStatusId: string; workOrderId: string }
  >,
  response: Response
): Promise<void> {
  const success = await updateBurialSiteStatus(
    request.body.burialSiteId,
    request.body.burialSiteStatusId,
    request.session.user as User
  )

  const results = await getBurialSites(
    {
      workOrderId: request.body.workOrderId
    },
    {
      limit: -1,
      offset: 0,
      includeContractCount: true
    }
  )

  response.json({
    success,
    workOrderBurialSites: results.burialSites
  })
}
