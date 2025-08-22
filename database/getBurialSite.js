import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import getBurialSiteComments from './getBurialSiteComments.js';
import getBurialSiteFields from './getBurialSiteFields.js';
import getContracts from './getContracts.js';
export default async function getBurialSite(burialSiteId, includeDeleted = false, connectedDatabase) {
    return await _getBurialSite('burialSiteId', burialSiteId, includeDeleted, connectedDatabase);
}
export async function getBurialSiteByBurialSiteName(burialSiteName, includeDeleted = false, connectedDatabase) {
    return await _getBurialSite('burialSiteName', burialSiteName, includeDeleted, connectedDatabase);
}
async function _getBurialSite(keyColumn, burialSiteIdOrLotName, includeDeleted = false, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const burialSite = database
        .prepare(`select b.burialSiteId,
        b.burialSiteTypeId, t.burialSiteType,
        b.burialSiteNameSegment1,
        b.burialSiteNameSegment2,
        b.burialSiteNameSegment3,
        b.burialSiteNameSegment4,
        b.burialSiteNameSegment5,
        b.burialSiteName,
        b.burialSiteStatusId, s.burialSiteStatus,

        b.bodyCapacity, b.crematedCapacity,
        t.bodyCapacityMax, t.crematedCapacityMax,

        b.cemeteryId, c.cemeteryName, c.cemeteryKey,
        c.cemeteryLatitude, c.cemeteryLongitude,
        c.cemeterySvg, b.cemeterySvgId, b.burialSiteImage,
        b.burialSiteLatitude, b.burialSiteLongitude,

        b.recordDelete_userName, b.recordDelete_timeMillis

        from BurialSites b
        left join BurialSiteTypes t on b.burialSiteTypeId = t.burialSiteTypeId
        left join BurialSiteStatuses s on b.burialSiteStatusId = s.burialSiteStatusId
        left join Cemeteries c on b.cemeteryId = c.cemeteryId

        where b.${keyColumn} = ?
        ${includeDeleted ? '' : ' and b.recordDelete_timeMillis is null '}
        
        order by b.burialSiteId`)
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
    if (connectedDatabase === undefined) {
        database.close();
    }
    return burialSite;
}
