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
        .prepare(`select m.cemeteryId, m.cemeteryName, m.cemeteryKey, m.cemeteryDescription,
        m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
        m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
        m.cemeteryPhoneNumber,

        p.cemeteryId as parentCemeteryId, p.cemeteryName as parentCemeteryName,
        p.cemeteryLatitude as parentCemeteryLatitude, p.cemeteryLongitude as parentCemeteryLongitude,
        p.cemeterySvg as parentCemeterySvg,

        m.recordCreate_userName, m.recordCreate_timeMillis,
        m.recordUpdate_userName, m.recordUpdate_timeMillis,
        m.recordDelete_userName, m.recordDelete_timeMillis,
        count(l.burialSiteId) as burialSiteCount
        from Cemeteries m
        left join Cemeteries p on m.parentCemeteryId = p.cemeteryId and p.recordDelete_timeMillis is null
        left join BurialSites l on m.cemeteryId = l.cemeteryId and l.recordDelete_timeMillis is null
        where m.${keyColumn} = ?
          and m.recordDelete_timeMillis is null
        group by m.cemeteryId, m.cemeteryName, m.cemeteryDescription,
          m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
          m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
          m.cemeteryPhoneNumber,
          p.cemeteryId, p.cemeteryName,
          m.recordCreate_userName, m.recordCreate_timeMillis,
          m.recordUpdate_userName, m.recordUpdate_timeMillis,
          m.recordDelete_userName, m.recordDelete_timeMillis`)
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
