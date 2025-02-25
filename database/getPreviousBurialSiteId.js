import { acquireConnection } from './pool.js';
export default async function getPreviousBurialSiteId(burialSiteId) {
    const database = await acquireConnection();
    const result = database
        .prepare(`select burialSiteId from BurialSites
        where recordDelete_timeMillis is null
        and burialSiteName < (select burialSiteName from BurialSites where burialSiteId = ?)
        order by burialSiteName desc
        limit 1`)
        .pluck()
        .get(burialSiteId);
    database.release();
    return result;
}
