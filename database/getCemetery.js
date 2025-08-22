import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import getCemeteries from './getCemeteries.js';
import getCemeteryDirectionsOfArrival from './getCemeteryDirectionsOfArrival.js';
export default function getCemetery(cemeteryId, connectedDatabase) {
    return _getCemetery('cemeteryId', cemeteryId, connectedDatabase);
}
export function getCemeteryByKey(cemeteryKey, connectedDatabase) {
    return _getCemetery('cemeteryKey', cemeteryKey, connectedDatabase);
}
function _getCemetery(keyColumn, cemeteryIdOrKey, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const cemetery = database
        .prepare(`select c.cemeteryId, c.cemeteryName, c.cemeteryKey, c.cemeteryDescription,
        c.cemeteryLatitude, c.cemeteryLongitude, c.cemeterySvg,
        c.cemeteryAddress1, c.cemeteryAddress2, c.cemeteryCity, c.cemeteryProvince, c.cemeteryPostalCode,
        c.cemeteryPhoneNumber,

        p.cemeteryId as parentCemeteryId, p.cemeteryName as parentCemeteryName,
        p.cemeteryLatitude as parentCemeteryLatitude, p.cemeteryLongitude as parentCemeteryLongitude,
        p.cemeterySvg as parentCemeterySvg,

        c.recordCreate_userName, c.recordCreate_timeMillis,
        c.recordUpdate_userName, c.recordUpdate_timeMillis,
        c.recordDelete_userName, c.recordDelete_timeMillis,
        count(b.burialSiteId) as burialSiteCount
        from Cemeteries c
        left join Cemeteries p on c.parentCemeteryId = p.cemeteryId and p.recordDelete_timeMillis is null
        left join BurialSites b on c.cemeteryId = b.cemeteryId and b.recordDelete_timeMillis is null
        where c.${keyColumn} = ?
          and c.recordDelete_timeMillis is null
        group by c.cemeteryId, c.cemeteryName, c.cemeteryDescription,
          c.cemeteryLatitude, c.cemeteryLongitude, c.cemeterySvg,
          c.cemeteryAddress1, c.cemeteryAddress2, c.cemeteryCity, c.cemeteryProvince, c.cemeteryPostalCode,
          c.cemeteryPhoneNumber,
          p.cemeteryId, p.cemeteryName,
          c.recordCreate_userName, c.recordCreate_timeMillis,
          c.recordUpdate_userName, c.recordUpdate_timeMillis,
          c.recordDelete_userName, c.recordDelete_timeMillis`)
        .get(cemeteryIdOrKey);
    if (cemetery !== undefined) {
        cemetery.childCemeteries =
            cemetery.parentCemeteryId === null
                ? getCemeteries({ parentCemeteryId: cemetery.cemeteryId }, connectedDatabase)
                : [];
        cemetery.directionsOfArrival = getCemeteryDirectionsOfArrival(cemetery.cemeteryId, connectedDatabase);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return cemetery;
}
