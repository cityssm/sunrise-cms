/* eslint-disable unicorn/no-null */
import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime';
export default function createAuditLogEntries(record, differences, user, connectedDatabase) {
    let entriesCreated = 0;
    for (const difference of differences) {
        if (difference.property === 'recordUpdate_timeMillis') {
            continue;
        }
        const currentDate = new Date();
        const fromValue = difference.from === undefined || difference.from === null
            ? null
            : JSON.stringify(difference.from);
        const toValue = difference.to === undefined || difference.to === null
            ? null
            : JSON.stringify(difference.to);
        connectedDatabase
            .prepare(/* sql */ `
        INSERT INTO
          AuditLog (
            logMillis,
            logDate,
            logTime,
            mainRecordType,
            mainRecordId,
            updateTable,
            recordIndex,
            updateField,
            updateType,
            updateUserName,
            fromValue,
            toValue
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
            .run(currentDate.getTime(), dateToInteger(currentDate), dateToTimeInteger(currentDate), record.mainRecordType, record.mainRecordId, record.updateTable, record.recordIndex, difference.property, difference.type, user.userName, fromValue, toValue);
        entriesCreated += 1;
    }
    return entriesCreated;
}
