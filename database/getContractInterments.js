import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
export default async function getContractInterments(contractId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    database.function('userFn_timeIntegerToString', timeIntegerToString);
    const interments = database
        .prepare(`select o.contractId, o.intermentNumber,
        o.isCremated,
        o.deceasedName,
        birthDate, userFn_dateIntegerToString(birthDate) as birthDateString,
        birthPlace,
        deathDate, userFn_dateIntegerToString(deathDate) as deathDateString,
        deathPlace,

        intermentDate, userFn_dateIntegerToString(intermentDate) as intermentDateString,
        intermentTime, userFn_timeIntegerToString(intermentTime) as intermentTimeString,

        intermentContainerTypeId, t.intermentContainerType,
        intermentCommittalTypeId, c.intermentCommittalType

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
