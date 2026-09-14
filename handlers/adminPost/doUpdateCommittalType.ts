import type { Request, Response } from 'express'

import updateCommittalType, {
  type UpdateCommittalTypeForm
} from '../../database/updateCommittalType.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'
import type { CommittalType } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateCommittalTypeResponse = {
  success: boolean

  committalTypes: CommittalType[]
}

export default function handler(
  request: Request<unknown, unknown, UpdateCommittalTypeForm>,
  response: Response<DoUpdateCommittalTypeResponse>
): void {
  const success = updateCommittalType(
    request.body,
    request.session.user as User
  )

  const committalTypes = getCachedCommittalTypes()

  response.json({
    success,

    committalTypes
  })
}
