import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getFuneralHome(funeralHomeId) {
    return _getFuneralHome('funeralHomeId', funeralHomeId);
}
export function getFuneralHomeByKey(funeralHomeKey) {
    return _getFuneralHome('funeralHomeKey', funeralHomeKey);
}
function _getFuneralHome(keyColumn, funeralHomeIdOrKey) {
    const database = sqlite(sunriseDB);
    const funeralHome = database
        .prepare(`select funeralHomeId, funeralHomeKey, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber
        from FuneralHomes f
        where f.recordDelete_timeMillis is null
        and f.${keyColumn} = ?
        order by f.funeralHomeName, f.funeralHomeId`)
        .get(funeralHomeIdOrKey);
    database.close();
    return funeralHome;
}
