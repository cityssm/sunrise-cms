import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('BurialSiteTypes', request.body.burialSiteTypeId)
      : moveRecordDown('BurialSiteTypes', request.body.burialSiteTypeId)

  const burialSiteTypes = getBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
