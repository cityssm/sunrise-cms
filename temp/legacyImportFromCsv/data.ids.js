import { getCachedBurialSiteStatusByBurialSiteStatus } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedContractTypeByContractType } from '../../helpers/cache/contractTypes.cache.js';
import { getCachedPaymentTypeByPaymentType } from '../../helpers/cache/paymentTypes.cache.js';
import { getCachedServiceTypeByServiceType } from '../../helpers/cache/serviceTypes.cache.js';
import { getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
import { getCachedWorkOrderStatusByWorkOrderStatus } from '../../helpers/cache/workOrderStatuses.cache.js';
import { getCachedWorkOrderTypeByWorkOrderType } from '../../helpers/cache/workOrderTypes.cache.js';
export const availableBurialSiteStatusId = getCachedBurialSiteStatusByBurialSiteStatus('Available', true)
    ?.burialSiteStatusId;
export const reservedBurialSiteStatusId = getCachedBurialSiteStatusByBurialSiteStatus('Reserved', true)
    ?.burialSiteStatusId;
export const occupiedBurialSiteStatusId = getCachedBurialSiteStatusByBurialSiteStatus('Occupied', true)
    ?.burialSiteStatusId;
export const preneedContractType = getCachedContractTypeByContractType('Preneed', true);
export const atNeedContractType = getCachedContractTypeByContractType('At Need', true);
export const permitOnlyContractType = getCachedContractTypeByContractType('Permit Only', true);
export const intermentServiceTypeId = getCachedServiceTypeByServiceType('Interment')?.serviceTypeId;
export const cremationServiceTypeId = getCachedServiceTypeByServiceType('Cremation')?.serviceTypeId;
export const entombmentServiceTypeId = getCachedServiceTypeByServiceType('Entombment')?.serviceTypeId;
export const nicheServiceTypeId = getCachedServiceTypeByServiceType('Niche')
    ?.serviceTypeId;
export const disintermentServiceTypeId = getCachedServiceTypeByServiceType('Disinterment')?.serviceTypeId;
export const funeralWorkOrderMilestoneTypeId = getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType('Funeral', true)?.workOrderMilestoneTypeId;
export const cremationWorkOrderMilestoneTypeId = getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType('Cremation', true)?.workOrderMilestoneTypeId;
export const intermentWorkOrderMilestoneTypeId = getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType('Interment', true)?.workOrderMilestoneTypeId;
export const generalWorkOrderTypeId = getCachedWorkOrderTypeByWorkOrderType('General')?.workOrderTypeId;
export const enteredWorkOrderStatusId = getCachedWorkOrderStatusByWorkOrderStatus('Entered')?.workOrderStatusId;
export const scheduledWorkOrderStatusId = getCachedWorkOrderStatusByWorkOrderStatus('Scheduled')?.workOrderStatusId;
export const paymentTakenPaymentTypeId = getCachedPaymentTypeByPaymentType('Payment Taken')?.paymentTypeId;
