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

export interface UpdateBurialSiteCommentForm {
  burialSiteCommentId: number | string
  comment: string
  commentDateString: DateString
  commentTimeString: TimeString
}

export default function updateBurialSiteComment(
  commentForm: UpdateBurialSiteCommentForm,
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
            BurialSiteComments
          WHERE
            burialSiteCommentId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(commentForm.burialSiteCommentId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE BurialSiteComments
      SET
        commentDate = ?,
        commentTime = ?,
        comment = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteCommentId = ?
    `)
    .run(
      dateStringToInteger(commentForm.commentDateString),
      timeStringToInteger(commentForm.commentTimeString),
      commentForm.comment,
      user.userName,
      Date.now(),
      commentForm.burialSiteCommentId
    )

  if (result.changes > 0 && auditLogIsEnabled && recordBefore !== undefined) {
    const parentId = (recordBefore as Record<string, unknown>)
      .burialSiteId as number

    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          BurialSiteComments
        WHERE
          burialSiteCommentId = ?
      `)
      .get(commentForm.burialSiteCommentId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: parentId,
          mainRecordType: 'burialSite',
          recordIndex: commentForm.burialSiteCommentId,
          updateTable: 'BurialSiteComments'
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
