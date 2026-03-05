import getObjectDifference from '@cityssm/object-difference'
import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export interface UpdateForm {
  comment: string
  commentDateString: DateString
  commentTimeString: TimeString
  contractCommentId: number | string
}

export default function updateContractComment(
  commentForm: UpdateForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            ContractComments
          WHERE
            contractCommentId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(commentForm.contractCommentId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractComments
      SET
        commentDate = ?,
        commentTime = ?,
        comment = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractCommentId = ?
    `)
    .run(
      dateStringToInteger(commentForm.commentDateString),
      timeStringToInteger(commentForm.commentTimeString),
      commentForm.comment,
      user.userName,
      Date.now(),
      commentForm.contractCommentId
    )

  if (result.changes > 0 && auditLogIsEnabled && recordBefore !== undefined) {
    const parentId = (recordBefore as Record<string, unknown>)
      .contractId as number

    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          ContractComments
        WHERE
          contractCommentId = ?
      `)
      .get(commentForm.contractCommentId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: parentId,
          mainRecordType: 'contract',
          recordIndex: commentForm.contractCommentId,
          updateTable: 'ContractComments'
        },
        differences,
        user,
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
