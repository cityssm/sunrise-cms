import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { intermentDepthId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop(
          'IntermentDepths',
          request.body.intermentDepthId
        )
      : moveRecordUp(
          'IntermentDepths',
          request.body.intermentDepthId
        )

  const intermentDepths = getCachedIntermentDepths()

  response.json({
    success,

    intermentDepths
  })
}
