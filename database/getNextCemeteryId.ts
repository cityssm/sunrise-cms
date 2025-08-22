import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function getNextCemeteryId(
  cemeteryId: number | string,
  connectedDatabase?: sqlite.Database
): number | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const result = database
    .prepare(
      `select cemeteryId
        from Cemeteries
        where recordDelete_timeMillis is null
        and cemeteryName > (select cemeteryName from Cemeteries where cemeteryId = ?)
        order by cemeteryName
        limit 1`
    )
    .pluck()
    .get(cemeteryId) as number | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }
  
  return result
}
