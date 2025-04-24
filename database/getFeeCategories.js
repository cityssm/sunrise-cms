import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import getFees from './getFees.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getFeeCategories(filters, options, connectedDatabase) {
    const updateOrderNumbers = !(filters.burialSiteTypeId || filters.contractTypeId) && options.includeFees;
    const database = sqlite(sunriseDB);
    let sqlWhereClause = ' where recordDelete_timeMillis is null';
    const sqlParameters = [];
    if ((filters.contractTypeId ?? '') !== '') {
        sqlWhereClause += ` and feeCategoryId in (
        select feeCategoryId from Fees where recordDelete_timeMillis is null and (contractTypeId is null or contractTypeId = ?))`;
        sqlParameters.push(filters.contractTypeId);
    }
    if ((filters.burialSiteTypeId ?? '') !== '') {
        sqlWhereClause += ` and feeCategoryId in (
        select feeCategoryId from Fees where recordDelete_timeMillis is null and (burialSiteTypeId is null or burialSiteTypeId = ?))`;
        sqlParameters.push(filters.burialSiteTypeId);
    }
    if ((filters.feeCategoryId ?? '') !== '') {
        sqlWhereClause += ` and feeCategoryId = ?`;
        sqlParameters.push(filters.feeCategoryId);
    }
    const feeCategories = database
        .prepare(`select feeCategoryId, feeCategory, isGroupedFee, orderNumber
        from FeeCategories
        ${sqlWhereClause}
        order by orderNumber, feeCategory`)
        .all(sqlParameters);
    if (options.includeFees ?? false) {
        let expectedOrderNumber = 0;
        for (const feeCategory of feeCategories) {
            if (updateOrderNumbers &&
                feeCategory.orderNumber !== expectedOrderNumber) {
                updateRecordOrderNumber('FeeCategories', feeCategory.feeCategoryId, expectedOrderNumber, database);
                feeCategory.orderNumber = expectedOrderNumber;
            }
            expectedOrderNumber += 1;
            feeCategory.fees = getFees(feeCategory.feeCategoryId, filters, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return feeCategories;
}
export function getFeeCategory(feeCategoryId, connectedDatabase) {
    const feeCategories = getFeeCategories({
        feeCategoryId
    }, {
        includeFees: true
    }, connectedDatabase);
    if (feeCategories.length > 0) {
        return feeCategories[0];
    }
    return undefined;
}
