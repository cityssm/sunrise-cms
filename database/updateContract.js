import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import addOrUpdateContractField from './addOrUpdateContractField.js';
import deleteContractField from './deleteContractField.js';
// eslint-disable-next-line complexity
export default function updateContract(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(`update Contracts
        set contractTypeId = ?,
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
        where contractId = ?
        and recordDelete_timeMillis is null`)
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
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}
