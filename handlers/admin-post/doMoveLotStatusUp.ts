import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getLotStatuses } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatusId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveRecordUpToTop('LotStatuses', request.body.burialSiteStatusId)
      : await moveRecordUp('LotStatuses', request.body.burialSiteStatusId)

  const lotStatuses = await getLotStatuses()

  response.json({
    success,
    lotStatuses
  })
}
