import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Cemetery, FuneralHome } from '../types/record.types.js'

export default function getFuneralHome(
  funeralHomeId: number | string,
  includeDeleted = false
): FuneralHome | undefined {
  return _getFuneralHome('funeralHomeId', funeralHomeId, includeDeleted)
}

export function getFuneralHomeByKey(
  funeralHomeKey: string,
  includeDeleted = false
): FuneralHome | undefined {
  return _getFuneralHome('funeralHomeKey', funeralHomeKey, includeDeleted)
}

function _getFuneralHome(
  keyColumn: 'funeralHomeId' | 'funeralHomeKey',
  funeralHomeIdOrKey: number | string,
  includeDeleted = false
): FuneralHome | undefined {
  const database = sqlite(sunriseDB)

  const funeralHome = database
    .prepare(
      `select funeralHomeId, funeralHomeKey, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber,
        recordDelete_userName, recordDelete_timeMillis
        from FuneralHomes f
        where f.${keyColumn} = ?
        ${includeDeleted ? '' : ' and f.recordDelete_timeMillis is null '}
        order by f.funeralHomeName, f.funeralHomeId`
    )
    .get(funeralHomeIdOrKey) as Cemetery | undefined

  database.close()

  return funeralHome
}
