import { Router } from 'express';
import handler_burialSiteTypes from '../handlers/admin-get/burialSiteTypes.js';
import handler_contractTypes from '../handlers/admin-get/contractTypes.js';
import handler_database from '../handlers/admin-get/database.js';
import handler_fees from '../handlers/admin-get/fees.js';
import handler_settings from '../handlers/admin-get/settings.js';
import handler_tables from '../handlers/admin-get/tables.js';
import handler_users from '../handlers/admin-get/users.js';
import handler_doAddBurialSiteStatus from '../handlers/admin-post/doAddBurialSiteStatus.js';
import handler_doAddBurialSiteType from '../handlers/admin-post/doAddBurialSiteType.js';
import handler_doAddBurialSiteTypeField from '../handlers/admin-post/doAddBurialSiteTypeField.js';
import handler_doAddCommittalType from '../handlers/admin-post/doAddCommittalType.js';
import handler_doAddContractType from '../handlers/admin-post/doAddContractType.js';
import handler_doAddContractTypeField from '../handlers/admin-post/doAddContractTypeField.js';
import handler_doAddContractTypePrint from '../handlers/admin-post/doAddContractTypePrint.js';
import handler_doAddFee from '../handlers/admin-post/doAddFee.js';
import handler_doAddFeeCategory from '../handlers/admin-post/doAddFeeCategory.js';
import handler_doAddIntermentContainerType from '../handlers/admin-post/doAddIntermentContainerType.js';
import handler_doAddWorkOrderMilestoneType from '../handlers/admin-post/doAddWorkOrderMilestoneType.js';
import handler_doAddWorkOrderType from '../handlers/admin-post/doAddWorkOrderType.js';
import handler_doAddUser from '../handlers/admin-post/doAddUser.js';
import handler_doBackupDatabase from '../handlers/admin-post/doBackupDatabase.js';
import handler_doCleanupDatabase from '../handlers/admin-post/doCleanupDatabase.js';
import handler_doDeleteBurialSiteStatus from '../handlers/admin-post/doDeleteBurialSiteStatus.js';
import handler_doDeleteBurialSiteType from '../handlers/admin-post/doDeleteBurialSiteType.js';
import handler_doDeleteBurialSiteTypeField from '../handlers/admin-post/doDeleteBurialSiteTypeField.js';
import handler_doDeleteCommittalType from '../handlers/admin-post/doDeleteCommittalType.js';
import handler_doDeleteContractType from '../handlers/admin-post/doDeleteContractType.js';
import handler_doDeleteContractTypeField from '../handlers/admin-post/doDeleteContractTypeField.js';
import handler_doDeleteContractTypePrint from '../handlers/admin-post/doDeleteContractTypePrint.js';
import handler_doDeleteFee from '../handlers/admin-post/doDeleteFee.js';
import handler_doDeleteFeeCategory from '../handlers/admin-post/doDeleteFeeCategory.js';
import handler_doDeleteIntermentContainerType from '../handlers/admin-post/doDeleteIntermentContainerType.js';
import handler_doDeleteWorkOrderMilestoneType from '../handlers/admin-post/doDeleteWorkOrderMilestoneType.js';
import handler_doDeleteWorkOrderType from '../handlers/admin-post/doDeleteWorkOrderType.js';
import handler_doDeleteUser from '../handlers/admin-post/doDeleteUser.js';
import handler_doMoveBurialSiteStatusDown from '../handlers/admin-post/doMoveBurialSiteStatusDown.js';
import handler_doMoveBurialSiteStatusUp from '../handlers/admin-post/doMoveBurialSiteStatusUp.js';
import handler_doMoveBurialSiteTypeDown from '../handlers/admin-post/doMoveBurialSiteTypeDown.js';
import handler_doMoveBurialSiteTypeFieldDown from '../handlers/admin-post/doMoveBurialSiteTypeFieldDown.js';
import handler_doMoveBurialSiteTypeFieldUp from '../handlers/admin-post/doMoveBurialSiteTypeFieldUp.js';
import handler_doMoveBurialSiteTypeUp from '../handlers/admin-post/doMoveBurialSiteTypeUp.js';
import handler_doMoveCommittalTypeDown from '../handlers/admin-post/doMoveCommittalTypeDown.js';
import handler_doMoveCommittalTypeUp from '../handlers/admin-post/doMoveCommittalTypeUp.js';
import handler_doMoveContractTypeDown from '../handlers/admin-post/doMoveContractTypeDown.js';
import handler_doMoveContractTypeFieldDown from '../handlers/admin-post/doMoveContractTypeFieldDown.js';
import handler_doMoveContractTypeFieldUp from '../handlers/admin-post/doMoveContractTypeFieldUp.js';
import handler_doMoveContractTypePrintDown from '../handlers/admin-post/doMoveContractTypePrintDown.js';
import handler_doMoveContractTypePrintUp from '../handlers/admin-post/doMoveContractTypePrintUp.js';
import handler_doMoveContractTypeUp from '../handlers/admin-post/doMoveContractTypeUp.js';
import handler_doMoveFeeCategoryDown from '../handlers/admin-post/doMoveFeeCategoryDown.js';
import handler_doMoveFeeCategoryUp from '../handlers/admin-post/doMoveFeeCategoryUp.js';
import handler_doMoveFeeDown from '../handlers/admin-post/doMoveFeeDown.js';
import handler_doMoveFeeUp from '../handlers/admin-post/doMoveFeeUp.js';
import handler_doMoveIntermentContainerTypeDown from '../handlers/admin-post/doMoveIntermentContainerTypeDown.js';
import handler_doMoveIntermentContainerTypeUp from '../handlers/admin-post/doMoveIntermentContainerTypeUp.js';
import handler_doMoveWorkOrderMilestoneTypeDown from '../handlers/admin-post/doMoveWorkOrderMilestoneTypeDown.js';
import handler_doMoveWorkOrderMilestoneTypeUp from '../handlers/admin-post/doMoveWorkOrderMilestoneTypeUp.js';
import handler_doMoveWorkOrderTypeDown from '../handlers/admin-post/doMoveWorkOrderTypeDown.js';
import handler_doMoveWorkOrderTypeUp from '../handlers/admin-post/doMoveWorkOrderTypeUp.js';
import handler_doUpdateBurialSiteStatus from '../handlers/admin-post/doUpdateBurialSiteStatus.js';
import handler_doUpdateBurialSiteType from '../handlers/admin-post/doUpdateBurialSiteType.js';
import handler_doUpdateBurialSiteTypeField from '../handlers/admin-post/doUpdateBurialSiteTypeField.js';
import handler_doUpdateCommittalType from '../handlers/admin-post/doUpdateCommittalType.js';
import handler_doUpdateContractType from '../handlers/admin-post/doUpdateContractType.js';
import handler_doUpdateContractTypeField from '../handlers/admin-post/doUpdateContractTypeField.js';
import handler_doUpdateFee from '../handlers/admin-post/doUpdateFee.js';
import handler_doUpdateFeeAmount from '../handlers/admin-post/doUpdateFeeAmount.js';
import handler_doUpdateFeeCategory from '../handlers/admin-post/doUpdateFeeCategory.js';
import handler_doUpdateIntermentContainerType from '../handlers/admin-post/doUpdateIntermentContainerType.js';
import handler_doUpdateSetting from '../handlers/admin-post/doUpdateSetting.js';
import handler_doUpdateWorkOrderMilestoneType from '../handlers/admin-post/doUpdateWorkOrderMilestoneType.js';
import handler_doUpdateWorkOrderType from '../handlers/admin-post/doUpdateWorkOrderType.js';
import handler_doUpdateUser from '../handlers/admin-post/doUpdateUser.js';
// Ntfy Startup
export const router = Router();
/*
 * Fees
 */
router.get('/fees', handler_fees);
router.post('/doAddFeeCategory', handler_doAddFeeCategory);
router.post('/doUpdateFeeCategory', handler_doUpdateFeeCategory);
router.post('/doMoveFeeCategoryUp', handler_doMoveFeeCategoryUp);
router.post('/doMoveFeeCategoryDown', handler_doMoveFeeCategoryDown);
router.post('/doDeleteFeeCategory', handler_doDeleteFeeCategory);
router.post('/doAddFee', handler_doAddFee);
router.post('/doUpdateFee', handler_doUpdateFee);
router.post('/doUpdateFeeAmount', handler_doUpdateFeeAmount);
router.post('/doMoveFeeUp', handler_doMoveFeeUp);
router.post('/doMoveFeeDown', handler_doMoveFeeDown);
router.post('/doDeleteFee', handler_doDeleteFee);
/*
 * Contract Type Management
 */
router.get('/contractTypes', handler_contractTypes);
router.post('/doAddContractType', handler_doAddContractType);
router.post('/doUpdateContractType', handler_doUpdateContractType);
router.post('/doMoveContractTypeUp', handler_doMoveContractTypeUp);
router.post('/doMoveContractTypeDown', handler_doMoveContractTypeDown);
router.post('/doDeleteContractType', handler_doDeleteContractType);
// Contract Type Fields
router.post('/doAddContractTypeField', handler_doAddContractTypeField);
router.post('/doUpdateContractTypeField', handler_doUpdateContractTypeField);
router.post('/doMoveContractTypeFieldUp', handler_doMoveContractTypeFieldUp);
router.post('/doMoveContractTypeFieldDown', handler_doMoveContractTypeFieldDown);
router.post('/doDeleteContractTypeField', handler_doDeleteContractTypeField);
// Contract Type Prints
router.post('/doAddContractTypePrint', handler_doAddContractTypePrint);
router.post('/doMoveContractTypePrintUp', handler_doMoveContractTypePrintUp);
router.post('/doMoveContractTypePrintDown', handler_doMoveContractTypePrintDown);
router.post('/doDeleteContractTypePrint', handler_doDeleteContractTypePrint);
/*
 * Burial Site Type Management
 */
router.get('/burialSiteTypes', handler_burialSiteTypes);
router.post('/doAddBurialSiteType', handler_doAddBurialSiteType);
router.post('/doUpdateBurialSiteType', handler_doUpdateBurialSiteType);
router.post('/doMoveBurialSiteTypeUp', handler_doMoveBurialSiteTypeUp);
router.post('/doMoveBurialSiteTypeDown', handler_doMoveBurialSiteTypeDown);
router.post('/doDeleteBurialSiteType', handler_doDeleteBurialSiteType);
// Burial Site Type Fields
router.post('/doAddBurialSiteTypeField', handler_doAddBurialSiteTypeField);
router.post('/doUpdateBurialSiteTypeField', handler_doUpdateBurialSiteTypeField);
router.post('/doMoveBurialSiteTypeFieldUp', handler_doMoveBurialSiteTypeFieldUp);
router.post(
// eslint-disable-next-line no-secrets/no-secrets
'/doMoveBurialSiteTypeFieldDown', handler_doMoveBurialSiteTypeFieldDown);
router.post('/doDeleteBurialSiteTypeField', handler_doDeleteBurialSiteTypeField);
/*
 * Config Tables
 */
router.get('/tables', handler_tables);
/*
 * Users
 */
router.get('/users', handler_users);
router.post('/doAddUser', handler_doAddUser);
router.post('/doUpdateUser', handler_doUpdateUser);
router.post('/doDeleteUser', handler_doDeleteUser);
// Config Tables - Work Order Types
router.post('/doAddWorkOrderType', handler_doAddWorkOrderType);
router.post('/doUpdateWorkOrderType', handler_doUpdateWorkOrderType);
router.post('/doMoveWorkOrderTypeUp', handler_doMoveWorkOrderTypeUp);
router.post('/doMoveWorkOrderTypeDown', handler_doMoveWorkOrderTypeDown);
router.post('/doDeleteWorkOrderType', handler_doDeleteWorkOrderType);
// Config Tables - Work Order Milestone Types
router.post('/doAddWorkOrderMilestoneType', handler_doAddWorkOrderMilestoneType);
router.post('/doUpdateWorkOrderMilestoneType', handler_doUpdateWorkOrderMilestoneType);
router.post('/doMoveWorkOrderMilestoneTypeUp', handler_doMoveWorkOrderMilestoneTypeUp);
router.post('/doMoveWorkOrderMilestoneTypeDown', handler_doMoveWorkOrderMilestoneTypeDown);
router.post('/doDeleteWorkOrderMilestoneType', handler_doDeleteWorkOrderMilestoneType);
// Config Tables - Burial Site Statuses
router.post('/doAddBurialSiteStatus', handler_doAddBurialSiteStatus);
router.post('/doUpdateBurialSiteStatus', handler_doUpdateBurialSiteStatus);
router.post('/doMoveBurialSiteStatusUp', handler_doMoveBurialSiteStatusUp);
router.post('/doMoveBurialSiteStatusDown', handler_doMoveBurialSiteStatusDown);
router.post('/doDeleteBurialSiteStatus', handler_doDeleteBurialSiteStatus);
// Config Tables - Committal Types
router.post('/doAddCommittalType', handler_doAddCommittalType);
router.post('/doUpdateCommittalType', handler_doUpdateCommittalType);
router.post('/doMoveCommittalTypeUp', handler_doMoveCommittalTypeUp);
router.post('/doMoveCommittalTypeDown', handler_doMoveCommittalTypeDown);
router.post('/doDeleteCommittalType', handler_doDeleteCommittalType);
// Config Tables - Interment Container Types
router.post('/doAddIntermentContainerType', handler_doAddIntermentContainerType);
router.post('/doUpdateIntermentContainerType', handler_doUpdateIntermentContainerType);
router.post('/doMoveIntermentContainerTypeUp', handler_doMoveIntermentContainerTypeUp);
router.post('/doMoveIntermentContainerTypeDown', handler_doMoveIntermentContainerTypeDown);
router.post('/doDeleteIntermentContainerType', handler_doDeleteIntermentContainerType);
/*
 * Settings Management
 */
router.get('/settings', handler_settings);
router.post('/doUpdateSetting', handler_doUpdateSetting);
/*
 * Database Maintenance
 */
router.get('/database', handler_database);
router.post('/doBackupDatabase', handler_doBackupDatabase);
router.post('/doCleanupDatabase', handler_doCleanupDatabase);
export default router;
