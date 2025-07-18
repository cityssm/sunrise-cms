import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCommittalTypes } from '../../helpers/cache.helpers.js'

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

  const committalTypes = getCommittalTypes()

  response.json({
    success,

    committalTypes
  })
}
