import { dateIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractInterments(contractId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    const interments = database
        .prepare(`select o.contractId, o.intermentNumber,
        o.deceasedName,
        o.deceasedAddress1, o.deceasedAddress2, o.deceasedCity, o.deceasedProvince, o.deceasedPostalCode,
        
        o.birthDate, userFn_dateIntegerToString(o.birthDate) as birthDateString,
        o.birthPlace,
        o.deathDate, userFn_dateIntegerToString(o.deathDate) as deathDateString,
        o.deathPlace,
        o.deathAge, o.deathAgePeriod,
        
        o.intermentContainerTypeId, t.intermentContainerType, t.isCremationType

        from ContractInterments o
        left join IntermentContainerTypes t on o.intermentContainerTypeId = t.intermentContainerTypeId

        where o.recordDelete_timeMillis is null
        and o.contractId = ?
        order by t.orderNumber, o.deceasedName, o.intermentNumber`)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return interments;
}
