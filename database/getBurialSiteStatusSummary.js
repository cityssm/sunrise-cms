import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getBurialSiteStatusSummary(filters, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    let sqlWhereClause = ' where l.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if ((filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' and l.cemeteryId = ?';
        sqlParameters.push(filters.cemeteryId);
    }
    const statuses = database
        .prepare(/* sql */ `select s.burialSiteStatusId, s.burialSiteStatus,
        count(l.burialSiteId) as burialSiteCount
        from BurialSites l
        left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
        ${sqlWhereClause}
        group by s.burialSiteStatusId, s.burialSiteStatus, s.orderNumber
        order by s.orderNumber`)
        .all(sqlParameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return statuses;
}
