import { getCachedBurialSiteStatusByBurialSiteStatus } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedContractTypeByContractType } from '../../helpers/cache/contractTypes.cache.js';
import { getCachedServiceTypeByServiceType } from '../../helpers/cache/serviceTypes.cache.js';
import { getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
/*
 * Burial Site Status IDs
 */
export const availableBurialSiteStatusId = getCachedBurialSiteStatusByBurialSiteStatus('Available', true)
    ?.burialSiteStatusId;
export const reservedBurialSiteStatusId = getCachedBurialSiteStatusByBurialSiteStatus('Reserved', true)
    ?.burialSiteStatusId;
export const occupiedBurialSiteStatusId = getCachedBurialSiteStatusByBurialSiteStatus('Occupied', true)
    ?.burialSiteStatusId;
/*
 * Contract Type IDs
 */
export const preneedContractType = getCachedContractTypeByContractType('Preneed', true);
export const atNeedContractType = getCachedContractTypeByContractType('At Need', true);
export const permitOnlyContractType = getCachedContractTypeByContractType('Permit Only', true);
/* Service Types */
export const intermentServiceTypeId = getCachedServiceTypeByServiceType('Interment')?.serviceTypeId;
export const cremationServiceTypeId = getCachedServiceTypeByServiceType('Cremation')?.serviceTypeId;
export const entombmentServiceTypeId = getCachedServiceTypeByServiceType('Entombment')?.serviceTypeId;
export const nicheServiceTypeId = getCachedServiceTypeByServiceType('Niche')
    ?.serviceTypeId;
export const disintermentServiceTypeId = getCachedServiceTypeByServiceType('Disinterment')?.serviceTypeId;
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
