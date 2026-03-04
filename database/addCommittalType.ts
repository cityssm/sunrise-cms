import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface AddForm {
  committalType: string
  committalTypeKey?: string
  orderNumber?: number | string
}

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function addCommittalType(
  addForm: AddForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        CommittalTypes (
          committalType,
          committalTypeKey,
          orderNumber,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      addForm.committalType,
      addForm.committalTypeKey ?? '',
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  const committalTypeId = result.lastInsertRowid as number

  if (auditLogIsEnabled) {
    const recordAfter = database
      .prepare(
        /* sql */ `SELECT * FROM CommittalTypes WHERE committalTypeId = ?`
      )
      .get(committalTypeId)

    createAuditLogEntries(
      {
        mainRecordType: 'committalType',
        mainRecordId: committalTypeId,
        updateTable: 'CommittalTypes'
      },
      [
        {
          property: '*',
          type: 'created',
          from: undefined,
          to: recordAfter
        }
      ],
      user,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  clearCacheByTableName('CommittalTypes')

  return committalTypeId
}
