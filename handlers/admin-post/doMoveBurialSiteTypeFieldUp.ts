import type { Request, Response } from 'express'

import {
  moveBurialSiteTypeFieldUp,
  moveBurialSiteTypeFieldUpToTop
} from '../../database/moveBurialSiteTypeField.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { burialSiteTypeFieldId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveBurialSiteTypeFieldUpToTop(request.body.burialSiteTypeFieldId)
      : moveBurialSiteTypeFieldUp(request.body.burialSiteTypeFieldId)

  const burialSiteTypes = getCachedBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
