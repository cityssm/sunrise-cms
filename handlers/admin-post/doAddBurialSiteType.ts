import type { Request, Response } from 'express'

import addBurialSiteType, {
  type AddBurialSiteTypeForm
} from '../../database/addBurialSiteType.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, AddBurialSiteTypeForm>,
  response: Response
): void {
  const burialSiteTypeId = addBurialSiteType(
    request.body,
    request.session.user as User
  )

  const burialSiteTypes = getCachedBurialSiteTypes()

  response.json({
    success: true,

    burialSiteTypeId,
    burialSiteTypes
  })
}
