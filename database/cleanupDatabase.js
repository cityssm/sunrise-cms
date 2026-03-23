import fs from 'node:fs/promises';
import path from 'node:path';
import { daysToMillis } from '@cityssm/to-millis';
import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database:cleanupDatabase`);
function getRecordDeleteTimeMillisMin() {
    return (Date.now() -
        daysToMillis(getConfigProperty('settings.adminCleanup.recordDeleteAgeDays')));
}
function cleanupWorkOrders(user, database) {
    const rightNowMillis = Date.now();
    const recordDeleteTimeMillisMin = getRecordDeleteTimeMillisMin();
    let inactivatedRecordCount = 0;
    let purgedRecordCount = 0;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE WorkOrderComments
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrders
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from WorkOrderComments where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE WorkOrderContracts
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrders
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from WorkOrderContracts where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE WorkOrderBurialSites
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrders
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from WorkOrderBurialSites where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE WorkOrderMilestones
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrders
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from WorkOrderMilestones where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM WorkOrders
      WHERE
        recordDelete_timeMillis <= ?
        AND workOrderId NOT IN (
          SELECT
            workOrderId
          FROM
            WorkOrderComments
        )
        AND workOrderId NOT IN (
          SELECT
            workOrderId
          FROM
            WorkOrderContracts
        )
        AND workOrderId NOT IN (
          SELECT
            workOrderId
          FROM
            WorkOrderBurialSites
        )
        AND workOrderId NOT IN (
          SELECT
            workOrderId
          FROM
            WorkOrderMilestones
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM WorkOrderMilestoneTypes
      WHERE
        recordDelete_timeMillis <= ?
        AND workOrderMilestoneTypeId NOT IN (
          SELECT
            workOrderMilestoneTypeId
          FROM
            WorkOrderMilestones
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM WorkOrderTypes
      WHERE
        recordDelete_timeMillis <= ?
        AND workOrderTypeId NOT IN (
          SELECT
            workOrderTypeId
          FROM
            WorkOrders
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    return { inactivatedRecordCount, purgedRecordCount };
}
async function cleanupContracts(user, database) {
    const rightNowMillis = Date.now();
    const recordDeleteTimeMillisMin = getRecordDeleteTimeMillisMin();
    let inactivatedRecordCount = 0;
    let purgedRecordCount = 0;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE ContractAttachments
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId IN (
          SELECT
            contractId
          FROM
            Contracts
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    const attachmentsToPurge = database
        .prepare(`
      SELECT
        contractAttachmentId,
        fileName,
        filePath
      FROM
        ContractAttachments
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .all(recordDeleteTimeMillisMin);
    for (const attachment of attachmentsToPurge) {
        const fullFilePath = path.join(attachment.filePath, attachment.fileName);
        try {
            await fs.access(fullFilePath);
            debug(`Deleting file: ${fullFilePath}`);
            await fs.unlink(fullFilePath);
            purgedRecordCount += database
                .prepare('delete from ContractAttachments where contractAttachmentId = ?')
                .run(attachment.contractAttachmentId).changes;
        }
        catch {
            debug(`File not found for deletion: ${fullFilePath}`);
        }
    }
    inactivatedRecordCount += database
        .prepare(`
      UPDATE ContractMetadata
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId IN (
          SELECT
            contractId
          FROM
            Contracts
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from ContractMetadata where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE ContractComments
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId IN (
          SELECT
            contractId
          FROM
            Contracts
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from ContractComments where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE ContractFields
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId IN (
          SELECT
            contractId
          FROM
            Contracts
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from ContractFields where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare('delete from ContractFees where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare('delete from ContractTransactions where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM RelatedContracts
      WHERE
        contractIdA IN (
          SELECT
            contractId
          FROM
            Contracts
          WHERE
            recordDelete_timeMillis <= ?
        )
        OR contractIdB IN (
          SELECT
            contractId
          FROM
            Contracts
          WHERE
            recordDelete_timeMillis <= ?
        )
    `)
        .run(recordDeleteTimeMillisMin, recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM Contracts
      WHERE
        recordDelete_timeMillis <= ?
        AND contractId NOT IN (
          SELECT
            contractId
          FROM
            ContractAttachments
        )
        AND contractId NOT IN (
          SELECT
            contractId
          FROM
            ContractComments
        )
        AND contractId NOT IN (
          SELECT
            contractId
          FROM
            ContractFees
        )
        AND contractId NOT IN (
          SELECT
            contractId
          FROM
            ContractFields
        )
        AND contractId NOT IN (
          SELECT
            contractId
          FROM
            ContractInterments
        )
        AND contractId NOT IN (
          SELECT
            contractId
          FROM
            ContractMetadata
        )
        AND contractId NOT IN (
          SELECT
            contractId
          FROM
            ContractTransactions
        )
        AND contractId NOT IN (
          SELECT
            contractIdA
          FROM
            RelatedContracts
        )
        AND contractId NOT IN (
          SELECT
            contractIdB
          FROM
            RelatedContracts
        )
        AND contractId NOT IN (
          SELECT
            contractId
          FROM
            WorkOrderContracts
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE Fees
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND feeCategoryId IN (
          SELECT
            feeCategoryId
          FROM
            FeeCategories
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM Fees
      WHERE
        recordDelete_timeMillis <= ?
        AND feeId NOT IN (
          SELECT
            feeId
          FROM
            ContractFees
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM FeeCategories
      WHERE
        recordDelete_timeMillis <= ?
        AND feeCategoryId NOT IN (
          SELECT
            feeCategoryId
          FROM
            Fees
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE ContractTypeFields
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractTypeId IN (
          SELECT
            contractTypeId
          FROM
            ContractTypes
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM ContractTypeFields
      WHERE
        recordDelete_timeMillis <= ?
        AND contractTypeFieldId NOT IN (
          SELECT
            contractTypeFieldId
          FROM
            ContractFields
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE ContractTypePrints
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractTypeId IN (
          SELECT
            contractTypeId
          FROM
            ContractTypes
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from ContractTypePrints where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM ContractTypes
      WHERE
        recordDelete_timeMillis <= ?
        AND contractTypeId NOT IN (
          SELECT
            contractTypeId
          FROM
            ContractTypeFields
        )
        AND contractTypeId NOT IN (
          SELECT
            contractTypeId
          FROM
            ContractTypePrints
        )
        AND contractTypeId NOT IN (
          SELECT
            contractTypeId
          FROM
            Contracts
        )
        AND contractTypeId NOT IN (
          SELECT
            contractTypeId
          FROM
            Fees
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    return { inactivatedRecordCount, purgedRecordCount };
}
function cleanupBurialSites(user, database) {
    const rightNowMillis = Date.now();
    const recordDeleteTimeMillisMin = getRecordDeleteTimeMillisMin();
    let inactivatedRecordCount = 0;
    let purgedRecordCount = 0;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE BurialSiteComments
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteId IN (
          SELECT
            burialSiteId
          FROM
            BurialSites
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from BurialSiteComments where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE BurialSiteFields
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteId IN (
          SELECT
            burialSiteId
          FROM
            BurialSites
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from BurialSiteFields where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE BurialSites
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND cemeteryId IN (
          SELECT
            cemeteryId
          FROM
            Cemeteries
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM BurialSites
      WHERE
        recordDelete_timeMillis <= ?
        AND burialSiteId NOT IN (
          SELECT
            burialSiteId
          FROM
            BurialSiteComments
        )
        AND burialSiteId NOT IN (
          SELECT
            burialSiteId
          FROM
            BurialSiteFields
        )
        AND burialSiteId NOT IN (
          SELECT
            burialSiteId
          FROM
            Contracts
        )
        AND burialSiteId NOT IN (
          SELECT
            burialSiteId
          FROM
            WorkOrderBurialSites
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM BurialSiteStatuses
      WHERE
        recordDelete_timeMillis <= ?
        AND burialSiteStatusId NOT IN (
          SELECT
            burialSiteStatusId
          FROM
            BurialSites
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    inactivatedRecordCount += database
        .prepare(`
      UPDATE BurialSiteTypeFields
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteTypeId IN (
          SELECT
            burialSiteTypeId
          FROM
            BurialSiteTypes
          WHERE
            recordDelete_timeMillis IS NOT NULL
        )
    `)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM BurialSiteTypeFields
      WHERE
        recordDelete_timeMillis <= ?
        AND burialSiteTypeFieldId NOT IN (
          SELECT
            burialSiteTypeFieldId
          FROM
            BurialSiteFields
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM BurialSiteTypes
      WHERE
        recordDelete_timeMillis <= ?
        AND burialSiteTypeId NOT IN (
          SELECT
            burialSiteTypeId
          FROM
            BurialSites
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    return { inactivatedRecordCount, purgedRecordCount };
}
function cleanupCemeteries(user, database) {
    const recordDeleteTimeMillisMin = getRecordDeleteTimeMillisMin();
    const inactivatedRecordCount = 0;
    let purgedRecordCount = 0;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM CemeteryDirectionsOfArrival
      WHERE
        cemeteryId IN (
          SELECT
            cemeteryId
          FROM
            Cemeteries
          WHERE
            recordDelete_timeMillis <= ?
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare(`
      DELETE FROM Cemeteries
      WHERE
        recordDelete_timeMillis <= ?
        AND cemeteryId NOT IN (
          SELECT
            cemeteryId
          FROM
            CemeteryDirectionsOfArrival
        )
        AND cemeteryId NOT IN (
          SELECT
            cemeteryId
          FROM
            BurialSites
          WHERE
            cemeteryId IS NOT NULL
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    return { inactivatedRecordCount, purgedRecordCount };
}
export default async function cleanupDatabase(user) {
    const database = sqlite(sunriseDB);
    const workOrderResult = cleanupWorkOrders(user, database);
    let inactivatedRecordCount = workOrderResult.inactivatedRecordCount;
    let purgedRecordCount = workOrderResult.purgedRecordCount;
    const contractResult = await cleanupContracts(user, database);
    inactivatedRecordCount += contractResult.inactivatedRecordCount;
    purgedRecordCount += contractResult.purgedRecordCount;
    const burialSiteResult = cleanupBurialSites(user, database);
    inactivatedRecordCount += burialSiteResult.inactivatedRecordCount;
    purgedRecordCount += burialSiteResult.purgedRecordCount;
    const cemeteryResult = cleanupCemeteries(user, database);
    inactivatedRecordCount += cemeteryResult.inactivatedRecordCount;
    purgedRecordCount += cemeteryResult.purgedRecordCount;
    database.close();
    return {
        inactivatedRecordCount,
        purgedRecordCount
    };
}
