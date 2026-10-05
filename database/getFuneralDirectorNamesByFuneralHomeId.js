import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
const limit = 20;
export default function getFuneralDirectorNamesByFuneralHomeId(funeralHomeId, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true });
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
        .all(funeralHomeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return funeralDirectors.map((fd) => fd.funeralDirectorName);
}
