import { daysToMillis } from '@cityssm/to-millis';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function cleanupDatabase(user) {
    const database = sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordDeleteTimeMillisMin = rightNowMillis -
        daysToMillis(getConfigProperty('settings.adminCleanup.recordDeleteAgeDays'));
    let inactivatedRecordCount = 0;
    let purgedRecordCount = 0;
    /*
     * Work Order Comments
     */
    inactivatedRecordCount += database
        .prepare(`update WorkOrderComments
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and workOrderId in (
            select workOrderId from WorkOrders where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from WorkOrderComments where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Work Order Contracts
     */
    inactivatedRecordCount += database
        .prepare(`update WorkOrderContracts
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and workOrderId in (
            select workOrderId from WorkOrders where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from WorkOrderContracts where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Work Order Burial Sites
     */
    inactivatedRecordCount += database
        .prepare(`update WorkOrderBurialSites
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and workOrderId in (
            select workOrderId from WorkOrders where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from WorkOrderBurialSites where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Work Order Milestones
     */
    inactivatedRecordCount += database
        .prepare(`update WorkOrderMilestones
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and workOrderId in (
            select workOrderId from WorkOrders where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from WorkOrderMilestones where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Work Orders
     */
    purgedRecordCount += database
        .prepare(`delete from WorkOrders
        where recordDelete_timeMillis <= ?
          and workOrderId not in (select workOrderId from WorkOrderComments)
          and workOrderId not in (select workOrderId from WorkOrderContracts)
          and workOrderId not in (select workOrderId from WorkOrderBurialSites)
          and workOrderId not in (select workOrderId from WorkOrderMilestones)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Work Order Milestone Types
     */
    purgedRecordCount += database
        .prepare(`delete from WorkOrderMilestoneTypes
        where recordDelete_timeMillis <= ?
          and workOrderMilestoneTypeId not in (
            select workOrderMilestoneTypeId from WorkOrderMilestones)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Work Order Types
     */
    purgedRecordCount += database
        .prepare(`delete from WorkOrderTypes
        where recordDelete_timeMillis <= ?
          and workOrderTypeId not in (select workOrderTypeId from WorkOrders)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Burial Site Contract Comments
     */
    inactivatedRecordCount += database
        .prepare(`update ContractComments
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractId in (
            select contractId from Contracts where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from ContractComments where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Burial Site Contract Fields
     */
    inactivatedRecordCount += database
        .prepare(`update ContractFields
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractId in (select contractId from Contracts where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from ContractFields where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Burial Site Contract Fees/Transactions
     * - Maintain financial data, do not delete related.
     */
    purgedRecordCount += database
        .prepare('delete from ContractFees where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    purgedRecordCount += database
        .prepare('delete from ContractTransactions where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Burial Site Contracts
     */
    purgedRecordCount += database
        .prepare(`delete from Contracts
        where recordDelete_timeMillis <= ?
          and contractId not in (select contractId from ContractComments)
          and contractId not in (select contractId from ContractFees)
          and contractId not in (select contractId from ContractFields)
          and contractId not in (select contractId from ContractInterments)
          and contractId not in (select contractId from ContractTransactions)
          and contractId not in (select contractId from WorkOrderContracts)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Fees
     */
    inactivatedRecordCount += database
        .prepare(`update Fees
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and feeCategoryId in (select feeCategoryId from FeeCategories where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare(`delete from Fees
        where recordDelete_timeMillis <= ?
          and feeId not in (select feeId from ContractFees)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Fee Categories
     */
    purgedRecordCount += database
        .prepare(`delete from FeeCategories
        where recordDelete_timeMillis <= ?
          and feeCategoryId not in (select feeCategoryId from Fees)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Contract Type Fields
     */
    inactivatedRecordCount += database
        .prepare(`update ContractTypeFields
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractTypeId in (select contractTypeId from ContractTypes where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare(`delete from ContractTypeFields
        where recordDelete_timeMillis <= ?
          and contractTypeFieldId not in (select contractTypeFieldId from ContractFields)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Contract Type Prints
     */
    inactivatedRecordCount += database
        .prepare(`update ContractTypePrints
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractTypeId in (select contractTypeId from ContractTypes where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from ContractTypePrints where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Contract Types
     */
    purgedRecordCount += database
        .prepare(`delete from ContractTypes
        where recordDelete_timeMillis <= ?
          and contractTypeId not in (select contractTypeId from ContractTypeFields)
          and contractTypeId not in (select contractTypeId from ContractTypePrints)
          and contractTypeId not in (select contractTypeId from Contracts)
          and contractTypeId not in (select contractTypeId from Fees)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Burial Site Comments
     */
    inactivatedRecordCount += database
        .prepare(`update BurialSiteComments
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and burialSiteId in (select burialSiteId from BurialSites where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from BurialSiteComments where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Burial Site Fields
     */
    inactivatedRecordCount += database
        .prepare(`update BurialSiteFields
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and burialSiteId in (select burialSiteId from BurialSites where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare('delete from BurialSiteFields where recordDelete_timeMillis <= ?')
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Burial Sites
     */
    inactivatedRecordCount += database
        .prepare(`update BurialSites
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and cemeteryId in (select cemeteryId from Cemeteries where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare(`delete from BurialSites
        where recordDelete_timeMillis <= ?
          and burialSiteId not in (select burialSiteId from BurialSiteComments)
          and burialSiteId not in (select burialSiteId from BurialSiteFields)
          and burialSiteId not in (select burialSiteId from Contracts)
          and burialSiteId not in (select burialSiteId from WorkOrderBurialSites)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Burial Site Statuses
     */
    purgedRecordCount += database
        .prepare(`delete from BurialSiteStatuses
        where recordDelete_timeMillis <= ?
          and burialSiteStatusId not in (select burialSiteStatusId from BurialSites)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Burial Site Type Fields
     */
    inactivatedRecordCount += database
        .prepare(`update BurialSiteTypeFields
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
          and burialSiteTypeId in (select burialSiteTypeId from BurialSiteTypes where recordDelete_timeMillis is not null)`)
        .run(user.userName, rightNowMillis).changes;
    purgedRecordCount += database
        .prepare(`delete from BurialSiteTypeFields
        where recordDelete_timeMillis <= ?
          and burialSiteTypeFieldId not in (select burialSiteTypeFieldId from BurialSiteFields)`)
        .run(recordDeleteTimeMillisMin).changes;
    /*
     * Burial Site Types
     */
    purgedRecordCount += database
        .prepare(`delete from BurialSiteTypes
        where recordDelete_timeMillis <= ?
          and burialSiteTypeId not in (select burialSiteTypeId from BurialSites)`)
        .run(recordDeleteTimeMillisMin).changes;
    database.close();
    return {
        inactivatedRecordCount,
        purgedRecordCount
    };
}
