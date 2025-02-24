import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import getLotOccupancyComments from '../../database/getLotOccupancyComments.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'LotOccupancyComments',
    request.body.burialSiteContractCommentId as string,
    request.session.user as User
  )

  const lotOccupancyComments = await getLotOccupancyComments(
    request.body.burialSiteContractId as string
  )

  response.json({
    success,
    lotOccupancyComments
  })
}
