import type { Request, Response } from 'express'

import addIntermentDepth, {
  type AddIntermentDepthForm
} from '../../database/addIntermentDepth.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'
import type { IntermentDepth } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddIntermentDepthResponse = {
  success: true

  intermentDepthId: number
  intermentDepths: IntermentDepth[]
}

export default function handler(
  request: Request<unknown, unknown, AddIntermentDepthForm>,
  response: Response<DoAddIntermentDepthResponse>
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
