import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addFeeCategory(feeCategoryForm, user) {
    const database = sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into FeeCategories (
        feeCategory,
        isGroupedFee, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?)`)
        .run(feeCategoryForm.feeCategory, (feeCategoryForm.isGroupedFee ?? '') === '1' ? 1 : 0, feeCategoryForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    database.close();
    return result.lastInsertRowid;
}
