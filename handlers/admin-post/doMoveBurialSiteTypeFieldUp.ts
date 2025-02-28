import type { Request, Response } from 'express'

import {
  moveBurialSiteTypeFieldUp,
  moveBurialSiteTypeFieldUpToTop
} from '../../database/moveBurialSiteTypeField.js'
import { getBurialSiteTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteTypeFieldId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): Promise<void> {
  const success =
    request.body.moveToEnd === '1'
      ? await moveBurialSiteTypeFieldUpToTop(request.body.burialSiteTypeFieldId)
      : await moveBurialSiteTypeFieldUp(request.body.burialSiteTypeFieldId)

  const burialSiteTypes = await getBurialSiteTypes()

  response.json({
    success,
    burialSiteTypes
  })
}
