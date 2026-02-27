import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'
import type { IntermentDepth } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveIntermentDepthDownResponse = {
  success: boolean

  intermentDepths: IntermentDepth[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { intermentDepthId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveIntermentDepthDownResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('IntermentDepths', request.body.intermentDepthId)
      : moveRecordDown('IntermentDepths', request.body.intermentDepthId)

  const intermentDepths = getCachedIntermentDepths()

  response.json({
    success,

    intermentDepths
  })
}
