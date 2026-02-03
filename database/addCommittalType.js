import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addCommittalType(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(/* sql */ `
      INSERT INTO
        CommittalTypes (
          committalType,
          committalTypeKey,
          orderNumber,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)
        .run(addForm.committalType, addForm.committalTypeKey ?? '', addForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('CommittalTypes');
    return result.lastInsertRowid;
}
