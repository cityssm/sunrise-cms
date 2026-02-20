import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'

export default function handler(
  request: Request<unknown, unknown, { intermentDepthId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'IntermentDepths',
    request.body.intermentDepthId,
    request.session.user as User
  )

  const intermentDepths = getCachedIntermentDepths()

  response.json({
    success,

    intermentDepths
  })
}
