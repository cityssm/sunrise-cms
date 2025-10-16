import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, { committalTypeId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'CommittalTypes',
    request.body.committalTypeId,
    request.session.user as User
  )

  const committalTypes = getCachedCommittalTypes()

  response.json({
    success,

    committalTypes
  })
}
