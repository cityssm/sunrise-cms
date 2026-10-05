import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getNextBurialSiteId(burialSiteId, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true });
    const result = database
        .prepare(`
      SELECT
        burialSiteId
      FROM
        BurialSites
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteName > (
          SELECT
            burialSiteName
          FROM
            BurialSites
          WHERE
            burialSiteId = ?
        )
      ORDER BY
        burialSiteName
      LIMIT
        1
    `)
        .get(burialSiteId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result?.burialSiteId;
}
