import { getDatabaseConnection, sanitizeLimit, sanitizeOffset } from '../helpers/database.helpers.js';
export default function getOrderForms(filters, options = {}) {
    const database = getDatabaseConnection(true);
    let sql = `
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
  `;
    let sqlParameters = {};
    if (filters.isOrderFormProcessed !== undefined) {
        sql += ' AND isOrderFormProcessed = @isOrderFormProcessed';
        sqlParameters = {
            isOrderFormProcessed: filters.isOrderFormProcessed ? 1 : 0
        };
    }
    const hasPaging = options.limit !== undefined || options.offset !== undefined;
    const limit = hasPaging
        ? sanitizeLimit(options.limit ?? 50)
        : undefined;
    const offset = hasPaging
        ? sanitizeOffset(options.offset ?? 0)
        : undefined;
    const countResult = hasPaging
        ? database
            .prepare(`
          SELECT
            COUNT(*) AS recordCount
          FROM
            OrderForms
          WHERE
            recordDelete_timeMillis IS NULL
          ${filters.isOrderFormProcessed !== undefined ? ' AND isOrderFormProcessed = @isOrderFormProcessed' : ''}
        `)
            .get(sqlParameters)
        : undefined;
    sql += ' ORDER BY orderFormId DESC';
    if (hasPaging) {
        sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }
    const rows = database.prepare(sql).all(sqlParameters);
    database.close();
    const orderForms = rows.map(({ orderFormDataString, ...rest }) => ({
        ...rest,
        orderFormData: JSON.parse(orderFormDataString)
    }));
    if (hasPaging) {
        return {
            orderForms,
            count: countResult?.recordCount ?? orderForms.length
        };
    }
    return orderForms;
}
export function getUnprocessedOrderFormCount() {
    const database = getDatabaseConnection(true);
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
