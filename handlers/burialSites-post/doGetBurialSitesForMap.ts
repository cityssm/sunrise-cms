import type { Request, Response } from 'express'

import getBurialSitesForMap from '../../database/getBurialSitesForMap.js'

export default function handler(
  request: Request<unknown, unknown, { cemeteryId: number | string }>,
  response: Response
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

  const result = getBurialSitesForMap(cemeteryId)

  response.json({
    ...result,
    success: true
  })
}
