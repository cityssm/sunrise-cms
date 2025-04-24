import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteStatusId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom(
          'BurialSiteStatuses',
          request.body.burialSiteStatusId
        )
      : moveRecordDown('BurialSiteStatuses', request.body.burialSiteStatusId)

  const burialSiteStatuses = getBurialSiteStatuses()

  response.json({
    success,

    burialSiteStatuses
  })
}
