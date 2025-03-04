import { acquireConnection } from './pool.js';
export default async function getIntermentContainerTypes() {
    const database = await acquireConnection();
    const containerTypes = database
        .prepare(`select intermentContainerTypeId, intermentContainerType, orderNumber
        from IntermentContainerTypes
        where recordDelete_timeMillis is null
        order by orderNumber, intermentContainerType, intermentContainerTypeId`)
        .all();
    database.release();
    return containerTypes;
}
