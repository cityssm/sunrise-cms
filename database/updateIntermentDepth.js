import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateIntermentDepth(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(/* sql */ `
      UPDATE IntermentDepths
      SET
        intermentDepth = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND intermentDepthId = ?
    `)
        .run(updateForm.intermentDepth, user.userName, rightNowMillis, updateForm.intermentDepthId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('IntermentDepths');
    return result.changes > 0;
}
