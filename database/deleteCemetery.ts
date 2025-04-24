import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteCemetery(
  cemeteryId: number | string,
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  /*
   * Ensure no active contracts reference the cemetery
   */

  const currentDateInteger = dateToInteger(new Date())

  const activeContract = database
    .prepare(
      `select contractId
        from Contracts
        where burialSiteId in (
          select burialSiteId from BurialSites where recordDelete_timeMillis is null and cemeteryId = ?)
        and recordDelete_timeMillis is null
        and (contractEndDate is null or contractEndDate >= ?)`
    )
    .pluck()
    .get(cemeteryId, currentDateInteger) as number | undefined

  if (activeContract !== undefined) {
    database.close()
    return false
  }

  /*
   * Delete the cemetery
   */

  const rightNowMillis = Date.now()

  database
    .prepare(
      `update Cemeteries
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, cemeteryId)

  /*
   * Delete burial sites, fields, and comments
   */

  database
    .prepare(
      `update BurialSites
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, cemeteryId)

  database
    .prepare(
      `update BurialSiteFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId in (
          select burialSiteId from BurialSites where cemeteryId = ?)
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, cemeteryId)

  database
    .prepare(
      `update BurialSiteComments
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId in (
          select burialSiteId from BurialSites where cemeteryId = ?)
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, cemeteryId)

  database.close()

  return true
}
