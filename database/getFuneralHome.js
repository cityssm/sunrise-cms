import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function getFuneralHome(funeralHomeId, shouldIncludeDeletedRecords = false, connectedDatabase) {
    return _getFuneralHome('funeralHomeId', funeralHomeId, shouldIncludeDeletedRecords, connectedDatabase);
}
export function getFuneralHomeByKey(funeralHomeKey, shouldIncludeDeletedRecords = false, connectedDatabase) {
    return _getFuneralHome('funeralHomeKey', funeralHomeKey, shouldIncludeDeletedRecords, connectedDatabase);
}
function _getFuneralHome(keyColumn, funeralHomeIdOrKey, shouldIncludeDeletedRecords = false, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection(true);
    const funeralHome = database
        .prepare(`
      SELECT
        funeralHomeId,
        funeralHomeKey,
        funeralHomeName,
        funeralHomeAddress1,
        funeralHomeAddress2,
        funeralHomeCity,
        funeralHomeProvince,
        funeralHomePostalCode,
        funeralHomePhoneNumber,
        isAvailableOnPortal,
        recordCreate_username,
        recordCreate_timeMillis,
        recordUpdate_username,
        recordUpdate_timeMillis,
        recordDelete_username,
        recordDelete_timeMillis
      FROM
        FuneralHomes f
      WHERE
        f.${keyColumn} = ? ${shouldIncludeDeletedRecords
        ? ''
        : ' and f.recordDelete_timeMillis IS NULL '}
      ORDER BY
        f.funeralHomeName,
        f.funeralHomeId
    `)
        .get(funeralHomeIdOrKey);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return funeralHome;
}
