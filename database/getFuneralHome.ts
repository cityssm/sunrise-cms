import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Cemetery, FuneralHome } from '../types/record.types.js'

export default function getFuneralHome(
  funeralHomeId: number | string
): FuneralHome | undefined {
  return _getFuneralHome('funeralHomeId', funeralHomeId)
}

export function getFuneralHomeByKey(
  funeralHomeKey: string
): FuneralHome | undefined {
  return _getFuneralHome('funeralHomeKey', funeralHomeKey)
}

function _getFuneralHome(
  keyColumn: 'funeralHomeId' | 'funeralHomeKey',
  funeralHomeIdOrKey: number | string
): FuneralHome | undefined {
  const database = sqlite(sunriseDB)

  const funeralHome = database
    .prepare(
      `select funeralHomeId, funeralHomeKey, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber
        from FuneralHomes f
        where f.recordDelete_timeMillis is null
        and f.${keyColumn} = ?
        order by f.funeralHomeName, f.funeralHomeId`
    )
    .get(funeralHomeIdOrKey) as Cemetery | undefined

  database.close()

  return funeralHome
}
