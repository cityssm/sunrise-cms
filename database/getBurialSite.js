import getBurialSiteComments from './getBurialSiteComments.js';
import getBurialSiteFields from './getBurialSiteFields.js';
import getContracts from './getContracts.js';
import { acquireConnection } from './pool.js';
const baseSQL = `select l.burialSiteId,
  l.burialSiteTypeId, t.burialSiteType,
  l.burialSiteNameSegment1,
  l.burialSiteNameSegment2,
  l.burialSiteNameSegment3,
  l.burialSiteNameSegment4,
  l.burialSiteNameSegment5,
  l.burialSiteName,
  l.burialSiteStatusId, s.burialSiteStatus,
  l.cemeteryId, m.cemeteryName,
  m.cemeterySvg, l.cemeterySvgId, l.burialSiteImage,
  l.burialSiteLatitude, l.burialSiteLongitude

  from BurialSites l
  left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
  left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
  left join Cemeteries m on l.cemeteryId = m.cemeteryId
  where l.recordDelete_timeMillis is null`;
export default async function getBurialSite(burialSiteId) {
    return await _getBurialSite(`${baseSQL} and l.burialSiteId = ?`, burialSiteId);
}
export async function getBurialSiteByBurialSiteName(burialSiteName) {
    return await _getBurialSite(`${baseSQL} and l.burialSiteName = ?`, burialSiteName);
}
async function _getBurialSite(sql, burialSiteIdOrLotName) {
    const database = await acquireConnection();
    const burialSite = database.prepare(sql).get(burialSiteIdOrLotName);
    if (burialSite !== undefined) {
        const contracts = await getContracts({
            burialSiteId: burialSite.burialSiteId
        }, {
            limit: -1,
            offset: 0,
            includeFees: false,
            includeInterments: true,
            includeTransactions: false
        }, database);
        burialSite.contracts = contracts.contracts;
        burialSite.burialSiteFields = await getBurialSiteFields(burialSite.burialSiteId, database);
        burialSite.burialSiteComments = await getBurialSiteComments(burialSite.burialSiteId, database);
    }
    database.release();
    return burialSite;
}
