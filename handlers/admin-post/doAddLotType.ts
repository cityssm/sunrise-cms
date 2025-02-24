import type { Request, Response } from 'express'

import { addRecord } from '../../database/addRecord.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const burialSiteTypeId = await addRecord(
    'LotTypes',
    request.body.lotType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const lotTypes = await getBurialSiteTypes()

  response.json({
    success: true,
    burialSiteTypeId,
    lotTypes
  })
}
