import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addOrUpdateContractField(fieldForm, user, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const rightNowMillis = Date.now();
    let result = database
        .prepare(`
      UPDATE ContractFields
      SET
        fieldValue = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_username = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        contractId = ?
        AND contractTypeFieldId = ?
    `)
        .run(fieldForm.fieldValue, user.username, rightNowMillis, fieldForm.contractId, fieldForm.contractTypeFieldId);
    if (result.changes === 0) {
        result = database
            .prepare(`
        INSERT INTO
          ContractFields (
            contractId,
            contractTypeFieldId,
            fieldValue,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
            .run(fieldForm.contractId, fieldForm.contractTypeFieldId, fieldForm.fieldValue, user.username, rightNowMillis, user.username, rightNowMillis);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
