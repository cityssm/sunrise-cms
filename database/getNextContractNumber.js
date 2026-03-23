/* eslint-disable no-secrets/no-secrets */
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
// eslint-disable-next-line require-unicode-regexp
const contractNumberRegex = /^\d+$/;
function matchesContractNumberSyntax(contractNumber) {
    return contractNumberRegex.test(contractNumber) ? 1 : 0;
}
export default function getNextContractNumber(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const paddingLength = getConfigProperty('settings.contracts.contractNumberLength');
    const currentYear = new Date().getFullYear();
    const currentYearString = currentYear.toString();
    database.function('userFn_matchesContractNumberSyntax', matchesContractNumberSyntax);
    const contractNumberRecord = database
        .prepare(/* sql */ `
      SELECT
        contractNumber
      FROM
        Contracts
      WHERE
        contractNumber like ? || '%'
        AND userFn_matchesContractNumberSyntax (contractNumber) = 1
        AND length(contractNumber) = ?
      ORDER BY
        cast(contractNumber AS INTEGER) DESC
      LIMIT
        1
    `)
        .get(currentYearString, paddingLength);
    if (connectedDatabase === undefined) {
        database.close();
    }
    let contractNumber = `${currentYearString.padEnd(paddingLength - 1, '0')}1`;
    if (contractNumberRecord !== undefined) {
        contractNumber = (Number.parseInt(contractNumberRecord.contractNumber, 10) + 1)
            .toString()
            .padStart(paddingLength, '0');
    }
    return contractNumber;
}
