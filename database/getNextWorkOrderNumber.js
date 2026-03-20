import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
// eslint-disable-next-line require-unicode-regexp
const workOrderNumberRegex = /^\d{4}-\d+$/;
function matchesWorkOrderNumberSyntax(workOrderNumber) {
    return workOrderNumberRegex.test(workOrderNumber) ? 1 : 0;
}
export default function getNextWorkOrderNumber(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const paddingLength = getConfigProperty('settings.workOrders.workOrderNumberLength');
    const currentYearString = new Date().getFullYear().toString();
    database.function(
    // eslint-disable-next-line no-secrets/no-secrets
    'userFn_matchesWorkOrderNumberSyntax', matchesWorkOrderNumberSyntax);
    const workOrderNumberRecord = database
        .prepare(// eslint-disable-next-line no-secrets/no-secrets
    /* sql */ `
      SELECT
        workOrderNumber
      FROM
        WorkOrders
      WHERE
        workOrderNumber like ? || '-%'
        AND userFn_matchesWorkOrderNumberSyntax (workOrderNumber) = 1
      ORDER BY
        cast(
          substr(workOrderNumber, instr(workOrderNumber, '-') + 1) AS INTEGER
        ) DESC
      LIMIT
        1
    `)
        .get(currentYearString);
    if (connectedDatabase === undefined) {
        database.close();
    }
    let workOrderNumberIndex = 0;
    if (workOrderNumberRecord !== undefined) {
        workOrderNumberIndex = Number.parseInt(workOrderNumberRecord.workOrderNumber.split('-')[1], 10);
    }
    workOrderNumberIndex += 1;
    return `${currentYearString}-${workOrderNumberIndex.toString().padStart(paddingLength, '0')}`;
}
