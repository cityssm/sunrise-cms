import type { Request, Response } from 'express'

import { getBurialSiteTypeById } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, { burialSiteTypeId: string }>,
  response: Response
): void {
  const burialSiteType = getBurialSiteTypeById(
    Number.parseInt(request.body.burialSiteTypeId, 10)
  )

  response.json({
    burialSiteTypeFields: burialSiteType?.burialSiteTypeFields ?? []
  })
}
