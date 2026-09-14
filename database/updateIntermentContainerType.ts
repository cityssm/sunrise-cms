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

  isAvailableOnPortal?: '0' | '1'
}

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

// eslint-disable-next-line unicorn/consistent-boolean-name
export default function updateIntermentContainerType(
  updateForm: UpdateIntermentContainerTypeForm,
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
            IntermentContainerTypes
          WHERE
            intermentContainerTypeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(updateForm.intermentContainerTypeId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE IntermentContainerTypes
      SET
        intermentContainerType = ?,
        isCremationType = ?,
        isAvailableOnPortal = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND intermentContainerTypeId = ?
    `)
    .run(
      updateForm.intermentContainerType,
      updateForm.isCremationType,
      updateForm.isAvailableOnPortal ?? '0',
      user.username,
      rightNowMillis,
      updateForm.intermentContainerTypeId
    )

  if (isAuditLoggingEnabled && result.changes > 0) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          IntermentContainerTypes
        WHERE
          intermentContainerTypeId = ?
      `)
      .get(updateForm.intermentContainerTypeId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: updateForm.intermentContainerTypeId,
          mainRecordType: 'intermentContainerType',
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
