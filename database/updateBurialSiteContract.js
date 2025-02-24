import { dateStringToInteger } from '@cityssm/utils-datetime';
import addOrUpdateBurialSiteContractField from './addOrUpdateBurialSiteContractField.js';
import deleteBurialSiteContractField from './deleteBurialSiteContractField.js';
import { acquireConnection } from './pool.js';
export default async function updateBurialSiteContract(updateForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update BurialSiteContracts
        set contractTypeId = ?,
        burialSiteId = ?,
        contractStartDate = ?,
        contractEndDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where burialSiteContractId = ?
        and recordDelete_timeMillis is null`)
        .run(updateForm.contractTypeId, updateForm.burialSiteId === '' ? undefined : updateForm.burialSiteId, dateStringToInteger(updateForm.contractStartDateString), updateForm.contractEndDateString === ''
        ? undefined
        : dateStringToInteger(updateForm.contractEndDateString), user.userName, Date.now(), updateForm.burialSiteContractId);
    if (result.changes > 0) {
        const contractTypeFieldIds = (updateForm.contractTypeFieldIds ?? '').split(',');
        for (const contractTypeFieldId of contractTypeFieldIds) {
            const fieldValue = updateForm[`fieldValue_${contractTypeFieldId}`];
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            await ((fieldValue ?? '') === ''
                ? deleteBurialSiteContractField(updateForm.burialSiteContractId, contractTypeFieldId, user, database)
                : addOrUpdateBurialSiteContractField({
                    burialSiteContractId: updateForm.burialSiteContractId,
                    contractTypeFieldId,
                    fieldValue
                }, user, database));
        }
    }
    database.release();
    return result.changes > 0;
}
