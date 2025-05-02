import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getFuneralHome(funeralHomeId, includeDeleted = false) {
    return _getFuneralHome('funeralHomeId', funeralHomeId, includeDeleted);
}
export function getFuneralHomeByKey(funeralHomeKey, includeDeleted = false) {
    return _getFuneralHome('funeralHomeKey', funeralHomeKey, includeDeleted);
}
function _getFuneralHome(keyColumn, funeralHomeIdOrKey, includeDeleted = false) {
    const database = sqlite(sunriseDB);
    const funeralHome = database
        .prepare(`select funeralHomeId, funeralHomeKey, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber,
        recordDelete_userName, recordDelete_timeMillis
        from FuneralHomes f
        where f.${keyColumn} = ?
        ${includeDeleted ? '' : ' and f.recordDelete_timeMillis is null '}
        order by f.funeralHomeName, f.funeralHomeId`)
        .get(funeralHomeIdOrKey);
    database.close();
    return funeralHome;
}
