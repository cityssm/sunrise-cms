/* eslint-disable max-lines */

import fs from 'node:fs/promises'
import path from 'node:path'

import { daysToMillis } from '@cityssm/to-millis'
import sqlite from 'better-sqlite3'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:database:cleanupDatabase`)

function getRecordDeleteTimeMillisMin(): number {
  return (
    Date.now() -
    daysToMillis(getConfigProperty('settings.adminCleanup.recordDeleteAgeDays'))
  )
}

interface CleanupResult {
  inactivatedRecordCount: number
  purgedRecordCount: number
}

function cleanupWorkOrders(
  user: User,
  database: sqlite.Database
): CleanupResult {
  const rightNowMillis = Date.now()
  const recordDeleteTimeMillisMin = getRecordDeleteTimeMillisMin()

  let inactivatedRecordCount = 0
  let purgedRecordCount = 0

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
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM WorkOrderComments
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM WorkOrderContracts
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM WorkOrderBurialSites
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM WorkOrderMilestones
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Work Orders
   */

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM WorkOrders
      WHERE
        recordDelete_timeMillis <= ?
        AND NOT EXISTS (
          SELECT 1
          FROM WorkOrderComments
          WHERE WorkOrderComments.workOrderId = WorkOrders.workOrderId
        )
        AND NOT EXISTS (
          SELECT 1
          FROM WorkOrderContracts
          WHERE WorkOrderContracts.workOrderId = WorkOrders.workOrderId
        )
        AND NOT EXISTS (
          SELECT 1
          FROM WorkOrderBurialSites
          WHERE WorkOrderBurialSites.workOrderId = WorkOrders.workOrderId
        )
        AND NOT EXISTS (
          SELECT 1
          FROM WorkOrderMilestones
          WHERE WorkOrderMilestones.workOrderId = WorkOrders.workOrderId
        )
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(recordDeleteTimeMillisMin).changes

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
    .run(recordDeleteTimeMillisMin).changes

  return { inactivatedRecordCount, purgedRecordCount }
}

async function cleanupContracts(
  user: User,
  database: sqlite.Database
): Promise<CleanupResult> {
  const rightNowMillis = Date.now()
  const recordDeleteTimeMillisMin = getRecordDeleteTimeMillisMin()

  let inactivatedRecordCount = 0
  let purgedRecordCount = 0

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
    .run(user.userName, rightNowMillis).changes

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
    .all(recordDeleteTimeMillisMin) as Array<{
    contractAttachmentId: number
    fileName: string
    filePath: string
  }>

  for (const attachment of attachmentsToPurge) {
    const fullFilePath = path.join(attachment.filePath, attachment.fileName)

    try {
      // Test if file exists before deletion attempt
      await fs.access(fullFilePath)

      debug(`Deleting file: ${fullFilePath}`)

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.unlink(fullFilePath)

      purgedRecordCount += database
        .prepare(/* sql */ `
          DELETE FROM ContractAttachments
          WHERE
            contractAttachmentId = ?
        `)
        .run(attachment.contractAttachmentId).changes
    } catch {
      debug(`File not found for deletion: ${fullFilePath}`)
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
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM ContractMetadata
      WHERE recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM ContractComments
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM ContractFields
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Contract Fees/Transactions
   * - Maintain financial data, do not delete related.
   */

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM ContractFees
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM ContractTransactions
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(recordDeleteTimeMillisMin, recordDeleteTimeMillisMin).changes

  /*
   * Contracts
   */

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM Contracts
      WHERE
        recordDelete_timeMillis <= ?
        AND NOT EXISTS (
          SELECT 1
          FROM (
            SELECT contractId
            FROM ContractAttachments
            UNION
            SELECT contractId
            FROM ContractComments
            UNION
            SELECT contractId
            FROM ContractFees
            UNION
            SELECT contractId
            FROM ContractFields
            UNION
            SELECT contractId
            FROM ContractInterments
            UNION
            SELECT contractId
            FROM ContractMetadata
            UNION
            SELECT contractId
            FROM ContractTransactions
            UNION
            SELECT contractIdA AS contractId
            FROM RelatedContracts
            UNION
            SELECT contractIdB AS contractId
            FROM RelatedContracts
            UNION
            SELECT contractId
            FROM WorkOrderContracts
          ) rc
          WHERE rc.contractId = Contracts.contractId
        )
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

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
    .run(recordDeleteTimeMillisMin).changes

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
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

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
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM ContractTypePrints
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(recordDeleteTimeMillisMin).changes

  return { inactivatedRecordCount, purgedRecordCount }
}

function cleanupBurialSites(
  user: User,
  database: sqlite.Database
): CleanupResult {
  const rightNowMillis = Date.now()
  const recordDeleteTimeMillisMin = getRecordDeleteTimeMillisMin()

  let inactivatedRecordCount = 0
  let purgedRecordCount = 0

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
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM BurialSiteComments
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(/* sql */ `
      DELETE FROM BurialSiteFields
      WHERE
        recordDelete_timeMillis <= ?
    `)
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

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
    .run(recordDeleteTimeMillisMin).changes

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
    .run(recordDeleteTimeMillisMin).changes

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
    .run(user.userName, rightNowMillis).changes

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
    .run(recordDeleteTimeMillisMin).changes

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
    .run(recordDeleteTimeMillisMin).changes

  return { inactivatedRecordCount, purgedRecordCount }
}

function cleanupCemeteries(
  database: sqlite.Database
): CleanupResult {
  const recordDeleteTimeMillisMin = getRecordDeleteTimeMillisMin()

  const inactivatedRecordCount = 0
  let purgedRecordCount = 0

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
    .run(recordDeleteTimeMillisMin).changes

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
    .run(recordDeleteTimeMillisMin).changes

  return { inactivatedRecordCount, purgedRecordCount }
}

export default async function cleanupDatabase(
  user: User
): Promise<CleanupResult> {
  const database = sqlite(sunriseDB)

  // Work Orders

  const workOrderResult = cleanupWorkOrders(user, database)

  let inactivatedRecordCount = workOrderResult.inactivatedRecordCount
  let purgedRecordCount = workOrderResult.purgedRecordCount

  // Contracts

  const contractResult = await cleanupContracts(user, database)

  inactivatedRecordCount += contractResult.inactivatedRecordCount
  purgedRecordCount += contractResult.purgedRecordCount

  // Burial Sites

  const burialSiteResult = cleanupBurialSites(user, database)

  inactivatedRecordCount += burialSiteResult.inactivatedRecordCount
  purgedRecordCount += burialSiteResult.purgedRecordCount

  // Cemeteries

  const cemeteryResult = cleanupCemeteries(database)

  inactivatedRecordCount += cemeteryResult.inactivatedRecordCount
  purgedRecordCount += cemeteryResult.purgedRecordCount

  database.close()

  return {
    inactivatedRecordCount,
    purgedRecordCount
  }
}
