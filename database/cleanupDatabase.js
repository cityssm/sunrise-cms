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
    const workOrderCommentsPurged = database
        .prepare(`
      DELETE FROM WorkOrderComments
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (workOrderCommentsPurged > 0) {
        debug(`Purged ${workOrderCommentsPurged} work order comments`);
        purgedRecordCount += workOrderCommentsPurged;
    }
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
    const workOrderContractsPurged = database
        .prepare(`
      DELETE FROM WorkOrderContracts
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (workOrderContractsPurged > 0) {
        debug(`Purged ${workOrderContractsPurged} work order contracts`);
        purgedRecordCount += workOrderContractsPurged;
    }
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
    const workOrderBurialSitesPurged = database
        .prepare(`
      DELETE FROM WorkOrderBurialSites
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (workOrderBurialSitesPurged > 0) {
        debug(`Purged ${workOrderBurialSitesPurged} work order burial sites`);
        purgedRecordCount += workOrderBurialSitesPurged;
    }
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
    const workOrderMilestonesPurged = database
        .prepare(`
      DELETE FROM WorkOrderMilestones
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (workOrderMilestonesPurged > 0) {
        debug(`Purged ${workOrderMilestonesPurged} work order milestones`);
        purgedRecordCount += workOrderMilestonesPurged;
    }
    const workOrdersPurged = database
        .prepare(`
      DELETE FROM WorkOrders
      WHERE
        recordDelete_timeMillis <= ?
        AND NOT EXISTS (
          SELECT
            1
          FROM
            WorkOrderComments
          WHERE
            WorkOrderComments.workOrderId = WorkOrders.workOrderId
        )
        AND NOT EXISTS (
          SELECT
            1
          FROM
            WorkOrderContracts
          WHERE
            WorkOrderContracts.workOrderId = WorkOrders.workOrderId
        )
        AND NOT EXISTS (
          SELECT
            1
          FROM
            WorkOrderBurialSites
          WHERE
            WorkOrderBurialSites.workOrderId = WorkOrders.workOrderId
        )
        AND NOT EXISTS (
          SELECT
            1
          FROM
            WorkOrderMilestones
          WHERE
            WorkOrderMilestones.workOrderId = WorkOrders.workOrderId
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (workOrdersPurged > 0) {
        debug(`Purged ${workOrdersPurged} work orders`);
        purgedRecordCount += workOrdersPurged;
    }
    const workOrderMilestoneTypesPurged = database
        .prepare(`
      DELETE FROM WorkOrderMilestoneTypes
      WHERE
        recordDelete_timeMillis <= ?
        AND NOT EXISTS (
          SELECT
            1
          FROM
            WorkOrderMilestones
          WHERE
            WorkOrderMilestones.workOrderMilestoneTypeId = WorkOrderMilestoneTypes.workOrderMilestoneTypeId
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (workOrderMilestoneTypesPurged > 0) {
        debug(`Purged ${workOrderMilestoneTypesPurged} work order milestone types`);
        purgedRecordCount += workOrderMilestoneTypesPurged;
    }
    const workOrderTypesPurged = database
        .prepare(`
      DELETE FROM WorkOrderTypes
      WHERE
        recordDelete_timeMillis <= ?
        AND NOT EXISTS (
          SELECT
            1
          FROM
            WorkOrders
          WHERE
            WorkOrders.workOrderTypeId = WorkOrderTypes.workOrderTypeId
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (workOrderTypesPurged > 0) {
        debug(`Purged ${workOrderTypesPurged} work order types`);
        purgedRecordCount += workOrderTypesPurged;
    }
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
                .prepare(`
          DELETE FROM ContractAttachments
          WHERE
            contractAttachmentId = ?
        `)
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
    const contractMetadataPurged = database
        .prepare(`
      DELETE FROM ContractMetadata
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (contractMetadataPurged > 0) {
        debug(`Purged ${contractMetadataPurged} contract metadata`);
        purgedRecordCount += contractMetadataPurged;
    }
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
    const contractCommentsPurged = database
        .prepare(`
      DELETE FROM ContractComments
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (contractCommentsPurged > 0) {
        debug(`Purged ${contractCommentsPurged} contract comments`);
        purgedRecordCount += contractCommentsPurged;
    }
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
    const contractFieldsPurged = database
        .prepare(`
      DELETE FROM ContractFields
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (contractFieldsPurged > 0) {
        debug(`Purged ${contractFieldsPurged} contract fields`);
        purgedRecordCount += contractFieldsPurged;
    }
    const contractFeesPurged = database
        .prepare(`
      DELETE FROM ContractFees
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (contractFeesPurged > 0) {
        debug(`Purged ${contractFeesPurged} contract fees`);
        purgedRecordCount += contractFeesPurged;
    }
    const contractTransactionsPurged = database
        .prepare(`
      DELETE FROM ContractTransactions
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (contractTransactionsPurged > 0) {
        debug(`Purged ${contractTransactionsPurged} contract transactions`);
        purgedRecordCount += contractTransactionsPurged;
    }
    const relatedContractsPurged = database
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
    if (relatedContractsPurged > 0) {
        debug(`Purged ${relatedContractsPurged} related contracts`);
        purgedRecordCount += relatedContractsPurged;
    }
    const contractsPurged = database
        .prepare(`
      DELETE FROM Contracts
      WHERE
        recordDelete_timeMillis <= ?
        AND NOT EXISTS (
          SELECT
            1
          FROM
            (
              SELECT
                contractId
              FROM
                ContractAttachments
              UNION
              SELECT
                contractId
              FROM
                ContractComments
              UNION
              SELECT
                contractId
              FROM
                ContractFees
              UNION
              SELECT
                contractId
              FROM
                ContractFields
              UNION
              SELECT
                contractId
              FROM
                ContractInterments
              UNION
              SELECT
                contractId
              FROM
                ContractMetadata
              UNION
              SELECT
                contractId
              FROM
                ContractTransactions
              UNION
              SELECT
                contractIdA AS contractId
              FROM
                RelatedContracts
              UNION
              SELECT
                contractIdB AS contractId
              FROM
                RelatedContracts
              UNION
              SELECT
                contractId
              FROM
                WorkOrderContracts
            ) rc
          WHERE
            rc.contractId = Contracts.contractId
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (contractsPurged > 0) {
        debug(`Purged ${contractsPurged} contracts`);
        purgedRecordCount += contractsPurged;
    }
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
    const feesPurged = database
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
    if (feesPurged > 0) {
        debug(`Purged ${feesPurged} fees`);
        purgedRecordCount += feesPurged;
    }
    const feeCategoriesPurged = database
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
    if (feeCategoriesPurged > 0) {
        debug(`Purged ${feeCategoriesPurged} fee categories`);
        purgedRecordCount += feeCategoriesPurged;
    }
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
    const contractTypeFieldsPurged = database
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
    if (contractTypeFieldsPurged > 0) {
        debug(`Purged ${contractTypeFieldsPurged} contract type fields`);
        purgedRecordCount += contractTypeFieldsPurged;
    }
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
    const contractTypePrintsPurged = database
        .prepare(`
      DELETE FROM ContractTypePrints
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (contractTypePrintsPurged > 0) {
        debug(`Purged ${contractTypePrintsPurged} contract type prints`);
        purgedRecordCount += contractTypePrintsPurged;
    }
    const contractTypesPurged = database
        .prepare(`
      DELETE FROM ContractTypes
      WHERE
        recordDelete_timeMillis <= ?
        AND contractTypeId NOT IN (
          SELECT
            contractTypeId
          FROM
            ContractTypeFields
          UNION
          SELECT
            contractTypeId
          FROM
            ContractTypePrints
          UNION
          SELECT
            contractTypeId
          FROM
            Contracts
          UNION
          SELECT
            contractTypeId
          FROM
            Fees
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (contractTypesPurged > 0) {
        debug(`Purged ${contractTypesPurged} contract types`);
        purgedRecordCount += contractTypesPurged;
    }
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
    const burialSiteCommentsPurged = database
        .prepare(`
      DELETE FROM BurialSiteComments
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (burialSiteCommentsPurged > 0) {
        debug(`Purged ${burialSiteCommentsPurged} burial site comments`);
        purgedRecordCount += burialSiteCommentsPurged;
    }
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
    const burialSiteFieldsPurged = database
        .prepare(`
      DELETE FROM BurialSiteFields
      WHERE
        recordDelete_timeMillis <= ?
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (burialSiteFieldsPurged > 0) {
        debug(`Purged ${burialSiteFieldsPurged} burial site fields`);
        purgedRecordCount += burialSiteFieldsPurged;
    }
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
    const burialSitesPurged = database
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
    if (burialSitesPurged > 0) {
        debug(`Purged ${burialSitesPurged} burial sites`);
        purgedRecordCount += burialSitesPurged;
    }
    const burialSiteStatusesPurged = database
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
    if (burialSiteStatusesPurged > 0) {
        debug(`Purged ${burialSiteStatusesPurged} burial site statuses`);
        purgedRecordCount += burialSiteStatusesPurged;
    }
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
    const burialSiteTypeFieldsPurged = database
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
    if (burialSiteTypeFieldsPurged > 0) {
        debug(`Purged ${burialSiteTypeFieldsPurged} burial site type fields`);
        purgedRecordCount += burialSiteTypeFieldsPurged;
    }
    const burialSiteTypesPurged = database
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
        AND burialSiteTypeId NOT IN (
          SELECT
            burialSiteTypeId
          FROM
            BurialSiteTypeFields
        )
    `)
        .run(recordDeleteTimeMillisMin).changes;
    if (burialSiteTypesPurged > 0) {
        debug(`Purged ${burialSiteTypesPurged} burial site types`);
        purgedRecordCount += burialSiteTypesPurged;
    }
    return { inactivatedRecordCount, purgedRecordCount };
}
function cleanupCemeteries(database) {
    const recordDeleteTimeMillisMin = getRecordDeleteTimeMillisMin();
    let purgedRecordCount = 0;
    const cemeteryDirectionsOfArrivalPurged = database
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
    if (cemeteryDirectionsOfArrivalPurged > 0) {
        debug(`Purged ${cemeteryDirectionsOfArrivalPurged} cemetery directions of arrival`);
        purgedRecordCount += cemeteryDirectionsOfArrivalPurged;
    }
    const cemeteriesPurged = database
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
    if (cemeteriesPurged > 0) {
        debug(`Purged ${cemeteriesPurged} cemeteries`);
        purgedRecordCount += cemeteriesPurged;
    }
    return { inactivatedRecordCount: 0, purgedRecordCount };
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
    const cemeteryResult = cleanupCemeteries(database);
    inactivatedRecordCount += cemeteryResult.inactivatedRecordCount;
    purgedRecordCount += cemeteryResult.purgedRecordCount;
    database.close();
    return {
        inactivatedRecordCount,
        purgedRecordCount
    };
}
