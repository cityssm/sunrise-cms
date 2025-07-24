import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { committalTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
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
