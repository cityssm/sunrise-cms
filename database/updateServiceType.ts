import getObjectDifference from '@cityssm/object-difference'
import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface UpdateForm {
  serviceTypeId: number | string

  serviceType: string
}

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function updateServiceType(
  updateForm: UpdateForm,
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
            ServiceTypes
          WHERE
            serviceTypeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(updateForm.serviceTypeId)
    : undefined

  const info = database
    .prepare(/* sql */ `
      UPDATE ServiceTypes
      SET
        serviceType = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        serviceTypeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      updateForm.serviceType,
      user.userName,
      Date.now(),
      updateForm.serviceTypeId
    )

  const success = info.changes > 0

  if (success) {
    if (auditLogIsEnabled) {
      const recordAfter = database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            ServiceTypes
          WHERE
            serviceTypeId = ?
        `)
        .get(updateForm.serviceTypeId)

      const differences = getObjectDifference(recordBefore, recordAfter)

      if (differences.length > 0) {
        createAuditLogEntries(
          {
            mainRecordId: updateForm.serviceTypeId,
            mainRecordType: 'serviceType',
            updateTable: 'ServiceTypes'
          },
          differences,
          user,
          database
        )
      }
    }

    clearCacheByTableName('ServiceTypes')
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return success
}
