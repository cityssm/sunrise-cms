import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function getPreviousFuneralHomeId(
  funeralHomeId: number | string,
  connectedDatabase?: sqlite.Database
): number | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const result = database
    .prepare(
      `select funeralHomeId from FuneralHomes
        where recordDelete_timeMillis is null
        and funeralHomeName < (select funeralHomeName from FuneralHomes where funeralHomeId = ?)
        order by funeralHomeName desc
        limit 1`
    )
    .pluck()
    .get(funeralHomeId) as number | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }
  
  return result
}
