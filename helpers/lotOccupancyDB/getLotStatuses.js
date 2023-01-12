import sqlite from 'better-sqlite3';
import { lotOccupancyDB as databasePath } from '../../data/databasePaths.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export function getLotStatuses() {
    const database = sqlite(databasePath);
    const lotStatuses = database
        .prepare(`select lotStatusId, lotStatus, orderNumber
        from LotStatuses
        where recordDelete_timeMillis is null
        order by orderNumber, lotStatus`)
        .all();
    let expectedOrderNumber = 0;
    for (const lotStatus of lotStatuses) {
        if (lotStatus.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('LotStatuses', lotStatus.lotStatusId, expectedOrderNumber, database);
            lotStatus.orderNumber = expectedOrderNumber;
        }
        expectedOrderNumber += 1;
    }
    database.close();
    return lotStatuses;
}
export default getLotStatuses;
