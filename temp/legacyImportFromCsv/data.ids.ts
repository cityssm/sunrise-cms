import { getCachedBurialSiteStatusByBurialSiteStatus } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedContractTypeByContractType } from '../../helpers/cache/contractTypes.cache.js'
import { getCachedServiceTypeByServiceType } from '../../helpers/cache/serviceTypes.cache.js'
import { getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType } from '../../helpers/cache/workOrderMilestoneTypes.cache.js'
import type { ContractType } from '../../types/record.types.js'

/*
 * Burial Site Status IDs
 */

export const availableBurialSiteStatusId =
  getCachedBurialSiteStatusByBurialSiteStatus('Available', true)
    ?.burialSiteStatusId as number

export const reservedBurialSiteStatusId =
  getCachedBurialSiteStatusByBurialSiteStatus('Reserved', true)
    ?.burialSiteStatusId as number

export const occupiedBurialSiteStatusId =
  getCachedBurialSiteStatusByBurialSiteStatus('Occupied', true)
    ?.burialSiteStatusId as number

/*
 * Contract Type IDs
 */

export const preneedContractType = getCachedContractTypeByContractType(
  'Preneed',
  true
) as ContractType

export const atNeedContractType = getCachedContractTypeByContractType(
  'At Need',
  true
) as ContractType

export const permitOnlyContractType = getCachedContractTypeByContractType(
  'Permit Only',
  true
) as ContractType

/* Service Types */

export const intermentServiceTypeId = getCachedServiceTypeByServiceType(
  'Interment'
)?.serviceTypeId as number

export const cremationServiceTypeId = getCachedServiceTypeByServiceType(
  'Cremation'
)?.serviceTypeId as number

export const entombmentServiceTypeId = getCachedServiceTypeByServiceType(
  'Entombment'
)?.serviceTypeId as number

export const nicheServiceTypeId = getCachedServiceTypeByServiceType('Niche')
  ?.serviceTypeId as number

export const disintermentServiceTypeId = getCachedServiceTypeByServiceType(
  'Disinterment'
)?.serviceTypeId as number

/*
 * Work Order Milestone Type IDs
 */

export const acknowledgedWorkOrderMilestoneTypeId =
  getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Acknowledged',
    true
  )?.workOrderMilestoneTypeId

export const deathWorkOrderMilestoneTypeId =
  getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Death',
    true
  )?.workOrderMilestoneTypeId

export const funeralWorkOrderMilestoneTypeId =
  getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Funeral',
    true
  )?.workOrderMilestoneTypeId

export const cremationWorkOrderMilestoneTypeId =
  getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Cremation',
    true
  )?.workOrderMilestoneTypeId

export const intermentWorkOrderMilestoneTypeId =
  getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Interment',
    true
  )?.workOrderMilestoneTypeId

/*
 * Work Order Type IDs
 */

export const workOrderTypeId = 1
