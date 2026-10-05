import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getBurialSiteStatusSummary(filters, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true });
    let sqlWhereClause = ' where l.recordDelete_timeMillis IS NULL';
    const sqlParameters = [];
    if (filters.cemeteryId !== undefined && (filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' and l.cemeteryId = ?';
        sqlParameters.push(filters.cemeteryId);
    }
    const statuses = database
        .prepare(`
      SELECT
        s.burialSiteStatusId,
        s.burialSiteStatus,
        COUNT(l.burialSiteId) AS burialSiteCount
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
        .all(...sqlParameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return statuses;
}
