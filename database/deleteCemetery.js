import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getCemetery from './getCemetery.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function deleteCemetery(cemeteryId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const currentDateInteger = dateToInteger(new Date());
    const activeContract = database
        .prepare(`
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
    const recordBefore = auditLogIsEnabled
        ? getCemetery(cemeteryId, database)
        : undefined;
    const rightNowMillis = Date.now();
    database
        .prepare(`
      UPDATE Cemeteries
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        cemeteryId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.userName, rightNowMillis, cemeteryId);
    const deletedBurialSites = database
        .prepare(`
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
        .prepare(`
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
        .prepare(`
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
                .prepare(`
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
    if (auditLogIsEnabled) {
        createAuditLogEntries({
            mainRecordId: cemeteryId,
            mainRecordType: 'cemetery',
            updateTable: 'Cemeteries'
        }, [
            {
                property: '*',
                type: 'deleted',
                from: recordBefore,
                to: undefined
            }
        ], user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}
