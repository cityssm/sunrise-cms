import { acquireConnection } from './pool.js';
export default async function getBurialSiteTypeSummary(filters) {
    const database = await acquireConnection();
    let sqlWhereClause = ' where l.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if ((filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' and l.cemeteryId = ?';
        sqlParameters.push(filters.cemeteryId);
    }
    const burialSiteTypes = database
        .prepare(`select t.burialSiteTypeId, t.burialSiteType,
        count(l.burialSiteId) as burialSiteCount
        from BurialSites l
        left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
        ${sqlWhereClause}
        group by t.burialSiteTypeId, t.burialSiteType, t.orderNumber
        order by t.orderNumber`)
        .all(sqlParameters);
    database.release();
    return burialSiteTypes;
}
