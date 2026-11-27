import type { DatabaseSync } from 'node:sqlite'

export const currentUserVersion = 4

export function getCurrentUserVersion(database: DatabaseSync): number {
  const row = database.prepare('PRAGMA user_version').get() as
    { user_version: number } | undefined

  return row?.user_version ?? 0
}

export function hasTableColumn(
  database: DatabaseSync,
  tableName:
    | 'ContractInterments'
    | 'Contracts'
    | 'ContractTransactions'
    | 'PaymentTypes',
  columnName:
    | 'deceasedCountry'
    | 'isInvoiced'
    | 'paymentType'
    | 'paymentTypeId'
    | 'purchaserCountry'
): boolean {
  const columns = database
    .prepare(`PRAGMA table_info(${tableName})`)
    .all() as Array<{ name: string }>

  return columns.some((column) => column.name === columnName)
}
