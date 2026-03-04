import getObjectDifference from '@cityssm/object-difference'
import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface UpdateIntermentContainerTypeForm {
  intermentContainerTypeId: number | string

  intermentContainerType: string
  isCremationType: '0' | '1'
}

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function updateIntermentContainerType(
  updateForm: UpdateIntermentContainerTypeForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(
          /* sql */ `SELECT * FROM IntermentContainerTypes WHERE intermentContainerTypeId = ? AND recordDelete_timeMillis IS NULL`
        )
        .get(updateForm.intermentContainerTypeId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE IntermentContainerTypes
      SET
        intermentContainerType = ?,
        isCremationType = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND intermentContainerTypeId = ?
    `)
    .run(
      updateForm.intermentContainerType,
      updateForm.isCremationType,
      user.userName,
      rightNowMillis,
      updateForm.intermentContainerTypeId
    )

  if (result.changes > 0 && auditLogIsEnabled) {
    const recordAfter = database
      .prepare(
        /* sql */ `SELECT * FROM IntermentContainerTypes WHERE intermentContainerTypeId = ?`
      )
      .get(updateForm.intermentContainerTypeId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordType: 'intermentContainerType',
          mainRecordId: String(updateForm.intermentContainerTypeId),
          updateTable: 'IntermentContainerTypes'
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

  clearCacheByTableName('IntermentContainerTypes')

  return result.changes > 0
}
