import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { FuneralHome } from '../types/record.types.js'

export default function getFuneralHome(
  funeralHomeId: number | string,
  includeDeleted = false,
  connectedDatabase: sqlite.Database | undefined = undefined
): FuneralHome | undefined {
  return _getFuneralHome(
    'funeralHomeId',
    funeralHomeId,
    includeDeleted,
    connectedDatabase
  )
}

export function getFuneralHomeByKey(
  funeralHomeKey: string,
  includeDeleted = false,
  connectedDatabase: sqlite.Database | undefined = undefined
): FuneralHome | undefined {
  return _getFuneralHome(
    'funeralHomeKey',
    funeralHomeKey,
    includeDeleted,
    connectedDatabase
  )
}

function _getFuneralHome(
  keyColumn: 'funeralHomeId' | 'funeralHomeKey',
  funeralHomeIdOrKey: number | string,
  includeDeleted = false,
  connectedDatabase: sqlite.Database | undefined = undefined
): FuneralHome | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const funeralHome = database
    .prepare(/* sql */ `select funeralHomeId, funeralHomeKey, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber,
        recordDelete_userName, recordDelete_timeMillis
        from FuneralHomes f
        where f.${keyColumn} = ?
        ${includeDeleted ? '' : ' and f.recordDelete_timeMillis is null '}
        order by f.funeralHomeName, f.funeralHomeId`
    )
    .get(funeralHomeIdOrKey) as FuneralHome | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return funeralHome
}
