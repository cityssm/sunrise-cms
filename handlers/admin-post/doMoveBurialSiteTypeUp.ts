import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('BurialSiteTypes', request.body.burialSiteTypeId)
      : moveRecordUp('BurialSiteTypes', request.body.burialSiteTypeId)

  const burialSiteTypes = getBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
