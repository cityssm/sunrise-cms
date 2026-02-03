import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getFuneralHomes(connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const currentDateNumber = dateToInteger(new Date());
    const funeralHomes = database
        .prepare(/* sql */ `select f.funeralHomeId, f.funeralHomeKey, f.funeralHomeName,
        f.funeralHomeAddress1, f.funeralHomeAddress2,
        f.funeralHomeCity, f.funeralHomeProvince, f.funeralHomePostalCode, f.funeralHomePhoneNumber,
		    count(c.contractId) as upcomingFuneralCount
        from FuneralHomes f
		    left join Contracts c on f.funeralHomeId = c.funeralHomeId
          and c.recordDelete_timeMillis is null
          and c.funeralDate >= ?
        where f.recordDelete_timeMillis is null
		    group by f.funeralHomeId, f.funeralHomeKey, f.funeralHomeName,
          f.funeralHomeAddress1, f.funeralHomeAddress2,
          f.funeralHomeCity, f.funeralHomeProvince, f.funeralHomePostalCode, f.funeralHomePhoneNumber
        order by f.funeralHomeName, f.funeralHomeId`)
        .all([currentDateNumber]);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return funeralHomes;
}
