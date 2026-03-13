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

export function getAuditableRecord(
  tableName: RecordTableName,
  recordIdValue: number | string,
  connectedDatabase: sqlite.Database
): unknown {
  return auditLogIsEnabled
    ? connectedDatabase
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            ${tableName}
          WHERE
            ${recordId[tableName]} = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(recordIdValue)
    : undefined
}

export function getAuditableContractRecord(
  contractId: number | string,
  connectedDatabase: sqlite.Database
): unknown {
  return getAuditableRecord('Contracts', contractId, connectedDatabase)
}

export function getAuditableContractFieldRecords(
  contractId: number | string,
  connectedDatabase: sqlite.Database
): unknown {
  return getAuditableRecord('ContractFields', contractId, connectedDatabase)
}
