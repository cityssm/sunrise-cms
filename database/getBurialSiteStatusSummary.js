import { acquireConnection } from './pool.js';
export default async function getBurialSiteStatusSummary(filters) {
    const database = await acquireConnection();
    let sqlWhereClause = ' where l.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if ((filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' and l.cemeteryId = ?';
        sqlParameters.push(filters.cemeteryId);
    }
    const statuses = database
        .prepare(`select s.burialSiteStatusId, s.burialSiteStatus,
        count(l.burialSiteId) as burialSiteCount
        from BurialSites l
        left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
        ${sqlWhereClause}
        group by s.burialSiteStatusId, s.burialSiteStatus, s.orderNumber
        order by s.orderNumber`)
        .all(sqlParameters);
    database.release();
    return statuses;
}
