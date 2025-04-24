import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function getPreviousBurialSiteId(
  burialSiteId: number | string
): number | undefined {
  const database = sqlite(sunriseDB, { readonly: true })

  const result = database
    .prepare(
      `select burialSiteId from BurialSites
        where recordDelete_timeMillis is null
        and burialSiteName < (select burialSiteName from BurialSites where burialSiteId = ?)
        order by burialSiteName desc
        limit 1`
    )
    .pluck()
    .get(burialSiteId) as number | undefined

  database.close()

  return result
}
