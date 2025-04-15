import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { burialSiteTypeId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'BurialSiteTypes',
    request.body.burialSiteTypeId as string,
    request.session.user as User
  )

  const burialSiteTypes = await getBurialSiteTypes()

  response.json({
    success,
    
    burialSiteTypes
  })
}
