import { acquireConnection } from './pool.js';
export default async function getIntermentCommittalTypes() {
    const database = await acquireConnection();
    const committalTypes = database
        .prepare(`select intermentCommittalTypeId, intermentCommittalType, orderNumber
        from IntermentCommittalTypes
        where recordDelete_timeMillis is null
        order by orderNumber, intermentCommittalType, intermentCommittalTypeId`)
        .all();
    database.release();
    return committalTypes;
}
