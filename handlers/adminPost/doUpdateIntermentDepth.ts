import type { Request, Response } from 'express'

import updateIntermentDepth, {
  type UpdateIntermentDepthForm
} from '../../database/updateIntermentDepth.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'
import type { IntermentDepth } from '../../types/record.types.js'

export type DoUpdateIntermentDepthResponse = {
  success: boolean

  intermentDepths: IntermentDepth[]
}

export default function handler(
  request: Request<unknown, unknown, UpdateIntermentDepthForm>,
  response: Response<DoUpdateIntermentDepthResponse>
): void {
  const success = updateIntermentDepth(
    request.body,
    request.session.user as User
  )

  const intermentDepths = getCachedIntermentDepths()

  response.json({
    success,

    intermentDepths
  })
}
