import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js'

import type { IntermentContainerType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveIntermentContainerTypeUpResponse =
  { success: boolean; intermentContainerTypes: IntermentContainerType[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { intermentContainerTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveIntermentContainerTypeUpResponse>
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
