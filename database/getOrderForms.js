import { getDatabaseConnection, sanitizeLimit, sanitizeOffset } from '../helpers/database.helpers.js';
function addNamePiecesFilter(whereClauses, sqlParameters, jsonPath, value) {
    if (value === undefined || value.trim() === '') {
        return;
    }
    const usedPieces = new Set();
    for (const namePiece of value.toLowerCase().split(/\s+/)) {
        if (namePiece === '' || usedPieces.has(namePiece)) {
            continue;
        }
        usedPieces.add(namePiece);
        whereClauses.push(`instr(lower(COALESCE(json_extract(orderFormData, ?), '')), ?) > 0`);
        sqlParameters.push(jsonPath, namePiece);
    }
}
export default function getOrderForms(filters, options = {}) {
    const database = getDatabaseConnection(true);
    const whereClauses = [];
    const sqlParameters = [];
    if (filters.isOrderFormProcessed !== undefined) {
        whereClauses.push('isOrderFormProcessed = ?');
        sqlParameters.push(filters.isOrderFormProcessed ? 1 : 0);
    }
    if (filters.contractTypeId !== undefined && `${filters.contractTypeId}` !== '') {
        const contractTypeId = Math.trunc(Number(filters.contractTypeId));
        if (Number.isFinite(contractTypeId)) {
            whereClauses.push("(CAST(COALESCE(json_extract(orderFormData, ?), -1) AS INTEGER) = ? OR lower(COALESCE(json_extract(orderFormData, ?), '')) = lower(?))");
            sqlParameters.push('$.contractTypeId', contractTypeId, '$.contractTypeIdText', filters.contractTypeName ?? '');
        }
    }
    addNamePiecesFilter(whereClauses, sqlParameters, '$.purchaserName', filters.purchaserName);
    addNamePiecesFilter(whereClauses, sqlParameters, '$.deceasedName', filters.deceasedName);
    const sqlWhereClause = whereClauses.length > 0 ? ` AND ${whereClauses.join(' AND ')}` : '';
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
      recordDelete_timeMillis IS NULL${sqlWhereClause}
  `;
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
            recordDelete_timeMillis IS NULL${sqlWhereClause}
        `)
            .get(...sqlParameters)
        : undefined;
    sql += ' ORDER BY orderFormId DESC';
    if (hasPaging) {
        sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }
    const rows = database.prepare(sql).all(...sqlParameters);
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
