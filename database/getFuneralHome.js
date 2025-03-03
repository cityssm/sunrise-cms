import { acquireConnection } from './pool.js';
export default async function getFuneralHome(funeralHomeId) {
    const database = await acquireConnection();
    const funeralHome = database
        .prepare(`select funeralHomeId, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber
        from FuneralHomes f
        where f.recordDelete_timeMillis is null
        and f.funeralHomeId = ?
        order by f.funeralHomeName, f.funeralHomeId`)
        .get(funeralHomeId);
    database.release();
    return funeralHome;
}
