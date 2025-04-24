import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getFee(feeId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const fee = database
        .prepare(`select f.feeId,
        f.feeCategoryId, c.feeCategory,
        f.feeName, f.feeDescription, f.feeAccount,
        f.contractTypeId, o.contractType,
        f.burialSiteTypeId, l.burialSiteType,
        ifnull(f.feeAmount, 0) as feeAmount, f.feeFunction,
        f.taxAmount, f.taxPercentage,
        f.includeQuantity, f.quantityUnit,
        f.isRequired, f.orderNumber
        from Fees f
        left join FeeCategories c on f.feeCategoryId = c.feeCategoryId
        left join ContractTypes o on f.contractTypeId = o.contractTypeId
        left join BurialSiteTypes l on f.burialSiteTypeId = l.burialSiteTypeId
        where f.recordDelete_timeMillis is null
        and f.feeId = ?`)
        .get(feeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return fee;
}
