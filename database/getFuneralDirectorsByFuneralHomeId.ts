import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface FuneralDirectorSuggestion {
  funeralDirectorName: string
  usageCount: number
}

export default function getFuneralDirectorsByFuneralHomeId(
  funeralHomeId: number | string,
  connectedDatabase?: sqlite.Database
): FuneralDirectorSuggestion[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const funeralDirectors = database
    .prepare(
      `select funeralDirectorName, count(*) as usageCount
       from Contracts
       where recordDelete_timeMillis is null
         and funeralHomeId = ?
         and funeralDirectorName is not null
         and trim(funeralDirectorName) != ''
       group by funeralDirectorName
       order by usageCount desc, funeralDirectorName
       limit 20`
    )
    .all(funeralHomeId) as FuneralDirectorSuggestion[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return funeralDirectors
}