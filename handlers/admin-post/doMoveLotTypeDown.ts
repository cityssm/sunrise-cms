import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveRecordDownToBottom('LotTypes', request.body.burialSiteTypeId)
      : await moveRecordDown('LotTypes', request.body.burialSiteTypeId)

  const lotTypes = await getBurialSiteTypes()

  response.json({
    success,
    lotTypes
  })
}
