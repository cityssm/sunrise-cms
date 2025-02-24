import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { lotTypeFieldId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'BurialSiteTypeFields',
    request.body.lotTypeFieldId as string,
    request.session.user as User
  )

  const burialSiteTypes = await getBurialSiteTypes()

  response.json({
    success,
    burialSiteTypes
  })
}
