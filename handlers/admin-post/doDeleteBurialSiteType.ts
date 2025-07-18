import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<unknown, unknown, { burialSiteTypeId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'BurialSiteTypes',
    request.body.burialSiteTypeId as string,
    request.session.user as User
  )

  const burialSiteTypes = getBurialSiteTypes()

  response.json({
    success,
    
    burialSiteTypes
  })
}
