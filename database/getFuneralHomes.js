import { DatabaseSync } from 'node:sqlite';
import { dateToInteger } from '@cityssm/utils-datetime';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getFuneralHomes(connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const currentDateNumber = dateToInteger(new Date());
    const funeralHomes = database
        .prepare(`
      SELECT
        f.funeralHomeId,
        f.funeralHomeKey,
        f.funeralHomeName,
        f.funeralHomeAddress1,
        f.funeralHomeAddress2,
        f.funeralHomeCity,
        f.funeralHomeProvince,
        f.funeralHomePostalCode,
        f.funeralHomePhoneNumber,
        f.isAvailableOnPortal,
        COUNT(c.contractId) AS upcomingFuneralCount
      FROM
        FuneralHomes f
        LEFT JOIN Contracts c ON f.funeralHomeId = c.funeralHomeId
        AND c.recordDelete_timeMillis IS NULL
        AND c.funeralDate >= ?
      WHERE
        f.recordDelete_timeMillis IS NULL
      GROUP BY
        f.funeralHomeId,
        f.funeralHomeKey,
        f.funeralHomeName,
        f.funeralHomeAddress1,
        f.funeralHomeAddress2,
        f.funeralHomeCity,
        f.funeralHomeProvince,
        f.funeralHomePostalCode,
        f.funeralHomePhoneNumber,
        f.isAvailableOnPortal
      ORDER BY
        f.funeralHomeName,
        f.funeralHomeId
    `)
        .all(currentDateNumber);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return funeralHomes;
}
