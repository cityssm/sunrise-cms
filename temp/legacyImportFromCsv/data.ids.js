// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-non-null-assertion, unicorn/no-await-expression-member */
import * as cacheFunctions from '../../helpers/functions.cache.js';
/*
 * Burial Site Status IDs
 */
export const availableBurialSiteStatusId = (await cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Available'))
    .burialSiteStatusId;
export const reservedBurialSiteStatusId = (await cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Reserved'))
    .burialSiteStatusId;
export const takenBurialSiteStatusId = (await cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Taken'))
    .burialSiteStatusId;
/*
 * Contract Type IDs
 */
export const preneedContractType = (await cacheFunctions.getContractTypeByContractType('Preneed'));
export const deceasedContractType = (await cacheFunctions.getContractTypeByContractType('Interment'));
export const cremationContractType = (await cacheFunctions.getContractTypeByContractType('Cremation'));
/*
 * Work Order Milestone Type IDs
 */
export const acknowledgedWorkOrderMilestoneTypeId = (await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Acknowledged'))?.workOrderMilestoneTypeId;
export const deathWorkOrderMilestoneTypeId = (await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Death'))?.workOrderMilestoneTypeId;
export const funeralWorkOrderMilestoneTypeId = (await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Funeral'))?.workOrderMilestoneTypeId;
export const cremationWorkOrderMilestoneTypeId = (await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Cremation'))?.workOrderMilestoneTypeId;
export const intermentWorkOrderMilestoneTypeId = (await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Interment'))?.workOrderMilestoneTypeId;
/*
 * Work Order Type IDs
 */
export const workOrderTypeId = 1;
