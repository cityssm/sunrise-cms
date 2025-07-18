import * as cacheFunctions from '../../helpers/cache.helpers.js';
/*
 * Burial Site Status IDs
 */
export const availableBurialSiteStatusId = cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Available', true)
    ?.burialSiteStatusId;
export const reservedBurialSiteStatusId = cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Reserved', true)
    ?.burialSiteStatusId;
export const occupiedBurialSiteStatusId = cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Occupied', true)
    ?.burialSiteStatusId;
/*
 * Contract Type IDs
 */
export const preneedContractType = cacheFunctions.getContractTypeByContractType('Preneed', true);
export const deceasedContractType = cacheFunctions.getContractTypeByContractType('Interment', true);
export const cremationContractType = cacheFunctions.getContractTypeByContractType('Cremation', true);
/*
 * Work Order Milestone Type IDs
 */
export const acknowledgedWorkOrderMilestoneTypeId = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Acknowledged', true)?.workOrderMilestoneTypeId;
export const deathWorkOrderMilestoneTypeId = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Death', true)?.workOrderMilestoneTypeId;
export const funeralWorkOrderMilestoneTypeId = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Funeral', true)?.workOrderMilestoneTypeId;
export const cremationWorkOrderMilestoneTypeId = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Cremation', true)?.workOrderMilestoneTypeId;
export const intermentWorkOrderMilestoneTypeId = cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType('Interment', true)?.workOrderMilestoneTypeId;
/*
 * Work Order Type IDs
 */
export const workOrderTypeId = 1;
