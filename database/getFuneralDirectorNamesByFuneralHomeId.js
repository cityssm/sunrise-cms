import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
const limit = 20;
export default function getFuneralDirectorNamesByFuneralHomeId(funeralHomeId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const funeralDirectors = database
        .prepare(`select funeralDirectorName
       from Contracts
       where recordDelete_timeMillis is null
         and funeralHomeId = ?
         and funeralDirectorName is not null
         and trim(funeralDirectorName) != ''
       group by funeralDirectorName
       order by count(*) desc, funeralDirectorName
       limit ${limit}`)
        .pluck()
        .all(funeralHomeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return funeralDirectors;
}
