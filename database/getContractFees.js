import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractFees(contractId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const fees = database
        .prepare(`select cf.contractId, cf.feeId,
        c.feeCategory, f.feeName,
        f.includeQuantity, cf.feeAmount, cf.taxAmount, cf.quantity, f.quantityUnit
        from ContractFees cf
        left join Fees f on cf.feeId = f.feeId
        left join FeeCategories c on f.feeCategoryId = c.feeCategoryId
        where cf.recordDelete_timeMillis is null
        and cf.contractId = ?
        order by cf.recordCreate_timeMillis`)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return fees;
}
