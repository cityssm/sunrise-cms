import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

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
    .prepare(/* sql */ `select contractId
        from Contracts
        where burialSiteId in (
          select burialSiteId from BurialSites where recordDelete_timeMillis is null and cemeteryId = ?)
        and recordDelete_timeMillis is null
        and (contractEndDate is null or contractEndDate >= ?)`
    )
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

  const rightNowMillis = Date.now()

  database
    .prepare(/* sql */ `update Cemeteries
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, cemeteryId)

  /*
   * Delete burial sites, fields, and comments
   */

  const deletedBurialSites = database
    .prepare(/* sql */ `update BurialSites
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, cemeteryId).changes

  database
    .prepare(/* sql */ `update BurialSiteFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId in (
          select burialSiteId from BurialSites where cemeteryId = ?)
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, cemeteryId)

  database
    .prepare(/* sql */ `update BurialSiteComments
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId in (
          select burialSiteId from BurialSites where cemeteryId = ?)
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, cemeteryId)

  if (deletedBurialSites === 0) {
    const purgeTables = ['CemeteryDirectionsOfArrival', 'Cemeteries']

    for (const tableName of purgeTables) {
      database
        .prepare(/* sql */ `delete from ${tableName}
            where cemeteryId = ?
            and cemeteryId not in (select cemeteryId from BurialSites)`
        )
        .run(cemeteryId)
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return true
}
