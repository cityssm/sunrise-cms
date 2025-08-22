import { dateStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateContractInterment(contractForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
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
          deathAge = ?,
          deathAgePeriod = ?,
          intermentContainerTypeId = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractId = ?
          and intermentNumber = ?`)
        .run(contractForm.deceasedName, contractForm.deceasedAddress1, contractForm.deceasedAddress2, contractForm.deceasedCity, contractForm.deceasedProvince, contractForm.deceasedPostalCode.toUpperCase(), contractForm.birthDateString === ''
        ? undefined
        : dateStringToInteger(contractForm.birthDateString), contractForm.birthPlace, contractForm.deathDateString === ''
        ? undefined
        : dateStringToInteger(contractForm.deathDateString), contractForm.deathPlace, contractForm.deathAge, contractForm.deathAgePeriod, contractForm.intermentContainerTypeId === ''
        ? undefined
        : contractForm.intermentContainerTypeId, user.userName, Date.now(), contractForm.contractId, contractForm.intermentNumber);
    if (connectedDatabase === undefined) {

      database.close()

    }
    return results.changes > 0;
}
