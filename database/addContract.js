import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import addContractInterment from './addContractInterment.js';
import addFuneralHome from './addFuneralHome.js';
import addOrUpdateContractField from './addOrUpdateContractField.js';
// eslint-disable-next-line complexity
export default function addContract(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    let funeralHomeId = addForm.funeralHomeId ?? '';
    if (funeralHomeId === 'new') {
        funeralHomeId = addFuneralHome({
            funeralHomeName: addForm.funeralHomeName ?? '',
            funeralHomeAddress1: addForm.funeralHomeAddress1 ?? '',
            funeralHomeAddress2: addForm.funeralHomeAddress2 ?? '',
            funeralHomeCity: addForm.funeralHomeCity ?? '',
            funeralHomePostalCode: addForm.funeralHomePostalCode ?? '',
            funeralHomeProvince: addForm.funeralHomeProvince ?? '',
            funeralHomePhoneNumber: addForm.funeralHomePhoneNumber ?? ''
        }, user, database);
    }
    const rightNowMillis = Date.now();
    const contractStartDate = dateStringToInteger(addForm.contractStartDateString);
    const result = database
        .prepare(`insert into Contracts (
        contractTypeId, burialSiteId,
        contractStartDate, contractEndDate,
        purchaserName, purchaserAddress1, purchaserAddress2,
        purchaserCity, purchaserProvince, purchaserPostalCode,
        purchaserPhoneNumber, purchaserEmail, purchaserRelationship,
        funeralHomeId, funeralDirectorName,
        funeralDate, funeralTime,
        directionOfArrival, committalTypeId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(addForm.contractTypeId, addForm.burialSiteId === '' ? undefined : addForm.burialSiteId, contractStartDate, addForm.contractEndDateString === ''
        ? undefined
        : dateStringToInteger(addForm.contractEndDateString), addForm.purchaserName ?? '', addForm.purchaserAddress1 ?? '', addForm.purchaserAddress2 ?? '', addForm.purchaserCity ?? '', addForm.purchaserProvince ?? '', addForm.purchaserPostalCode ?? '', addForm.purchaserPhoneNumber ?? '', addForm.purchaserEmail ?? '', addForm.purchaserRelationship ?? '', funeralHomeId === '' ? undefined : funeralHomeId, addForm.funeralDirectorName ?? '', addForm.funeralDateString === ''
        ? undefined
        : dateStringToInteger(addForm.funeralDateString), addForm.funeralTimeString === ''
        ? undefined
        : timeStringToInteger(addForm.funeralTimeString), addForm.directionOfArrival ?? '', addForm.committalTypeId === '' ? undefined : addForm.committalTypeId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    const contractId = result.lastInsertRowid;
    /*
     * Add contract fields
     */
    const contractTypeFieldIds = (addForm.contractTypeFieldIds ?? '').split(',');
    for (const contractTypeFieldId of contractTypeFieldIds) {
        const fieldValue = addForm[`fieldValue_${contractTypeFieldId}`];
        if ((fieldValue ?? '') !== '') {
            addOrUpdateContractField({
                contractId,
                contractTypeFieldId,
                fieldValue: fieldValue ?? ''
            }, user, database);
        }
    }
    /*
     * Add deceased information
     */
    if ((addForm.deceasedName ?? '') !== '') {
        addContractInterment({ ...addForm, contractId }, user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return contractId;
}
