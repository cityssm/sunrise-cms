"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getContract;
const utils_datetime_1 = require("@cityssm/utils-datetime");
const better_sqlite3_1 = require("better-sqlite3");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
const getContractAttachments_js_1 = require("./getContractAttachments.js");
const getContractComments_js_1 = require("./getContractComments.js");
const getContractFees_js_1 = require("./getContractFees.js");
const getContractFields_js_1 = require("./getContractFields.js");
const getContractInterments_js_1 = require("./getContractInterments.js");
const getContracts_js_1 = require("./getContracts.js");
const getContractTransactions_js_1 = require("./getContractTransactions.js");
const getWorkOrders_js_1 = require("./getWorkOrders.js");
async function getContract(contractId, connectedDatabase) {
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB);
    database.function('userFn_dateIntegerToString', utils_datetime_1.dateIntegerToString);
    database.function('userFn_timeIntegerToString', utils_datetime_1.timeIntegerToString);
    database.function('userFn_timeIntegerToPeriodString', utils_datetime_1.timeIntegerToPeriodString);
    const contract = database
        .prepare(`select o.contractId,
          o.contractTypeId, t.contractType, t.isPreneed,

          o.burialSiteId, b.burialSiteName, b.burialSiteTypeId,
          case when b.recordDelete_timeMillis is null then 1 else 0 end as burialSiteIsActive,
          
          b.cemeteryId, c.cemeteryName,
          
          o.contractStartDate, userFn_dateIntegerToString(o.contractStartDate) as contractStartDateString,
          o.contractEndDate, userFn_dateIntegerToString(o.contractEndDate) as contractEndDateString,

          (o.contractEndDate is null or o.contractEndDate > cast(strftime('%Y%m%d', date()) as integer)) as contractIsActive,
          (o.contractStartDate > cast(strftime('%Y%m%d', date()) as integer)) as contractIsFuture,
          
          o.purchaserName, o.purchaserAddress1, o.purchaserAddress2,
          o.purchaserCity, o.purchaserProvince, o.purchaserPostalCode,
          o.purchaserPhoneNumber, o.purchaserEmail, o.purchaserRelationship,

          o.funeralHomeId, o.funeralDirectorName, f.funeralHomeKey,
          f.funeralHomeName, f.funeralHomeAddress1, f.funeralHomeAddress2,
          f.funeralHomeCity, f.funeralHomeProvince, f.funeralHomePostalCode,
          case when f.recordDelete_timeMillis is null then 1 else 0 end as funeralHomeIsActive,

          o.funeralDate, userFn_dateIntegerToString(o.funeralDate) as funeralDateString,

          o.funeralTime,
          userFn_timeIntegerToString(o.funeralTime) as funeralTimeString,
          userFn_timeIntegerToPeriodString(o.funeralTime) as funeralTimePeriodString,
          
          o.directionOfArrival, d.directionOfArrivalDescription,
          o.committalTypeId, c.committalType,

          o.recordUpdate_timeMillis
          
        from Contracts o
        left join ContractTypes t on o.contractTypeId = t.contractTypeId
        left join FuneralHomes f on o.funeralHomeId = f.funeralHomeId
        left join CommittalTypes c on o.committalTypeId = c.committalTypeId
        left join BurialSites b on o.burialSiteId = b.burialSiteId
        left join Cemeteries c on b.cemeteryId = c.cemeteryId
        left join CemeteryDirectionsOfArrival d
          on b.cemeteryId = d.cemeteryId
          and o.directionOfArrival = d.directionOfArrival

        where o.recordDelete_timeMillis is null
          and o.contractId = ?`)
        .get(contractId);
    if (contract !== undefined) {
        contract.contractFields = (0, getContractFields_js_1.default)(contractId, database);
        contract.contractInterments = (0, getContractInterments_js_1.default)(contractId, database);
        contract.contractComments = (0, getContractComments_js_1.default)(contractId, database);
        contract.contractFees = (0, getContractFees_js_1.default)(contractId, database);
        contract.contractTransactions = await (0, getContractTransactions_js_1.default)(contractId, { includeIntegrations: true }, database);
        const workOrdersResults = await (0, getWorkOrders_js_1.getWorkOrders)({
            contractId
        }, {
            limit: -1,
            offset: 0,
            includeMilestones: true
        }, database);
        contract.workOrders = workOrdersResults.workOrders;
        const relatedContractsResults = await (0, getContracts_js_1.default)({
            relatedContractId: contractId
        }, {
            limit: -1,
            offset: 0,
            includeFees: false,
            includeInterments: true,
            includeTransactions: false
        }, database);
        contract.relatedContracts = relatedContractsResults.contracts;
        contract.contractAttachments = (0, getContractAttachments_js_1.default)(contractId, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return contract;
}
