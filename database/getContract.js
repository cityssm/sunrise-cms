import { dateIntegerToString, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import getContractAttachments from './getContractAttachments.js';
import getContractComments from './getContractComments.js';
import getContractFees from './getContractFees.js';
import getContractFields from './getContractFields.js';
import getContractInterments from './getContractInterments.js';
import getContracts from './getContracts.js';
import getContractTransactions from './getContractTransactions.js';
import { getWorkOrders } from './getWorkOrders.js';
export default async function getContract(contractId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    database.function('userFn_timeIntegerToString', timeIntegerToString);
    database.function('userFn_timeIntegerToPeriodString', timeIntegerToPeriodString);
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
        contract.contractFields = getContractFields(contractId, database);
        contract.contractInterments = getContractInterments(contractId, database);
        contract.contractComments = getContractComments(contractId, database);
        contract.contractFees = getContractFees(contractId, database);
        contract.contractTransactions = await getContractTransactions(contractId, { includeIntegrations: true }, database);
        const workOrdersResults = await getWorkOrders({
            contractId
        }, {
            limit: -1,
            offset: 0,
            includeMilestones: true
        }, database);
        contract.workOrders = workOrdersResults.workOrders;
        const relatedContractsResults = await getContracts({
            relatedContractId: contractId
        }, {
            limit: -1,
            offset: 0,
            includeFees: false,
            includeInterments: true,
            includeTransactions: false
        }, database);
        contract.relatedContracts = relatedContractsResults.contracts;
        contract.contractAttachments = getContractAttachments(contractId, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return contract;
}
