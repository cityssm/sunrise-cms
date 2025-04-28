import * as cacheFunctions from '../../helpers/functions.cache.js';
/*
 * Burial Site Status IDs
 */
export const availableBurialSiteStatusId = cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Available')
    ?.burialSiteStatusId;
export const reservedBurialSiteStatusId = cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Reserved')
    ?.burialSiteStatusId;
export const takenBurialSiteStatusId = cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Taken')
    ?.burialSiteStatusId;
/*
 * Contract Type IDs
 */
export const preneedContractType = cacheFunctions.getContractTypeByContractType('Preneed');
export const deceasedContractType = cacheFunctions.getContractTypeByContractType('Interment');
export const cremationContractType = cacheFunctions.getContractTypeByContractType('Cremation');
/*
 * Work Order Milestone Type IDs
 */
export const acknowledgedWorkOrderMilestoneTypeId = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Acknowledged')?.workOrderMilestoneTypeId;
export const deathWorkOrderMilestoneTypeId = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Death')?.workOrderMilestoneTypeId;
export const funeralWorkOrderMilestoneTypeId = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Funeral')?.workOrderMilestoneTypeId;
export const cremationWorkOrderMilestoneTypeId = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Cremation')?.workOrderMilestoneTypeId;
export const intermentWorkOrderMilestoneTypeId = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Interment')?.workOrderMilestoneTypeId;
/*
 * Work Order Type IDs
 */
export const workOrderTypeId = 1;
