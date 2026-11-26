import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'
import type { IntermentDepth } from '../../types/record.types.js'

export type DoDeleteIntermentDepthResponse = {
  success: boolean

  intermentDepths: IntermentDepth[]
}

export default function handler(
  request: Request<unknown, unknown, { intermentDepthId: string }>,
  response: Response<DoDeleteIntermentDepthResponse>
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
