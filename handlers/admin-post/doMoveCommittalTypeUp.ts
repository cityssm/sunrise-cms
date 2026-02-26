import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'

import type { CommittalType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveCommittalTypeUpResponse =
  { success: boolean; committalTypes: CommittalType[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { committalTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveCommittalTypeUpResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('CommittalTypes', request.body.committalTypeId)
      : moveRecordUp('CommittalTypes', request.body.committalTypeId)

  const committalTypes = getCachedCommittalTypes()

  response.json({
    success,

    committalTypes
  })
}
