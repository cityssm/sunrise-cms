import { acquireConnection } from './pool.js';
async function _getCemetery(keyColumn, cemeteryIdOrKey, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const cemetery = database
        .prepare(`select m.cemeteryId, m.cemeteryName, m.cemeteryKey, m.cemeteryDescription,
        m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
        m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
        m.cemeteryPhoneNumber,
        m.recordCreate_userName, m.recordCreate_timeMillis,
        m.recordUpdate_userName, m.recordUpdate_timeMillis,
        m.recordDelete_userName, m.recordDelete_timeMillis,
        count(l.burialSiteId) as burialSiteCount
        from Cemeteries m
        left join BurialSites l on m.cemeteryId = l.cemeteryId and l.recordDelete_timeMillis is null
        where m.${keyColumn} = ?
          and m.recordDelete_timeMillis is null
        group by m.cemeteryId, m.cemeteryName, m.cemeteryDescription,
          m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
          m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
          m.cemeteryPhoneNumber,
          m.recordCreate_userName, m.recordCreate_timeMillis,
          m.recordUpdate_userName, m.recordUpdate_timeMillis,
          m.recordDelete_userName, m.recordDelete_timeMillis`)
        .get(cemeteryIdOrKey);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return cemetery;
}
export default async function getCemetery(cemeteryId, connectedDatabase) {
    return await _getCemetery('cemeteryId', cemeteryId, connectedDatabase);
}
export async function getCemeteryByKey(cemeteryKey, connectedDatabase) {
    return await _getCemetery('cemeteryKey', cemeteryKey, connectedDatabase);
}
