import * as cacheFunctions from '../../helpers/functions.cache.js'
import type { ContractType } from '../../types/record.types.js'

/*
 * Burial Site Status IDs
 */

export const availableBurialSiteStatusId =
  cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Available')
    ?.burialSiteStatusId as number

export const reservedBurialSiteStatusId =
  cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Reserved')
    ?.burialSiteStatusId as number

export const takenBurialSiteStatusId =
  cacheFunctions.getBurialSiteStatusByBurialSiteStatus('Taken')
    ?.burialSiteStatusId as number

/*
 * Contract Type IDs
 */

export const preneedContractType = cacheFunctions.getContractTypeByContractType(
  'Preneed'
) as ContractType

export const deceasedContractType =
  cacheFunctions.getContractTypeByContractType('Interment') as ContractType

export const cremationContractType =
  cacheFunctions.getContractTypeByContractType('Cremation') as ContractType

/*
 * Work Order Milestone Type IDs
 */

export const acknowledgedWorkOrderMilestoneTypeId =
  cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Acknowledged'
  )?.workOrderMilestoneTypeId

export const deathWorkOrderMilestoneTypeId =
  cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Death'
  )?.workOrderMilestoneTypeId

export const funeralWorkOrderMilestoneTypeId =
  cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Funeral'
  )?.workOrderMilestoneTypeId

export const cremationWorkOrderMilestoneTypeId =
  cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Cremation'
  )?.workOrderMilestoneTypeId

export const intermentWorkOrderMilestoneTypeId =
  cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
    'Interment'
  )?.workOrderMilestoneTypeId

/*
 * Work Order Type IDs
 */

export const workOrderTypeId = 1
