import sqlite from "better-sqlite3";
import { lotOccupancyDB as databasePath } from "../../data/databasePaths.js";
import { clearCacheByTableName } from "../functions.cache.js";
export function deleteOccupancyTypePrint(occupancyTypeId, printEJS, requestSession) {
    const database = sqlite(databasePath);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`update OccupancyTypePrints
                set recordDelete_userName = ?,
                recordDelete_timeMillis = ?
                where occupancyTypeId = ?
                and printEJS = ?`)
        .run(requestSession.user.userName, rightNowMillis, occupancyTypeId, printEJS);
    database.close();
    clearCacheByTableName("OccupancyTypePrints");
    return result.changes > 0;
}
export default deleteOccupancyTypePrint;
