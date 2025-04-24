import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getNextWorkOrderNumber(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const paddingLength = getConfigProperty('settings.workOrders.workOrderNumberLength');
    const currentYearString = new Date().getFullYear().toString();
    const regex = new RegExp(`^${currentYearString}-\\d+$`);
    database.function(
    // eslint-disable-next-line no-secrets/no-secrets
    'userFn_matchesWorkOrderNumberSyntax', (workOrderNumber) => (regex.test(workOrderNumber) ? 1 : 0));
    const workOrderNumberRecord = database
        .prepare(
    // eslint-disable-next-line no-secrets/no-secrets
    `select workOrderNumber from WorkOrders
        where userFn_matchesWorkOrderNumberSyntax(workOrderNumber) = 1
        order by cast(substr(workOrderNumber, instr(workOrderNumber, '-') + 1) as integer) desc`)
        .get();
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
