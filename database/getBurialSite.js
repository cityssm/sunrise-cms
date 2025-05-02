import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import getBurialSiteComments from './getBurialSiteComments.js';
import getBurialSiteFields from './getBurialSiteFields.js';
import getContracts from './getContracts.js';
export default async function getBurialSite(burialSiteId, includeDeleted = false) {
    return await _getBurialSite('burialSiteId', burialSiteId, includeDeleted);
}
export async function getBurialSiteByBurialSiteName(burialSiteName, includeDeleted = false) {
    return await _getBurialSite('burialSiteName', burialSiteName, includeDeleted);
}
async function _getBurialSite(keyColumn, burialSiteIdOrLotName, includeDeleted = false) {
    const database = sqlite(sunriseDB, { readonly: true });
    const burialSite = database
        .prepare(`select l.burialSiteId,
        l.burialSiteTypeId, t.burialSiteType,
        l.burialSiteNameSegment1,
        l.burialSiteNameSegment2,
        l.burialSiteNameSegment3,
        l.burialSiteNameSegment4,
        l.burialSiteNameSegment5,
        l.burialSiteName,
        l.burialSiteStatusId, s.burialSiteStatus,

        l.bodyCapacity, l.crematedCapacity,
        t.bodyCapacityMax, t.crematedCapacityMax,

        l.cemeteryId, m.cemeteryName,
        m.cemeteryLatitude, m.cemeteryLongitude,
        m.cemeterySvg, l.cemeterySvgId, l.burialSiteImage,
        l.burialSiteLatitude, l.burialSiteLongitude,

        l.recordDelete_userName, l.recordDelete_timeMillis

        from BurialSites l
        left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
        left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
        left join Cemeteries m on l.cemeteryId = m.cemeteryId

        where l.${keyColumn} = ?
        ${includeDeleted ? '' : ' and l.recordDelete_timeMillis is null '}
        
        order by l.burialSiteId`)
        .get(burialSiteIdOrLotName);
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
        burialSite.burialSiteFields = getBurialSiteFields(burialSite.burialSiteId, database);
        burialSite.burialSiteComments = getBurialSiteComments(burialSite.burialSiteId, database);
    }
    database.close();
    return burialSite;
}
