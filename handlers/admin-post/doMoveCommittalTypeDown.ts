import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getCommittalTypes } from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { committalTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('CommittalTypes', request.body.committalTypeId)
      : moveRecordDown('CommittalTypes', request.body.committalTypeId)

  const committalTypes = getCommittalTypes()

  response.json({
    success,

    committalTypes
  })
}
