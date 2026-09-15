import getObjectDifference from '@cityssm/object-difference'
import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'
import { startSyncDataToPortalTask } from '../integrations/portal/taskStart.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface UpdateCommittalTypeForm {
  committalTypeId: number | string

  committalType: string

  isAvailableOnPortal?: '0' | '1'
}

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

// eslint-disable-next-line unicorn/consistent-boolean-name
export default function updateCommittalType(
  updateForm: UpdateCommittalTypeForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const recordBefore = isAuditLoggingEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            CommittalTypes
          WHERE
            committalTypeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(updateForm.committalTypeId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE CommittalTypes
      SET
        committalType = ?,
        isAvailableOnPortal = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND committalTypeId = ?
    `)
    .run(
      updateForm.committalType,
      updateForm.isAvailableOnPortal ?? '0',
      user.username,
      rightNowMillis,
      updateForm.committalTypeId
    )

  if (isAuditLoggingEnabled && result.changes > 0) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          CommittalTypes
        WHERE
          committalTypeId = ?
      `)
      .get(updateForm.committalTypeId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: updateForm.committalTypeId,
          mainRecordType: 'committalType',
          updateTable: 'CommittalTypes'
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

  clearCacheByTableName('CommittalTypes')

  startSyncDataToPortalTask()

  return result.changes > 0
}
