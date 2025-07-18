import type { Request, Response } from 'express'

import { updateRecord } from '../../database/updateRecord.js'
import { getCommittalTypes } from '../../helpers/cache.helpers.js'

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

  const committalTypes = getCommittalTypes()

  response.json({
    success,

    committalTypes
  })
}
