import type { Request, Response } from 'express'

import addCemetery, {
  type AddCemeteryForm
} from '../../database/addCemetery.js'
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js'
export type DoCreateCemeteryResponse = {
  cemeteryId: number
}

export default function handler(
  request: Request<unknown, unknown, AddCemeteryForm>,
  response: Response<DoCreateCemeteryResponse>
): void {
  const cemeteryId = addCemetery(request.body, request.session.user as User)

  response.json({
    cemeteryId
  })

  response.on('finish', () => {
    getCachedCemeteries()
  })
}
