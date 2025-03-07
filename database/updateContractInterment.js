import { dateStringToInteger } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
export default async function updateContractInterment(contractForm, user) {
    const database = await acquireConnection();
    const results = database
        .prepare(`update ContractInterments
        set deceasedName = ?,
        deceasedAddress1 = ?,
        deceasedAddress2 = ?,
        deceasedCity = ?,
        deceasedProvince = ?,
        deceasedPostalCode = ?,
        birthDate = ?,
        birthPlace = ?,
        deathDate = ?,
        deathPlace = ?,
        intermentContainerTypeId = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and contractId = ?
        and intermentNumber = ?`)
        .run(contractForm.deceasedName, contractForm.deceasedAddress1, contractForm.deceasedAddress2, contractForm.deceasedCity, contractForm.deceasedProvince, contractForm.deceasedPostalCode, contractForm.birthDateString === ''
        ? undefined
        : dateStringToInteger(contractForm.birthDateString), contractForm.birthPlace, contractForm.deathDateString === ''
        ? undefined
        : dateStringToInteger(contractForm.deathDateString), contractForm.deathPlace, contractForm.intermentContainerTypeId === ''
        ? undefined
        : contractForm.intermentContainerTypeId, user.userName, Date.now(), contractForm.contractId, contractForm.intermentNumber);
    database.release();
    return results.changes > 0;
}
