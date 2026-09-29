import { DatabaseSync } from 'node:sqlite';
import { dateToInteger } from '@cityssm/utils-datetime';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import { startSyncDataToPortalTask } from '../integrations/portal/taskStart.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
import getFuneralHome from './getFuneralHome.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export default function deleteFuneralHome(funeralHomeId, user, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const currentDateInteger = dateToInteger(new Date());
    const activeContract = database
        .prepare(`
      SELECT
        contractId
      FROM
        Contracts
      WHERE
        funeralHomeId = ?
        AND recordDelete_timeMillis IS NULL
        AND (
          contractEndDate IS NULL
          OR contractEndDate >= ?
        )
        AND funeralDate >= ?
    `)
        .get(funeralHomeId, currentDateInteger, currentDateInteger);
    if (activeContract !== undefined) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return false;
    }
    const recordBefore = isAuditLoggingEnabled
        ? getFuneralHome(funeralHomeId, false, database)
        : undefined;
    const rightNowMillis = Date.now();
    database
        .prepare(`
      UPDATE FuneralHomes
      SET
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        funeralHomeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.username, rightNowMillis, funeralHomeId);
    if (isAuditLoggingEnabled) {
        createAuditLogEntries({
            mainRecordId: funeralHomeId,
            mainRecordType: 'funeralHome',
            updateTable: 'FuneralHomes'
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
    startSyncDataToPortalTask();
    return true;
}
