import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getBurialSiteTypeSummary(filters, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    let sqlWhereClause = ' WHERE l.recordDelete_timeMillis IS NULL';
    const sqlParameters = [];
    if (filters.cemeteryId !== undefined && (filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' and l.cemeteryId = ?';
        sqlParameters.push(filters.cemeteryId);
    }
    const burialSiteTypes = database
        .prepare(`
      SELECT
        t.burialSiteTypeId,
        t.burialSiteType,
        COUNT(l.burialSiteId) AS burialSiteCount
      FROM
        BurialSites l
        LEFT JOIN BurialSiteTypes t ON l.burialSiteTypeId = t.burialSiteTypeId ${sqlWhereClause}
      GROUP BY
        t.burialSiteTypeId,
        t.burialSiteType,
        t.orderNumber
      ORDER BY
        t.orderNumber
    `)
        .all(...sqlParameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return burialSiteTypes;
}
