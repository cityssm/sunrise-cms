/* eslint-disable unicorn/no-null */

import type { Difference } from '@cityssm/object-difference'
import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime'
import type sqlite from 'better-sqlite3'

type MainRecordType =
  | 'burialSite'
  | 'burialSiteStatus'
  | 'burialSiteType'
  | 'cemetery'
  | 'committalType'
  | 'contract'
  | 'contractType'
  | 'fee'
  | 'funeralHome'
  | 'intermentContainerType'
  | 'intermentDepth'
  | 'serviceType'
  | 'user'
  | 'workOrder'
  | 'workOrderMilestoneType'
  | 'workOrderType'

type UpdateTable =
  | 'BurialSites'
  | 'BurialSiteStatuses'
  | 'BurialSiteTypes'
  | 'Cemeteries'
  | 'CemeteryDirectionsOfArrival'
  | 'CommittalTypes'
  | 'Contracts'
  | 'ContractTypes'
  | 'Fees'
  | 'FuneralHomes'
  | 'IntermentContainerTypes'
  | 'IntermentDepths'
  | 'ServiceTypes'
  | 'Users'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrders'
  | 'WorkOrderTypes'

const propertiesToExclude = new Set([
  'recordCreate_timeMillis',
  'recordCreate_userName',
  'recordUpdate_timeMillis'
])

export default function createAuditLogEntries(
  record: {
    mainRecordType: MainRecordType
    mainRecordId: string
    updateTable: UpdateTable
    recordIndex?: string
  },
  differences: Difference[],
  user: User,
  connectedDatabase: sqlite.Database
): number {
  let entriesCreated = 0

  for (const difference of differences) {
    if (
      propertiesToExclude.has(difference.property) ||
      difference.type === 'NA'
    ) {
      continue
    }

    const currentDate = new Date()

    const fromValue =
      difference.from === undefined || difference.from === null
        ? null
        : JSON.stringify(difference.from)

    const toValue =
      difference.to === undefined || difference.to === null
        ? null
        : JSON.stringify(difference.to)

    connectedDatabase
      .prepare(/* sql */ `
        INSERT INTO
          AuditLog (
            logMillis,
            logDate,
            logTime,
            mainRecordType,
            mainRecordId,
            updateTable,
            recordIndex,
            updateField,
            updateType,
            updateUserName,
            fromValue,
            toValue
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        currentDate.getTime(),
        dateToInteger(currentDate),
        dateToTimeInteger(currentDate),
        record.mainRecordType,
        record.mainRecordId,
        record.updateTable,
        record.recordIndex,
        difference.property,
        difference.type,
        user.userName,
        fromValue,
        toValue
      )

    entriesCreated += 1
  }

  return entriesCreated
}
