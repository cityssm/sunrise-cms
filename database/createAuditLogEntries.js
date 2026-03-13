/* eslint-disable unicorn/no-null */
import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime';
const propertiesToExclude = new Set([
    'recordCreate_timeMillis',
    'recordCreate_userName',
    'recordUpdate_timeMillis'
]);
/**
 * Creates audit log entries for a record update based on the differences between
 * the previous and updated record values. Excludes certain properties from being logged,
 * and handles null/undefined values appropriately.
 * @param record - An object containing information about the main record being updated,
 * including its ID, type, and the table being updated.
 * @param record.updateTable - The name of the table being updated.
 * @param record.recordIndex - The index of the record being updated, if applicable.
 * @param record.mainRecordType - The type of the main record being updated.
 * @param record.mainRecordId - The ID of the main record being updated.
 * @param differences - An array of Difference objects representing the changes made to the record.
 * If the list is empty, nothing will be logged.
 * @param user - The User object representing the user making the update, used for logging purposes.
 * @param connectedDatabase - An instance of a connected SQLite database to use for inserting audit log entries.
 * @returns The number of audit log entries created based on the provided differences.
 */
export default function createAuditLogEntries(record, differences, user, connectedDatabase) {
    let entriesCreated = 0;
    for (const difference of differences) {
        if (propertiesToExclude.has(difference.property) ||
            difference.type === 'NA') {
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
            .run(currentDate.getTime(), dateToInteger(currentDate), dateToTimeInteger(currentDate), record.mainRecordType, String(record.mainRecordId), record.updateTable, record.recordIndex === undefined ? null : String(record.recordIndex), difference.property, difference.type, user.userName, fromValue, toValue);
        entriesCreated += 1;
    }
    return entriesCreated;
}
