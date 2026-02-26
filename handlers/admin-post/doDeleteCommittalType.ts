import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'

import type { CommittalType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteCommittalTypeResponse =
  { success: boolean; committalTypes: CommittalType[] }

export default function handler(
  request: Request<unknown, unknown, { committalTypeId: string }>,
  response: Response<DoDeleteCommittalTypeResponse>
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
