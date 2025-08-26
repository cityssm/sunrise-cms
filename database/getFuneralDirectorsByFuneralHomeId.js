import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getFuneralDirectorsByFuneralHomeId(funeralHomeId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const funeralDirectors = database
        .prepare(`select funeralDirectorName, count(*) as usageCount
       from Contracts
       where recordDelete_timeMillis is null
         and funeralHomeId = ?
         and funeralDirectorName is not null
         and trim(funeralDirectorName) != ''
       group by funeralDirectorName
       order by usageCount desc, funeralDirectorName
       limit 20`)
        .all(funeralHomeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return funeralDirectors;
}
