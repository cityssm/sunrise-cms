import { acquireConnection } from './pool.js';
export default async function getFuneralHomes() {
    const database = await acquireConnection();
    const funeralHomes = database
        .prepare(`select funeralHomeId, funeralHomeName,
        funeralHomeAddress1, funeralHomeAddress2,
        funeralHomeCity, funeralHomeProvince, funeralHomePostalCode, funeralHomePhoneNumber
        from FuneralHomes f
        where f.recordDelete_timeMillis is null
        order by f.funeralHomeName, f.funeralHomeId`)
        .all();
    database.release();
    return funeralHomes;
}
