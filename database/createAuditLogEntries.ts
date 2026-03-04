import type { Difference } from '@cityssm/object-difference'
import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime'
import type sqlite from 'better-sqlite3'

type MainRecordType =
  | 'burialSite'
  | 'cemetery'
  | 'contract'
  | 'user'
  | 'workOrder'

type UpdateTable =
  | 'BurialSites'
  | 'Cemeteries'
  | 'CemeteryDirectionsOfArrival'
  | 'Contracts'
  | 'Users'
  | 'WorkOrders'

export default function createAuditLogEntries(
  record: {
    mainRecordType: MainRecordType
    mainRecordId: number | string
    updateTable: UpdateTable
    recordIndex?: string
  },
  differences: Difference[],
  user: User,
  connectedDatabase: sqlite.Database
): number {
  let entriesCreated = 0

  for (const difference of differences) {

    if (difference.property === 'recordUpdate_timeMillis') {
      continue
    }

    const currentDate = new Date()

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
        difference.from,
        difference.to
      )

    entriesCreated += 1
  }

  return entriesCreated
}
