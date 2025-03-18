import { acquireConnection } from './pool.js';
async function _getFuneralHome(keyColumn, funeralHomeIdOrKey) {
    const database = await acquireConnection();
    const funeralHome = database
        .prepare(`select funeralHomeId, funeralHomeKey, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber
        from FuneralHomes f
        where f.recordDelete_timeMillis is null
        and f.${keyColumn} = ?
        order by f.funeralHomeName, f.funeralHomeId`)
        .get(funeralHomeIdOrKey);
    database.release();
    return funeralHome;
}
export default async function getFuneralHome(funeralHomeId) {
    return await _getFuneralHome('funeralHomeId', funeralHomeId);
}
export async function getFuneralHomeByKey(funeralHomeKey) {
    return await _getFuneralHome('funeralHomeKey', funeralHomeKey);
}
