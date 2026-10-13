import type { DatabaseSync, SQLInputValue, SQLOutputValue } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import { getFindAGraveCemeteryUrl } from '../helpers/findagrave.helpers.js'
import type { Cemetery } from '../types/record.types.js'

export default function getCemeteries(
  filters?: {
    parentCemeteryId?: number | string
  },
  connectedDatabase?: DatabaseSync
): Cemetery[] {
  const database = connectedDatabase ?? getDatabaseConnection(true)

  const sqlParameters: SQLInputValue[] = []

  if (filters?.parentCemeteryId !== undefined) {
    sqlParameters.push(filters.parentCemeteryId)
  }

  database.function(
    'userFn_getFindAGraveCemeteryUrl',
    {
      deterministic: true
    },
    (findagraveCemeteryId: SQLOutputValue) =>
      getFindAGraveCemeteryUrl(findagraveCemeteryId as number | null) ?? null
  )

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
        cem.findagraveCemeteryId,
        userFn_getFindAGraveCemeteryUrl (cem.findagraveCemeteryId) AS findagraveCemeteryUrl,
        p.cemeteryId AS parentCemeteryId,
        p.cemeteryName AS parentCemeteryName,
        COUNT(b.burialSiteId) AS burialSiteCount
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
        cem.findagraveCemeteryId,
        p.cemeteryId,
        p.cemeteryName
      ORDER BY
        cem.cemeteryName,
        cem.cemeteryId
    `)
    .all(...sqlParameters) as unknown as Cemetery[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return cemeteries
}
