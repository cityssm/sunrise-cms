import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'
import getFuneralHome from './getFuneralHome.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function deleteFuneralHome(
  funeralHomeId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  /*
   * Ensure no open contracts have current or upcoming funeral dates
   * associated with the funeral home
   */

  const currentDateInteger = dateToInteger(new Date())

  const activeContract = database
    .prepare(/* sql */ `
      SELECT
        contractId
      FROM
        Contracts
      WHERE
        funeralHomeId = ?
        AND recordDelete_timeMillis IS NULL
        AND (
          contractEndDate IS NULL
          OR contractEndDate >= ?
        )
        AND funeralDate >= ?
    `)
    .pluck()
    .get(funeralHomeId, currentDateInteger, currentDateInteger) as
    | number
    | undefined

  if (activeContract !== undefined) {
    if (connectedDatabase === undefined) {
      database.close()
    }
    return false
  }

  /*
   * Delete the funeral home
   */

  const recordBefore = auditLogIsEnabled
    ? getFuneralHome(funeralHomeId, false, database)
    : undefined

  const rightNowMillis = Date.now()

  database
    .prepare(/* sql */ `
      UPDATE FuneralHomes
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        funeralHomeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(user.userName, rightNowMillis, funeralHomeId)

  if (auditLogIsEnabled) {
    createAuditLogEntries(
      {
        mainRecordId: funeralHomeId,
        mainRecordType: 'funeralHome',
        updateTable: 'FuneralHomes'
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
