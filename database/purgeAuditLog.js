/* eslint-disable @typescript-eslint/no-magic-numbers */
import { daysToMillis } from '@cityssm/to-millis';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function purgeAuditLog(age, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const currentMillis = Date.now();
    let minimumMillis;
    switch (age) {
        case 'ninetyDays': {
            minimumMillis = currentMillis - daysToMillis(90);
            break;
        }
        case 'oneYear': {
            minimumMillis = currentMillis - daysToMillis(365);
            break;
        }
        case 'thirtyDays': {
            minimumMillis = currentMillis - daysToMillis(30);
            break;
        }
        default: {
            minimumMillis = currentMillis + 1;
            break;
        }
    }
    const result = database
        .prepare(/* sql */ `
      DELETE FROM AuditLog
      WHERE
        logMillis < ?
    `)
        .run(minimumMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes;
}
