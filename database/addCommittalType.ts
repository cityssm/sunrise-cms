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

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

export default function addCommittalType(
  form: AddForm,
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
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      form.committalType,
      form.committalTypeKey ?? '',
      form.orderNumber ?? -1,
      user.username,
      rightNowMillis,
      user.username,
      rightNowMillis
    )

  const committalTypeId = result.lastInsertRowid as number

  if (isAuditLoggingEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          CommittalTypes
        WHERE
          committalTypeId = ?
      `)
      .get(committalTypeId)

    createAuditLogEntries(
      {
        mainRecordId: committalTypeId,
        mainRecordType: 'committalType',
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
