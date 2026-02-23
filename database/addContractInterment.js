import { dateStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
// eslint-disable-next-line complexity
export default function addContractInterment(contractForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const maxIntermentNumber = (database
        .prepare(/* sql */ `
      SELECT
        max(intermentNumber) AS maxIntermentNumber
      FROM
        ContractInterments
      WHERE
        contractId = ?
    `)
        .pluck()
        .get(contractForm.contractId) ?? 0);
    const newIntermentNumber = maxIntermentNumber + 1;
    const rightNowMillis = Date.now();
    database
        .prepare(/* sql */ `
      INSERT INTO
        ContractInterments (
          contractId,
          intermentNumber,
          deceasedName,
          deceasedAddress1,
          deceasedAddress2,
          deceasedCity,
          deceasedProvince,
          deceasedPostalCode,
          birthDate,
          birthPlace,
          deathDate,
          deathPlace,
          deathAge,
          deathAgePeriod,
          intermentContainerTypeId,
          intermentDepthId,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
    `)
        .run(contractForm.contractId, newIntermentNumber, contractForm.deceasedName ?? '', contractForm.deceasedAddress1 ?? '', contractForm.deceasedAddress2 ?? '', contractForm.deceasedCity ?? '', contractForm.deceasedProvince ?? '', (contractForm.deceasedPostalCode ?? '').toUpperCase(), (contractForm.birthDateString ?? '') === ''
        ? undefined
        : dateStringToInteger(contractForm.birthDateString), contractForm.birthPlace ?? '', (contractForm.deathDateString ?? '') === ''
        ? undefined
        : dateStringToInteger(contractForm.deathDateString), contractForm.deathPlace ?? '', (contractForm.deathAge ?? '') === '' ? undefined : contractForm.deathAge, contractForm.deathAgePeriod ?? '', (contractForm.intermentContainerTypeId ?? '') === ''
        ? undefined
        : contractForm.intermentContainerTypeId, (contractForm.intermentDepthId ?? '') === ''
        ? undefined
        : contractForm.intermentDepthId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return newIntermentNumber;
}
