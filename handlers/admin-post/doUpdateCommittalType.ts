import type { Request, Response } from 'express'

import { updateCommittalType } from '../../database/updateRecord.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'
import type { CommittalType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateCommittalTypeResponse = {
  success: boolean

  committalTypes: CommittalType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { committalType: string; committalTypeId: string }
  >,
  response: Response<DoUpdateCommittalTypeResponse>
): void {
  const success = updateCommittalType(
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
