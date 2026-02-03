import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getFuneralHome(funeralHomeId, includeDeleted = false, connectedDatabase = undefined) {
    return _getFuneralHome('funeralHomeId', funeralHomeId, includeDeleted, connectedDatabase);
}
export function getFuneralHomeByKey(funeralHomeKey, includeDeleted = false, connectedDatabase = undefined) {
    return _getFuneralHome('funeralHomeKey', funeralHomeKey, includeDeleted, connectedDatabase);
}
function _getFuneralHome(keyColumn, funeralHomeIdOrKey, includeDeleted = false, connectedDatabase = undefined) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const funeralHome = database
        .prepare(/* sql */ `
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
        recordDelete_userName,
        recordDelete_timeMillis
      FROM
        FuneralHomes f
      WHERE
        f.${keyColumn} = ? ${includeDeleted
        ? ''
        : ' and f.recordDelete_timeMillis is null '}
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
