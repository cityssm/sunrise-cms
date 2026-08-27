/* eslint-disable express-security/require-route-authentication -- Authentication set in app */

import { Router } from 'express'

import handler_auditLog from '../handlers/adminGet/auditLog.js'
import handler_burialSiteTypes from '../handlers/adminGet/burialSiteTypes.js'
import handler_contractTypes from '../handlers/adminGet/contractTypes.js'
import handler_database from '../handlers/adminGet/database.js'
import handler_fees from '../handlers/adminGet/fees.js'
import handler_settings from '../handlers/adminGet/settings.js'
import handler_tables from '../handlers/adminGet/tables.js'
import handler_users from '../handlers/adminGet/users.js'
import handler_doAddBurialSiteStatus from '../handlers/adminPost/doAddBurialSiteStatus.js'
import handler_doAddBurialSiteType from '../handlers/adminPost/doAddBurialSiteType.js'
import handler_doAddBurialSiteTypeField from '../handlers/adminPost/doAddBurialSiteTypeField.js'
import handler_doAddCommittalType from '../handlers/adminPost/doAddCommittalType.js'
import handler_doAddContractType from '../handlers/adminPost/doAddContractType.js'
import handler_doAddContractTypeField from '../handlers/adminPost/doAddContractTypeField.js'
import handler_doAddContractTypePrint from '../handlers/adminPost/doAddContractTypePrint.js'
import handler_doAddFee from '../handlers/adminPost/doAddFee.js'
import handler_doAddFeeCategory from '../handlers/adminPost/doAddFeeCategory.js'
import handler_doAddIntermentContainerType from '../handlers/adminPost/doAddIntermentContainerType.js'
import handler_doAddIntermentDepth from '../handlers/adminPost/doAddIntermentDepth.js'
import handler_doAddServiceType from '../handlers/adminPost/doAddServiceType.js'
import handler_doAddUser from '../handlers/adminPost/doAddUser.js'
import handler_doAddWorkOrderMilestoneType from '../handlers/adminPost/doAddWorkOrderMilestoneType.js'
import handler_doAddWorkOrderStatus from '../handlers/adminPost/doAddWorkOrderStatus.js'
import handler_doAddWorkOrderType from '../handlers/adminPost/doAddWorkOrderType.js'
import handler_doBackupDatabase from '../handlers/adminPost/doBackupDatabase.js'
import handler_doCleanupDatabase from '../handlers/adminPost/doCleanupDatabase.js'
import handler_doDeleteBurialSiteStatus from '../handlers/adminPost/doDeleteBurialSiteStatus.js'
import handler_doDeleteBurialSiteType from '../handlers/adminPost/doDeleteBurialSiteType.js'
import handler_doDeleteBurialSiteTypeField from '../handlers/adminPost/doDeleteBurialSiteTypeField.js'
import handler_doDeleteCommittalType from '../handlers/adminPost/doDeleteCommittalType.js'
import handler_doDeleteContractType from '../handlers/adminPost/doDeleteContractType.js'
import handler_doDeleteContractTypeField from '../handlers/adminPost/doDeleteContractTypeField.js'
import handler_doDeleteContractTypePrint from '../handlers/adminPost/doDeleteContractTypePrint.js'
import handler_doDeleteFee from '../handlers/adminPost/doDeleteFee.js'
import handler_doDeleteFeeCategory from '../handlers/adminPost/doDeleteFeeCategory.js'
import handler_doDeleteIntermentContainerType from '../handlers/adminPost/doDeleteIntermentContainerType.js'
import handler_doDeleteIntermentDepth from '../handlers/adminPost/doDeleteIntermentDepth.js'
import handler_doDeleteServiceType from '../handlers/adminPost/doDeleteServiceType.js'
import handler_doDeleteUser from '../handlers/adminPost/doDeleteUser.js'
import handler_doDeleteWorkOrderMilestoneType from '../handlers/adminPost/doDeleteWorkOrderMilestoneType.js'
import handler_doDeleteWorkOrderStatus from '../handlers/adminPost/doDeleteWorkOrderStatus.js'
import handler_doDeleteWorkOrderType from '../handlers/adminPost/doDeleteWorkOrderType.js'
import handler_doGetAuditLog from '../handlers/adminPost/doGetAuditLog.js'
import handler_doMoveBurialSiteStatusDown from '../handlers/adminPost/doMoveBurialSiteStatusDown.js'
import handler_doMoveBurialSiteStatusUp from '../handlers/adminPost/doMoveBurialSiteStatusUp.js'
import handler_doMoveBurialSiteTypeDown from '../handlers/adminPost/doMoveBurialSiteTypeDown.js'
import handler_doMoveBurialSiteTypeFieldDown from '../handlers/adminPost/doMoveBurialSiteTypeFieldDown.js'
import handler_doMoveBurialSiteTypeFieldUp from '../handlers/adminPost/doMoveBurialSiteTypeFieldUp.js'
import handler_doMoveBurialSiteTypeUp from '../handlers/adminPost/doMoveBurialSiteTypeUp.js'
import handler_doMoveCommittalTypeDown from '../handlers/adminPost/doMoveCommittalTypeDown.js'
import handler_doMoveCommittalTypeUp from '../handlers/adminPost/doMoveCommittalTypeUp.js'
import handler_doMoveContractTypeDown from '../handlers/adminPost/doMoveContractTypeDown.js'
import handler_doMoveContractTypeFieldDown from '../handlers/adminPost/doMoveContractTypeFieldDown.js'
import handler_doMoveContractTypeFieldUp from '../handlers/adminPost/doMoveContractTypeFieldUp.js'
import handler_doMoveContractTypePrintDown from '../handlers/adminPost/doMoveContractTypePrintDown.js'
import handler_doMoveContractTypePrintUp from '../handlers/adminPost/doMoveContractTypePrintUp.js'
import handler_doMoveContractTypeUp from '../handlers/adminPost/doMoveContractTypeUp.js'
import handler_doMoveFeeCategoryDown from '../handlers/adminPost/doMoveFeeCategoryDown.js'
import handler_doMoveFeeCategoryUp from '../handlers/adminPost/doMoveFeeCategoryUp.js'
import handler_doMoveFeeDown from '../handlers/adminPost/doMoveFeeDown.js'
import handler_doMoveFeeUp from '../handlers/adminPost/doMoveFeeUp.js'
import handler_doMoveIntermentContainerTypeDown from '../handlers/adminPost/doMoveIntermentContainerTypeDown.js'
import handler_doMoveIntermentContainerTypeUp from '../handlers/adminPost/doMoveIntermentContainerTypeUp.js'
import handler_doMoveIntermentDepthDown from '../handlers/adminPost/doMoveIntermentDepthDown.js'
import handler_doMoveIntermentDepthUp from '../handlers/adminPost/doMoveIntermentDepthUp.js'
import handler_doMoveServiceTypeDown from '../handlers/adminPost/doMoveServiceTypeDown.js'
import handler_doMoveServiceTypeUp from '../handlers/adminPost/doMoveServiceTypeUp.js'
import handler_doMoveWorkOrderMilestoneTypeDown from '../handlers/adminPost/doMoveWorkOrderMilestoneTypeDown.js'
import handler_doMoveWorkOrderMilestoneTypeUp from '../handlers/adminPost/doMoveWorkOrderMilestoneTypeUp.js'
import handler_doMoveWorkOrderStatusDown from '../handlers/adminPost/doMoveWorkOrderStatusDown.js'
import handler_doMoveWorkOrderStatusUp from '../handlers/adminPost/doMoveWorkOrderStatusUp.js'
import handler_doMoveWorkOrderTypeDown from '../handlers/adminPost/doMoveWorkOrderTypeDown.js'
import handler_doMoveWorkOrderTypeUp from '../handlers/adminPost/doMoveWorkOrderTypeUp.js'
import handler_doPurgeAuditLog from '../handlers/adminPost/doPurgeAuditLog.js'
import handler_doToggleUserPermission from '../handlers/adminPost/doToggleUserPermission.js'
import handler_doUpdateBurialSiteStatus from '../handlers/adminPost/doUpdateBurialSiteStatus.js'
import handler_doUpdateBurialSiteType from '../handlers/adminPost/doUpdateBurialSiteType.js'
import handler_doUpdateBurialSiteTypeField from '../handlers/adminPost/doUpdateBurialSiteTypeField.js'
import handler_doUpdateCommittalType from '../handlers/adminPost/doUpdateCommittalType.js'
import handler_doUpdateContractType from '../handlers/adminPost/doUpdateContractType.js'
import handler_doUpdateContractTypeField from '../handlers/adminPost/doUpdateContractTypeField.js'
import handler_doUpdateFee from '../handlers/adminPost/doUpdateFee.js'
import handler_doUpdateFeeAmount from '../handlers/adminPost/doUpdateFeeAmount.js'
import handler_doUpdateFeeCategory from '../handlers/adminPost/doUpdateFeeCategory.js'
import handler_doUpdateIntermentContainerType from '../handlers/adminPost/doUpdateIntermentContainerType.js'
import handler_doUpdateIntermentDepth from '../handlers/adminPost/doUpdateIntermentDepth.js'
import handler_doUpdateServiceType from '../handlers/adminPost/doUpdateServiceType.js'
import handler_doUpdateSetting from '../handlers/adminPost/doUpdateSetting.js'
import handler_doUpdateUser from '../handlers/adminPost/doUpdateUser.js'
import handler_doUpdateWorkOrderMilestoneType from '../handlers/adminPost/doUpdateWorkOrderMilestoneType.js'
import handler_doUpdateWorkOrderStatus from '../handlers/adminPost/doUpdateWorkOrderStatus.js'
import handler_doUpdateWorkOrderType from '../handlers/adminPost/doUpdateWorkOrderType.js'
import { getConfigProperty } from '../helpers/config.helpers.js'

export const router = Router()

/*
 * Fees
 */

router
  .get('/fees', handler_fees)
  .post('/doAddFeeCategory', handler_doAddFeeCategory)
  .post('/doUpdateFeeCategory', handler_doUpdateFeeCategory)
  .post('/doMoveFeeCategoryUp', handler_doMoveFeeCategoryUp)
  .post('/doMoveFeeCategoryDown', handler_doMoveFeeCategoryDown)
  .post('/doDeleteFeeCategory', handler_doDeleteFeeCategory)
  .post('/doAddFee', handler_doAddFee)
  .post('/doUpdateFee', handler_doUpdateFee)
  .post('/doUpdateFeeAmount', handler_doUpdateFeeAmount)
  .post('/doMoveFeeUp', handler_doMoveFeeUp)
  .post('/doMoveFeeDown', handler_doMoveFeeDown)
  .post('/doDeleteFee', handler_doDeleteFee)

/*
 * Contract Type Management
 */

router
  .get('/contractTypes', handler_contractTypes)
  .post('/doAddContractType', handler_doAddContractType)
  .post('/doUpdateContractType', handler_doUpdateContractType)
  .post('/doMoveContractTypeUp', handler_doMoveContractTypeUp)
  .post('/doMoveContractTypeDown', handler_doMoveContractTypeDown)
  .post('/doDeleteContractType', handler_doDeleteContractType)

// Contract Type Fields

router
  .post('/doAddContractTypeField', handler_doAddContractTypeField)
  .post('/doUpdateContractTypeField', handler_doUpdateContractTypeField)
  .post('/doMoveContractTypeFieldUp', handler_doMoveContractTypeFieldUp)
  .post('/doMoveContractTypeFieldDown', handler_doMoveContractTypeFieldDown)
  .post('/doDeleteContractTypeField', handler_doDeleteContractTypeField)

// Contract Type Prints

router
  .post('/doAddContractTypePrint', handler_doAddContractTypePrint)
  .post('/doMoveContractTypePrintUp', handler_doMoveContractTypePrintUp)
  .post('/doMoveContractTypePrintDown', handler_doMoveContractTypePrintDown)
  .post('/doDeleteContractTypePrint', handler_doDeleteContractTypePrint)

/*
 * Burial Site Type Management
 */

router
  .get('/burialSiteTypes', handler_burialSiteTypes)
  .post('/doAddBurialSiteType', handler_doAddBurialSiteType)
  .post('/doUpdateBurialSiteType', handler_doUpdateBurialSiteType)
  .post('/doMoveBurialSiteTypeUp', handler_doMoveBurialSiteTypeUp)
  .post('/doMoveBurialSiteTypeDown', handler_doMoveBurialSiteTypeDown)
  .post('/doDeleteBurialSiteType', handler_doDeleteBurialSiteType)

// Burial Site Type Fields

router
  .post('/doAddBurialSiteTypeField', handler_doAddBurialSiteTypeField)
  .post('/doUpdateBurialSiteTypeField', handler_doUpdateBurialSiteTypeField)
  .post('/doMoveBurialSiteTypeFieldUp', handler_doMoveBurialSiteTypeFieldUp)
  .post(
    '/doMoveBurialSiteTypeFieldDown',
    handler_doMoveBurialSiteTypeFieldDown
  )
  .post('/doDeleteBurialSiteTypeField', handler_doDeleteBurialSiteTypeField)

/*
 * Config Tables
 */

router.get('/tables', handler_tables)

// Config Tables - Work Order Types

router
  .post('/doAddWorkOrderType', handler_doAddWorkOrderType)
  .post('/doUpdateWorkOrderType', handler_doUpdateWorkOrderType)
  .post('/doMoveWorkOrderTypeUp', handler_doMoveWorkOrderTypeUp)
  .post('/doMoveWorkOrderTypeDown', handler_doMoveWorkOrderTypeDown)
  .post('/doDeleteWorkOrderType', handler_doDeleteWorkOrderType)

// Config Tables - Work Order Statuses

router
  .post('/doAddWorkOrderStatus', handler_doAddWorkOrderStatus)
  .post('/doUpdateWorkOrderStatus', handler_doUpdateWorkOrderStatus)
  .post('/doMoveWorkOrderStatusUp', handler_doMoveWorkOrderStatusUp)
  .post('/doMoveWorkOrderStatusDown', handler_doMoveWorkOrderStatusDown)
  .post('/doDeleteWorkOrderStatus', handler_doDeleteWorkOrderStatus)

// Config Tables - Work Order Milestone Types

router
  .post('/doAddWorkOrderMilestoneType', handler_doAddWorkOrderMilestoneType)
  .post(
    '/doUpdateWorkOrderMilestoneType',
    handler_doUpdateWorkOrderMilestoneType
  )
  .post(
    '/doMoveWorkOrderMilestoneTypeUp',
    handler_doMoveWorkOrderMilestoneTypeUp
  )
  .post(
    '/doMoveWorkOrderMilestoneTypeDown',
    handler_doMoveWorkOrderMilestoneTypeDown
  )
  .post(
    '/doDeleteWorkOrderMilestoneType',
    handler_doDeleteWorkOrderMilestoneType
  )

// Config Tables - Burial Site Statuses

router
  .post('/doAddBurialSiteStatus', handler_doAddBurialSiteStatus)
  .post('/doUpdateBurialSiteStatus', handler_doUpdateBurialSiteStatus)
  .post('/doMoveBurialSiteStatusUp', handler_doMoveBurialSiteStatusUp)
  .post('/doMoveBurialSiteStatusDown', handler_doMoveBurialSiteStatusDown)
  .post('/doDeleteBurialSiteStatus', handler_doDeleteBurialSiteStatus)

// Config Tables - Committal Types

router
  .post('/doAddCommittalType', handler_doAddCommittalType)
  .post('/doUpdateCommittalType', handler_doUpdateCommittalType)
  .post('/doMoveCommittalTypeUp', handler_doMoveCommittalTypeUp)
  .post('/doMoveCommittalTypeDown', handler_doMoveCommittalTypeDown)
  .post('/doDeleteCommittalType', handler_doDeleteCommittalType)

// Config Tables - Service Types

router
  .post('/doAddServiceType', handler_doAddServiceType)
  .post('/doUpdateServiceType', handler_doUpdateServiceType)
  .post('/doMoveServiceTypeUp', handler_doMoveServiceTypeUp)
  .post('/doMoveServiceTypeDown', handler_doMoveServiceTypeDown)
  .post('/doDeleteServiceType', handler_doDeleteServiceType)

// Config Tables - Interment Container Types

router
  .post('/doAddIntermentContainerType', handler_doAddIntermentContainerType)
  .post(
    '/doUpdateIntermentContainerType',
    handler_doUpdateIntermentContainerType
  )
  .post(
    '/doMoveIntermentContainerTypeUp',
    handler_doMoveIntermentContainerTypeUp
  )
  .post(
    '/doMoveIntermentContainerTypeDown',
    handler_doMoveIntermentContainerTypeDown
  )
  .post(
    '/doDeleteIntermentContainerType',
    handler_doDeleteIntermentContainerType
  )

// Config Tables - Interment Depths

router
  .post('/doAddIntermentDepth', handler_doAddIntermentDepth)
  .post('/doUpdateIntermentDepth', handler_doUpdateIntermentDepth)
  .post('/doMoveIntermentDepthUp', handler_doMoveIntermentDepthUp)
  .post('/doMoveIntermentDepthDown', handler_doMoveIntermentDepthDown)
  .post('/doDeleteIntermentDepth', handler_doDeleteIntermentDepth)

/*
 * Users
 */

router
  .get('/users', handler_users)
  .post('/doAddUser', handler_doAddUser)
  .post('/doUpdateUser', handler_doUpdateUser)
  .post('/doToggleUserPermission', handler_doToggleUserPermission)
  .post('/doDeleteUser', handler_doDeleteUser)

/*
 * Settings Management
 */

router
  .get('/settings', handler_settings)
  .post('/doUpdateSetting', handler_doUpdateSetting)

/*
 * Database Maintenance
 */

router
  .get('/database', handler_database)
  .post('/doBackupDatabase', handler_doBackupDatabase)
  .post('/doCleanupDatabase', handler_doCleanupDatabase)

/*
 * Audit Log
 */

if (getConfigProperty('settings.auditLog.enabled')) {
  router
    .get('/auditLog', handler_auditLog)
    .post('/doGetAuditLog', handler_doGetAuditLog)
    .post('/doPurgeAuditLog', handler_doPurgeAuditLog)
}

export default router
