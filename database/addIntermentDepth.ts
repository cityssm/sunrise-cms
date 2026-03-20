import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface AddIntermentDepthForm {
  intermentDepth: string
  intermentDepthKey?: string
  orderNumber?: number | string
}

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function addIntermentDepth(
  addForm: AddIntermentDepthForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        IntermentDepths (
          intermentDepth,
          intermentDepthKey,
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
      addForm.intermentDepth,
      addForm.intermentDepthKey ?? '',
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  const intermentDepthId = result.lastInsertRowid as number

  if (auditLogIsEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          IntermentDepths
        WHERE
          intermentDepthId = ?
      `)
      .get(intermentDepthId)

    createAuditLogEntries(
      {
        mainRecordId: intermentDepthId,
        mainRecordType: 'intermentDepth',
        updateTable: 'IntermentDepths'
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

  clearCacheByTableName('IntermentDepths')

  return intermentDepthId
}
