import { dateIntegerToString } from '@cityssm/utils-datetime';
import getBurialSiteContractComments from './getBurialSiteContractComments.js';
import getBurialSiteContractFees from './getBurialSiteContractFees.js';
import getBurialSiteContractFields from './getBurialSiteContractFields.js';
// import getLotOccupancyOccupants from './getLotOccupancyOccupants.js'
import getBurialSiteContractTransactions from './getBurialSiteContractTransactions.js';
import { getWorkOrders } from './getWorkOrders.js';
import { acquireConnection } from './pool.js';
export default async function getLotOccupancy(burialSiteContractId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    const contract = database
        .prepare(`select o.burialSiteContractId,
        o.contractTypeId, t.contractType,
        o.burialSiteId,
        l.burialSiteNameSegment1,
        l.burialSiteNameSegment2,
        l.burialSiteNameSegment3,
        l.burialSiteNameSegment4,
        l.burialSiteNameSegment5,
        l.burialSiteTypeId,
        l.cemeteryId, m.cemeteryName,
        o.contractStartDate, userFn_dateIntegerToString(o.contractStartDate) as contractStartDateString,
        o.contractEndDate, userFn_dateIntegerToString(o.contractEndDate) as contractEndDateString,
        o.recordUpdate_timeMillis
        from BurialSiteContracts o
        left join ContractTypes t on o.contractTypeId = t.contractTypeId
        left join BurialSites l on o.burialSiteId = l.burialSiteId
        left join Maps m on l.cemeteryId = m.cemeteryId
        where o.recordDelete_timeMillis is null
        and o.burialSiteContractId = ?`)
        .get(burialSiteContractId);
    if (contract !== undefined) {
        contract.burialSiteContractFields = await getBurialSiteContractFields(burialSiteContractId, database);
        /*
        contract.burialSiteContractInterments = await getLotOccupancyOccupants(
          burialSiteContractId,
          database
        )
        */
        contract.burialSiteContractComments = await getBurialSiteContractComments(burialSiteContractId, database);
        contract.burialSiteContractFees = await getBurialSiteContractFees(burialSiteContractId, database);
        contract.burialSiteContractTransactions = await getBurialSiteContractTransactions(burialSiteContractId, { includeIntegrations: true }, database);
        const workOrdersResults = await getWorkOrders({
            burialSiteContractId
        }, {
            limit: -1,
            offset: 0
        }, database);
        contract.workOrders = workOrdersResults.workOrders;
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return contract;
}
