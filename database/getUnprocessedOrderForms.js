import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getUnprocessedOrderForms() {
    const database = new DatabaseSync(sunriseDB);
    const rows = database
        .prepare(`
      SELECT
        orderFormId,
        orderFormKey,
        orderFormData AS orderFormDataString,
        recordCreate_ipAddress,
        recordCreate_timeMillis,
        recordSync_timeMillis,
        isOrderFormProcessed
      FROM
        OrderForms
      WHERE
        recordDelete_timeMillis IS NULL
        AND isOrderFormProcessed = 0
    `)
        .all();
    database.close();
    return rows.map(({ orderFormDataString, ...rest }) => ({
        ...rest,
        orderFormData: JSON.parse(orderFormDataString)
    }));
}
export function getUnprocessedOrderFormCount() {
    const database = new DatabaseSync(sunriseDB);
    const row = database
        .prepare(`
      SELECT
        COUNT(*) AS count
      FROM
        OrderForms
      WHERE
        recordDelete_timeMillis IS NULL
        AND isOrderFormProcessed = 0
    `)
        .get();
    database.close();
    return row?.count ?? 0;
}
