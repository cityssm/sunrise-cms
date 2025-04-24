import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getCemeteries(filters, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const sqlParameters = [];
    if (filters?.parentCemeteryId !== undefined) {
        sqlParameters.push(filters.parentCemeteryId);
    }
    const cemeteries = database
        .prepare(`select m.cemeteryId, m.cemeteryName, m.cemeteryKey, m.cemeteryDescription,
        m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
        m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
        m.cemeteryPhoneNumber,
        p.cemeteryId as parentCemeteryId, p.cemeteryName as parentCemeteryName,
        count(b.burialSiteId) as burialSiteCount
        from Cemeteries m
        left join Cemeteries p on m.parentCemeteryId = p.cemeteryId and p.recordDelete_timeMillis is null
        left join BurialSites b on m.cemeteryId = b.cemeteryId and b.recordDelete_timeMillis is null
        where m.recordDelete_timeMillis is null
        ${filters?.parentCemeteryId === undefined ? '' : 'and m.parentCemeteryId = ?'}
        group by m.cemeteryId, m.cemeteryName, m.cemeteryDescription,
          m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
          m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
          m.cemeteryPhoneNumber,
          p.cemeteryId, p.cemeteryName
        order by m.cemeteryName, m.cemeteryId`)
        .all(sqlParameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return cemeteries;
}
