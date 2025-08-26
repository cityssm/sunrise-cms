import { dateIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractInterments(contractId, connectedDatabase) {
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : sqlite(sunriseDB, { readonly: true });
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    const interments = database
        .prepare(`select ci.contractId, ci.intermentNumber,
        ci.deceasedName,
        ci.deceasedAddress1, ci.deceasedAddress2, ci.deceasedCity, ci.deceasedProvince, ci.deceasedPostalCode,
        
        ci.birthDate, userFn_dateIntegerToString(ci.birthDate) as birthDateString,
        ci.birthPlace,
        ci.deathDate, userFn_dateIntegerToString(ci.deathDate) as deathDateString,
        ci.deathPlace,
        ci.deathAge, ci.deathAgePeriod,
        
        ci.intermentContainerTypeId, t.intermentContainerType, t.isCremationType

        from ContractInterments ci
        left join IntermentContainerTypes t on ci.intermentContainerTypeId = t.intermentContainerTypeId

        where ci.recordDelete_timeMillis is null
        and ci.contractId = ?
        order by t.orderNumber, ci.deceasedName, ci.intermentNumber`)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return interments;
}
