import { acquireConnection } from './pool.js';
export default async function getCemeteries() {
    const database = await acquireConnection();
    const cemeteries = database
        .prepare(`select m.cemeteryId, m.cemeteryName, m.cemeteryKey, m.cemeteryDescription,
        m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
        m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
        m.cemeteryPhoneNumber,
        count(b.burialSiteId) as burialSiteCount
        from Cemeteries m
        left join BurialSites b on m.cemeteryId = b.cemeteryId and b.recordDelete_timeMillis is null
        where m.recordDelete_timeMillis is null
        group by m.cemeteryId, m.cemeteryName, m.cemeteryDescription,
          m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
          m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
          m.cemeteryPhoneNumber
        order by m.cemeteryName, m.cemeteryId`)
        .all();
    database.release();
    return cemeteries;
}
