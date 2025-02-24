import type { Request, Response } from 'express'

import { updateRecord } from '../../database/updateRecord.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { burialSiteTypeId: string; burialSiteType: string }>,
  response: Response
): Promise<void> {
  const success = await updateRecord(
    'BurialSiteTypes',
    request.body.burialSiteTypeId,
    request.body.burialSiteType,
    request.session.user as User
  )

  const burialSiteTypes = await getBurialSiteTypes()

  response.json({
    success,
    burialSiteTypes
  })
}
