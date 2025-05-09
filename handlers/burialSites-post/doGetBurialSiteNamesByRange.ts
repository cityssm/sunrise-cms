import type { Request, Response } from 'express'

import getBurialSiteNamesByRange, {
  type GetBurialSiteNamesByRangeForm
} from '../../database/getBurialSiteNamesByRange.js'

export default function handler(
  request: Request<unknown, unknown, GetBurialSiteNamesByRangeForm>,
  response: Response
): void {
  const burialSiteNames = getBurialSiteNamesByRange(request.body)

  response.json({
    burialSiteNames,
    cemeteryId: request.body.cemeteryId
  })
}
