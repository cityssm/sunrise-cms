import { dateIntegerToString } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
export default async function getContractInterments(contractId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    const interments = database
        .prepare(`select o.contractId, o.intermentNumber,
        o.isCremated,
        o.deceasedName,
        o.birthDate, userFn_dateIntegerToString(o.birthDate) as birthDateString,
        o.birthPlace,
        o.deathDate, userFn_dateIntegerToString(o.deathDate) as deathDateString,
        o.deathPlace,

        o.intermentDate, userFn_dateIntegerToString(o.intermentDate) as intermentDateString,

        o.intermentContainerTypeId, t.intermentContainerType,
        o.intermentCommittalTypeId, c.intermentCommittalType

        from ContractInterments o
        left join IntermentContainerTypes t on o.intermentContainerTypeId = t.intermentContainerTypeId
        left join IntermentCommittalTypes c on o.intermentCommittalTypeId = c.intermentCommittalTypeId

        where o.recordDelete_timeMillis is null
        and o.contractId = ?
        order by t.orderNumber, o.deceasedName, o.intermentNumber`)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return interments;
}
