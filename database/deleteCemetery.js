import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteCemetery(cemeteryId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    /*
     * Ensure no active contracts reference the cemetery
     */
    const currentDateInteger = dateToInteger(new Date());
    const activeContract = database
        .prepare(/* sql */ `
      SELECT
        contractId
      FROM
        Contracts
      WHERE
        burialSiteId IN (
          SELECT
            burialSiteId
          FROM
            BurialSites
          WHERE
            recordDelete_timeMillis IS NULL
            AND cemeteryId = ?
        )
        AND recordDelete_timeMillis IS NULL
        AND (
          contractEndDate IS NULL
          OR contractEndDate >= ?
        )
    `)
        .pluck()
        .get(cemeteryId, currentDateInteger);
    if (activeContract !== undefined) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return false;
    }
    /*
     * Delete the cemetery
     */
    const rightNowMillis = Date.now();
    database
        .prepare(/* sql */ `
      UPDATE Cemeteries
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        cemeteryId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.userName, rightNowMillis, cemeteryId);
    /*
     * Delete burial sites, fields, and comments
     */
    const deletedBurialSites = database
        .prepare(/* sql */ `
      UPDATE BurialSites
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        cemeteryId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.userName, rightNowMillis, cemeteryId).changes;
    database
        .prepare(/* sql */ `
      UPDATE BurialSiteFields
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        burialSiteId IN (
          SELECT
            burialSiteId
          FROM
            BurialSites
          WHERE
            cemeteryId = ?
        )
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.userName, rightNowMillis, cemeteryId);
    database
        .prepare(/* sql */ `
      UPDATE BurialSiteComments
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        burialSiteId IN (
          SELECT
            burialSiteId
          FROM
            BurialSites
          WHERE
            cemeteryId = ?
        )
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.userName, rightNowMillis, cemeteryId);
    if (deletedBurialSites === 0) {
        const purgeTables = ['CemeteryDirectionsOfArrival', 'Cemeteries'];
        for (const tableName of purgeTables) {
            database
                .prepare(/* sql */ `
          DELETE FROM ${tableName}
          WHERE
            cemeteryId = ?
            AND cemeteryId NOT IN (
              SELECT
                cemeteryId
              FROM
                BurialSites
            )
        `)
                .run(cemeteryId);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}
