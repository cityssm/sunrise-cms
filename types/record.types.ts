/* eslint-disable @typescript-eslint/no-restricted-types */
/* eslint-disable max-lines */

import type { DateString, TimeString } from '@cityssm/utils-datetime'
import type { OrderFormData } from 'sunrise-cms-shared'

import type { directionsOfArrival } from '../helpers/dataLists.js'
import type { DynamicsGPDocument } from '../integrations/dynamicsGp/types.js'

import type { MetadataKey } from './contractMetadata.types.js'
import type { SettingKey } from './setting.types.js'

type NumberStringNullable = number | string | null

export type BurialSite = DatabaseRecord & {
  burialSiteId: number

  burialSiteName: string
  burialSiteNameSegment1: string
  burialSiteNameSegment2: string
  burialSiteNameSegment3: string
  burialSiteNameSegment4: string
  burialSiteNameSegment5: string

  burialSiteType: string | null
  burialSiteTypeId?: number

  bodyCapacity: number | null
  bodyCapacityMax?: number | null
  bodyCapacityUsed?: number
  setBodyCapacity?: number | null

  crematedCapacity: number | null
  crematedCapacityMax?: number | null
  crematedCapacityUsed?: number
  setCrematedCapacity?: number | null

  cemetery?: Cemetery
  cemeteryId: number | null
  cemeteryKey?: string
  cemeteryName: string | null
  cemeterySvg?: string
  cemeterySvgId?: string

  cemeteryLatitude?: number | null
  cemeteryLongitude?: number | null

  burialSiteImage?: string

  burialSiteLatitude: number | null
  burialSiteLongitude: number | null

  burialSiteStatus?: string
  burialSiteStatusId?: number | null

  burialSiteFields?: BurialSiteField[]

  contractCount?: number
  contracts?: Contract[]

  deceasedNames?: string[]

  burialSiteComments?: BurialSiteComment[]
}

export type BurialSiteComment = DatabaseRecord & {
  burialSiteCommentId?: number
  burialSiteId?: number

  commentDate?: number
  commentDateString?: string

  commentTime?: number
  commentTimePeriodString?: string
  commentTimeString?: string

  comment?: string
}

export type BurialSiteField = BurialSiteTypeField &
  DatabaseRecord & {
    burialSiteFieldValue?: string
    burialSiteId?: number
  }

export type BurialSiteStatus = DatabaseRecord & {
  burialSiteStatusId: number

  burialSiteStatus: string
  orderNumber?: number
}

export type BurialSiteType = DatabaseRecord & {
  burialSiteTypeId: number

  burialSiteType: string

  bodyCapacityMax: number | null
  crematedCapacityMax: number | null

  burialSiteTypeFields?: BurialSiteTypeField[]
  isAvailableOnPortal: boolean
  orderNumber?: number
}

export type BurialSiteTypeField = DatabaseRecord & {
  burialSiteTypeFieldId: number

  burialSiteTypeField?: string

  burialSiteType: BurialSiteType
  burialSiteTypeId?: number

  fieldType: string
  fieldValues?: string | null
  isRequired?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string

  orderNumber?: number
}

export type Cemetery = DatabaseRecord & {
  cemeteryId?: number

  cemeteryDescription: string
  cemeteryKey: string
  cemeteryName: string

  parentCemeteryId?: number | null
  parentCemeteryName?: string | null

  parentCemeteryLatitude?: number | null
  parentCemeteryLongitude?: number | null
  parentCemeterySvg?: string | null

  cemeteryLatitude: number | null
  cemeteryLongitude: number | null
  cemeterySvg: string

  cemeteryAddress1: string
  cemeteryAddress2: string
  cemeteryCity: string
  cemeteryPostalCode: string
  cemeteryProvince: string

  cemeteryPhoneNumber: string

  findagraveCemeteryId: number | null
  findagraveCemeteryUrl: string | null

  isAvailableOnPortal: boolean

  burialSiteCount?: number
  childCemeteries?: Cemetery[]
  directionsOfArrival?: Partial<
    globalThis.Record<(typeof directionsOfArrival)[number], string>
  >
}

export type CommittalType = DatabaseRecord & {
  committalTypeId: number

  committalType: string
  committalTypeKey: string

  isAvailableOnPortal: boolean

  orderNumber?: number
}

export type Contract = DatabaseRecord & {
  contractId: number
  contractNumber: string

  contractType: string
  contractTypeId: number
  isPreneed: boolean
  sourceOrderFormId?: number

  comment?: string

  printEJS?: string

  burialSiteId?: number | null
  burialSiteIsActive?: 0 | 1
  burialSiteName?: string
  burialSiteType?: string
  burialSiteTypeId?: number

  cemeteryId?: number
  cemeteryName?: string

  contractStartDate: number
  contractStartDateString: '' | DateString

  contractEndDate?: number | null
  contractEndDateString?: '' | DateString

  contractIsActive: boolean
  contractIsFuture: boolean

  purchaserName: string

  purchaserAddress1: string
  purchaserAddress2: string
  purchaserCity: string
  purchaserCountry?: string
  purchaserPostalCode: string
  purchaserProvince: string

  purchaserEmail: string
  purchaserPhoneNumber: string
  purchaserRelationship: string

  deceasedName?: string

  deceasedAddress1?: string
  deceasedAddress2?: string
  deceasedCity?: string
  deceasedCountry?: string
  deceasedPostalCode?: string
  deceasedProvince?: string

  funeralDirectorName: string
  funeralHomeId: number | null
  funeralHomeIsActive?: 0 | 1
  funeralHomeName: string | null

  birthDay?: NumberStringNullable
  birthMonth?: NumberStringNullable
  birthYear?: NumberStringNullable

  birthPlace?: string

  deathDay?: NumberStringNullable
  deathMonth?: NumberStringNullable
  deathYear?: NumberStringNullable

  deathPlace?: string

  deathAge?: NumberStringNullable
  deathAgePeriod?: string

  intermentContainerType?: string
  intermentContainerTypeId?: NumberStringNullable

  intermentDepth?: string
  intermentDepthId?: NumberStringNullable

  funeralHomeKey?: string

  funeralHomeAddress1?: string
  funeralHomeAddress2?: string
  funeralHomeCity?: string
  funeralHomePostalCode?: string
  funeralHomeProvince?: string

  funeralDate?: number | null
  funeralDateString?: '' | DateString

  funeralTime?: number
  funeralTimePeriodString?: string
  funeralTimeString?: TimeString

  committalType?: string
  committalTypeId?: number

  directionOfArrival?: string
  directionOfArrivalDescription?: string

  contractAttachments?: ContractAttachment[]
  contractComments?: ContractComment[]
  contractFees?: ContractFee[]
  contractFields?: ContractField[]
  contractInterments?: ContractInterment[]
  contractServiceTypes?: ServiceType[]
  contractTransactions?: ContractTransaction[]
  relatedContracts?: Contract[]
  workOrders?: WorkOrder[]
}

export type ContractComment = DatabaseRecord & {
  contractCommentId: number
  contractId?: number

  commentDate: number
  commentDateString: string

  commentTime: number
  commentTimePeriodString: string
  commentTimeString: string

  comment: string
}

export type ContractFee = DatabaseRecord &
  Fee & {
    contractId?: number
    quantity?: number
  }

export type ContractField = ContractTypeField &
  DatabaseRecord & {
    contractId: number
    contractTypeFieldId: number
    fieldValue?: string
  }

export type ContractInterment = DatabaseRecord & {
  contractId?: number
  intermentNumber?: number

  deceasedName: string

  deceasedAddress1: string
  deceasedAddress2: string
  deceasedCity: string
  deceasedCountry?: string
  deceasedPostalCode: string
  deceasedProvince: string

  birthDate?: number
  birthDateString?: string
  birthPlace?: string

  deathAge?: number | null
  deathAgePeriod?: string
  deathDate?: number
  deathDateString?: string
  deathPlace?: string

  findagraveMemorialId: number | null
  findagraveMemorialUrl: string | null

  findagraveMemorialSearchUrl: string | null

  intermentContainerType?: string
  intermentContainerTypeId?: number
  isCremationType?: boolean

  intermentDepth?: string
  intermentDepthId?: number

  contractIdCount?: number
  recordUpdate_timeMillisMax?: number
}

export type ContractTransaction = DatabaseRecord & {
  contractId?: number
  transactionIndex?: number

  transactionDate?: number
  transactionDateString?: string

  transactionTime?: number
  transactionTimeString?: string

  dynamicsGPDocument?: DynamicsGPDocument
  externalReceiptNumber?: string
  paymentType?: string
  paymentTypeId?: number

  transactionAmount: number
  transactionNote?: string
}

export type ContractType = DatabaseRecord & {
  contractTypeId: number

  contractType: string
  isPreneed: boolean

  contractTypeFields?: ContractTypeField[]
  contractTypePrints?: string[]

  isAvailableOnPortal: boolean

  orderNumber?: number
}

export type ContractTypeField = {
  contractTypeFieldId: number

  contractTypeField?: string
  contractTypeId?: number

  fieldType: string
  fieldValues?: string
  isRequired?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string

  orderNumber?: number
}

export type ContractMetadata = DatabaseRecord & {
  contractId: number
  metadataKey: MetadataKey
  metadataValue: string
}

export type ContractAttachment = DatabaseRecord & {
  contractAttachmentId: number

  contractId?: number

  attachmentDetails: string
  attachmentTitle: string

  fileName: string
  filePath?: string
}

export type Fee = DatabaseRecord & {
  feeId: number

  feeCategory?: string
  feeCategoryId: number

  feeAccount: string
  feeDescription: string
  feeName: string

  contractType?: string | null
  contractTypeId: number | null

  burialSiteType?: string | null
  burialSiteTypeId: number | null

  includeQuantity: boolean
  quantityUnit: string | null

  feeAmount: number | null
  feeFunction: string | null

  taxAmount: number | null
  taxPercentage: number | null

  isRequired: boolean

  orderNumber: number

  contractFeeCount?: number
}

export type FeeCategory = DatabaseRecord & {
  feeCategoryId: number

  feeCategory: string
  fees: Fee[]
  isGroupedFee: boolean
  orderNumber?: number
}

export type OrderForm = {
  orderFormId: number
  orderFormKey: string

  orderFormData: OrderFormData

  recordCreate_ipAddress: string
  recordCreate_timeMillis: number

  recordSync_timeMillis: number

  isOrderFormProcessed: 0 | 1
}

export type FuneralHome = DatabaseRecord & {
  funeralHomeId?: number
  funeralHomeKey?: string
  funeralHomeName: string

  funeralHomeAddress1: string
  funeralHomeAddress2: string
  funeralHomeCity: string
  funeralHomePostalCode: string
  funeralHomeProvince: string

  funeralHomePhoneNumber: string

  isAvailableOnPortal: boolean
}

export type FuneralHomeWithCounts = FuneralHome & {
  openWorkOrderCount: number
  upcomingFuneralCount: number
}

export type IntermentContainerType = DatabaseRecord & {
  intermentContainerTypeId: number

  intermentContainerType: string
  intermentContainerTypeKey: string
  isCremationType: boolean

  isAvailableOnPortal: boolean

  orderNumber?: number
}

export type IntermentDepth = DatabaseRecord & {
  intermentDepthId: number

  intermentDepth: string
  intermentDepthKey: string

  isAvailableOnPortal: boolean

  orderNumber?: number
}

export type PaymentType = DatabaseRecord & {
  paymentTypeId: number

  paymentType: string

  orderNumber?: number
}

export type ServiceType = DatabaseRecord & {
  serviceTypeId: number

  serviceType: string

  isAvailableOnPortal: boolean

  contractServiceDetails?: string

  orderNumber?: number
}

export type DatabaseRecord = {
  recordCreate_dateString?: string
  recordCreate_timeMillis?: number
  recordCreate_username?: string

  recordUpdate_dateString?: string
  recordUpdate_timeMillis?: number
  recordUpdate_timeString?: string
  recordUpdate_username?: string

  recordDelete_dateString?: string
  recordDelete_timeMillis?: number | null
  recordDelete_username?: string | null
}

/*
 * WORK ORDERS
 */

export type WorkOrder = DatabaseRecord & {
  workOrderId: number

  workOrderType?: string
  workOrderTypeId?: number

  workOrderDescription?: string
  workOrderNumber?: string

  workOrderOpenDate?: number
  workOrderOpenDateString?: string

  workOrderCloseDate?: number | null
  workOrderCloseDateString?: string

  workOrderStatus?: string
  workOrderStatusId?: number

  workOrderMilestoneCount?: number
  workOrderMilestones?: WorkOrderMilestone[]

  workOrderMilestoneCompletionCount?: number
  workOrderMilestoneOverdueCount?: number

  workOrderComments?: WorkOrderComment[]

  workOrderBurialSiteCount?: number
  workOrderBurialSites?: BurialSite[]

  workOrderContracts?: Contract[]
}

export type WorkOrderComment = DatabaseRecord & {
  workOrderCommentId?: number
  workOrderId?: number

  commentDate?: number
  commentDateString?: string

  commentTime?: number
  commentTimePeriodString?: string
  commentTimeString?: string

  comment?: string
}

export type WorkOrderMilestone = DatabaseRecord &
  WorkOrder & {
    workOrderMilestoneId: number

    workOrderMilestoneType?: string | null
    workOrderMilestoneTypeId?: number | null

    workOrderMilestoneDate: number
    workOrderMilestoneDateString?: string

    workOrderMilestoneTime?: number | null
    workOrderMilestoneTimePeriodString?: string
    workOrderMilestoneTimeString?: string

    workOrderMilestoneDescription: string

    workOrderMilestoneCompletionDate?: number | null
    workOrderMilestoneCompletionDateString?: string

    workOrderMilestoneCompletionTime?: number
    workOrderMilestoneCompletionTimePeriodString?: string
    workOrderMilestoneCompletionTimeString?: string

    workOrderRecordUpdate_timeMillis?: number
  }

export type WorkOrderMilestoneType = DatabaseRecord & {
  workOrderMilestoneType: string
  workOrderMilestoneTypeId: number

  orderNumber?: number
}

export type WorkOrderType = DatabaseRecord & {
  workOrderType: string
  workOrderTypeId: number

  orderNumber?: number
}

export type WorkOrderStatus = DatabaseRecord & {
  workOrderStatus: string
  workOrderStatusId: number

  orderNumber?: number
}

export type Setting = {
  settingKey: SettingKey

  previousSettingValue: string | null
  settingValue: string | null

  recordUpdate_timeMillis: number
}

export type DatabaseUser = DatabaseRecord & {
  username: string

  isActive: boolean

  canUpdateCemeteries: boolean
  canUpdateContracts: boolean
  canUpdateWorkOrders: boolean
  isAdmin: boolean
}

export type AuditLogEntry = {
  logMillis: number

  logDate: number
  logTime: number

  mainRecordId: string
  mainRecordType: string

  recordIndex: string | null
  updateTable: string

  updateField: string
  updateType: string

  updateUsername: string

  fromValue: string | null
  toValue: string | null
}
