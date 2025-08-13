// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-magic-numbers, max-lines, no-secrets/no-secrets */

import sqlite from 'better-sqlite3'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import { sunriseDB as databasePath } from '../helpers/database.helpers.js'

import addBurialSiteType from './addBurialSiteType.js'
import addCommittalType from './addCommittalType.js'
import addContractType from './addContractType.js'
import addFeeCategory from './addFeeCategory.js'
import addIntermentContainerType from './addIntermentContainerType.js'
import addRecord from './addRecord.js'
import getBurialSiteStatuses from './getBurialSiteStatuses.js'
import getBurialSiteTypes from './getBurialSiteTypes.js'
import getCommittalTypes from './getCommittalTypes.js'
import getContractTypes from './getContractTypes.js'
import getFeeCategories from './getFeeCategories.js'
import getIntermentContainerTypes from './getIntermentContainerTypes.js'
import getWorkOrderMilestoneTypes from './getWorkOrderMilestoneTypes.js'
import getWorkOrderTypes from './getWorkOrderTypes.js'

const debug = Debug(`${DEBUG_NAMESPACE}:database/initializeDatabase`)

const recordColumns = `recordCreate_userName varchar(30) not null,
  recordCreate_timeMillis integer not null,
  recordUpdate_userName varchar(30) not null,
  recordUpdate_timeMillis integer not null,
  recordDelete_userName varchar(30),
  recordDelete_timeMillis integer`

const createStatements = [
  /*
   * Burial Site Types
   */

  `create table if not exists BurialSiteTypes (
    burialSiteTypeId integer not null primary key autoincrement,
    burialSiteType varchar(100) not null,
    bodyCapacityMax smallint,
    crematedCapacityMax smallint,
    orderNumber smallint not null default 0,
    ${recordColumns})`,

  `create index if not exists idx_BurialSiteTypes_orderNumber
    on BurialSiteTypes (orderNumber, burialSiteType)`,

  `create table if not exists BurialSiteTypeFields (
    burialSiteTypeFieldId integer not null primary key autoincrement,
    burialSiteTypeId integer not null,
    burialSiteTypeField varchar(100) not null,
    fieldType varchar(15) not null default 'text',
    fieldValues text,
    isRequired bit not null default 0,
    pattern varchar(100),
    minLength smallint not null default 1 check (minLength >= 0),
    maxLength smallint not null default 100 check (maxLength >= 0),
    orderNumber smallint not null default 0,
    ${recordColumns},
    foreign key (burialSiteTypeId) references BurialSiteTypes (burialSiteTypeId))`,

  `create index if not exists idx_BurialSiteTypeFields_orderNumber
    on BurialSiteTypeFields (burialSiteTypeId, orderNumber, burialSiteTypeField)`,

  /*
   * Burial Site Statuses
   */

  `create table if not exists BurialSiteStatuses (
    burialSiteStatusId integer not null primary key autoincrement,
    burialSiteStatus varchar(100) not null,
    orderNumber smallint not null default 0,
    ${recordColumns})`,

  `create index if not exists idx_BurialSiteStatuses_orderNumber
    on BurialSiteStatuses (orderNumber, burialSiteStatus)`,

  /*
   * Cemeteries
   */

  `create table if not exists Cemeteries (
    cemeteryId integer not null primary key autoincrement,
    cemeteryName varchar(200) not null,
    cemeteryKey varchar(20) not null,
    cemeteryDescription text,
    cemeteryLatitude decimal(10, 8)
      check (cemeteryLatitude between -90 and 90),
    cemeteryLongitude decimal(11, 8)
      check (cemeteryLongitude between -180 and 180),
    cemeterySvg varchar(50),
    cemeteryAddress1 varchar(50),
    cemeteryAddress2 varchar(50),
    cemeteryCity varchar(20),
    cemeteryProvince varchar(2),
    cemeteryPostalCode varchar(7),
    cemeteryPhoneNumber varchar(30),
    parentCemeteryId integer,
    ${recordColumns},
    foreign key (parentCemeteryId) references Cemeteries (cemeteryId))`,

  `create table if not exists CemeteryDirectionsOfArrival (
    cemeteryId integer not null,
    directionOfArrival varchar(2) not null,
    directionOfArrivalDescription varchar(100) not null,
    primary key (cemeteryId, directionOfArrival),
    foreign key (cemeteryId) references Cemeteries (cemeteryId)) without rowid`,

  /*
   * Burial Sites
   */

  `create table if not exists BurialSites (
    burialSiteId integer not null primary key autoincrement,
    burialSiteTypeId integer not null,

    burialSiteNameSegment1 varchar(20) not null,
    burialSiteNameSegment2 varchar(20) not null,
    burialSiteNameSegment3 varchar(20) not null,
    burialSiteNameSegment4 varchar(20) not null,
    burialSiteNameSegment5 varchar(20) not null,
    burialSiteName varchar(200) not null,

    bodyCapacity smallint,
    crematedCapacity smallint,

    cemeteryId integer,
    cemeterySvgId varchar(100),
    burialSiteImage varchar(100) not null default '',

    burialSiteLatitude decimal(10, 8)
      check (burialSiteLatitude between -90 and 90),
    burialSiteLongitude decimal(11, 8)
      check (burialSiteLongitude between -180 and 180),
    burialSiteStatusId integer,
    ${recordColumns},
    foreign key (burialSiteTypeId) references BurialSiteTypes (burialSiteTypeId),
    foreign key (cemeteryId) references Cemeteries (cemeteryId),
    foreign key (burialSiteStatusId) references BurialSiteStatuses (burialSiteStatusId),
    unique (cemeteryId, burialSiteNameSegment1, burialSiteNameSegment2, burialSiteNameSegment3, burialSiteNameSegment4, burialSiteNameSegment5))`,

  `create table if not exists BurialSiteFields (
    burialSiteId integer not null,
    burialSiteTypeFieldId integer not null,
    fieldValue text not null,
    ${recordColumns},
    primary key (burialSiteId, burialSiteTypeFieldId),
    foreign key (burialSiteId) references BurialSites (burialSiteId),
    foreign key (burialSiteTypeFieldId) references BurialSiteTypeFields (burialSiteTypeFieldId)) without rowid`,

  `create table if not exists BurialSiteComments (
    burialSiteCommentId integer not null primary key autoincrement,
    burialSiteId integer not null,
    commentDate integer not null check (commentDate > 0),
    commentTime integer not null check (commentTime >= 0),
    comment text not null,
    ${recordColumns},
    foreign key (burialSiteId) references BurialSites (burialSiteId))`,

  `create index if not exists idx_BurialSiteComments_datetime
    on BurialSiteComments (burialSiteId, commentDate, commentTime)`,

  /*
   * Funeral Homes
   */

  `create table if not exists FuneralHomes (
    funeralHomeId integer not null primary key autoincrement,
    funeralHomeName varchar(200) not null,
    funeralHomeKey varchar(20) not null default '',
    funeralHomeAddress1 varchar(50),
    funeralHomeAddress2 varchar(50),
    funeralHomeCity varchar(20),
    funeralHomeProvince varchar(2),
    funeralHomePostalCode varchar(7),
    funeralHomePhoneNumber varchar(30),
    ${recordColumns})`,

  /*
   * Contracts
   */

  `create table if not exists ContractTypes (
    contractTypeId integer not null primary key autoincrement,
    contractType varchar(100) not null,
    isPreneed bit not null default 0,
    orderNumber smallint not null default 0,
    ${recordColumns})`,

  `create index if not exists idx_ContractTypes_orderNumber
    on ContractTypes (orderNumber, contractType)`,

  `create table if not exists ContractTypeFields (
    contractTypeFieldId integer not null primary key autoincrement,
    contractTypeId integer,
    contractTypeField varchar(100) not null,
    fieldType varchar(15) not null default 'text',
    fieldValues text,
    isRequired bit not null default 0,
    pattern varchar(100),
    minLength smallint not null default 1 check (minLength >= 0),
    maxLength smallint not null default 100 check (maxLength >= 0),
    orderNumber smallint not null default 0,
    ${recordColumns},
    foreign key (contractTypeId) references ContractTypes (contractTypeId))`,

  `create index if not exists idx_ContractTypeFields_orderNumber
    on ContractTypeFields (contractTypeId, orderNumber, contractTypeField)`,

  `create table if not exists ContractTypePrints (
    contractTypeId integer not null,
    printEJS varchar(100) not null,
    orderNumber smallint not null default 0,
    ${recordColumns},
    primary key (contractTypeId, printEJS),
    foreign key (contractTypeId) references ContractTypes (contractTypeId))`,

  `create index if not exists idx_ContractTypePrints_orderNumber
    on ContractTypePrints (contractTypeId, orderNumber, printEJS)`,

  `create table if not exists CommittalTypes (
    committalTypeId integer not null primary key autoincrement,
    committalTypeKey varchar(20) not null default '',
    committalType varchar(100) not null,
    orderNumber smallint not null default 0,
    ${recordColumns})`,

  `create index if not exists idx_CommittalType_orderNumber
    on CommittalTypes (orderNumber, committalType)`,

  `create table if not exists Contracts (
    contractId integer not null primary key autoincrement,
    contractTypeId integer not null,
    burialSiteId integer,
    contractStartDate integer not null check (contractStartDate > 0),
    contractEndDate integer check (contractEndDate > 0),

    purchaserName varchar(100) not null,
    purchaserAddress1 varchar(50),
    purchaserAddress2 varchar(50),
    purchaserCity varchar(20),
    purchaserProvince varchar(2),
    purchaserPostalCode varchar(7),
    purchaserPhoneNumber varchar(30),
    purchaserEmail varchar(100),
    purchaserRelationship varchar(50),

    funeralHomeId integer,
    funeralDirectorName varchar(100),
    funeralDate integer check (funeralDate > 0),
    funeralTime integer check (funeralTime >= 0),
    committalTypeId integer,
    directionOfArrival varchar(2),

    ${recordColumns},

    foreign key (burialSiteId) references BurialSites (burialSiteId),
    foreign key (contractTypeId) references ContractTypes (contractTypeId),
    foreign key (funeralHomeId) references FuneralHomes (funeralHomeId),
    foreign key (committalTypeId) references CommittalTypes (committalTypeId))`,

  `create table if not exists ContractFields (
    contractId integer not null,
    contractTypeFieldId integer not null,
    fieldValue text not null,
    ${recordColumns},
    primary key (contractId, contractTypeFieldId),
    foreign key (contractId) references Contracts (contractId),
    foreign key (contractTypeFieldId) references ContractTypeFields (contractTypeFieldId)) without rowid`,

  `create table if not exists ContractMetadata (
    contractId integer not null,
    metadataKey varchar(100) not null,
    metadataValue text not null,
    ${recordColumns},
    primary key (contractId, metadataKey),
    foreign key (contractId) references Contracts (contractId)) without rowid`,

  `create table if not exists ContractAttachments (
    contractAttachmentId integer not null primary key autoincrement,
    contractId integer not null,
    attachmentTitle varchar(100) not null,
    attachmentDetails text,
    fileName varchar(100) not null,
    filePath varchar(500) not null,
    ${recordColumns},
    foreign key (contractId) references Contracts (contractId))`,

  `create table if not exists ContractComments (
    contractCommentId integer not null primary key autoincrement,
    contractId integer not null,
    commentDate integer not null check (commentDate > 0),
    commentTime integer not null check (commentTime >= 0),
    comment text not null,
    ${recordColumns},
    foreign key (contractId) references Contracts (contractId))`,

  `create index if not exists idx_ContractComments_datetime
    on ContractComments (contractId, commentDate, commentTime)`,

  `create table if not exists RelatedContracts (
    contractIdA integer not null,
    contractIdB integer not null check (contractIdA < contractIdB),
    primary key (contractIdA, contractIdB),
    foreign key (contractIdA) references Contracts (contractId),
    foreign key (contractIdB) references Contracts (contractId)) without rowid`,

  /*
   * Interments
   */

  `create table if not exists IntermentContainerTypes (
    intermentContainerTypeId integer not null primary key autoincrement,
    intermentContainerType varchar(100) not null,
    intermentContainerTypeKey varchar(20) not null default '',
    isCremationType bit not null default 0,
    orderNumber smallint not null default 0,
    ${recordColumns})`,

  `create index if not exists idx_IntermentContainerTypes_orderNumber
    on IntermentContainerTypes (orderNumber, intermentContainerType)`,

  `create table if not exists ContractInterments (
    contractId integer not null,
    intermentNumber integer not null,
    
    deceasedName varchar(200) not null,
    isCremated bit not null default 0,

    deceasedAddress1 varchar(50),
    deceasedAddress2 varchar(50),
    deceasedCity varchar(20),
    deceasedProvince varchar(2),
    deceasedPostalCode varchar(7),

    birthDate integer,
    birthPlace varchar(100),

    deathDate integer,
    deathPlace varchar(100),
    deathAge integer,
    deathAgePeriod varchar(10),

    intermentContainerTypeId integer,

    ${recordColumns},
    primary key (contractId, intermentNumber),
    foreign key (contractId) references Contracts (contractId),
    foreign key (intermentContainerTypeId) references IntermentContainerTypes (intermentContainerTypeId)) without rowid`,

  /*
   * Fees and Transactions
   */

  `create table if not exists FeeCategories (
    feeCategoryId integer not null primary key autoincrement,
    feeCategory varchar(100) not null,
    isGroupedFee bit not null default 0,
    orderNumber smallint not null default 0,
    ${recordColumns})`,

  `create table if not exists Fees (
    feeId integer not null primary key autoincrement,
    feeCategoryId integer not null,
    feeName varchar(100) not null,
    feeDescription text,
    feeAccount varchar(20),

    contractTypeId integer,
    burialSiteTypeId integer,

    includeQuantity boolean not null default 0,
    quantityUnit varchar(30),
    feeAmount decimal(8, 2),
    feeFunction varchar(100),
    taxAmount decimal(6, 2),
    taxPercentage decimal(5, 2),
    isRequired bit not null default 0,
    orderNumber smallint not null default 0,
    ${recordColumns},
    foreign key (feeCategoryId) references FeeCategories (feeCategoryId),
    foreign key (contractTypeId) references ContractTypes (contractTypeId),
    foreign key (burialSiteTypeId) references BurialSiteTypes (burialSiteTypeId))`,

  'create index if not exists idx_Fees_orderNumber on Fees (orderNumber, feeName)',

  `create table if not exists ContractFees (
    contractId integer not null,
    feeId integer not null,
    quantity decimal(4, 1) not null default 1,
    feeAmount decimal(8, 2) not null,
    taxAmount decimal(8, 2) not null,
    ${recordColumns},
    primary key (contractId, feeId),
    foreign key (contractId) references Contracts (contractId),
    foreign key (feeId) references Fees (feeId)) without rowid`,

  `create table if not exists ContractTransactions (
    contractId integer not null,
    transactionIndex integer not null,
    transactionDate integer not null check (transactionDate > 0),
    transactionTime integer not null check (transactionTime >= 0),
    transactionAmount decimal(8, 2) not null,
    isInvoiced bit not null default 0,
    externalReceiptNumber varchar(100),
    transactionNote text,
    ${recordColumns},
    primary key (contractId, transactionIndex),
    foreign key (contractId) references Contracts (contractId)) without rowid`,

  `create index if not exists idx_ContractTransactions_orderNumber
    on ContractTransactions (contractId, transactionDate, transactionTime)`,

  /*
   * Work Orders
   */

  `create table if not exists WorkOrderTypes (
    workOrderTypeId integer not null primary key autoincrement,
    workOrderType varchar(100) not null,
    orderNumber smallint not null default 0,
    ${recordColumns})`,

  `create index if not exists idx_WorkOrderTypes_orderNumber
    on WorkOrderTypes (orderNumber, workOrderType)`,

  `create table if not exists WorkOrders (
    workOrderId integer not null primary key autoincrement,
    workOrderTypeId integer not null,
    workOrderNumber varchar(50) not null,
    workOrderDescription text,
    workOrderOpenDate integer check (workOrderOpenDate > 0),
    workOrderCloseDate integer check (workOrderCloseDate > 0),
    ${recordColumns},
    foreign key (workOrderTypeId) references WorkOrderTypes (workOrderTypeId))`,

  `create table if not exists WorkOrderBurialSites (
    workOrderId integer not null,
    burialSiteId integer not null,
    ${recordColumns},
    primary key (workOrderId, burialSiteId),
    foreign key (workOrderId) references WorkOrders (workOrderId),
    foreign key (burialSiteId) references BurialSites (burialSiteId)) without rowid`,

  `create table if not exists WorkOrderContracts (
    workOrderId integer not null,
    contractId integer not null,
    ${recordColumns},
    primary key (workOrderId, contractId),
    foreign key (workOrderId) references WorkOrders (workOrderId),
    foreign key (contractId) references Contracts (contractId)) without rowid`,

  `create table if not exists WorkOrderComments (
    workOrderCommentId integer not null primary key autoincrement,
    workOrderId integer not null,
    commentDate integer not null check (commentDate > 0),
    commentTime integer not null check (commentTime >= 0),
    comment text not null,
    ${recordColumns},
    foreign key (workOrderId) references WorkOrders (workOrderId))`,

  `create index if not exists idx_WorkOrderComments_datetime
    on WorkOrderComments (workOrderId, commentDate, commentTime)`,

  `create table if not exists WorkOrderMilestoneTypes (
    workOrderMilestoneTypeId integer not null primary key autoincrement,
    workOrderMilestoneType varchar(100) not null,
    orderNumber smallint not null default 0,
    ${recordColumns})`,

  `create table if not exists WorkOrderMilestones (
    workOrderMilestoneId integer not null primary key autoincrement,
    workOrderId integer not null,
    workOrderMilestoneTypeId integer,
    workOrderMilestoneDate integer not null check (workOrderMilestoneDate >= 0),
    workOrderMilestoneTime integer not null check (workOrderMilestoneTime >= 0),
    workOrderMilestoneDescription text not null,
    workOrderMilestoneCompletionDate integer check (workOrderMilestoneCompletionDate > 0),
    workOrderMilestoneCompletionTime integer check (workOrderMilestoneCompletionTime >= 0),
    ${recordColumns},
    foreign key (workOrderId) references WorkOrders (workOrderId),
    foreign key (workOrderMilestoneTypeId) references WorkOrderMilestoneTypes (workOrderMilestoneTypeId))`,

  /*
   * Settings
   */

  `CREATE TABLE if not exists SunriseSettings (
    settingKey varchar(100) not null primary key,
    settingValue varchar(500),
    previousSettingValue varchar(500),
    recordUpdate_timeMillis integer not null)`,

  `CREATE TABLE if not exists UserSettings (
    userName varchar(30) not null,
    settingKey varchar(100) not null,
    settingValue varchar(500),
    previousSettingValue varchar(500),
    recordUpdate_timeMillis integer not null,
    primary key (userName, settingKey)) without rowid`
]

const initializingUser: User = {
  userName: 'databaseInit',
  userProperties: {
    canUpdate: true,
    canUpdateWorkOrders: true,
    isAdmin: true
  },
  userSettings: {}
}

export function initializeDatabase(): boolean {
  const sunriseDB = sqlite(databasePath)

  const row = sunriseDB
    .prepare(
      "select name from sqlite_master where type = 'table' and name = 'ContractAttachments'"
    )
    .get()

  if (row !== undefined) {
    return false
  }

  debug(`Creating ${databasePath} tables...`)

  for (const sql of createStatements) {
    sunriseDB.prepare(sql).run()
  }

  sunriseDB.close()

  initializeData()

  return true
}

export function initializeData(): void {
  debug('Initializing data...')

  // Burial Site Types

  const burialSiteTypes = getBurialSiteTypes()

  if (burialSiteTypes.length <= 0) {
    debug('No burial site types found, adding default types.')

    addBurialSiteType(
      {
        burialSiteType: 'In-Ground Grave',

        bodyCapacityMax: 2,
        crematedCapacityMax: 6,
        orderNumber: 1
      },
      initializingUser
    )

    addBurialSiteType(
      {
        burialSiteType: 'Columbarium',

        bodyCapacityMax: 0,
        crematedCapacityMax: '',
        orderNumber: 2
      },
      initializingUser
    )

    addBurialSiteType(
      {
        burialSiteType: 'Mausoleum',

        bodyCapacityMax: 2,
        crematedCapacityMax: 0,
        orderNumber: 2
      },
      initializingUser
    )

    addBurialSiteType(
      {
        burialSiteType: 'Niche Wall',

        bodyCapacityMax: 0,
        crematedCapacityMax: 1,
        orderNumber: 2
      },
      initializingUser
    )

    addBurialSiteType(
      {
        burialSiteType: 'Urn Garden',

        bodyCapacityMax: 0,
        crematedCapacityMax: 1,
        orderNumber: 2
      },
      initializingUser
    )

    addBurialSiteType(
      {
        burialSiteType: 'Crematorium',

        bodyCapacityMax: 0,
        crematedCapacityMax: 1,
        orderNumber: 2
      },
      initializingUser
    )
  }

  // Burial Site Statuses

  const burialSiteStatuses = getBurialSiteStatuses()

  if (burialSiteStatuses.length <= 0) {
    debug('No burial site statuses found, adding default statuses.')

    addRecord('BurialSiteStatuses', 'Available', 1, initializingUser)
    addRecord('BurialSiteStatuses', 'Reserved', 2, initializingUser)
    addRecord('BurialSiteStatuses', 'Occupied', 3, initializingUser)
  }

  // Contract Types

  const contractTypes = getContractTypes()

  if (contractTypes.length <= 0) {
    debug('No contract types found, adding default types.')

    addContractType(
      {
        contractType: 'Preneed',
        isPreneed: '1',
        orderNumber: 1
      },
      initializingUser
    )

    addContractType(
      {
        contractType: 'Interment',
        orderNumber: 2
      },
      initializingUser
    )

    addContractType(
      {
        contractType: 'Cremation',
        orderNumber: 3
      },
      initializingUser
    )
  }

  // Interment Container Types

  const intermentContainerTypes = getIntermentContainerTypes()

  if (intermentContainerTypes.length <= 0) {
    debug('No interment container types found, adding default types.')

    addIntermentContainerType(
      {
        intermentContainerType: 'No Shell',
        intermentContainerTypeKey: 'NS',
        orderNumber: 1
      },
      initializingUser
    )

    addIntermentContainerType(
      {
        intermentContainerType: 'Concrete Liner',
        intermentContainerTypeKey: 'CL',
        orderNumber: 2
      },
      initializingUser
    )

    addIntermentContainerType(
      {
        intermentContainerType: 'Unpainted Vault',
        intermentContainerTypeKey: 'UV',
        orderNumber: 3
      },
      initializingUser
    )

    addIntermentContainerType(
      {
        intermentContainerType: 'Concrete Vault',
        intermentContainerTypeKey: 'CV',
        orderNumber: 4
      },
      initializingUser
    )

    addIntermentContainerType(
      {
        intermentContainerType: 'Wooden Shell',
        intermentContainerTypeKey: 'WS',
        orderNumber: 5
      },
      initializingUser
    )

    addIntermentContainerType(
      {
        intermentContainerType: 'Steel Vault',
        intermentContainerTypeKey: 'SV',
        orderNumber: 6
      },
      initializingUser
    )

    addIntermentContainerType(
      {
        intermentContainerType: 'Shroud',
        intermentContainerTypeKey: 'SH',
        orderNumber: 7
      },
      initializingUser
    )

    addIntermentContainerType(
      {
        intermentContainerType: 'Urn',
        intermentContainerTypeKey: 'U',
        isCremationType: '1',
        orderNumber: 7
      },
      initializingUser
    )
  }

  // Committal Types

  const committalTypes = getCommittalTypes()

  if (committalTypes.length <= 0) {
    debug('No committal types found, adding default types.')

    addCommittalType(
      {
        committalType: 'Graveside',
        committalTypeKey: 'GS',
        orderNumber: 1
      },
      initializingUser
    )

    addCommittalType(
      {
        committalType: 'Chapel',
        committalTypeKey: 'CS',
        orderNumber: 2
      },
      initializingUser
    )

    addCommittalType(
      {
        committalType: 'Church',
        committalTypeKey: 'CH',
        orderNumber: 3
      },
      initializingUser
    )
  }

  /*
   * Fee Categories
   */

  const feeCategories = getFeeCategories({}, {})

  if (feeCategories.length <= 0) {
    debug('No fee categories found, adding default categories.')

    addFeeCategory(
      {
        feeCategory: 'Interment Rights',
        orderNumber: 1
      },
      initializingUser
    )

    addFeeCategory(
      {
        feeCategory: 'Cremation Services',
        orderNumber: 2
      },
      initializingUser
    )

    addFeeCategory(
      {
        feeCategory: 'Burial Charges',
        orderNumber: 3
      },
      initializingUser
    )

    addFeeCategory(
      {
        feeCategory: 'Disinterment of Human Remains',
        orderNumber: 4
      },
      initializingUser
    )

    addFeeCategory(
      {
        feeCategory: 'Additional Services',
        orderNumber: 5
      },
      initializingUser
    )
  }

  // Work Order Types

  const workOrderTypes = getWorkOrderTypes()

  if (workOrderTypes.length <= 0) {
    debug('No work order types found, adding default types.')
    addRecord('WorkOrderTypes', 'Cemetery Work Order', 1, initializingUser)
  }

  // Work Order Milestone Types

  const workOrderMilestoneTypes = getWorkOrderMilestoneTypes()

  if (workOrderMilestoneTypes.length <= 0) {
    debug('No work order milestone types found, adding default types.')
    addRecord('WorkOrderMilestoneTypes', 'Funeral', 1, initializingUser)
    addRecord('WorkOrderMilestoneTypes', 'Arrival', 2, initializingUser)
    addRecord('WorkOrderMilestoneTypes', 'Cremation', 3, initializingUser)
    addRecord('WorkOrderMilestoneTypes', 'Interment', 4, initializingUser)
  }
}
