import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import addOrUpdateContractField from './addOrUpdateContractField.js';
import { acquireConnection } from './pool.js';
// eslint-disable-next-line complexity
export default async function addContract(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
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
        committalTypeId,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(addForm.contractTypeId, addForm.burialSiteId === '' ? undefined : addForm.burialSiteId, contractStartDate, addForm.contractEndDateString === ''
        ? undefined
        : dateStringToInteger(addForm.contractEndDateString), addForm.purchaserName ?? '', addForm.purchaserAddress1 ?? '', addForm.purchaserAddress2 ?? '', addForm.purchaserCity ?? '', addForm.purchaserProvince ?? '', addForm.purchaserPostalCode ?? '', addForm.purchaserPhoneNumber ?? '', addForm.purchaserEmail ?? '', addForm.purchaserRelationship ?? '', addForm.funeralHomeId === '' ? undefined : addForm.funeralHomeId, addForm.funeralDirectorName ?? '', addForm.funeralDateString === ''
        ? undefined
        : dateStringToInteger(addForm.funeralDateString), addForm.funeralTimeString === ''
        ? undefined
        : timeStringToInteger(addForm.funeralTimeString), addForm.committalTypeId === '' ? undefined : addForm.committalTypeId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    const contractId = result.lastInsertRowid;
    /*
     * Add contract fields
     */
    const contractTypeFieldIds = (addForm.contractTypeFieldIds ?? '').split(',');
    for (const contractTypeFieldId of contractTypeFieldIds) {
        const fieldValue = addForm[`fieldValue_${contractTypeFieldId}`];
        if ((fieldValue ?? '') !== '') {
            await addOrUpdateContractField({
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
        database
            .prepare(`insert into ContractInterments (
          contractId, intermentNumber,
          deceasedName, deceasedAddress1, deceasedAddress2,
          deceasedCity, deceasedProvince, deceasedPostalCode,
          birthDate, deathDate,
          birthPlace, deathPlace,
          intermentContainerTypeId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(contractId, 1, addForm.deceasedName ?? '', addForm.deceasedAddress1 ?? '', addForm.deceasedAddress2 ?? '', addForm.deceasedCity ?? '', addForm.deceasedProvince ?? '', addForm.deceasedPostalCode ?? '', addForm.birthDateString === ''
            ? undefined
            : dateStringToInteger(addForm.birthDateString), addForm.deathDateString === ''
            ? undefined
            : dateStringToInteger(addForm.deathDateString), addForm.birthPlace ?? '', addForm.deathPlace ?? '', addForm.intermentContainerTypeId === ''
            ? undefined
            : addForm.intermentContainerTypeId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return contractId;
}
