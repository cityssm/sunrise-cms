import type { Request, Response } from 'express'

import getBurialSitesForMap, {
  type BurialSiteMapResult
} from '../../database/getBurialSitesForMap.js'

export type DoGetBurialSitesForMapResponse =
  | { errorMessage: string; success: false }
  | (BurialSiteMapResult & { success: true })

export default function handler(
  request: Request<unknown, unknown, { cemeteryId?: number | string }>,
  response: Response<DoGetBurialSitesForMapResponse>
): void {
  const { cemeteryId = '' } = request.body

  // Cemetery is required
  if (cemeteryId === '') {
    response.json({
      errorMessage: 'Cemetery selection is required',
      success: false
    })
    return
  }

  const result = getBurialSitesForMap(cemeteryId)

  response.json({
    ...result,
    success: true
  })
}
