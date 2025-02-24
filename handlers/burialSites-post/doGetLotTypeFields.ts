import type { Request, Response } from 'express'

import { getLotTypeById } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const lotType = (await getLotTypeById(
    Number.parseInt(request.body.burialSiteTypeId, 10)
  ))!

  response.json({
    BurialSiteTypeFields: lotType.BurialSiteTypeFields
  })
}

