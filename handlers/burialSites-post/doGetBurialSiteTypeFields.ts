import type { Request, Response } from 'express'

import { getCachedBurialSiteTypeById } from '../../helpers/cache/burialSiteTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, { burialSiteTypeId: string }>,
  response: Response
): void {
  const burialSiteType = getCachedBurialSiteTypeById(
    Number.parseInt(request.body.burialSiteTypeId, 10)
  )

  response.json({
    burialSiteTypeFields: burialSiteType?.burialSiteTypeFields ?? []
  })
}
