import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { BurialSite } from '../types/record.types.js'

import getBurialSiteComments from './getBurialSiteComments.js'
import getBurialSiteFields from './getBurialSiteFields.js'
import getContracts from './getContracts.js'

export default async function getBurialSite(
  burialSiteId: number | string,
  includeDeleted = false,
  connectedDatabase: sqlite.Database | undefined = undefined
): Promise<BurialSite | undefined> {
  return await _getBurialSite(
    'burialSiteId',
    burialSiteId,
    includeDeleted,
    connectedDatabase
  )
}

export async function getBurialSiteByBurialSiteName(
  burialSiteName: string,
  includeDeleted = false,
  connectedDatabase: sqlite.Database | undefined = undefined
): Promise<BurialSite | undefined> {
  return await _getBurialSite(
    'burialSiteName',
    burialSiteName,
    includeDeleted,
    connectedDatabase
  )
}

async function _getBurialSite(
  keyColumn: 'burialSiteId' | 'burialSiteName',
  burialSiteIdOrName: number | string,
  includeDeleted = false,
  connectedDatabase: sqlite.Database | undefined = undefined
): Promise<BurialSite | undefined> {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const burialSite = database
    .prepare(/* sql */ `
      SELECT
        b.burialSiteId,
        b.burialSiteTypeId,
        t.burialSiteType,
        b.burialSiteNameSegment1,
        b.burialSiteNameSegment2,
        b.burialSiteNameSegment3,
        b.burialSiteNameSegment4,
        b.burialSiteNameSegment5,
        b.burialSiteName,
        b.burialSiteStatusId,
        s.burialSiteStatus,
        b.bodyCapacity,
        b.crematedCapacity,
        t.bodyCapacityMax,
        t.crematedCapacityMax,
        b.cemeteryId,
        c.cemeteryName,
        c.cemeteryKey,
        c.cemeteryLatitude,
        c.cemeteryLongitude,
        c.cemeterySvg,
        b.cemeterySvgId,
        b.burialSiteImage,
        b.burialSiteLatitude,
        b.burialSiteLongitude,
        b.recordDelete_userName,
        b.recordDelete_timeMillis
      FROM
        BurialSites b
        LEFT JOIN BurialSiteTypes t ON b.burialSiteTypeId = t.burialSiteTypeId
        LEFT JOIN BurialSiteStatuses s ON b.burialSiteStatusId = s.burialSiteStatusId
        LEFT JOIN Cemeteries c ON b.cemeteryId = c.cemeteryId
      WHERE
        b.${keyColumn} = ? ${includeDeleted
          ? ''
          : ' AND b.recordDelete_timeMillis IS NULL '}
      ORDER BY
        b.burialSiteId
    `)
    .get(burialSiteIdOrName) as BurialSite | undefined

  if (burialSite !== undefined) {
    const contracts = await getContracts(
      {
        burialSiteId: burialSite.burialSiteId
      },
      {
        limit: -1,
        offset: 0,

        includeFees: false,
        includeInterments: true,
        includeTransactions: false
      },
      database
    )

    burialSite.contracts = contracts.contracts

    burialSite.burialSiteFields = getBurialSiteFields(
      burialSite.burialSiteId,
      database
    )

    burialSite.burialSiteComments = getBurialSiteComments(
      burialSite.burialSiteId,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return burialSite
}
