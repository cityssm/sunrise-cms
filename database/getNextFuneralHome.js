import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getNextFuneralHomeId(funeralHomeId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const result = database
        .prepare(/* sql */ `
      SELECT
        funeralHomeId
      FROM
        FuneralHomes
      WHERE
        recordDelete_timeMillis IS NULL
        AND funeralHomeName > (
          SELECT
            funeralHomeName
          FROM
            FuneralHomes
          WHERE
            funeralHomeId = ?
        )
      ORDER BY
        funeralHomeName
      LIMIT
        1
    `)
        .pluck()
        .get(funeralHomeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}
