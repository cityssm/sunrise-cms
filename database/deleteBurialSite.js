import { DatabaseSync } from 'node:sqlite';
import { dateToInteger } from '@cityssm/utils-datetime';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled');
export function deleteBurialSite(burialSiteId, user, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const currentDateInteger = dateToInteger(new Date());
    const activeContractResult = database
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
        .get(burialSiteId, currentDateInteger);
    if (activeContractResult !== undefined) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return false;
    }
    const recordBefore = isAuditLoggingEnabled
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
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        burialSiteId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.username, rightNowMillis, burialSiteId);
    if (isAuditLoggingEnabled) {
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
    clearCacheByTableName('BurialSites');
    return true;
}
