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
    .prepare(
      `update WorkOrderComments
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and workOrderId in (
            select workOrderId from WorkOrders where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare('delete from WorkOrderComments where recordDelete_timeMillis <= ?')
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Work Order Contracts
   */

  inactivatedRecordCount += database
    .prepare(
      `update WorkOrderContracts
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and workOrderId in (
            select workOrderId from WorkOrders where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(
      'delete from WorkOrderContracts where recordDelete_timeMillis <= ?'
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Work Order Burial Sites
   */

  inactivatedRecordCount += database
    .prepare(
      `update WorkOrderBurialSites
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and workOrderId in (
            select workOrderId from WorkOrders where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(
      'delete from WorkOrderBurialSites where recordDelete_timeMillis <= ?'
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Work Order Milestones
   */

  inactivatedRecordCount += database
    .prepare(
      `update WorkOrderMilestones
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and workOrderId in (
            select workOrderId from WorkOrders where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(
      'delete from WorkOrderMilestones where recordDelete_timeMillis <= ?'
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Work Orders
   */

  purgedRecordCount += database
    .prepare(
      `delete from WorkOrders
        where recordDelete_timeMillis <= ?
          and workOrderId not in (select workOrderId from WorkOrderComments)
          and workOrderId not in (select workOrderId from WorkOrderContracts)
          and workOrderId not in (select workOrderId from WorkOrderBurialSites)
          and workOrderId not in (select workOrderId from WorkOrderMilestones)`
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Work Order Milestone Types
   */

  purgedRecordCount += database
    .prepare(
      `delete from WorkOrderMilestoneTypes
        where recordDelete_timeMillis <= ?
          and workOrderMilestoneTypeId not in (
            select workOrderMilestoneTypeId from WorkOrderMilestones)`
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Work Order Types
   */

  purgedRecordCount += database
    .prepare(
      `delete from WorkOrderTypes
        where recordDelete_timeMillis <= ?
          and workOrderTypeId not in (select workOrderTypeId from WorkOrders)`
    )
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
    .prepare(
      `update ContractAttachments
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractId in (select contractId from Contracts where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  const attachmentsToPurge = database
    .prepare(
      `select contractAttachmentId, fileName, filePath
        from ContractAttachments
        where recordDelete_timeMillis <= ?`
    )
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
        .prepare(
          'delete from ContractAttachments where contractAttachmentId = ?'
        )
        .run(attachment.contractAttachmentId).changes
    } catch {
      debug(`File not found for deletion: ${fullFilePath}`)
    }
  }

  /*
   * Contract Metadata
   */

  inactivatedRecordCount += database
    .prepare(
      `update ContractMetadata
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractId in (select contractId from Contracts where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare('delete from ContractMetadata where recordDelete_timeMillis <= ?')
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Contract Comments
   */

  inactivatedRecordCount += database
    .prepare(
      `update ContractComments
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractId in (
            select contractId from Contracts where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare('delete from ContractComments where recordDelete_timeMillis <= ?')
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Contract Fields
   */

  inactivatedRecordCount += database
    .prepare(
      `update ContractFields
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractId in (select contractId from Contracts where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare('delete from ContractFields where recordDelete_timeMillis <= ?')
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Contract Fees/Transactions
   * - Maintain financial data, do not delete related.
   */

  purgedRecordCount += database
    .prepare('delete from ContractFees where recordDelete_timeMillis <= ?')
    .run(recordDeleteTimeMillisMin).changes

  purgedRecordCount += database
    .prepare(
      'delete from ContractTransactions where recordDelete_timeMillis <= ?'
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Related Contracts
   */

  purgedRecordCount += database
    .prepare(
      `delete from RelatedContracts
        where contractIdA in (select contractId from Contracts where recordDelete_timeMillis <= ?)
          or contractIdB in (select contractId from Contracts where recordDelete_timeMillis <= ?)`
    )
    .run(recordDeleteTimeMillisMin, recordDeleteTimeMillisMin).changes

  /*
   * Contracts
   */

  purgedRecordCount += database
    .prepare(
      `delete from Contracts
        where recordDelete_timeMillis <= ?
          and contractId not in (select contractId from ContractAttachments)
          and contractId not in (select contractId from ContractComments)
          and contractId not in (select contractId from ContractFees)
          and contractId not in (select contractId from ContractFields)
          and contractId not in (select contractId from ContractInterments)
          and contractId not in (select contractId from ContractMetadata)
          and contractId not in (select contractId from ContractTransactions)
          and contractId not in (select contractIdA from RelatedContracts)
          and contractId not in (select contractIdB from RelatedContracts)
          and contractId not in (select contractId from WorkOrderContracts)`
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Fees
   */

  inactivatedRecordCount += database
    .prepare(
      `update Fees
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and feeCategoryId in (select feeCategoryId from FeeCategories where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(
      `delete from Fees
        where recordDelete_timeMillis <= ?
          and feeId not in (select feeId from ContractFees)`
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Fee Categories
   */

  purgedRecordCount += database
    .prepare(
      `delete from FeeCategories
        where recordDelete_timeMillis <= ?
          and feeCategoryId not in (select feeCategoryId from Fees)`
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Contract Type Fields
   */

  inactivatedRecordCount += database
    .prepare(
      `update ContractTypeFields
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractTypeId in (select contractTypeId from ContractTypes where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(
      `delete from ContractTypeFields
        where recordDelete_timeMillis <= ?
          and contractTypeFieldId not in (select contractTypeFieldId from ContractFields)`
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Contract Type Prints
   */

  inactivatedRecordCount += database
    .prepare(
      `update ContractTypePrints
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractTypeId in (select contractTypeId from ContractTypes where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(
      'delete from ContractTypePrints where recordDelete_timeMillis <= ?'
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Contract Types
   */

  purgedRecordCount += database
    .prepare(
      `delete from ContractTypes
        where recordDelete_timeMillis <= ?
          and contractTypeId not in (select contractTypeId from ContractTypeFields)
          and contractTypeId not in (select contractTypeId from ContractTypePrints)
          and contractTypeId not in (select contractTypeId from Contracts)
          and contractTypeId not in (select contractTypeId from Fees)`
    )
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
    .prepare(
      `update BurialSiteComments
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and burialSiteId in (select burialSiteId from BurialSites where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(
      'delete from BurialSiteComments where recordDelete_timeMillis <= ?'
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Burial Site Fields
   */

  inactivatedRecordCount += database
    .prepare(
      `update BurialSiteFields
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and burialSiteId in (select burialSiteId from BurialSites where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare('delete from BurialSiteFields where recordDelete_timeMillis <= ?')
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Burial Sites
   */

  inactivatedRecordCount += database
    .prepare(
      `update BurialSites
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and cemeteryId in (select cemeteryId from Cemeteries where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(
      `delete from BurialSites
        where recordDelete_timeMillis <= ?
          and burialSiteId not in (select burialSiteId from BurialSiteComments)
          and burialSiteId not in (select burialSiteId from BurialSiteFields)
          and burialSiteId not in (select burialSiteId from Contracts)
          and burialSiteId not in (select burialSiteId from WorkOrderBurialSites)`
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Burial Site Statuses
   */

  purgedRecordCount += database
    .prepare(
      `delete from BurialSiteStatuses
        where recordDelete_timeMillis <= ?
          and burialSiteStatusId not in (select burialSiteStatusId from BurialSites)`
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Burial Site Type Fields
   */

  inactivatedRecordCount += database
    .prepare(
      `update BurialSiteTypeFields
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and burialSiteTypeId in (select burialSiteTypeId from BurialSiteTypes where recordDelete_timeMillis is not null)`
    )
    .run(user.userName, rightNowMillis).changes

  purgedRecordCount += database
    .prepare(
      `delete from BurialSiteTypeFields
        where recordDelete_timeMillis <= ?
          and burialSiteTypeFieldId not in (select burialSiteTypeFieldId from BurialSiteFields)`
    )
    .run(recordDeleteTimeMillisMin).changes

  /*
   * Burial Site Types
   */

  purgedRecordCount += database
    .prepare(
      `delete from BurialSiteTypes
        where recordDelete_timeMillis <= ?
          and burialSiteTypeId not in (select burialSiteTypeId from BurialSites)`
    )
    .run(recordDeleteTimeMillisMin).changes

  return { inactivatedRecordCount, purgedRecordCount }
}

function cleanupCemeteries(
  user: User,
  database: sqlite.Database
): CleanupResult {
  const recordDeleteTimeMillisMin = getRecordDeleteTimeMillisMin()

  const inactivatedRecordCount = 0
  let purgedRecordCount = 0

  /*
   * Cemeteries
   */

  purgedRecordCount += database
    .prepare(
      `delete from CemeteryDirectionsOfArrival
        where cemeteryId in (select cemeteryId from Cemeteries where recordDelete_timeMillis <= ?)`
    )
    .run(recordDeleteTimeMillisMin).changes

  purgedRecordCount += database
    .prepare(
      `delete from Cemeteries
        where recordDelete_timeMillis <= ?
          and cemeteryId not in (select cemeteryId from CemeteryDirectionsOfArrival)
          and cemeteryId not in (select cemeteryId from BurialSites where cemeteryId is not null)`
    )
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

  const cemeteryResult = cleanupCemeteries(user, database)

  inactivatedRecordCount += cemeteryResult.inactivatedRecordCount
  purgedRecordCount += cemeteryResult.purgedRecordCount

  database.close()

  return {
    inactivatedRecordCount,
    purgedRecordCount
  }
}
