import { acquireConnection } from './pool.js';
export default async function deleteBurialSiteField(burialSiteId, burialSiteTypeFieldId, user, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const result = database
        .prepare(`update BurialSiteFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteId = ?
        and burialSiteTypeFieldId = ?`)
        .run(user.userName, Date.now(), burialSiteId, burialSiteTypeFieldId);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return result.changes > 0;
}
