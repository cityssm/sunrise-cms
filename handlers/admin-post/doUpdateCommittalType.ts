import type { Request, Response } from 'express'

import { updateRecord } from '../../database/updateRecord.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { committalType: string; committalTypeId: string; }
  >,
  response: Response
): void {
  const success = updateRecord(
    'CommittalTypes',
    request.body.committalTypeId,
    request.body.committalType,
    request.session.user as User
  )

  const committalTypes = getCachedCommittalTypes()

  response.json({
    success,

    committalTypes
  })
}
