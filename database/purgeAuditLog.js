import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function purgeAuditLog(age, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const currentMillis = Date.now();
    let minimumMillis;
    switch (age) {
        case 'thirtyDays': {
            minimumMillis = currentMillis - 30 * 24 * 60 * 60 * 1000;
            break;
        }
        case 'ninetyDays': {
            minimumMillis = currentMillis - 90 * 24 * 60 * 60 * 1000;
            break;
        }
        case 'oneYear': {
            minimumMillis = currentMillis - 365 * 24 * 60 * 60 * 1000;
            break;
        }
        default: {
            minimumMillis = currentMillis + 1;
            break;
        }
    }
    const result = database
        .prepare(/* sql */ `
      DELETE FROM
        AuditLog
      WHERE
        logMillis < ?
    `)
        .run(minimumMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes;
}
