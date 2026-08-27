import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
const limit = 20;
export default function getFuneralDirectorNamesByFuneralHomeId(funeralHomeId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const funeralDirectors = database
        .prepare(`
      SELECT
        funeralDirectorName
      FROM
        Contracts
      WHERE
        recordDelete_timeMillis IS NULL
        AND funeralHomeId = ?
        AND funeralDirectorName IS NOT NULL
        AND TRIM(funeralDirectorName) != ''
      GROUP BY
        funeralDirectorName
      ORDER BY
        COUNT(*) DESC,
        funeralDirectorName
      LIMIT
        ${limit}
    `)
        .pluck()
        .all(funeralHomeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return funeralDirectors;
}
