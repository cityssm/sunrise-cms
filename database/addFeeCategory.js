import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addFeeCategory(feeCategoryForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        FeeCategories (
          feeCategory,
          isGroupedFee,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)
        .run(feeCategoryForm.feeCategory, (feeCategoryForm.isGroupedFee ?? '') === '1' ? 1 : 0, feeCategoryForm.orderNumber ?? -1, user.username, rightNowMillis, user.username, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.lastInsertRowid;
}
