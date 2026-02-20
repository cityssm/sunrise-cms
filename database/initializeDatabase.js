/* eslint-disable @typescript-eslint/no-magic-numbers, max-lines, no-secrets/no-secrets */
import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { sunriseDB as databasePath } from '../helpers/database.helpers.js';
import addBurialSiteType from './addBurialSiteType.js';
import addCommittalType from './addCommittalType.js';
import addContractType from './addContractType.js';
import addContractTypeField from './addContractTypeField.js';
import addFeeCategory from './addFeeCategory.js';
import addIntermentContainerType from './addIntermentContainerType.js';
import { addBurialSiteStatus, addWorkOrderMilestoneType, addWorkOrderType } from './addRecord.js';
import getBurialSiteStatuses from './getBurialSiteStatuses.js';
import getBurialSiteTypes from './getBurialSiteTypes.js';
import getCommittalTypes from './getCommittalTypes.js';
import getContractTypes from './getContractTypes.js';
import getFeeCategories from './getFeeCategories.js';
import getIntermentContainerTypes from './getIntermentContainerTypes.js';
import getWorkOrderMilestoneTypes from './getWorkOrderMilestoneTypes.js';
import getWorkOrderTypes from './getWorkOrderTypes.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database:initializeDatabase`);
const recordColumns = `recordCreate_userName varchar(30) not null,
  recordCreate_timeMillis integer not null,
  recordUpdate_userName varchar(30) not null,
  recordUpdate_timeMillis integer not null,
  recordDelete_userName varchar(30),
  recordDelete_timeMillis integer`;
const createStatements = [
    /*
     * Burial Site Types
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS BurialSiteTypes (
      burialSiteTypeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      burialSiteType VARCHAR(100) NOT NULL,
      bodyCapacityMax smallint,
      crematedCapacityMax smallint,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns}
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_BurialSiteTypes_orderNumber ON BurialSiteTypes (orderNumber, burialSiteType)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS BurialSiteTypeFields (
      burialSiteTypeFieldId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      burialSiteTypeId INTEGER NOT NULL,
      burialSiteTypeField VARCHAR(100) NOT NULL,
      fieldType VARCHAR(15) NOT NULL DEFAULT 'text',
      fieldValues TEXT,
      isRequired bit NOT NULL DEFAULT 0,
      pattern VARCHAR(100),
      minLength smallint NOT NULL DEFAULT 1 CHECK (minLength >= 0),
      maxLength smallint NOT NULL DEFAULT 100 CHECK (maxLength >= 0),
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns},
      FOREIGN KEY (burialSiteTypeId) REFERENCES BurialSiteTypes (burialSiteTypeId)
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_BurialSiteTypeFields_orderNumber ON BurialSiteTypeFields (
      burialSiteTypeId,
      orderNumber,
      burialSiteTypeField
    )
  `,
    /*
     * Burial Site Statuses
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS BurialSiteStatuses (
      burialSiteStatusId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      burialSiteStatus VARCHAR(100) NOT NULL,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns}
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_BurialSiteStatuses_orderNumber ON BurialSiteStatuses (orderNumber, burialSiteStatus)
  `,
    /*
     * Cemeteries
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS Cemeteries (
      cemeteryId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      cemeteryName VARCHAR(200) NOT NULL,
      cemeteryKey VARCHAR(20) NOT NULL,
      cemeteryDescription TEXT,
      cemeteryLatitude DECIMAL(10, 8) CHECK (cemeteryLatitude BETWEEN -90 AND 90),
      cemeteryLongitude DECIMAL(11, 8) CHECK (cemeteryLongitude BETWEEN -180 AND 180),
      cemeterySvg VARCHAR(50),
      cemeteryAddress1 VARCHAR(50),
      cemeteryAddress2 VARCHAR(50),
      cemeteryCity VARCHAR(20),
      cemeteryProvince VARCHAR(2),
      cemeteryPostalCode VARCHAR(7),
      cemeteryPhoneNumber VARCHAR(30),
      parentCemeteryId INTEGER,
      ${recordColumns},
      FOREIGN KEY (parentCemeteryId) REFERENCES Cemeteries (cemeteryId)
    )
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS CemeteryDirectionsOfArrival (
      cemeteryId INTEGER NOT NULL,
      directionOfArrival VARCHAR(2) NOT NULL,
      directionOfArrivalDescription VARCHAR(100) NOT NULL,
      PRIMARY KEY (cemeteryId, directionOfArrival),
      FOREIGN KEY (cemeteryId) REFERENCES Cemeteries (cemeteryId)
    ) WITHOUT rowid
  `,
    /*
     * Burial Sites
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS BurialSites (
      burialSiteId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      burialSiteTypeId INTEGER NOT NULL,
      burialSiteNameSegment1 VARCHAR(20) NOT NULL,
      burialSiteNameSegment2 VARCHAR(20) NOT NULL,
      burialSiteNameSegment3 VARCHAR(20) NOT NULL,
      burialSiteNameSegment4 VARCHAR(20) NOT NULL,
      burialSiteNameSegment5 VARCHAR(20) NOT NULL,
      burialSiteName VARCHAR(200) NOT NULL,
      bodyCapacity smallint,
      crematedCapacity smallint,
      cemeteryId INTEGER,
      cemeterySvgId VARCHAR(100),
      burialSiteImage VARCHAR(100) NOT NULL DEFAULT '',
      burialSiteLatitude DECIMAL(10, 8) CHECK (burialSiteLatitude BETWEEN -90 AND 90),
      burialSiteLongitude DECIMAL(11, 8) CHECK (burialSiteLongitude BETWEEN -180 AND 180),
      burialSiteStatusId INTEGER,
      ${recordColumns},
      FOREIGN KEY (burialSiteTypeId) REFERENCES BurialSiteTypes (burialSiteTypeId),
      FOREIGN KEY (cemeteryId) REFERENCES Cemeteries (cemeteryId),
      FOREIGN KEY (burialSiteStatusId) REFERENCES BurialSiteStatuses (burialSiteStatusId),
      UNIQUE (
        cemeteryId,
        burialSiteNameSegment1,
        burialSiteNameSegment2,
        burialSiteNameSegment3,
        burialSiteNameSegment4,
        burialSiteNameSegment5
      )
    )
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS BurialSiteFields (
      burialSiteId INTEGER NOT NULL,
      burialSiteTypeFieldId INTEGER NOT NULL,
      fieldValue TEXT NOT NULL,
      ${recordColumns},
      PRIMARY KEY (burialSiteId, burialSiteTypeFieldId),
      FOREIGN KEY (burialSiteId) REFERENCES BurialSites (burialSiteId),
      FOREIGN KEY (burialSiteTypeFieldId) REFERENCES BurialSiteTypeFields (burialSiteTypeFieldId)
    ) WITHOUT rowid
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS BurialSiteComments (
      burialSiteCommentId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      burialSiteId INTEGER NOT NULL,
      commentDate INTEGER NOT NULL CHECK (commentDate > 0),
      commentTime INTEGER NOT NULL CHECK (commentTime >= 0),
      comment TEXT NOT NULL,
      ${recordColumns},
      FOREIGN KEY (burialSiteId) REFERENCES BurialSites (burialSiteId)
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_BurialSiteComments_datetime ON BurialSiteComments (burialSiteId, commentDate, commentTime)
  `,
    /*
     * Funeral Homes
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS FuneralHomes (
      funeralHomeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      funeralHomeName VARCHAR(200) NOT NULL,
      funeralHomeKey VARCHAR(20) NOT NULL DEFAULT '',
      funeralHomeAddress1 VARCHAR(50),
      funeralHomeAddress2 VARCHAR(50),
      funeralHomeCity VARCHAR(20),
      funeralHomeProvince VARCHAR(2),
      funeralHomePostalCode VARCHAR(7),
      funeralHomePhoneNumber VARCHAR(30),
      ${recordColumns}
    )
  `,
    /*
     * Contracts
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractTypes (
      contractTypeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      contractType VARCHAR(100) NOT NULL,
      isPreneed bit NOT NULL DEFAULT 0,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns}
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_ContractTypes_orderNumber ON ContractTypes (orderNumber, contractType)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractTypeFields (
      contractTypeFieldId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      contractTypeId INTEGER,
      contractTypeField VARCHAR(100) NOT NULL,
      fieldType VARCHAR(15) NOT NULL DEFAULT 'text',
      fieldValues TEXT,
      isRequired bit NOT NULL DEFAULT 0,
      pattern VARCHAR(100),
      minLength smallint NOT NULL DEFAULT 1 CHECK (minLength >= 0),
      maxLength smallint NOT NULL DEFAULT 100 CHECK (maxLength >= 0),
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns},
      FOREIGN KEY (contractTypeId) REFERENCES ContractTypes (contractTypeId)
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_ContractTypeFields_orderNumber ON ContractTypeFields (contractTypeId, orderNumber, contractTypeField)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractTypePrints (
      contractTypeId INTEGER NOT NULL,
      printEJS VARCHAR(100) NOT NULL,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns},
      PRIMARY KEY (contractTypeId, printEJS),
      FOREIGN KEY (contractTypeId) REFERENCES ContractTypes (contractTypeId)
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_ContractTypePrints_orderNumber ON ContractTypePrints (contractTypeId, orderNumber, printEJS)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS CommittalTypes (
      committalTypeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      committalTypeKey VARCHAR(20) NOT NULL DEFAULT '',
      committalType VARCHAR(100) NOT NULL,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns}
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_CommittalType_orderNumber ON CommittalTypes (orderNumber, committalType)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS Contracts (
      contractId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      contractNumber VARCHAR(50) NOT NULL DEFAULT '',
      contractTypeId INTEGER NOT NULL,
      burialSiteId INTEGER,
      contractStartDate INTEGER NOT NULL CHECK (contractStartDate > 0),
      contractEndDate INTEGER CHECK (contractEndDate > 0),
      purchaserName VARCHAR(100) NOT NULL,
      purchaserAddress1 VARCHAR(50),
      purchaserAddress2 VARCHAR(50),
      purchaserCity VARCHAR(20),
      purchaserProvince VARCHAR(2),
      purchaserPostalCode VARCHAR(7),
      purchaserPhoneNumber VARCHAR(30),
      purchaserEmail VARCHAR(100),
      purchaserRelationship VARCHAR(50),
      funeralHomeId INTEGER,
      funeralDirectorName VARCHAR(100),
      funeralDate INTEGER CHECK (funeralDate > 0),
      funeralTime INTEGER CHECK (funeralTime >= 0),
      committalTypeId INTEGER,
      directionOfArrival VARCHAR(2),
      ${recordColumns},
      FOREIGN KEY (burialSiteId) REFERENCES BurialSites (burialSiteId),
      FOREIGN KEY (contractTypeId) REFERENCES ContractTypes (contractTypeId),
      FOREIGN KEY (funeralHomeId) REFERENCES FuneralHomes (funeralHomeId),
      FOREIGN KEY (committalTypeId) REFERENCES CommittalTypes (committalTypeId)
    )
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractFields (
      contractId INTEGER NOT NULL,
      contractTypeFieldId INTEGER NOT NULL,
      fieldValue TEXT NOT NULL,
      ${recordColumns},
      PRIMARY KEY (contractId, contractTypeFieldId),
      FOREIGN KEY (contractId) REFERENCES Contracts (contractId),
      FOREIGN KEY (contractTypeFieldId) REFERENCES ContractTypeFields (contractTypeFieldId)
    ) WITHOUT rowid
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractMetadata (
      contractId INTEGER NOT NULL,
      metadataKey VARCHAR(100) NOT NULL,
      metadataValue TEXT NOT NULL,
      ${recordColumns},
      PRIMARY KEY (contractId, metadataKey),
      FOREIGN KEY (contractId) REFERENCES Contracts (contractId)
    ) WITHOUT rowid
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ServiceTypes (
      serviceTypeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      serviceType VARCHAR(100) NOT NULL,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns}
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_ServiceTypes_orderNumber ON ServiceTypes (orderNumber, serviceType)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractServiceTypes (
      contractId INTEGER NOT NULL,
      serviceTypeId INTEGER NOT NULL,
      contractServiceDetails TEXT,
      ${recordColumns},
      PRIMARY KEY (contractId, serviceTypeId),
      FOREIGN KEY (contractId) REFERENCES Contracts (contractId),
      FOREIGN KEY (serviceTypeId) REFERENCES ServiceTypes (serviceTypeId)
    ) WITHOUT rowid
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractAttachments (
      contractAttachmentId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      contractId INTEGER NOT NULL,
      attachmentTitle VARCHAR(100) NOT NULL,
      attachmentDetails TEXT,
      fileName VARCHAR(100) NOT NULL,
      filePath VARCHAR(500) NOT NULL,
      ${recordColumns},
      FOREIGN KEY (contractId) REFERENCES Contracts (contractId)
    )
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractComments (
      contractCommentId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      contractId INTEGER NOT NULL,
      commentDate INTEGER NOT NULL CHECK (commentDate > 0),
      commentTime INTEGER NOT NULL CHECK (commentTime >= 0),
      comment TEXT NOT NULL,
      ${recordColumns},
      FOREIGN KEY (contractId) REFERENCES Contracts (contractId)
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_ContractComments_datetime ON ContractComments (contractId, commentDate, commentTime)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS RelatedContracts (
      contractIdA INTEGER NOT NULL,
      contractIdB INTEGER NOT NULL CHECK (contractIdA < contractIdB),
      PRIMARY KEY (contractIdA, contractIdB),
      FOREIGN KEY (contractIdA) REFERENCES Contracts (contractId),
      FOREIGN KEY (contractIdB) REFERENCES Contracts (contractId)
    ) WITHOUT rowid
  `,
    /*
     * Interments
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS IntermentContainerTypes (
      intermentContainerTypeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      intermentContainerType VARCHAR(100) NOT NULL,
      intermentContainerTypeKey VARCHAR(20) NOT NULL DEFAULT '',
      isCremationType bit NOT NULL DEFAULT 0,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns}
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_IntermentContainerTypes_orderNumber ON IntermentContainerTypes (orderNumber, intermentContainerType)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS IntermentDepths (
      intermentDepthId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      intermentDepth VARCHAR(100) NOT NULL,
      intermentDepthKey VARCHAR(20) NOT NULL DEFAULT '',
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns}
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_IntermentDepths_orderNumber ON IntermentDepths (orderNumber, intermentDepth)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractInterments (
      contractId INTEGER NOT NULL,
      intermentNumber INTEGER NOT NULL,
      deceasedName VARCHAR(200) NOT NULL,
      isCremated bit NOT NULL DEFAULT 0,
      deceasedAddress1 VARCHAR(50),
      deceasedAddress2 VARCHAR(50),
      deceasedCity VARCHAR(20),
      deceasedProvince VARCHAR(2),
      deceasedPostalCode VARCHAR(7),
      birthDate INTEGER,
      birthPlace VARCHAR(100),
      deathDate INTEGER,
      deathPlace VARCHAR(100),
      deathAge INTEGER,
      deathAgePeriod VARCHAR(10),
      intermentContainerTypeId INTEGER,
      intermentDepthId INTEGER,
      ${recordColumns},
      PRIMARY KEY (contractId, intermentNumber),
      FOREIGN KEY (contractId) REFERENCES Contracts (contractId),
      FOREIGN KEY (intermentContainerTypeId) REFERENCES IntermentContainerTypes (intermentContainerTypeId),
      FOREIGN KEY (intermentDepthId) REFERENCES IntermentDepths (intermentDepthId)
    ) WITHOUT rowid
  `,
    /*
     * Fees and Transactions
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS FeeCategories (
      feeCategoryId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      feeCategory VARCHAR(100) NOT NULL,
      isGroupedFee bit NOT NULL DEFAULT 0,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns}
    )
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS Fees (
      feeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      feeCategoryId INTEGER NOT NULL,
      feeName VARCHAR(100) NOT NULL,
      feeDescription TEXT,
      feeAccount VARCHAR(20),
      contractTypeId INTEGER,
      burialSiteTypeId INTEGER,
      includeQuantity boolean NOT NULL DEFAULT 0,
      quantityUnit VARCHAR(30),
      feeAmount DECIMAL(8, 2),
      feeFunction VARCHAR(100),
      taxAmount DECIMAL(6, 2),
      taxPercentage DECIMAL(5, 2),
      isRequired bit NOT NULL DEFAULT 0,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns},
      FOREIGN KEY (feeCategoryId) REFERENCES FeeCategories (feeCategoryId),
      FOREIGN KEY (contractTypeId) REFERENCES ContractTypes (contractTypeId),
      FOREIGN KEY (burialSiteTypeId) REFERENCES BurialSiteTypes (burialSiteTypeId)
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_Fees_orderNumber ON Fees (orderNumber, feeName)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractFees (
      contractId INTEGER NOT NULL,
      feeId INTEGER NOT NULL,
      quantity DECIMAL(4, 1) NOT NULL DEFAULT 1,
      feeAmount DECIMAL(8, 2) NOT NULL,
      taxAmount DECIMAL(8, 2) NOT NULL,
      ${recordColumns},
      PRIMARY KEY (contractId, feeId),
      FOREIGN KEY (contractId) REFERENCES Contracts (contractId),
      FOREIGN KEY (feeId) REFERENCES Fees (feeId)
    ) WITHOUT rowid
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS ContractTransactions (
      contractId INTEGER NOT NULL,
      transactionIndex INTEGER NOT NULL,
      transactionDate INTEGER NOT NULL CHECK (transactionDate > 0),
      transactionTime INTEGER NOT NULL CHECK (transactionTime >= 0),
      transactionAmount DECIMAL(8, 2) NOT NULL,
      isInvoiced bit NOT NULL DEFAULT 0,
      externalReceiptNumber VARCHAR(100),
      transactionNote TEXT,
      ${recordColumns},
      PRIMARY KEY (contractId, transactionIndex),
      FOREIGN KEY (contractId) REFERENCES Contracts (contractId)
    ) WITHOUT rowid
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_ContractTransactions_orderNumber ON ContractTransactions (contractId, transactionDate, transactionTime)
  `,
    /*
     * Work Orders
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS WorkOrderTypes (
      workOrderTypeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      workOrderType VARCHAR(100) NOT NULL,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns}
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_WorkOrderTypes_orderNumber ON WorkOrderTypes (orderNumber, workOrderType)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS WorkOrders (
      workOrderId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      workOrderTypeId INTEGER NOT NULL,
      workOrderNumber VARCHAR(50) NOT NULL,
      workOrderDescription TEXT,
      workOrderOpenDate INTEGER CHECK (workOrderOpenDate > 0),
      workOrderCloseDate INTEGER CHECK (workOrderCloseDate > 0),
      ${recordColumns},
      FOREIGN KEY (workOrderTypeId) REFERENCES WorkOrderTypes (workOrderTypeId)
    )
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS WorkOrderBurialSites (
      workOrderId INTEGER NOT NULL,
      burialSiteId INTEGER NOT NULL,
      ${recordColumns},
      PRIMARY KEY (workOrderId, burialSiteId),
      FOREIGN KEY (workOrderId) REFERENCES WorkOrders (workOrderId),
      FOREIGN KEY (burialSiteId) REFERENCES BurialSites (burialSiteId)
    ) WITHOUT rowid
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS WorkOrderContracts (
      workOrderId INTEGER NOT NULL,
      contractId INTEGER NOT NULL,
      ${recordColumns},
      PRIMARY KEY (workOrderId, contractId),
      FOREIGN KEY (workOrderId) REFERENCES WorkOrders (workOrderId),
      FOREIGN KEY (contractId) REFERENCES Contracts (contractId)
    ) WITHOUT rowid
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS WorkOrderComments (
      workOrderCommentId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      workOrderId INTEGER NOT NULL,
      commentDate INTEGER NOT NULL CHECK (commentDate > 0),
      commentTime INTEGER NOT NULL CHECK (commentTime >= 0),
      comment TEXT NOT NULL,
      ${recordColumns},
      FOREIGN KEY (workOrderId) REFERENCES WorkOrders (workOrderId)
    )
  `,
    /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_WorkOrderComments_datetime ON WorkOrderComments (workOrderId, commentDate, commentTime)
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS WorkOrderMilestoneTypes (
      workOrderMilestoneTypeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      workOrderMilestoneType VARCHAR(100) NOT NULL,
      orderNumber smallint NOT NULL DEFAULT 0,
      ${recordColumns}
    )
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS WorkOrderMilestones (
      workOrderMilestoneId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      workOrderId INTEGER NOT NULL,
      workOrderMilestoneTypeId INTEGER,
      workOrderMilestoneDate INTEGER NOT NULL CHECK (workOrderMilestoneDate >= 0),
      workOrderMilestoneTime INTEGER CHECK (workOrderMilestoneTime >= 0),
      workOrderMilestoneDescription TEXT NOT NULL,
      workOrderMilestoneCompletionDate INTEGER CHECK (workOrderMilestoneCompletionDate > 0),
      workOrderMilestoneCompletionTime INTEGER CHECK (workOrderMilestoneCompletionTime >= 0),
      ${recordColumns},
      FOREIGN KEY (workOrderId) REFERENCES WorkOrders (workOrderId),
      FOREIGN KEY (workOrderMilestoneTypeId) REFERENCES WorkOrderMilestoneTypes (workOrderMilestoneTypeId)
    )
  `,
    /*
     * Settings
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS SunriseSettings (
      settingKey VARCHAR(100) NOT NULL PRIMARY KEY,
      settingValue VARCHAR(500),
      previousSettingValue VARCHAR(500),
      recordUpdate_timeMillis INTEGER NOT NULL
    )
  `,
    /* sql */ `
    CREATE TABLE IF NOT EXISTS UserSettings (
      userName VARCHAR(30) NOT NULL,
      settingKey VARCHAR(100) NOT NULL,
      settingValue VARCHAR(500),
      previousSettingValue VARCHAR(500),
      recordUpdate_timeMillis INTEGER NOT NULL,
      PRIMARY KEY (userName, settingKey)
    ) WITHOUT rowid
  `,
    /*
     * Users
     */
    /* sql */ `
    CREATE TABLE IF NOT EXISTS Users (
      userName VARCHAR(30) NOT NULL PRIMARY KEY,
      isActive bit NOT NULL DEFAULT 1,
      canUpdateCemeteries bit NOT NULL DEFAULT 0,
      canUpdateContracts bit NOT NULL DEFAULT 0,
      canUpdateWorkOrders bit NOT NULL DEFAULT 0,
      isAdmin bit NOT NULL DEFAULT 0,
      ${recordColumns}
    ) WITHOUT rowid
  `
];
const initializingUser = {
    userName: 'databaseInit',
    userProperties: {
        canUpdateCemeteries: true,
        canUpdateContracts: true,
        canUpdateWorkOrders: true,
        isAdmin: true
    },
    userSettings: {}
};
export function initializeDatabase(connectedDatabase) {
    const sunriseDB = connectedDatabase ?? sqlite(databasePath);
    sunriseDB.pragma('journal_mode = WAL');
    const row = sunriseDB
        .prepare("select name from sqlite_master where type = 'table' and name = 'IntermentDepths'")
        .get();
    if (row !== undefined) {
        return false;
    }
    debug(`Creating ${databasePath} tables...`);
    for (const sql of createStatements) {
        sunriseDB.prepare(sql).run();
    }
    debug(`Finished creating tables in ${databasePath}`);
    if (connectedDatabase === undefined) {
        sunriseDB.close();
    }
    initializeData();
    return true;
}
export function initializeData(connectedDatabase) {
    debug('Initializing data...');
    // Burial Site Types
    const burialSiteTypes = getBurialSiteTypes(false, connectedDatabase);
    if (burialSiteTypes.length <= 0) {
        debug('No burial site types found, adding default types.');
        addBurialSiteType({
            burialSiteType: 'In-Ground Grave',
            bodyCapacityMax: 2,
            crematedCapacityMax: 6,
            orderNumber: 1
        }, initializingUser, connectedDatabase);
        addBurialSiteType({
            burialSiteType: 'Columbarium',
            bodyCapacityMax: 0,
            crematedCapacityMax: '',
            orderNumber: 2
        }, initializingUser, connectedDatabase);
        addBurialSiteType({
            burialSiteType: 'Mausoleum',
            bodyCapacityMax: 2,
            crematedCapacityMax: 0,
            orderNumber: 2
        }, initializingUser, connectedDatabase);
        addBurialSiteType({
            burialSiteType: 'Niche Wall',
            bodyCapacityMax: 0,
            crematedCapacityMax: 1,
            orderNumber: 2
        }, initializingUser, connectedDatabase);
        addBurialSiteType({
            burialSiteType: 'Urn Garden',
            bodyCapacityMax: 0,
            crematedCapacityMax: 1,
            orderNumber: 2
        }, initializingUser, connectedDatabase);
        addBurialSiteType({
            burialSiteType: 'Crematorium',
            bodyCapacityMax: 0,
            crematedCapacityMax: 1,
            orderNumber: 2
        }, initializingUser, connectedDatabase);
    }
    // Burial Site Statuses
    const burialSiteStatuses = getBurialSiteStatuses(false, connectedDatabase);
    if (burialSiteStatuses.length <= 0) {
        debug('No burial site statuses found, adding default statuses.');
        addBurialSiteStatus('Available', 1, initializingUser, connectedDatabase);
        addBurialSiteStatus('Reserved', 2, initializingUser, connectedDatabase);
        addBurialSiteStatus('Occupied', 3, initializingUser, connectedDatabase);
    }
    // Contract Types
    const contractTypes = getContractTypes(false, connectedDatabase);
    if (contractTypes.length <= 0) {
        debug('No contract types found, adding default types.');
        addContractType({
            contractType: 'Preneed',
            isPreneed: '1',
            orderNumber: 1
        }, initializingUser, connectedDatabase);
        const atNeedContractTypeId = addContractType({
            contractType: 'At Need',
            orderNumber: 2
        }, initializingUser, connectedDatabase);
        addContractTypeField({
            contractTypeId: atNeedContractTypeId,
            contractTypeField: 'Interment Depth',
            fieldType: 'select',
            fieldValues: 'Single\nDouble',
            isRequired: ''
        }, initializingUser, connectedDatabase);
        addContractType({
            contractType: 'Permit Only',
            orderNumber: 3
        }, initializingUser, connectedDatabase);
    }
    // Interment Container Types
    const intermentContainerTypes = getIntermentContainerTypes(false, connectedDatabase);
    if (intermentContainerTypes.length <= 0) {
        debug('No interment container types found, adding default types.');
        addIntermentContainerType({
            intermentContainerType: 'No Shell',
            intermentContainerTypeKey: 'NS',
            orderNumber: 1
        }, initializingUser, connectedDatabase);
        addIntermentContainerType({
            intermentContainerType: 'Concrete Liner',
            intermentContainerTypeKey: 'CL',
            orderNumber: 2
        }, initializingUser, connectedDatabase);
        addIntermentContainerType({
            intermentContainerType: 'Unpainted Vault',
            intermentContainerTypeKey: 'UV',
            orderNumber: 3
        }, initializingUser, connectedDatabase);
        addIntermentContainerType({
            intermentContainerType: 'Concrete Vault',
            intermentContainerTypeKey: 'CV',
            orderNumber: 4
        }, initializingUser, connectedDatabase);
        addIntermentContainerType({
            intermentContainerType: 'Wooden Shell',
            intermentContainerTypeKey: 'WS',
            orderNumber: 5
        }, initializingUser, connectedDatabase);
        addIntermentContainerType({
            intermentContainerType: 'Steel Vault',
            intermentContainerTypeKey: 'SV',
            orderNumber: 6
        }, initializingUser, connectedDatabase);
        addIntermentContainerType({
            intermentContainerType: 'Shroud',
            intermentContainerTypeKey: 'SH',
            orderNumber: 7
        }, initializingUser, connectedDatabase);
        addIntermentContainerType({
            intermentContainerType: 'Urn',
            intermentContainerTypeKey: 'U',
            isCremationType: '1',
            orderNumber: 7
        }, initializingUser, connectedDatabase);
    }
    // Committal Types
    const committalTypes = getCommittalTypes(false, connectedDatabase);
    if (committalTypes.length <= 0) {
        debug('No committal types found, adding default types.');
        addCommittalType({
            committalType: 'Graveside',
            committalTypeKey: 'GS',
            orderNumber: 1
        }, initializingUser, connectedDatabase);
        addCommittalType({
            committalType: 'Chapel',
            committalTypeKey: 'CS',
            orderNumber: 2
        }, initializingUser, connectedDatabase);
        addCommittalType({
            committalType: 'Church',
            committalTypeKey: 'CH',
            orderNumber: 3
        }, initializingUser, connectedDatabase);
    }
    /*
     * Fee Categories
     */
    const feeCategories = getFeeCategories({}, {}, connectedDatabase);
    if (feeCategories.length <= 0) {
        debug('No fee categories found, adding default categories.');
        addFeeCategory({
            feeCategory: 'Interment Rights',
            orderNumber: 1
        }, initializingUser, connectedDatabase);
        addFeeCategory({
            feeCategory: 'Cremation Services',
            orderNumber: 2
        }, initializingUser, connectedDatabase);
        addFeeCategory({
            feeCategory: 'Burial Charges',
            orderNumber: 3
        }, initializingUser, connectedDatabase);
        addFeeCategory({
            feeCategory: 'Disinterment of Human Remains',
            orderNumber: 4
        }, initializingUser, connectedDatabase);
        addFeeCategory({
            feeCategory: 'Additional Services',
            orderNumber: 5
        }, initializingUser, connectedDatabase);
    }
    // Work Order Types
    const workOrderTypes = getWorkOrderTypes(connectedDatabase);
    if (workOrderTypes.length <= 0) {
        debug('No work order types found, adding default types.');
        addWorkOrderType('Cemetery Work Order', 1, initializingUser, connectedDatabase);
    }
    // Work Order Milestone Types
    const workOrderMilestoneTypes = getWorkOrderMilestoneTypes(false, connectedDatabase);
    if (workOrderMilestoneTypes.length <= 0) {
        debug('No work order milestone types found, adding default types.');
        addWorkOrderMilestoneType('Funeral', 1, initializingUser, connectedDatabase);
        addWorkOrderMilestoneType('Arrival', 2, initializingUser, connectedDatabase);
        addWorkOrderMilestoneType('Cremation', 3, initializingUser, connectedDatabase);
        addWorkOrderMilestoneType('Interment', 4, initializingUser, connectedDatabase);
    }
}
