import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const workOrderNumberRegex = /^\d{4}-\d+$/;
function matchesWorkOrderNumberSyntax(workOrderNumber) {
    return workOrderNumberRegex.test(workOrderNumber) ? 1 : 0;
}
export default function getNextWorkOrderNumber(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const paddingLength = getConfigProperty('settings.workOrders.workOrderNumberLength');
    const currentYearString = new Date().getFullYear().toString();
    database.function('userFn_matchesWorkOrderNumberSyntax', matchesWorkOrderNumberSyntax);
    const workOrderNumberRecord = database
        .prepare(`
      SELECT
        workOrderNumber
      FROM
        WorkOrders
      WHERE
        workOrderNumber like ? || '-%'
        AND userFn_matchesWorkOrderNumberSyntax (workOrderNumber) = 1
      ORDER BY
        CAST(
          SUBSTR(workOrderNumber, INSTR(workOrderNumber, '-') + 1) AS INTEGER
        ) DESC
      LIMIT
        1
    `)
        .get(currentYearString);
    if (connectedDatabase === undefined) {
        database.close();
    }
    let workOrderNumberIndex = workOrderNumberRecord === undefined
        ? 0
        : Math.trunc(Number(workOrderNumberRecord.workOrderNumber.split('-', 2)[1]));
    workOrderNumberIndex += 1;
    return `${currentYearString}-${workOrderNumberIndex.toString().padStart(paddingLength, '0')}`;
}
