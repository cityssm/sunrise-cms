import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import {
  getFindAGraveMemorialSearchUrl,
  getFindAGraveMemorialUrl
} from '../helpers/findagrave.helpers.js'
import { partialDateIntegerToString } from '../helpers/partialDate.helpers.js'
import type { ContractInterment } from '../types/record.types.js'

export default function getContractInterments(
  contractId: number | string,
  connectedDatabase?: DatabaseSync
): ContractInterment[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  database.function(
    'userFn_partialDateIntegerToString',
    {
      deterministic: true
    },
    (dateInteger: unknown) => partialDateIntegerToString(dateInteger as number)
  )

  database.function(
    'userFn_getFindAGraveMemorialUrl',
    {
      deterministic: true
    },
    (memorialId: unknown) =>
      getFindAGraveMemorialUrl(memorialId as number) ?? null
  )

  database.function(
    'userFn_getFindAGraveMemorialSearchUrl',
    {
      deterministic: true
    },
    (
      cemeteryId: unknown,
      deceasedName: unknown,
      birthDate: unknown,
      deathDate: unknown
    ) =>
      getFindAGraveMemorialSearchUrl(
        cemeteryId as number,
        deceasedName as string,
        birthDate as number,
        deathDate as number
      ) ?? null
  )

  const interments = database
    .prepare(/* sql */ `
      SELECT
        ci.contractId,
        ci.intermentNumber,
        ci.deceasedName,
        ci.deceasedAddress1,
        ci.deceasedAddress2,
        ci.deceasedCity,
        ci.deceasedProvince,
        ci.deceasedPostalCode,
        ci.birthDate,
        userFn_partialDateIntegerToString (ci.birthDate) AS birthDateString,
        ci.birthPlace,
        ci.deathDate,
        userFn_partialDateIntegerToString (ci.deathDate) AS deathDateString,
        ci.deathPlace,
        ci.deathAge,
        ci.deathAgePeriod,
        ci.intermentContainerTypeId,
        t.intermentContainerType,
        t.isCremationType,
        ci.intermentDepthId,
        d.intermentDepth,
        ci.findagraveMemorialId,
        userFn_getFindAGraveMemorialUrl (ci.findagraveMemorialId) AS findagraveMemorialUrl,
        userFn_getFindAGraveMemorialSearchUrl (
          cem.findagraveCemeteryId,
          ci.deceasedName,
          ci.birthDate,
          ci.deathDate
        ) AS findagraveMemorialSearchUrl
      FROM
        ContractInterments ci
        LEFT JOIN IntermentContainerTypes t ON ci.intermentContainerTypeId = t.intermentContainerTypeId
        LEFT JOIN IntermentDepths d ON ci.intermentDepthId = d.intermentDepthId
        LEFT JOIN Contracts c ON ci.contractId = c.contractId
        LEFT JOIN BurialSites b ON c.burialSiteId = b.burialSiteId
        LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
      WHERE
        ci.recordDelete_timeMillis IS NULL
        AND ci.contractId = ?
      ORDER BY
        t.orderNumber,
        ci.deceasedName,
        ci.intermentNumber
    `)
    .all(contractId) as unknown as ContractInterment[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return interments
}
