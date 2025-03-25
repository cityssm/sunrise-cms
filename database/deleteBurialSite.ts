import { dateToInteger } from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export async function deleteBurialSite(
  burialSiteId: number,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  /*
   * Ensure no active contracts reference the burial site
   */

  const currentDateInteger = dateToInteger(new Date())

  const activeContract = database
    .prepare(
      `select contractId
        from Contracts
        where burialSiteId = ?
        and recordDelete_timeMillis is null
        and (contractEndDate is null or contractEndDate >= ?)`
    )
    .pluck()
    .get(burialSiteId, currentDateInteger) as number | undefined

  if (activeContract !== undefined) {
    database.release()
    return false
  }

  /*
   * Delete the burial site
   */

  const rightNowMillis = Date.now()

  database
    .prepare(
      `update BurialSites
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId = ?
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, burialSiteId)

  /*
   * Delete fields and comments
   */

  database
    .prepare(
      `update BurialSiteFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId = ?
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, burialSiteId)

  database
    .prepare(
      `update BurialSiteComments
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId = ?
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, burialSiteId)

  database.release()

  return true
}
