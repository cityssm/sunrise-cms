import type { Request, Response } from 'express'

import addRecord from '../../database/addRecord.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteType: string; orderNumber?: number | string }
  >,
  response: Response
): Promise<void> {
  const burialSiteTypeId = await addRecord(
    'BurialSiteTypes',
    request.body.burialSiteType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const burialSiteTypes = await getBurialSiteTypes()

  response.json({
    success: true,
    
    burialSiteTypeId,
    burialSiteTypes
  })
}
