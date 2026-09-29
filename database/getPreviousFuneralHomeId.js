import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getPreviousFuneralHomeId(funeralHomeId, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const result = database
        .prepare(`
      SELECT
        funeralHomeId
      FROM
        FuneralHomes
      WHERE
        recordDelete_timeMillis IS NULL
        AND funeralHomeName < (
          SELECT
            funeralHomeName
          FROM
            FuneralHomes
          WHERE
            funeralHomeId = ?
        )
      ORDER BY
        funeralHomeName DESC
      LIMIT
        1
    `)
        .get(funeralHomeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result?.funeralHomeId;
}
