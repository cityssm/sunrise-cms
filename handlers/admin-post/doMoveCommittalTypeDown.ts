import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'

import type { CommittalType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveCommittalTypeDownResponse =
  { success: boolean; committalTypes: CommittalType[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { committalTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveCommittalTypeDownResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('CommittalTypes', request.body.committalTypeId)
      : moveRecordDown('CommittalTypes', request.body.committalTypeId)

  const committalTypes = getCachedCommittalTypes()

  response.json({
    success,

    committalTypes
  })
}
