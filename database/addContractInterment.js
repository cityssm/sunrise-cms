import { dateStringToInteger } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
export default async function addContractInterment(contractForm, user, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const maxIntermentNumber = (database
        .prepare(`select max(intermentNumber) as maxIntermentNumber
      from ContractInterments
      where contractId = ?`)
        .pluck()
        .get(contractForm.contractId) ?? 0);
    const newIntermentNumber = maxIntermentNumber + 1;
    const rightNowMillis = Date.now();
    database
        .prepare(`insert into ContractInterments
        (contractId, intermentNumber,
          deceasedName, deceasedAddress1, deceasedAddress2, deceasedCity, deceasedProvince, deceasedPostalCode,
          birthDate, birthPlace, deathDate, deathPlace, intermentContainerTypeId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(contractForm.contractId, newIntermentNumber, contractForm.deceasedName, contractForm.deceasedAddress1, contractForm.deceasedAddress2, contractForm.deceasedCity, contractForm.deceasedProvince, contractForm.deceasedPostalCode, contractForm.birthDateString === ''
        ? undefined
        : dateStringToInteger(contractForm.birthDateString), contractForm.birthPlace, contractForm.deathDateString === ''
        ? undefined
        : dateStringToInteger(contractForm.deathDateString), contractForm.deathPlace, contractForm.intermentContainerTypeId === ''
        ? undefined
        : contractForm.intermentContainerTypeId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return newIntermentNumber;
}
