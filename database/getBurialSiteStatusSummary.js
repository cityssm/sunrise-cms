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
        .prepare(/* sql */ `
      SELECT
        s.burialSiteStatusId,
        s.burialSiteStatus,
        count(l.burialSiteId) AS burialSiteCount
      FROM
        BurialSites l
        LEFT JOIN BurialSiteStatuses s ON l.burialSiteStatusId = s.burialSiteStatusId ${sqlWhereClause}
      GROUP BY
        s.burialSiteStatusId,
        s.burialSiteStatus,
        s.orderNumber
      ORDER BY
        s.orderNumber
    `)
        .all(sqlParameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return statuses;
}
