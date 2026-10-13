import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function getNextCemeteryId(cemeteryId, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection(true);
    const result = database
        .prepare(`
      SELECT
        cemeteryId
      FROM
        Cemeteries
      WHERE
        recordDelete_timeMillis IS NULL
        AND cemeteryName > (
          SELECT
            cemeteryName
          FROM
            Cemeteries
          WHERE
            cemeteryId = ?
        )
      ORDER BY
        cemeteryName
      LIMIT
        1
    `)
        .get(cemeteryId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result?.cemeteryId;
}
