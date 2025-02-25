import type { Request, Response } from 'express'

import { getBurialSiteTypeById } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { burialSiteTypeId: string }>,
  response: Response
): Promise<void> {
  const burialSiteType = await getBurialSiteTypeById(
    Number.parseInt(request.body.burialSiteTypeId, 10)
  )

  response.json({
    burialSiteTypeFields: burialSiteType?.burialSiteTypeFields ?? []
  })
}
