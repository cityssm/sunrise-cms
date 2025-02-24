import type { Request, Response } from 'express'

import {
  moveBurialSiteTypeFieldDown,
  moveBurialSiteTypeFieldDownToBottom
} from '../../database/moveBurialSiteTypeField.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { lotTypeFieldId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveBurialSiteTypeFieldDownToBottom(request.body.lotTypeFieldId)
      : await moveBurialSiteTypeFieldDown(request.body.lotTypeFieldId)

  const burialSiteTypes = await getBurialSiteTypes()

  response.json({
    success,
    burialSiteTypes
  })
}
