import type { SQLInputValue } from 'node:sqlite'

import {
  getDatabaseConnection,
  sanitizeLimit,
  sanitizeOffset
} from '../helpers/database.helpers.js'
import type { OrderForm } from '../types/record.types.js'

export interface GetOrderFormsFilters {
  contractTypeId?: number | string
  contractTypeName?: string
  deceasedName?: string
  purchaserName?: string
  isOrderFormProcessed?: boolean
}

export interface GetOrderFormsOptions {
  limit?: number | string
  offset?: number | string
}

function addNamePiecesFilter(
  whereClauses: string[],
  sqlParameters: SQLInputValue[],
  jsonPath: '$.purchaserName' | '$.deceasedName',
  value: string | undefined
): void {
  if (value === undefined || value.trim() === '') {
    return
  }

  const usedPieces = new Set<string>()

  for (const namePiece of value.toLowerCase().split(/\s+/)) {
    if (namePiece === '' || usedPieces.has(namePiece)) {
      continue
    }

    usedPieces.add(namePiece)

    whereClauses.push(
      `instr(lower(COALESCE(json_extract(orderFormData, ?), '')), ?) > 0`
    )
    sqlParameters.push(jsonPath, namePiece)
  }
}

export default function getOrderForms(
  filters: GetOrderFormsFilters,
  options: GetOrderFormsOptions = {}
): OrderForm[] | { orderForms: OrderForm[]; count: number } {
  const database = getDatabaseConnection(true)

  const whereClauses: string[] = []
  const sqlParameters: SQLInputValue[] = []

  if (filters.isOrderFormProcessed !== undefined) {
    whereClauses.push('isOrderFormProcessed = ?')
    sqlParameters.push(filters.isOrderFormProcessed ? 1 : 0)
  }

  if (filters.contractTypeId !== undefined && `${filters.contractTypeId}` !== '') {
    const contractTypeId = Math.trunc(Number(filters.contractTypeId))

    if (Number.isFinite(contractTypeId)) {
      whereClauses.push(
        "(CAST(COALESCE(json_extract(orderFormData, ?), -1) AS INTEGER) = ? OR lower(COALESCE(json_extract(orderFormData, ?), '')) = lower(?))"
      )
      sqlParameters.push(
        '$.contractTypeId',
        contractTypeId,
        '$.contractTypeIdText',
        filters.contractTypeName ?? ''
      )
    }
  }

  addNamePiecesFilter(whereClauses, sqlParameters, '$.purchaserName', filters.purchaserName)
  addNamePiecesFilter(whereClauses, sqlParameters, '$.deceasedName', filters.deceasedName)

  const sqlWhereClause =
    whereClauses.length > 0 ? ` AND ${whereClauses.join(' AND ')}` : ''

  let sql = /* sql */ `
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
  `

  const hasPaging = options.limit !== undefined || options.offset !== undefined

  const limit = hasPaging
    ? sanitizeLimit(options.limit ?? 50)
    : undefined

  const offset = hasPaging
    ? sanitizeOffset(options.offset ?? 0)
    : undefined

  const countResult = hasPaging
    ? (database
        .prepare(/* sql */ `
          SELECT
            COUNT(*) AS recordCount
          FROM
            OrderForms
          WHERE
            recordDelete_timeMillis IS NULL${sqlWhereClause}
        `)
        .get(...sqlParameters) as { recordCount: number } | undefined)
    : undefined

  sql += ' ORDER BY orderFormId DESC'

  if (hasPaging) {
    sql += ` LIMIT ${limit} OFFSET ${offset}`
  }

  const rows = database.prepare(sql).all(...sqlParameters) as Array<
    Omit<OrderForm, 'orderFormData'> & { orderFormDataString: string }
  >

  database.close()

  const orderForms = rows.map(({ orderFormDataString, ...rest }) => ({
    ...rest,

    orderFormData: JSON.parse(orderFormDataString) as OrderForm['orderFormData']
  })) as OrderForm[]

  if (hasPaging) {
    return {
      orderForms,
      count: countResult?.recordCount ?? orderForms.length
    }
  }

  return orderForms
}

export function getUnprocessedOrderFormCount(): number {
  const database = getDatabaseConnection(true)

  const row = database
    .prepare(/* sql */ `
      SELECT
        COUNT(*) AS count
      FROM
        OrderForms
      WHERE
        recordDelete_timeMillis IS NULL
        AND isOrderFormProcessed = 0
    `)
    .get() as { count: number } | undefined

  database.close()

  return row?.count ?? 0
}
