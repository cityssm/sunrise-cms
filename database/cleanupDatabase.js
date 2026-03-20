/* eslint-disable max-lines */
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
    /*
     * Work Order Comments
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Work Order Contracts
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Work Order Burial Sites
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Work Order Milestones
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Work Orders
     */
    purgedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Work Order Milestone Types
     */
    purgedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Work Order Types
     */
    purgedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Contract Attachments
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
        .prepare(/* sql */ `
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
            // Test if file exists before deletion attempt
            await fs.access(fullFilePath);
            debug(`Deleting file: ${fullFilePath}`);
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            await fs.unlink(fullFilePath);
            purgedRecordCount += database
                .prepare('delete from ContractAttachments where contractAttachmentId = ?')
                .run(attachment.contractAttachmentId).changes;
        }
        catch {
            debug(`File not found for deletion: ${fullFilePath}`);
        }
    }
    /*
     * Contract Metadata
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Contract Comments
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Contract Fields
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Contract Fees/Transactions
     * - Maintain financial data, do not delete related.
     */
    purgedRecordCount += database
        .prepare('delete from ContractFees where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare('delete from ContractTransactions where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Related Contracts
     */
    purgedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Contracts
     */
    purgedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Fees
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
        .prepare(/* sql */ `
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
    /*
     * Fee Categories
     */
    purgedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Contract Type Fields
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
        .prepare(/* sql */ `
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
    /*
     * Contract Type Prints
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Contract Types
     */
    purgedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Burial Site Comments
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Burial Site Fields
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Burial Sites
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
        .prepare(/* sql */ `
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
    /*
     * Burial Site Statuses
     */
    purgedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Burial Site Type Fields
     */
    inactivatedRecordCount += database
        .prepare(/* sql */ `
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
        .prepare(/* sql */ `
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
    /*
     * Burial Site Types
     */
    purgedRecordCount += database
        .prepare(/* sql */ `
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
    /*
     * Cemeteries
     */
    purgedRecordCount += database
        .prepare(/* sql */ `
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
        .prepare(/* sql */ `
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
    // Work Orders
    const workOrderResult = cleanupWorkOrders(user, database);
    let inactivatedRecordCount = workOrderResult.inactivatedRecordCount;
    let purgedRecordCount = workOrderResult.purgedRecordCount;
    // Contracts
    const contractResult = await cleanupContracts(user, database);
    inactivatedRecordCount += contractResult.inactivatedRecordCount;
    purgedRecordCount += contractResult.purgedRecordCount;
    // Burial Sites
    const burialSiteResult = cleanupBurialSites(user, database);
    inactivatedRecordCount += burialSiteResult.inactivatedRecordCount;
    purgedRecordCount += burialSiteResult.purgedRecordCount;
    // Cemeteries
    const cemeteryResult = cleanupCemeteries(user, database);
    inactivatedRecordCount += cemeteryResult.inactivatedRecordCount;
    purgedRecordCount += cemeteryResult.purgedRecordCount;
    database.close();
    return {
        inactivatedRecordCount,
        purgedRecordCount
    };
}
