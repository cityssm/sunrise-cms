import type { Lot } from '../types/recordTypes.js'

import getLotComments from './getLotComments.js'
import getLotFields from './getLotFields.js'
import getBurialSiteInterments from './getLotOccupancies.js'
import { acquireConnection } from './pool.js'

const baseSQL = `select l.burialSiteId,
  l.burialSiteTypeId, t.burialSiteType,
  l.burialSiteNameSegment1,
  l.burialSiteNameSegment2,
  l.burialSiteNameSegment3,
  l.burialSiteNameSegment4,
  l.burialSiteNameSegment5,
  l.burialSiteStatusId, s.burialSiteStatus,
  l.cemeteryId, m.cemeteryName,
  m.cemeterySvg, l.cemeterySvgId,
  l.burialSiteLatitude, l.burialSiteLongitude,

    from BurialSites l
    left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
    left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
    left join Cemeteries m on l.cemeteryId = m.cemeteryId
    where l.recordDelete_timeMillis is null`

async function _getBurialSite(
  sql: string,
  burialSiteIdOrLotName: number | string
): Promise<Lot | undefined> {
  const database = await acquireConnection()

  const burialSite = database.prepare(sql).get(burialSiteIdOrLotName) as Lot | undefined

  if (burialSite !== undefined) {
    const lotOccupancies = await getBurialSiteInterments(
      {
        lotId: burialSite.lotId
      },
      {
        includeOccupants: true,
        includeFees: false,
        includeTransactions: false,
        limit: -1,
        offset: 0
      },
      database
    )

    burialSite.lotOccupancies = lotOccupancies.lotOccupancies

    burialSite.lotFields = await getLotFields(burialSite.lotId, database)

    burialSite.lotComments = await getLotComments(burialSite.lotId, database)
  }

  database.release()

  return burialSite
}

// TODO
export async function getLotByLotName(
  lotName: string
): Promise<Lot | undefined> {
  return await _getBurialSite(`${baseSQL} and l.lotName = ?`, lotName)
}

export default async function getLot(
  burialSiteId: number | string
): Promise<Lot | undefined> {
  return await _getBurialSite(`${baseSQL} and l.burialSiteId = ?`, burialSiteId)
}
