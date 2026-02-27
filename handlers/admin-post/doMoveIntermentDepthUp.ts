import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'
import type { IntermentDepth } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveIntermentDepthUpResponse = {
  success: boolean

  intermentDepths: IntermentDepth[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { intermentDepthId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveIntermentDepthUpResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('IntermentDepths', request.body.intermentDepthId)
      : moveRecordUp('IntermentDepths', request.body.intermentDepthId)

  const intermentDepths = getCachedIntermentDepths()

  response.json({
    success,

    intermentDepths
  })
}
