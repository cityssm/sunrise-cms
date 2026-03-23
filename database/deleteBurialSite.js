import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export function deleteBurialSite(burialSiteId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const currentDateInteger = dateToInteger(new Date());
    const activeContract = database
        .prepare(`
      SELECT
        contractId
      FROM
        Contracts
      WHERE
        burialSiteId = ?
        AND recordDelete_timeMillis IS NULL
        AND (
          contractEndDate IS NULL
          OR contractEndDate >= ?
        )
    `)
        .pluck()
        .get(burialSiteId, currentDateInteger);
    if (activeContract !== undefined) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return false;
    }
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            BurialSites
          WHERE
            burialSiteId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(burialSiteId)
        : undefined;
    const rightNowMillis = Date.now();
    database
        .prepare(`
      UPDATE BurialSites
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        burialSiteId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.userName, rightNowMillis, burialSiteId);
    if (auditLogIsEnabled) {
        createAuditLogEntries({
            mainRecordId: burialSiteId,
            mainRecordType: 'burialSite',
            updateTable: 'BurialSites'
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
