import { dateStringToInteger } from '@cityssm/utils-datetime';
import addLotOccupancyOccupant from './addLotOccupancyOccupant.js';
import addOrUpdateBurialSiteContractField from './addOrUpdateBurialSiteContractField.js';
import { acquireConnection } from './pool.js';
export default async function addLotOccupancy(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const rightNowMillis = Date.now();
    const contractStartDate = dateStringToInteger(addForm.contractStartDateString);
    if (contractStartDate <= 0) {
        console.error(addForm);
    }
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
        const lotOccupancyFieldValue = addForm[`lotOccupancyFieldValue_${contractTypeFieldId}`];
        if ((lotOccupancyFieldValue ?? '') !== '') {
            await addOrUpdateBurialSiteContractField({
                burialSiteContractId,
                contractTypeFieldId,
                lotOccupancyFieldValue: lotOccupancyFieldValue ?? ''
            }, user, database);
        }
    }
    if ((addForm.lotOccupantTypeId ?? '') !== '') {
        await addLotOccupancyOccupant({
            burialSiteContractId,
            lotOccupantTypeId: addForm.lotOccupantTypeId ?? '',
            occupantName: addForm.occupantName ?? '',
            occupantFamilyName: addForm.occupantFamilyName ?? '',
            occupantAddress1: addForm.occupantAddress1 ?? '',
            occupantAddress2: addForm.occupantAddress2 ?? '',
            occupantCity: addForm.occupantCity ?? '',
            occupantProvince: addForm.occupantProvince ?? '',
            occupantPostalCode: addForm.occupantPostalCode ?? '',
            occupantPhoneNumber: addForm.occupantPhoneNumber ?? '',
            occupantEmailAddress: addForm.occupantEmailAddress ?? '',
            occupantComment: addForm.occupantComment ?? ''
        }, user, database);
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return burialSiteContractId;
}
