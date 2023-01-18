import { acquireConnection } from './pool.js';
import { dateIntegerToString } from '@cityssm/expressjs-server-js/dateTimeFns.js';
import { getLotOccupancyOccupants } from './getLotOccupancyOccupants.js';
import { getLotOccupancyComments } from './getLotOccupancyComments.js';
import { getLotOccupancyFields } from './getLotOccupancyFields.js';
import { getLotOccupancyFees } from './getLotOccupancyFees.js';
import { getLotOccupancyTransactions } from './getLotOccupancyTransactions.js';
import { getWorkOrders } from './getWorkOrders.js';
export async function getLotOccupancy(lotOccupancyId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    const lotOccupancy = database
        .prepare(`select o.lotOccupancyId,
        o.occupancyTypeId, t.occupancyType,
        o.lotId, l.lotName, l.lotTypeId,
        l.mapId, m.mapName,
        o.occupancyStartDate, userFn_dateIntegerToString(o.occupancyStartDate) as occupancyStartDateString,
        o.occupancyEndDate,  userFn_dateIntegerToString(o.occupancyEndDate) as occupancyEndDateString,
        o.recordUpdate_timeMillis
        from LotOccupancies o
        left join OccupancyTypes t on o.occupancyTypeId = t.occupancyTypeId
        left join Lots l on o.lotId = l.lotId
        left join Maps m on l.mapId = m.mapId
        where o.recordDelete_timeMillis is null
        and o.lotOccupancyId = ?`)
        .get(lotOccupancyId);
    if (lotOccupancy) {
        lotOccupancy.lotOccupancyFields = await getLotOccupancyFields(lotOccupancyId, database);
        lotOccupancy.lotOccupancyOccupants = await getLotOccupancyOccupants(lotOccupancyId, database);
        lotOccupancy.lotOccupancyComments = await getLotOccupancyComments(lotOccupancyId, database);
        lotOccupancy.lotOccupancyFees = await getLotOccupancyFees(lotOccupancyId, database);
        lotOccupancy.lotOccupancyTransactions = await getLotOccupancyTransactions(lotOccupancyId, database);
        const workOrdersResults = await getWorkOrders({
            lotOccupancyId
        }, {
            limit: -1,
            offset: 0
        }, database);
        lotOccupancy.workOrders = workOrdersResults.workOrders;
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return lotOccupancy;
}
export default getLotOccupancy;
