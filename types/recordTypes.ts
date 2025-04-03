import type { DateString, TimeString } from '@cityssm/utils-datetime'

export interface BurialSite extends Record {
  burialSiteId: number

  burialSiteName?: string
  burialSiteNameSegment1?: string
  burialSiteNameSegment2?: string
  burialSiteNameSegment3?: string
  burialSiteNameSegment4?: string
  burialSiteNameSegment5?: string

  burialSiteType?: string
  burialSiteTypeId?: number

  cemetery?: Cemetery
  cemeteryId?: number
  cemeteryName?: string
  cemeterySvg?: string
  cemeterySvgId?: string

  burialSiteImage?: string

  burialSiteLatitude?: number
  burialSiteLongitude?: number

  burialSiteStatus?: string
  burialSiteStatusId?: number

  burialSiteFields?: BurialSiteField[]

  contractCount?: number
  contracts?: Contract[]

  burialSiteComments?: BurialSiteComment[]
}

export interface BurialSiteComment extends Record {
  burialSiteCommentId?: number
  burialSiteId?: number

  commentDate?: number
  commentDateString?: string

  commentTime?: number
  commentTimePeriodString?: string
  commentTimeString?: string

  comment?: string
}

export interface BurialSiteField extends BurialSiteTypeField, Record {
  burialSiteFieldValue?: string
  burialSiteId?: number
}

export interface BurialSiteStatus extends Record {
  burialSiteStatusId: number

  burialSiteStatus: string
  orderNumber?: number
}

export interface BurialSiteType extends Record {
  burialSiteTypeId: number

  burialSiteType: string
  burialSiteTypeFields?: BurialSiteTypeField[]
  orderNumber?: number
}

export interface BurialSiteTypeField extends Record {
  burialSiteTypeFieldId: number

  burialSiteTypeField?: string

  burialSiteType: BurialSiteType
  burialSiteTypeId?: number

  fieldType: string
  fieldValues?: string
  isRequired?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string

  orderNumber?: number
}

export interface Cemetery extends Record {
  cemeteryId?: number

  cemeteryDescription: string
  cemeteryKey: string
  cemeteryName: string

  cemeteryLatitude?: number
  cemeteryLongitude?: number
  cemeterySvg?: string

  cemeteryAddress1: string
  cemeteryAddress2: string
  cemeteryCity: string
  cemeteryPostalCode: string
  cemeteryProvince: string

  cemeteryPhoneNumber: string

  burialSiteCount?: number
}

export interface CommittalType extends Record {
  committalTypeId: number

  committalType: string
  committalTypeKey: string

  orderNumber?: number
}

export interface Contract extends Record {
  contractId: number

  contractType: string
  contractTypeId: number
  isPreneed: boolean

  printEJS?: string

  burialSiteId?: number
  burialSiteName?: string
  burialSiteType?: string
  burialSiteTypeId?: number

  cemeteryId?: number
  cemeteryName?: string

  contractStartDate: number
  contractStartDateString: string

  contractEndDate?: number
  contractEndDateString?: string

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
  funeralHomeName: string | null

  funeralHomeKey?: string

  funeralHomeAddress1?: string
  funeralHomeAddress2?: string
  funeralHomeCity?: string
  funeralHomePostalCode?: string
  funeralHomeProvince?: string

  funeralDate?: number
  funeralDateString?: DateString

  funeralTime?: number
  funeralTimePeriodString?: string
  funeralTimeString?: TimeString

  committalType?: string
  committalTypeId?: number

  contractComments?: ContractComment[]
  contractFees?: ContractFee[]
  contractFields?: ContractField[]
  contractInterments?: ContractInterment[]
  contractTransactions?: ContractTransaction[]
  workOrders?: WorkOrder[]
}

export interface ContractComment extends Record {
  contractCommentId: number
  contractId?: number

  commentDate: number
  commentDateString: string

  commentTime: number
  commentTimePeriodString: string
  commentTimeString: string

  comment: string
}

export interface ContractFee extends Fee, Record {
  contractId?: number
  quantity?: number
}

export interface ContractField extends ContractTypeField, Record {
  contractId: number
  contractTypeFieldId: number
  fieldValue?: string
}

export interface ContractInterment extends Record {
  contractId?: number
  intermentNumber?: number

  deceasedName?: string

  deceasedAddress1?: string
  deceasedAddress2?: string
  deceasedCity?: string
  deceasedPostalCode?: string
  deceasedProvince?: string

  birthDate?: number
  birthDateString?: DateString
  birthPlace?: string

  deathAge?: number | null
  deathAgePeriod?: string
  deathDate?: number
  deathDateString?: DateString
  deathPlace?: string

  intermentContainerType?: string
  intermentContainerTypeId?: number
  isCremationType?: boolean

  contractIdCount?: number
  recordUpdate_timeMillisMax?: number
}

export interface ContractTransaction extends Record {
  contractId?: number
  transactionIndex?: number

  transactionDate?: number
  transactionDateString?: string

  transactionTime?: number
  transactionTimeString?: string

  dynamicsGPDocument?: DynamicsGPDocument
  externalReceiptNumber?: string
  transactionAmount: number
  transactionNote?: string
}

export interface ContractType extends Record {
  contractTypeId: number

  contractType: string
  isPreneed: boolean

  contractTypeFields?: ContractTypeField[]
  contractTypePrints?: string[]

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

export interface DynamicsGPDocument {
  documentType: 'Cash Receipt' | 'Invoice'

  documentDate: Date
  documentDescription: string[]
  documentNumber: string
  documentTotal: number
}

export interface Fee extends Record {
  feeId: number

  feeCategory?: string
  feeCategoryId: number

  feeAccount?: string
  feeDescription?: string
  feeName?: string

  contractType?: string
  contractTypeId?: number

  burialSiteType?: string
  burialSiteTypeId?: number

  includeQuantity?: boolean
  quantityUnit?: string

  feeAmount?: number
  feeFunction?: string

  taxAmount?: number
  taxPercentage?: number

  isRequired?: boolean

  orderNumber: number

  contractFeeCount?: number
}

export interface FeeCategory extends Record {
  feeCategoryId: number

  feeCategory: string
  fees: Fee[]
  isGroupedFee: boolean
  orderNumber?: number
}

export interface FuneralHome extends Record {
  funeralHomeId?: number
  funeralHomeKey?: string
  funeralHomeName?: string

  funeralHomeAddress1?: string
  funeralHomeAddress2?: string
  funeralHomeCity?: string
  funeralHomePostalCode?: string
  funeralHomeProvince?: string

  funeralHomePhoneNumber?: string
}

export interface IntermentContainerType extends Record {
  intermentContainerTypeId: number
  intermentContainerType: string
  intermentContainerTypeKey: string
  isCremationType: boolean
  orderNumber?: number
}

export interface Record {
  recordCreate_dateString?: string
  recordCreate_timeMillis?: number
  recordCreate_userName?: string

  recordUpdate_dateString?: string
  recordUpdate_timeMillis?: number
  recordUpdate_timeString?: string
  recordUpdate_userName?: string

  recordDelete_dateString?: string
  recordDelete_timeMillis?: number
  recordDelete_userName?: string
}

/*
 * WORK ORDERS
 */

export interface WorkOrder extends Record {
  workOrderId: number

  workOrderType?: string
  workOrderTypeId?: number

  workOrderDescription?: string
  workOrderNumber?: string

  workOrderOpenDate?: number
  workOrderOpenDateString?: string

  workOrderCloseDate?: number
  workOrderCloseDateString?: string

  workOrderMilestones?: WorkOrderMilestone[]
  workOrderMilestoneCount?: number
  workOrderMilestoneCompletionCount?: number

  workOrderComments?: WorkOrderComment[]

  workOrderBurialSites?: BurialSite[]
  workOrderBurialSiteCount?: number

  workOrderContracts?: Contract[]
}

export interface WorkOrderComment extends Record {
  workOrderCommentId?: number
  workOrderId?: number

  commentDate?: number
  commentDateString?: string

  commentTime?: number
  commentTimeString?: string
  commentTimePeriodString?: string

  comment?: string
}

export interface WorkOrderMilestone extends Record, WorkOrder {
  workOrderMilestoneId?: number

  workOrderMilestoneTypeId?: number
  workOrderMilestoneType?: string

  workOrderMilestoneDate?: number
  workOrderMilestoneDateString?: string

  workOrderMilestoneTime?: number
  workOrderMilestoneTimeString?: string
  workOrderMilestoneTimePeriodString?: string

  workOrderMilestoneDescription?: string

  workOrderMilestoneCompletionDate?: number
  workOrderMilestoneCompletionDateString?: string

  workOrderMilestoneCompletionTime?: number
  workOrderMilestoneCompletionTimeString?: string
  workOrderMilestoneCompletionTimePeriodString?: string

  workOrderRecordUpdate_timeMillis?: number
}

export interface WorkOrderMilestoneType extends Record {
  workOrderMilestoneTypeId: number
  workOrderMilestoneType: string
  orderNumber?: number
}

export interface WorkOrderType extends Record {
  workOrderTypeId: number
  workOrderType?: string
  orderNumber?: number
}

/*
 * USER TYPES
 */

declare global {
  export interface User {
    userName: string
    userProperties?: UserProperties
  }
}

export interface UserProperties {
  apiKey: string
  canUpdate: boolean
  isAdmin: boolean
}

declare module 'express-session' {
  interface Session {
    user?: User
  }
}
