import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addOrUpdateBurialSiteField(fieldForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    let result = database
        .prepare(/* sql */ `
      UPDATE BurialSiteFields
      SET
        fieldValue = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_userName = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        burialSiteId = ?
        AND burialSiteTypeFieldId = ?
    `)
        .run(fieldForm.fieldValue, user.userName, rightNowMillis, fieldForm.burialSiteId, fieldForm.burialSiteTypeFieldId);
    if (result.changes === 0) {
        result = database
            .prepare(/* sql */ `
        INSERT INTO
          BurialSiteFields (
            burialSiteId,
            burialSiteTypeFieldId,
            fieldValue,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
            .run(fieldForm.burialSiteId, fieldForm.burialSiteTypeFieldId, fieldForm.fieldValue, user.userName, rightNowMillis, user.userName, rightNowMillis);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
