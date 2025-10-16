import type { Request, Response } from 'express'

import updateBurialSiteType, {
  type UpdateBurialSiteTypeForm
} from '../../database/updateBurialSiteType.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, UpdateBurialSiteTypeForm>,
  response: Response
): void {
  const success = updateBurialSiteType(
    request.body,
    request.session.user as User
  )

  const burialSiteTypes = getCachedBurialSiteTypes()

  response.json({
    success,

    burialSiteTypes
  })
}
