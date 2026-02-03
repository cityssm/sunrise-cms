import { dateIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractInterments(contractId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    const interments = database
        .prepare(/* sql */ `
      SELECT
        ci.contractId,
        ci.intermentNumber,
        ci.deceasedName,
        ci.deceasedAddress1,
        ci.deceasedAddress2,
        ci.deceasedCity,
        ci.deceasedProvince,
        ci.deceasedPostalCode,
        ci.birthDate,
        userFn_dateIntegerToString (ci.birthDate) AS birthDateString,
        ci.birthPlace,
        ci.deathDate,
        userFn_dateIntegerToString (ci.deathDate) AS deathDateString,
        ci.deathPlace,
        ci.deathAge,
        ci.deathAgePeriod,
        ci.intermentContainerTypeId,
        t.intermentContainerType,
        t.isCremationType
      FROM
        ContractInterments ci
        LEFT JOIN IntermentContainerTypes t ON ci.intermentContainerTypeId = t.intermentContainerTypeId
      WHERE
        ci.recordDelete_timeMillis IS NULL
        AND ci.contractId = ?
      ORDER BY
        t.orderNumber,
        ci.deceasedName,
        ci.intermentNumber
    `)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return interments;
}
