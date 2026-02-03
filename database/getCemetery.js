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
        .prepare(/* sql */ `
      SELECT
        cem.cemeteryId,
        cem.cemeteryName,
        cem.cemeteryKey,
        cem.cemeteryDescription,
        cem.cemeteryLatitude,
        cem.cemeteryLongitude,
        cem.cemeterySvg,
        cem.cemeteryAddress1,
        cem.cemeteryAddress2,
        cem.cemeteryCity,
        cem.cemeteryProvince,
        cem.cemeteryPostalCode,
        cem.cemeteryPhoneNumber,
        p.cemeteryId AS parentCemeteryId,
        p.cemeteryName AS parentCemeteryName,
        p.cemeteryLatitude AS parentCemeteryLatitude,
        p.cemeteryLongitude AS parentCemeteryLongitude,
        p.cemeterySvg AS parentCemeterySvg,
        cem.recordCreate_userName,
        cem.recordCreate_timeMillis,
        cem.recordUpdate_userName,
        cem.recordUpdate_timeMillis,
        cem.recordDelete_userName,
        cem.recordDelete_timeMillis,
        count(b.burialSiteId) AS burialSiteCount
      FROM
        Cemeteries cem
        LEFT JOIN Cemeteries p ON cem.parentCemeteryId = p.cemeteryId
        AND p.recordDelete_timeMillis IS NULL
        LEFT JOIN BurialSites b ON cem.cemeteryId = b.cemeteryId
        AND b.recordDelete_timeMillis IS NULL
      WHERE
        cem.${keyColumn} = ?
        AND cem.recordDelete_timeMillis IS NULL
      GROUP BY
        cem.cemeteryId,
        cem.cemeteryName,
        cem.cemeteryDescription,
        cem.cemeteryLatitude,
        cem.cemeteryLongitude,
        cem.cemeterySvg,
        cem.cemeteryAddress1,
        cem.cemeteryAddress2,
        cem.cemeteryCity,
        cem.cemeteryProvince,
        cem.cemeteryPostalCode,
        cem.cemeteryPhoneNumber,
        p.cemeteryId,
        p.cemeteryName,
        cem.recordCreate_userName,
        cem.recordCreate_timeMillis,
        cem.recordUpdate_userName,
        cem.recordUpdate_timeMillis,
        cem.recordDelete_userName,
        cem.recordDelete_timeMillis
    `)
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
