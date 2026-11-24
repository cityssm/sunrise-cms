import { dateToInteger } from '@cityssm/utils-datetime';
import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function getServiceDateTodayCount() {
    const database = getDatabaseConnection(true);
    const row = database
        .prepare(`
      SELECT
        COUNT(*) AS count
      FROM
        Contracts
      WHERE
        recordDelete_timeMillis IS NULL
        AND funeralDate = ?
    `)
        .get(dateToInteger(new Date()));
    database.close();
    return row?.count ?? 0;
}
