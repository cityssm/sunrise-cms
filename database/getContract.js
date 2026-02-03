import { dateIntegerToString, dateToInteger, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
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
        .prepare(/* sql */ `select c.contractId,
          c.contractTypeId, t.contractType, t.isPreneed,

          c.burialSiteId, b.burialSiteName, b.burialSiteTypeId,
          case when b.recordDelete_timeMillis is null then 1 else 0 end as burialSiteIsActive,
          
          b.cemeteryId, cem.cemeteryName,
          
          c.contractStartDate, userFn_dateIntegerToString(c.contractStartDate) as contractStartDateString,
          c.contractEndDate, userFn_dateIntegerToString(c.contractEndDate) as contractEndDateString,

          c.purchaserName, c.purchaserAddress1, c.purchaserAddress2,
          c.purchaserCity, c.purchaserProvince, c.purchaserPostalCode,
          c.purchaserPhoneNumber, c.purchaserEmail, c.purchaserRelationship,

          c.funeralHomeId, c.funeralDirectorName, f.funeralHomeKey,
          f.funeralHomeName, f.funeralHomeAddress1, f.funeralHomeAddress2,
          f.funeralHomeCity, f.funeralHomeProvince, f.funeralHomePostalCode,
          case when f.recordDelete_timeMillis is null then 1 else 0 end as funeralHomeIsActive,

          c.funeralDate, userFn_dateIntegerToString(c.funeralDate) as funeralDateString,

          c.funeralTime,
          userFn_timeIntegerToString(c.funeralTime) as funeralTimeString,
          userFn_timeIntegerToPeriodString(c.funeralTime) as funeralTimePeriodString,
          
          c.directionOfArrival, d.directionOfArrivalDescription,
          c.committalTypeId, ct.committalType,

          c.recordUpdate_timeMillis
          
        from Contracts c
        left join ContractTypes t on c.contractTypeId = t.contractTypeId
        left join FuneralHomes f on c.funeralHomeId = f.funeralHomeId
        left join CommittalTypes ct on c.committalTypeId = ct.committalTypeId
        left join BurialSites b on c.burialSiteId = b.burialSiteId
        left join Cemeteries cem on b.cemeteryId = cem.cemeteryId
        left join CemeteryDirectionsOfArrival d
          on b.cemeteryId = d.cemeteryId
          and c.directionOfArrival = d.directionOfArrival

        where c.recordDelete_timeMillis is null
          and c.contractId = ?`)
        .get(contractId);
    if (contract !== undefined) {
        const currentDateInteger = dateToInteger(new Date());
        contract.contractIsActive = contract.contractEndDate === null ||
            (contract.contractEndDate ?? 0) > currentDateInteger;
        contract.contractIsFuture =
            contract.contractStartDate > currentDateInteger;
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
