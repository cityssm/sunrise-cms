import { getCachedBurialSiteStatusByBurialSiteStatus } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedContractTypeByContractType } from '../../helpers/cache/contractTypes.cache.js'
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

export const intermentContractType = getCachedContractTypeByContractType(
  'Interment',
  true
) as ContractType

export const intermentDepthContractField =
  intermentContractType.contractTypeFields?.find(
    (field) => field.contractTypeField === 'Interment Depth'
  )

export const cremationContractType = getCachedContractTypeByContractType(
  'Cremation',
  true
) as ContractType

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
