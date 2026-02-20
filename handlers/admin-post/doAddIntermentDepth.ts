import type { Request, Response } from 'express'

import addIntermentDepth, {
  type AddIntermentDepthForm
} from '../../database/addIntermentDepth.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'

export default function handler(
  request: Request<unknown, unknown, AddIntermentDepthForm>,
  response: Response
): void {
  const intermentDepthId = addIntermentDepth(
    request.body,
    request.session.user as User
  )

  const intermentDepths = getCachedIntermentDepths()

  response.json({
    success: true,

    intermentDepthId,
    intermentDepths
  })
}
