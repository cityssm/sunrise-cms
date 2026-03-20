import getObjectDifference from '@cityssm/object-difference'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export function restoreBurialSite(
  burialSiteId: number,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            BurialSites
          WHERE
            burialSiteId = ?
            AND recordDelete_timeMillis IS NOT NULL
        `)
        .get(burialSiteId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE BurialSites
      SET
        recordDelete_userName = NULL,
        recordDelete_timeMillis = NULL,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        burialSiteId = ?
        AND recordDelete_timeMillis IS NOT NULL
    `)
    .run(user.userName, rightNowMillis, burialSiteId)

  if (result.changes > 0 && auditLogIsEnabled && recordBefore !== undefined) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          BurialSites
        WHERE
          burialSiteId = ?
      `)
      .get(burialSiteId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: burialSiteId,
          mainRecordType: 'burialSite',
          updateTable: 'BurialSites'
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
