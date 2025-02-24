import type { Request, Response } from 'express'

import { updateRecord } from '../../database/updateRecord.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { burialSiteTypeId: string; lotType: string }>,
  response: Response
): Promise<void> {
  const success = await updateRecord(
    'LotTypes',
    request.body.burialSiteTypeId,
    request.body.lotType,
    request.session.user as User
  )

  const lotTypes = await getBurialSiteTypes()

  response.json({
    success,
    lotTypes
  })
}
