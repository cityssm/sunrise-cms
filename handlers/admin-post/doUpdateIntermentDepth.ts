import type { Request, Response } from 'express'

import updateIntermentDepth, {
  type UpdateIntermentDepthForm
} from '../../database/updateIntermentDepth.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'

export default function handler(
  request: Request<unknown, unknown, UpdateIntermentDepthForm>,
  response: Response
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
