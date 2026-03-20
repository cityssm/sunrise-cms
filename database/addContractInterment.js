import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import { datePartsToInteger } from '../helpers/partialDate.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
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
          findagraveMemorialId,
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
          ?,
          ?
        )
    `)
        .run(contractForm.contractId, newIntermentNumber, contractForm.deceasedName ?? '', contractForm.deceasedAddress1 ?? '', contractForm.deceasedAddress2 ?? '', contractForm.deceasedCity ?? '', contractForm.deceasedProvince ?? '', (contractForm.deceasedPostalCode ?? '').toUpperCase(), datePartsToInteger(contractForm.birthYear ?? '', contractForm.birthMonth ?? '', contractForm.birthDay ?? ''), contractForm.birthPlace ?? '', datePartsToInteger(contractForm.deathYear ?? '', contractForm.deathMonth ?? '', contractForm.deathDay ?? ''), contractForm.deathPlace ?? '', (contractForm.deathAge ?? '') === '' ? undefined : contractForm.deathAge, contractForm.deathAgePeriod ?? '', (contractForm.intermentContainerTypeId ?? '') === ''
        ? undefined
        : contractForm.intermentContainerTypeId, (contractForm.intermentDepthId ?? '') === ''
        ? undefined
        : contractForm.intermentDepthId, (contractForm.findagraveMemorialId ?? '') === ''
        ? undefined
        : contractForm.findagraveMemorialId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (auditLogIsEnabled) {
        const recordAfter = database
            .prepare(/* sql */ `
        SELECT
          *
        FROM
          ContractInterments
        WHERE
          contractId = ?
          AND intermentNumber = ?
      `)
            .get(contractForm.contractId, newIntermentNumber);
        createAuditLogEntries({
            mainRecordId: contractForm.contractId,
            mainRecordType: 'contract',
            recordIndex: newIntermentNumber,
            updateTable: 'ContractInterments'
        }, [
            {
                property: '*',
                type: 'created',
                from: undefined,
                to: recordAfter
            }
        ], user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return newIntermentNumber;
}
