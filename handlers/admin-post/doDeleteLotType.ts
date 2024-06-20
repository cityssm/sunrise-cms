import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getLotTypes } from '../../helpers/functions.cache.js'

export async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'LotTypes',
    request.body.lotTypeId as string,
    request.session.user as User
  )

  const lotTypes = await getLotTypes()

  response.json({
    success,
    lotTypes
  })
}

export default handler
