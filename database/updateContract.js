import getObjectDifference from '@cityssm/object-difference';
import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import addOrUpdateContractField from './addOrUpdateContractField.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import deleteContractField from './deleteContractField.js';
import { getAuditableContractFieldRecords, getAuditableContractRecord } from './getAuditableRecords.js';
export default function updateContract(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const recordBefore = getAuditableContractRecord(updateForm.contractId, database);
    const result = database
        .prepare(`
      UPDATE Contracts
      SET
        contractTypeId = ?,
        burialSiteId = ?,
        contractStartDate = ?,
        contractEndDate = ?,
        funeralHomeId = ?,
        funeralDirectorName = ?,
        funeralDate = ?,
        funeralTime = ?,
        directionOfArrival = ?,
        committalTypeId = ?,
        purchaserName = ?,
        purchaserAddress1 = ?,
        purchaserAddress2 = ?,
        purchaserCity = ?,
        purchaserProvince = ?,
        purchaserPostalCode = ?,
        purchaserPhoneNumber = ?,
        purchaserEmail = ?,
        purchaserRelationship = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        contractId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(updateForm.contractTypeId, updateForm.burialSiteId === '' ? undefined : updateForm.burialSiteId, dateStringToInteger(updateForm.contractStartDateString), updateForm.contractEndDateString === ''
        ? undefined
        : dateStringToInteger(updateForm.contractEndDateString), updateForm.funeralHomeId === '' ? undefined : updateForm.funeralHomeId, updateForm.funeralDirectorName, updateForm.funeralDateString === ''
        ? undefined
        : dateStringToInteger(updateForm.funeralDateString), updateForm.funeralTimeString === ''
        ? undefined
        : timeStringToInteger(updateForm.funeralTimeString), updateForm.directionOfArrival ?? '', updateForm.committalTypeId === ''
        ? undefined
        : updateForm.committalTypeId, updateForm.purchaserName ?? '', updateForm.purchaserAddress1 ?? '', updateForm.purchaserAddress2 ?? '', updateForm.purchaserCity ?? '', updateForm.purchaserProvince ?? '', updateForm.purchaserPostalCode ?? '', updateForm.purchaserPhoneNumber ?? '', updateForm.purchaserEmail ?? '', updateForm.purchaserRelationship ?? '', user.userName, Date.now(), updateForm.contractId);
    if (result.changes > 0) {
        const contractTypeFieldIds = (updateForm.contractTypeFieldIds ?? '').split(',');
        const fieldsBefore = getAuditableContractFieldRecords(updateForm.contractId, database);
        for (const contractTypeFieldId of contractTypeFieldIds) {
            const fieldValue = updateForm[`fieldValue_${contractTypeFieldId}`];
            (fieldValue ?? '') === ''
                ? deleteContractField(updateForm.contractId, contractTypeFieldId, user, database)
                : addOrUpdateContractField({
                    contractId: updateForm.contractId,
                    contractTypeFieldId,
                    fieldValue
                }, user, database);
        }
        const fieldsAfter = getAuditableContractFieldRecords(updateForm.contractId, database);
        const fieldDifferences = getObjectDifference(fieldsBefore, fieldsAfter);
        createAuditLogEntries({
            mainRecordId: updateForm.contractId,
            mainRecordType: 'contract',
            updateTable: 'ContractFields'
        }, fieldDifferences, user, database);
        const recordAfter = getAuditableContractRecord(updateForm.contractId, database);
        const differences = getObjectDifference(recordBefore, recordAfter);
        createAuditLogEntries({
            mainRecordId: updateForm.contractId,
            mainRecordType: 'contract',
            updateTable: 'Contracts'
        }, differences, user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
