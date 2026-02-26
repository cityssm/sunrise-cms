import type { Request, Response } from 'express'

import getBurialSitesForMap from '../../database/getBurialSitesForMap.js'

import type { BurialSiteMapResult } from '../../database/getBurialSitesForMap.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoGetBurialSitesForMapResponse =
  | (BurialSiteMapResult & { success: true })
  | { errorMessage: string; success: false }

export default function handler(
  request: Request<unknown, unknown, { cemeteryId?: number | string }>,
  response: Response<DoGetBurialSitesForMapResponse>
): void {
  const { cemeteryId } = request.body

  // Cemetery is required
  if ((cemeteryId ?? '') === '') {
    response.json({
      errorMessage: 'Cemetery selection is required',
      success: false
    })
    return
  }

  const result = getBurialSitesForMap(cemeteryId ?? '')

  response.json({
    ...result,
    success: true
  })
}
