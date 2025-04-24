import type { Request, Response } from 'express'

import addRecord from '../../database/addRecord.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteType: string; orderNumber?: number | string }
  >,
  response: Response
): void {
  const burialSiteTypeId = addRecord(
    'BurialSiteTypes',
    request.body.burialSiteType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const burialSiteTypes = getBurialSiteTypes()

  response.json({
    success: true,

    burialSiteTypeId,
    burialSiteTypes
  })
}
