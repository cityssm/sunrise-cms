import type { Request, Response } from 'express'

import getBurialSiteNamesByRange, {
  type GetBurialSiteNamesByRangeForm,
  type GetBurialSiteNamesByRangeResult,
  burialSiteNameRangeLimit
} from '../../database/getBurialSiteNamesByRange.js'

export type DoGetBurialSiteNamesByRangeResponse = {
  burialSiteNames: GetBurialSiteNamesByRangeResult
  cemeteryId: number | string
  burialSiteNameRangeLimit: number
}

export default function handler(
  request: Request<unknown, unknown, GetBurialSiteNamesByRangeForm>,
  response: Response<DoGetBurialSiteNamesByRangeResponse>
): void {
  const burialSiteNames = getBurialSiteNamesByRange(request.body)

  response.json({
    burialSiteNames,
    cemeteryId: request.body.cemeteryId,

    burialSiteNameRangeLimit
  })
}
