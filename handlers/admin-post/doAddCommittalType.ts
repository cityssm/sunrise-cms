import type { Request, Response } from 'express'

import addCommittalType from '../../database/addCommittalType.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'
import type { CommittalType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoAddCommittalTypeResponse = {
  success: true

  committalTypeId: number
  committalTypes: CommittalType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { committalType: string; orderNumber?: number | string }
  >,
  response: Response<DoAddCommittalTypeResponse>
): void {
  const committalTypeId = addCommittalType(
    request.body,
    request.session.user as User
  )

  const committalTypes = getCachedCommittalTypes()

  response.json({
    success: true,

    committalTypeId,
    committalTypes
  })
}
