import type sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'

type RecordTableName =
  | 'BurialSiteStatuses'
  | 'ContractFields'
  | 'Contracts'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

const recordId: Record<RecordTableName, string> = {
  BurialSiteStatuses: 'burialSiteStatusId',
  ContractFields: 'contractId',
  Contracts: 'contractId',
  WorkOrderMilestoneTypes: 'workOrderMilestoneTypeId',
  WorkOrderTypes: 'workOrderTypeId'
}

export function getAuditableRecords(
  tableName: RecordTableName,
  recordIdValue: number | string,
  connectedDatabase: sqlite.Database
): unknown[] | undefined {
  const idColumn = recordId[tableName] as string | undefined

  if (idColumn === undefined) {
    throw new Error('Invalid table name for auditable record lookup.')
  }

  return auditLogIsEnabled
    ? connectedDatabase
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            ${tableName}
          WHERE
            ${idColumn} = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .all(recordIdValue)
    : undefined
}

export function getAuditableContractRecord(
  contractId: number | string,
  connectedDatabase: sqlite.Database
): unknown {
  const records = getAuditableRecords(
    'Contracts',
    contractId,
    connectedDatabase
  )

  return records === undefined || records.length === 0 ? undefined : records[0]
}

export function getAuditableContractFieldRecords(
  contractId: number | string,
  connectedDatabase: sqlite.Database
): unknown[] | undefined {
  const records = getAuditableRecords(
    'ContractFields',
    contractId,
    connectedDatabase
  )

  return records === undefined || records.length === 0 ? undefined : records
}
