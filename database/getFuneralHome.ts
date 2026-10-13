import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { FuneralHome } from '../types/record.types.js'

export default function getFuneralHome(
  funeralHomeId: number | string,
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): FuneralHome | undefined {
  return _getFuneralHome(
    'funeralHomeId',
    funeralHomeId,
    shouldIncludeDeletedRecords,
    connectedDatabase
  )
}

export function getFuneralHomeByKey(
  funeralHomeKey: string,
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): FuneralHome | undefined {
  return _getFuneralHome(
    'funeralHomeKey',
    funeralHomeKey,
    shouldIncludeDeletedRecords,
    connectedDatabase
  )
}

function _getFuneralHome(
  keyColumn: 'funeralHomeId' | 'funeralHomeKey',
  funeralHomeIdOrKey: number | string,
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): FuneralHome | undefined {
  const database = connectedDatabase ?? getDatabaseConnection(true)

  const funeralHome = database
    .prepare(/* sql */ `
      SELECT
        funeralHomeId,
        funeralHomeKey,
        funeralHomeName,
        funeralHomeAddress1,
        funeralHomeAddress2,
        funeralHomeCity,
        funeralHomeProvince,
        funeralHomePostalCode,
        funeralHomePhoneNumber,
        isAvailableOnPortal,
        recordCreate_username,
        recordCreate_timeMillis,
        recordUpdate_username,
        recordUpdate_timeMillis,
        recordDelete_username,
        recordDelete_timeMillis
      FROM
        FuneralHomes f
      WHERE
        f.${keyColumn} = ? ${shouldIncludeDeletedRecords
          ? ''
          : ' and f.recordDelete_timeMillis IS NULL '}
      ORDER BY
        f.funeralHomeName,
        f.funeralHomeId
    `)
    .get(funeralHomeIdOrKey) as FuneralHome | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return funeralHome
}
