import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Cemetery } from '../types/record.types.js'

export default function getCemeteries(
  filters?: {
    parentCemeteryId?: number | string
  },
  connectedDatabase?: sqlite.Database
): Cemetery[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const sqlParameters: Array<number | string> = []

  if (filters?.parentCemeteryId !== undefined) {
    sqlParameters.push(filters.parentCemeteryId)
  }

  const cemeteries = database
    .prepare(/* sql */ `
      SELECT
        cem.cemeteryId,
        cem.cemeteryName,
        cem.cemeteryKey,
        cem.cemeteryDescription,
        cem.cemeteryLatitude,
        cem.cemeteryLongitude,
        cem.cemeterySvg,
        cem.cemeteryAddress1,
        cem.cemeteryAddress2,
        cem.cemeteryCity,
        cem.cemeteryProvince,
        cem.cemeteryPostalCode,
        cem.cemeteryPhoneNumber,
        p.cemeteryId AS parentCemeteryId,
        p.cemeteryName AS parentCemeteryName,
        count(b.burialSiteId) AS burialSiteCount
      FROM
        Cemeteries cem
        LEFT JOIN Cemeteries p ON cem.parentCemeteryId = p.cemeteryId
        AND p.recordDelete_timeMillis IS NULL
        LEFT JOIN BurialSites b ON cem.cemeteryId = b.cemeteryId
        AND b.recordDelete_timeMillis IS NULL
      WHERE
        cem.recordDelete_timeMillis IS NULL ${filters?.parentCemeteryId ===
        undefined
          ? ''
          : 'and cem.parentCemeteryId = ?'}
      GROUP BY
        cem.cemeteryId,
        cem.cemeteryName,
        cem.cemeteryDescription,
        cem.cemeteryLatitude,
        cem.cemeteryLongitude,
        cem.cemeterySvg,
        cem.cemeteryAddress1,
        cem.cemeteryAddress2,
        cem.cemeteryCity,
        cem.cemeteryProvince,
        cem.cemeteryPostalCode,
        cem.cemeteryPhoneNumber,
        p.cemeteryId,
        p.cemeteryName
      ORDER BY
        cem.cemeteryName,
        cem.cemeteryId
    `)
    .all(sqlParameters) as Cemetery[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return cemeteries
}
