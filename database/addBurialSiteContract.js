import { dateStringToInteger } from '@cityssm/utils-datetime';
import addOrUpdateBurialSiteContractField from './addOrUpdateBurialSiteContractField.js';
import { acquireConnection } from './pool.js';
export default async function addBurialSiteContract(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const rightNowMillis = Date.now();
    const contractStartDate = dateStringToInteger(addForm.contractStartDateString);
    const result = database
        .prepare(`insert into BurialSiteContracts (
        contractTypeId, lotId,
        contractStartDate, contractEndDate,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(addForm.contractTypeId, addForm.burialSiteId === '' ? undefined : addForm.burialSiteId, contractStartDate, addForm.contractEndDateString === ''
        ? undefined
        : dateStringToInteger(addForm.contractEndDateString), user.userName, rightNowMillis, user.userName, rightNowMillis);
    const burialSiteContractId = result.lastInsertRowid;
    const contractTypeFieldIds = (addForm.contractTypeFieldIds ?? '').split(',');
    for (const contractTypeFieldId of contractTypeFieldIds) {
        const fieldValue = addForm[`fieldValue_${contractTypeFieldId}`];
        if ((fieldValue ?? '') !== '') {
            await addOrUpdateBurialSiteContractField({
                burialSiteContractId,
                contractTypeFieldId,
                fieldValue: fieldValue ?? ''
            }, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return burialSiteContractId;
}
