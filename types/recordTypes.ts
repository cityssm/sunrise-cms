export interface Record {
  recordCreate_userName?: string
  recordCreate_timeMillis?: number
  recordCreate_dateString?: string

  recordUpdate_userName?: string
  recordUpdate_timeMillis?: number
  recordUpdate_dateString?: string
  recordUpdate_timeString?: string

  recordDelete_userName?: string
  recordDelete_timeMillis?: number
  recordDelete_dateString?: string
}

/*
 * SUNRISE DB TYPES
 */

export interface Cemetery extends Record {
  cemeteryId?: number
  cemeteryName?: string
  cemeteryKey?: string
  cemeteryDescription?: string

  cemeteryLatitude?: number
  cemeteryLongitude?: number
  cemeterySvg?: string

  cemeteryAddress1?: string
  cemeteryAddress2?: string
  cemeteryCity?: string
  cemeteryProvince?: string
  cemeteryPostalCode?: string
  cemeteryPhoneNumber?: string

  burialSiteCount?: number
}

export interface BurialSiteType extends Record {
  burialSiteTypeId: number
  burialSiteType: string
  orderNumber?: number
  burialSiteTypeFields?: BurialSiteTypeField[]
}

export interface BurialSiteTypeField extends Record {
  burialSiteTypeFieldId: number
  burialSiteTypeField?: string

  burialSiteTypeId?: number
  burialSiteType: BurialSiteType

  fieldType: string
  fieldValues?: string
  isRequired?: boolean
  pattern?: string
  minLength?: number
  maxLength?: number

  orderNumber?: number
}

export interface BurialSiteStatus extends Record {
  burialSiteStatusId: number
  burialSiteStatus: string
  orderNumber?: number
}

export interface BurialSite extends Record {
  burialSiteId: number

  burialSiteNameSegment1?: string
  burialSiteNameSegment2?: string
  burialSiteNameSegment3?: string
  burialSiteNameSegment4?: string
  burialSiteNameSegment5?: string
  burialSiteName?: string

  burialSiteTypeId?: number
  burialSiteType?: string

  cemeteryId?: number
  cemeteryName?: string
  cemetery?: Cemetery
  cemeterySvg?: string
  cemeterySvgId?: string

  burialSiteLatitude?: number
  burialSiteLongitude?: number

  burialSiteStatusId?: number
  burialSiteStatus?: string

  burialSiteFields?: BurialSiteField[]

  burialSiteContractCount?: number
  burialSiteContracts?: BurialSiteContract[]

  burialSiteComments?: BurialSiteComment[]
}

export interface BurialSiteComment extends Record {
  burialSiteCommentId?: number
  burialSiteId?: number

  commentDate?: number
  commentDateString?: string

  commentTime?: number
  commentTimeString?: string
  commentTimePeriodString?: string

  comment?: string
}

export interface BurialSiteField extends BurialSiteTypeField, Record {
  burialSiteId?: number
  burialSiteFieldValue?: string
}

export interface ContractType extends Record {
  contractTypeId: number
  contractType: string
  orderNumber?: number
  contractTypeFields?: ContractTypeField[]
  contractTypePrints?: string[]
}

export interface ContractTypeField {
  contractTypeFieldId: number
  contractTypeId?: number
  contractTypeField?: string
  
  fieldType: string
  fieldValues?: string
  isRequired?: boolean
  pattern?: string
  minLength?: number
  maxLength?: number
  orderNumber?: number
}

export interface FeeCategory extends Record {
  feeCategoryId: number
  feeCategory: string
  fees: Fee[]
  isGroupedFee: boolean
  orderNumber?: number
}

export interface Fee extends Record {
  feeId: number

  feeCategoryId: number
  feeCategory?: string

  feeName?: string
  feeDescription?: string
  feeAccount?: string

  contractTypeId?: number
  contractType?: string

  burialSiteTypeId?: number
  burialSiteType?: string

  includeQuantity?: boolean
  quantityUnit?: string

  feeAmount?: number
  feeFunction?: string

  taxAmount?: number
  taxPercentage?: number

  isRequired?: boolean

  orderNumber: number

  burialSiteContractFeeCount?: number
}

export interface BurialSiteContractFee extends Fee, Record {
  burialSiteContractId?: number
  quantity?: number
}

export interface BurialSiteContractTransaction extends Record {
  burialSiteContractId?: number
  transactionIndex?: number
  transactionDate?: number
  transactionDateString?: string
  transactionTime?: number
  transactionTimeString?: string
  transactionAmount: number
  externalReceiptNumber?: string
  transactionNote?: string
  dynamicsGPDocument?: DynamicsGPDocument
}

export interface DynamicsGPDocument {
  documentType: 'Invoice' | 'Cash Receipt'
  documentNumber: string
  documentDate: Date
  documentDescription: string[]
  documentTotal: number
}

export interface BurialSiteContractInterment extends Record {
  burialSiteContractId?: number
  intermentNumber?: number
  isCremated?: boolean

  deceasedName?: string

  birthDate?: number
  birthDateString?: string
  birthPlace?: string

  deathDate?: number
  deathDateString?: string
  deathPlace?: string

  intermentDate?: number
  intermentDateString?: string

  intermentTime?: number
  intermentTimeString?: string

  intermentContainerTypeId?: number
  intermentContainerType?: string

  intermentCommittalTypeId?: number
  intermentCommittalType?: string

  burialSiteContractIdCount?: number
  recordUpdate_timeMillisMax?: number
}

export interface BurialSiteContractComment extends Record {
  burialSiteContractCommentId?: number
  burialSiteContractId?: number

  commentDate?: number
  commentDateString?: string

  commentTime?: number
  commentTimeString?: string
  commentTimePeriodString?: string

  comment?: string
}

export interface BurialSiteContractField extends ContractTypeField, Record {
  burialSiteContractId: number
  contractTypeFieldId: number
  fieldValue?: string
}

export interface BurialSiteContract extends Record {
  burialSiteContractId: number

  contractTypeId: number
  contractType?: string
  printEJS?: string

  burialSiteId?: number
  burialSiteTypeId?: number
  burialSiteType?: string
  burialSiteName?: string
  
  cemeteryId?: number
  cemeteryName?: string

  contractStartDate?: number
  contractStartDateString?: string

  contractEndDate?: number
  contractEndDateString?: string

  purchaserName?: string
  purchaserAddress1?: string
  purchaserAddress2?: string
  purchaserCity?: string
  purchaserProvince?: string
  purchaserPostalCode?: string
  purchaserPhoneNumber?: string 
  purchaserEmail?: string

  funeralHomeId?: number
  funeralHomeDirectorName?: string
  funeralHomeName?: string

  burialSiteContractFields?: BurialSiteContractField[]
  burialSiteContractComments?: BurialSiteContractComment[]
  burialSiteContractInterments?: BurialSiteContractInterment[]
  burialSiteContractFees?: BurialSiteContractFee[]
  burialSiteContractTransactions?: BurialSiteContractTransaction[]
  workOrders?: WorkOrder[]
}

/*
 * WORK ORDERS
 */

export interface WorkOrderType extends Record {
  workOrderTypeId: number
  workOrderType?: string
  orderNumber?: number
}

export interface WorkOrderMilestoneType extends Record {
  workOrderMilestoneTypeId: number
  workOrderMilestoneType: string
  orderNumber?: number
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

export interface WorkOrder extends Record {
  workOrderId: number

  workOrderTypeId?: number
  workOrderType?: string

  workOrderNumber?: string
  workOrderDescription?: string

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

  workOrderBurialSiteContract?: BurialSiteContract[]
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
  canUpdate: boolean
  isAdmin: boolean
  apiKey: string
}

declare module 'express-session' {
  interface Session {
    user?: User
  }
}
