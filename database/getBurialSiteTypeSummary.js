import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getBurialSiteTypeSummary(filters, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    let sqlWhereClause = ' where l.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if ((filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' and l.cemeteryId = ?';
        sqlParameters.push(filters.cemeteryId);
    }
    const burialSiteTypes = database
        .prepare(/* sql */ `
      SELECT
        t.burialSiteTypeId,
        t.burialSiteType,
        count(l.burialSiteId) AS burialSiteCount
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
        .all(sqlParameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return burialSiteTypes;
}
