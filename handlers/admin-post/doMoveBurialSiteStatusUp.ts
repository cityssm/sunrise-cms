import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js'

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
      ? await moveRecordUpToTop(
          'BurialSiteStatuses',
          request.body.burialSiteStatusId
        )
      : await moveRecordUp(
          'BurialSiteStatuses',
          request.body.burialSiteStatusId
        )

  const burialSiteStatuses = await getBurialSiteStatuses()

  response.json({
    success,
    burialSiteStatuses
  })
}
