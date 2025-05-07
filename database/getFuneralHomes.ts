import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { FuneralHome } from '../types/record.types.js'

export default function getFuneralHomes(): FuneralHome[] {
  const database = sqlite(sunriseDB, { readonly: true })

  const funeralHomes = database
    .prepare(
      `select funeralHomeId, funeralHomeKey, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber
        from FuneralHomes f
        where f.recordDelete_timeMillis is null
        order by f.funeralHomeName, f.funeralHomeId`
    )
    .all() as FuneralHome[]

  database.close()

  return funeralHomes
}
