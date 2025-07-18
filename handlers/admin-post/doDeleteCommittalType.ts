import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCommittalTypes } from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<unknown, unknown, { committalTypeId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'CommittalTypes',
    request.body.committalTypeId as string,
    request.session.user as User
  )

  const committalTypes = getCommittalTypes()

  response.json({
    success,

    committalTypes
  })
}
