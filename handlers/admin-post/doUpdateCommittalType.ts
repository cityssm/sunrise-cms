import type { Request, Response } from 'express'

import { updateRecord } from '../../database/updateRecord.js'
import { getCommittalTypes } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { committalTypeId: string; committalType: string }
  >,
  response: Response
): void {
  const success = updateRecord(
    'CommittalTypes',
    request.body.committalTypeId,
    request.body.committalType,
    request.session.user as User
  )

  const committalTypes = getCommittalTypes()

  response.json({
    success,

    committalTypes
  })
}
