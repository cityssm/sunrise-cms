import type { DatabaseSync } from 'node:sqlite'

import { dateToInteger } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { FuneralHome } from '../types/record.types.js'

export default function getFuneralHomes(
  shouldIncludeUpcomingFuneralCount = true,
  connectedDatabase?: DatabaseSync
): FuneralHome[] {
  const database = connectedDatabase ?? getDatabaseConnection(true)

  const currentDateNumber = dateToInteger(new Date())

  let funeralHomes: FuneralHome[]

  if (shouldIncludeUpcomingFuneralCount) {
    funeralHomes = database
      .prepare(/* sql */ `
        SELECT
          f.funeralHomeId,
          f.funeralHomeKey,
          f.funeralHomeName,
          f.funeralHomeAddress1,
          f.funeralHomeAddress2,
          f.funeralHomeCity,
          f.funeralHomeProvince,
          f.funeralHomePostalCode,
          f.funeralHomePhoneNumber,
          ${getConfigProperty('integrations.portal.integrationIsEnabled')
            ? 'f.isAvailableOnPortal'
            : '0 as isAvailableOnPortal'},
          COUNT(c.contractId) AS upcomingFuneralCount
        FROM
          FuneralHomes f
          LEFT JOIN Contracts c ON f.funeralHomeId = c.funeralHomeId
          AND c.recordDelete_timeMillis IS NULL
          AND c.funeralDate >= ?
        WHERE
          f.recordDelete_timeMillis IS NULL
        GROUP BY
          f.funeralHomeId,
          f.funeralHomeKey,
          f.funeralHomeName,
          f.funeralHomeAddress1,
          f.funeralHomeAddress2,
          f.funeralHomeCity,
          f.funeralHomeProvince,
          f.funeralHomePostalCode,
          f.funeralHomePhoneNumber,
          f.isAvailableOnPortal
        ORDER BY
          f.funeralHomeName,
          f.funeralHomeId
      `)
      .all(currentDateNumber) as unknown as FuneralHome[]
  } else {
    funeralHomes = database
      .prepare(/* sql */ `
        SELECT
          f.funeralHomeId,
          f.funeralHomeKey,
          f.funeralHomeName,
          f.funeralHomeAddress1,
          f.funeralHomeAddress2,
          f.funeralHomeCity,
          f.funeralHomeProvince,
          f.funeralHomePostalCode,
          f.funeralHomePhoneNumber,
          ${getConfigProperty('integrations.portal.integrationIsEnabled')
            ? 'f.isAvailableOnPortal'
            : '0 as isAvailableOnPortal'}
        FROM
          FuneralHomes f
        WHERE
          f.recordDelete_timeMillis IS NULL
        ORDER BY
          f.funeralHomeName,
          f.funeralHomeId
      `)
      .all() as unknown as FuneralHome[]
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return funeralHomes
}
