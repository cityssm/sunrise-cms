import getObjectDifference from '@cityssm/object-difference'
import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'
import { startSyncDataToPortalTask } from '../integrations/portal/taskStart.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface UpdateForm {
  serviceTypeId: number | string

  serviceType: string

  isAvailableOnPortal?: '0' | '1'
}

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

// eslint-disable-next-line unicorn/consistent-boolean-name
export default function updateServiceType(
  updateForm: UpdateForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const recordBefore = isAuditLoggingEnabled
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

  const result = database
    .prepare(/* sql */ `
      UPDATE ServiceTypes
      SET
        serviceType = ?,
        isAvailableOnPortal = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        serviceTypeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      updateForm.serviceType,
      updateForm.isAvailableOnPortal ?? '0',
      user.username,
      Date.now(),
      updateForm.serviceTypeId
    )

  if (isAuditLoggingEnabled && result.changes > 0) {
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

  if (connectedDatabase === undefined) {
    database.close()
  }

  clearCacheByTableName('ServiceTypes')

  startSyncDataToPortalTask()

  return result.changes > 0
}
