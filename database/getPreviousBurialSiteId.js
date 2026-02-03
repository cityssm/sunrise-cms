import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getPreviousBurialSiteId(burialSiteId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const result = database
        .prepare(/* sql */ `
      SELECT
        burialSiteId
      FROM
        BurialSites
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteName < (
          SELECT
            burialSiteName
          FROM
            BurialSites
          WHERE
            burialSiteId = ?
        )
      ORDER BY
        burialSiteName DESC
      LIMIT
        1
    `)
        .pluck()
        .get(burialSiteId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}
