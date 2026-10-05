import type { DateString, TimeString } from '@cityssm/utils-datetime'

import type { directionsOfArrival } from '../helpers/dataLists.js'
import type { DynamicsGPDocument } from '../integrations/dynamicsGp/types.js'

import type { MetadataKey } from './contractMetadata.types.js'
import type { SettingKey } from './setting.types.js'

export interface BurialSite extends DatabaseRecord {
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
  crematedCapacity: number | null
  crematedCapacityMax?: number | null

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

export interface BurialSiteComment extends DatabaseRecord {
  burialSiteCommentId?: number
  burialSiteId?: number

  commentDate?: number
  commentDateString?: string

  commentTime?: number
  commentTimePeriodString?: string
  commentTimeString?: string

  comment?: string
}

export interface BurialSiteField extends BurialSiteTypeField, DatabaseRecord {
  burialSiteFieldValue?: string
  burialSiteId?: number
}

export interface BurialSiteStatus extends DatabaseRecord {
  burialSiteStatusId: number

  burialSiteStatus: string
  orderNumber?: number
}

export interface BurialSiteType extends DatabaseRecord {
  burialSiteTypeId: number

  burialSiteType: string

  bodyCapacityMax: number | null
  crematedCapacityMax: number | null

  burialSiteTypeFields?: BurialSiteTypeField[]
  isAvailableOnPortal: boolean
  orderNumber?: number
}

export interface BurialSiteTypeField extends DatabaseRecord {
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

export interface Cemetery extends DatabaseRecord {
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

export interface CommittalType extends DatabaseRecord {
  committalTypeId: number

  committalType: string
  committalTypeKey: string

  isAvailableOnPortal: boolean

  orderNumber?: number
}

export interface Contract extends DatabaseRecord {
  contractId: number
  contractNumber: string

  contractType: string
  contractTypeId: number
  isPreneed: boolean

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
  purchaserPostalCode: string
  purchaserProvince: string

  purchaserEmail: string
  purchaserPhoneNumber: string
  purchaserRelationship: string

  funeralDirectorName: string
  funeralHomeId: number | null
  funeralHomeIsActive?: 0 | 1
  funeralHomeName: string | null

  funeralHomeKey?: string

  funeralHomeAddress1?: string
  funeralHomeAddress2?: string
  funeralHomeCity?: string
  funeralHomePostalCode?: string
  funeralHomeProvince?: string

  funeralDate?: number
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

export interface ContractComment extends DatabaseRecord {
  contractCommentId: number
  contractId?: number

  commentDate: number
  commentDateString: string

  commentTime: number
  commentTimePeriodString: string
  commentTimeString: string

  comment: string
}

export interface ContractFee extends DatabaseRecord, Fee {
  contractId?: number
  quantity?: number
}

export interface ContractField extends ContractTypeField, DatabaseRecord {
  contractId: number
  contractTypeFieldId: number
  fieldValue?: string
}

export interface ContractInterment extends DatabaseRecord {
  contractId?: number
  intermentNumber?: number

  deceasedName: string

  deceasedAddress1: string
  deceasedAddress2: string
  deceasedCity: string
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

export interface ContractTransaction extends DatabaseRecord {
  contractId?: number
  transactionIndex?: number

  transactionDate?: number
  transactionDateString?: string

  transactionTime?: number
  transactionTimeString?: string

  dynamicsGPDocument?: DynamicsGPDocument
  externalReceiptNumber?: string
  isInvoiced?: 0 | 1

  transactionAmount: number
  transactionNote?: string
}

export interface ContractType extends DatabaseRecord {
  contractTypeId: number

  contractType: string
  isPreneed: boolean

  contractTypeFields?: ContractTypeField[]
  contractTypePrints?: string[]

  isAvailableOnPortal: boolean

  orderNumber?: number
}

export interface ContractTypeField {
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

export interface ContractMetadata extends DatabaseRecord {
  contractId: number
  metadataKey: MetadataKey
  metadataValue: string
}

export interface ContractAttachment extends DatabaseRecord {
  contractAttachmentId: number

  contractId?: number

  attachmentDetails: string
  attachmentTitle: string

  fileName: string
  filePath?: string
}

export interface Fee extends DatabaseRecord {
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

export interface FeeCategory extends DatabaseRecord {
  feeCategoryId: number

  feeCategory: string
  fees: Fee[]
  isGroupedFee: boolean
  orderNumber?: number
}

export interface OrderForm {
  orderFormId: number
  orderFormKey: string

  orderFormData: Record<string, string>

  recordCreate_ipAddress: string
  recordCreate_timeMillis: number

  recordSync_timeMillis: number

  isOrderFormProcessed: 0 | 1
}

export interface FuneralHome extends DatabaseRecord {
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

  upcomingFuneralCount?: number
}

export interface IntermentContainerType extends DatabaseRecord {
  intermentContainerTypeId: number

  intermentContainerType: string
  intermentContainerTypeKey: string
  isCremationType: boolean

  isAvailableOnPortal: boolean

  orderNumber?: number
}

export interface IntermentDepth extends DatabaseRecord {
  intermentDepthId: number

  intermentDepth: string
  intermentDepthKey: string

  isAvailableOnPortal: boolean

  orderNumber?: number
}

export interface ServiceType extends DatabaseRecord {
  serviceTypeId: number

  serviceType: string

  isAvailableOnPortal: boolean

  contractServiceDetails?: string

  orderNumber?: number
}

export interface DatabaseRecord {
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

export interface WorkOrder extends DatabaseRecord {
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

export interface WorkOrderComment extends DatabaseRecord {
  workOrderCommentId?: number
  workOrderId?: number

  commentDate?: number
  commentDateString?: string

  commentTime?: number
  commentTimePeriodString?: string
  commentTimeString?: string

  comment?: string
}

export interface WorkOrderMilestone extends DatabaseRecord, WorkOrder {
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

export interface WorkOrderMilestoneType extends DatabaseRecord {
  workOrderMilestoneType: string
  workOrderMilestoneTypeId: number

  orderNumber?: number
}

export interface WorkOrderType extends DatabaseRecord {
  workOrderType: string
  workOrderTypeId: number

  orderNumber?: number
}

export interface WorkOrderStatus extends DatabaseRecord {
  workOrderStatus: string
  workOrderStatusId: number

  orderNumber?: number
}

export interface Setting {
  settingKey: SettingKey

  previousSettingValue: string | null
  settingValue: string | null

  recordUpdate_timeMillis: number
}

export interface DatabaseUser extends DatabaseRecord {
  username: string

  isActive: boolean

  canUpdateCemeteries: boolean
  canUpdateContracts: boolean
  canUpdateWorkOrders: boolean
  isAdmin: boolean
}

export interface AuditLogEntry {
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
