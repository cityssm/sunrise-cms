import * as cacheFunctions from '../../helpers/cache.helpers.js'
import type { ContractType } from '../../types/record.types.js'

/*
 * Burial Site Status IDs
 */

export const availableBurialSiteStatusId =
  cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Available', true)
    ?.burialSiteStatusId as number

export const reservedBurialSiteStatusId =
  cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Reserved', true)
    ?.burialSiteStatusId as number

export const occupiedBurialSiteStatusId =
  cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Occupied', true)
    ?.burialSiteStatusId as number

/*
 * Contract Type IDs
 */

export const preneedContractType = cacheFunctions.getContractTypeByContractType(
  'Preneed',
  true
) as ContractType

export const deceasedContractType =
  cacheFunctions.getContractTypeByContractType(
    'Interment',
    true
  ) as ContractType

export const cremationContractType =
  cacheFunctions.getContractTypeByContractType(
    'Cremation',
    true
  ) as ContractType

/*
 * Work Order Milestone Type IDs
 */

export const acknowledgedWorkOrderMilestoneTypeId =
  cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Acknowledged',
    true
  )?.workOrderMilestoneTypeId

export const deathWorkOrderMilestoneTypeId =
  cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Death',
    true
  )?.workOrderMilestoneTypeId

export const funeralWorkOrderMilestoneTypeId =
  cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Funeral',
    true
  )?.workOrderMilestoneTypeId

export const cremationWorkOrderMilestoneTypeId =
  cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Cremation',
    true
  )?.workOrderMilestoneTypeId

export const intermentWorkOrderMilestoneTypeId =
  cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Interment',
    true
  )?.workOrderMilestoneTypeId

/*
 * Work Order Type IDs
 */

export const workOrderTypeId = 1
