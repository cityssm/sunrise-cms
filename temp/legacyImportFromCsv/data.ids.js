import { getCachedBurialSiteStatusByBurialSiteStatus } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedContractTypeByContractType } from '../../helpers/cache/contractTypes.cache.js';
import { getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
/*
 * Burial Site Status IDs
 */
export const availableBurialSiteStatusId = getCachedBurialSiteStatusByBurialSiteStatus('Available', true)
    ?.burialSiteStatusId;
export const reservedBurialSiteStatusId = getCachedBurialSiteStatusByBurialSiteStatus('Reserved', true)?.burialSiteStatusId;
export const occupiedBurialSiteStatusId = getCachedBurialSiteStatusByBurialSiteStatus('Occupied', true)?.burialSiteStatusId;
/*
 * Contract Type IDs
 */
export const preneedContractType = getCachedContractTypeByContractType('Preneed', true);
export const deceasedContractType = getCachedContractTypeByContractType('Interment', true);
export const cremationContractType = getCachedContractTypeByContractType('Cremation', true);
/*
 * Work Order Milestone Type IDs
 */
export const acknowledgedWorkOrderMilestoneTypeId = getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType('Acknowledged', true)?.workOrderMilestoneTypeId;
export const deathWorkOrderMilestoneTypeId = getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType('Death', true)?.workOrderMilestoneTypeId;
export const funeralWorkOrderMilestoneTypeId = getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType('Funeral', true)?.workOrderMilestoneTypeId;
export const cremationWorkOrderMilestoneTypeId = getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType('Cremation', true)?.workOrderMilestoneTypeId;
export const intermentWorkOrderMilestoneTypeId = getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType('Interment', true)?.workOrderMilestoneTypeId;
/*
 * Work Order Type IDs
 */
export const workOrderTypeId = 1;
