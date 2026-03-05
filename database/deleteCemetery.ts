import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'
import getCemetery from './getCemetery.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function deleteCemetery(
  cemeteryId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  /*
   * Ensure no active contracts reference the cemetery
   */

  const currentDateInteger = dateToInteger(new Date())

  const activeContract = database
    .prepare(/* sql */ `
      SELECT
        contractId
      FROM
        Contracts
      WHERE
        burialSiteId IN (
          SELECT
            burialSiteId
          FROM
            BurialSites
          WHERE
            recordDelete_timeMillis IS NULL
            AND cemeteryId = ?
        )
        AND recordDelete_timeMillis IS NULL
        AND (
          contractEndDate IS NULL
          OR contractEndDate >= ?
        )
    `)
    .pluck()
    .get(cemeteryId, currentDateInteger) as number | undefined

  if (activeContract !== undefined) {
    if (connectedDatabase === undefined) {
      database.close()
    }
    return false
  }

  /*
   * Delete the cemetery
   */

  const recordBefore = auditLogIsEnabled
    ? getCemetery(cemeteryId, database)
    : undefined

  const rightNowMillis = Date.now()

  database
    .prepare(/* sql */ `
      UPDATE Cemeteries
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        cemeteryId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(user.userName, rightNowMillis, cemeteryId)

  /*
   * Delete burial sites, fields, and comments
   */

  const deletedBurialSites = database
    .prepare(/* sql */ `
      UPDATE BurialSites
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        cemeteryId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(user.userName, rightNowMillis, cemeteryId).changes

  database
    .prepare(/* sql */ `
      UPDATE BurialSiteFields
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        burialSiteId IN (
          SELECT
            burialSiteId
          FROM
            BurialSites
          WHERE
            cemeteryId = ?
        )
        AND recordDelete_timeMillis IS NULL
    `)
    .run(user.userName, rightNowMillis, cemeteryId)

  database
    .prepare(/* sql */ `
      UPDATE BurialSiteComments
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        burialSiteId IN (
          SELECT
            burialSiteId
          FROM
            BurialSites
          WHERE
            cemeteryId = ?
        )
        AND recordDelete_timeMillis IS NULL
    `)
    .run(user.userName, rightNowMillis, cemeteryId)

  if (deletedBurialSites === 0) {
    const purgeTables = ['CemeteryDirectionsOfArrival', 'Cemeteries']

    for (const tableName of purgeTables) {
      database
        .prepare(/* sql */ `
          DELETE FROM ${tableName}
          WHERE
            cemeteryId = ?
            AND cemeteryId NOT IN (
              SELECT
                cemeteryId
              FROM
                BurialSites
            )
        `)
        .run(cemeteryId)
    }
  }

  if (auditLogIsEnabled) {
    createAuditLogEntries(
      {
        mainRecordType: 'cemetery',
        mainRecordId: String(cemeteryId),
        updateTable: 'Cemeteries'
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

  if (connectedDatabase === undefined) {
    database.close()
  }

  return true
}
