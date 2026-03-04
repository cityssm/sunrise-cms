import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function deleteServiceType(
  serviceTypeId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(
          /* sql */ `SELECT * FROM ServiceTypes WHERE serviceTypeId = ? AND recordDelete_timeMillis IS NULL`
        )
        .get(serviceTypeId)
    : undefined

  const info = database
    .prepare(/* sql */ `
      UPDATE
        ServiceTypes
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        serviceTypeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(user.userName, rightNowMillis, serviceTypeId)

  const success = info.changes > 0

  if (success) {
    if (auditLogIsEnabled) {
      createAuditLogEntries(
        {
          mainRecordType: 'serviceType',
          mainRecordId: serviceTypeId,
          updateTable: 'ServiceTypes'
        },
        [
          {
            property: '*',
            type: 'deleted',
            from: recordBefore,
            to: undefined
          }
        ],
        user,
        database
      )
    }

    clearCacheByTableName('ServiceTypes')
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return success
}
