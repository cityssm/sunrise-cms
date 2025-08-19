import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getFuneralHomes(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const funeralHomes = database
        .prepare(`select funeralHomeId, funeralHomeKey, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber
        from FuneralHomes f
        where f.recordDelete_timeMillis is null
        order by f.funeralHomeName, f.funeralHomeId`)
        .all();
    if (connectedDatabase === undefined) {
        database.close();
    }
    return funeralHomes;
}
