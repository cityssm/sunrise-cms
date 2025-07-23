import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addFuneralHome(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into FuneralHomes (
        funeralHomeName, funeralHomeKey, funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(addForm.funeralHomeName, addForm.funeralHomeKey ?? '', addForm.funeralHomeAddress1, addForm.funeralHomeAddress2, addForm.funeralHomeCity, addForm.funeralHomeProvince, addForm.funeralHomePostalCode.toUpperCase(), addForm.funeralHomePhoneNumber, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.lastInsertRowid;
}
