import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { intermentContainerTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop(
          'IntermentContainerTypes',
          request.body.intermentContainerTypeId
        )
      : moveRecordUp(
          'IntermentContainerTypes',
          request.body.intermentContainerTypeId
        )

  const intermentContainerTypes = getCachedIntermentContainerTypes()

  response.json({
    success,

    intermentContainerTypes
  })
}
