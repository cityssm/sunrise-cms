import getObjectDifference from '@cityssm/object-difference'
import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import addOrUpdateContractField from './addOrUpdateContractField.js'
import createAuditLogEntries from './createAuditLogEntries.js'
import deleteContractField from './deleteContractField.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export interface UpdateContractForm {
  contractId: number | string

  burialSiteId: number | string
  contractTypeId: number | string

  contractEndDateString: '' | DateString
  contractStartDateString: DateString

  funeralHomeId?: number | string

  committalTypeId?: number | string
  directionOfArrival?: string
  funeralDateString: '' | DateString
  funeralDirectorName: string
  funeralTimeString: '' | TimeString

  purchaserName?: string

  purchaserAddress1?: string
  purchaserAddress2?: string
  purchaserCity?: string
  purchaserPostalCode?: string
  purchaserProvince?: string

  purchaserEmail?: string
  purchaserPhoneNumber?: string
  purchaserRelationship?: string

  [fieldValue_contractTypeFieldId: `fieldValue_${string}`]: unknown
  contractTypeFieldIds?: string
}

// eslint-disable-next-line complexity
export default function updateContract(
  updateForm: UpdateContractForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(
          /* sql */ `SELECT * FROM Contracts WHERE contractId = ? AND recordDelete_timeMillis IS NULL`
        )
        .get(updateForm.contractId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE Contracts
      SET
        contractTypeId = ?,
        burialSiteId = ?,
        contractStartDate = ?,
        contractEndDate = ?,
        funeralHomeId = ?,
        funeralDirectorName = ?,
        funeralDate = ?,
        funeralTime = ?,
        directionOfArrival = ?,
        committalTypeId = ?,
        purchaserName = ?,
        purchaserAddress1 = ?,
        purchaserAddress2 = ?,
        purchaserCity = ?,
        purchaserProvince = ?,
        purchaserPostalCode = ?,
        purchaserPhoneNumber = ?,
        purchaserEmail = ?,
        purchaserRelationship = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        contractId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(
      updateForm.contractTypeId,
      updateForm.burialSiteId === '' ? undefined : updateForm.burialSiteId,
      dateStringToInteger(updateForm.contractStartDateString),
      updateForm.contractEndDateString === ''
        ? undefined
        : dateStringToInteger(updateForm.contractEndDateString),
      updateForm.funeralHomeId === '' ? undefined : updateForm.funeralHomeId,
      updateForm.funeralDirectorName,
      updateForm.funeralDateString === ''
        ? undefined
        : dateStringToInteger(updateForm.funeralDateString),
      updateForm.funeralTimeString === ''
        ? undefined
        : timeStringToInteger(updateForm.funeralTimeString),
      updateForm.directionOfArrival ?? '',
      updateForm.committalTypeId === ''
        ? undefined
        : updateForm.committalTypeId,
      updateForm.purchaserName ?? '',
      updateForm.purchaserAddress1 ?? '',
      updateForm.purchaserAddress2 ?? '',
      updateForm.purchaserCity ?? '',
      updateForm.purchaserProvince ?? '',
      updateForm.purchaserPostalCode ?? '',
      updateForm.purchaserPhoneNumber ?? '',
      updateForm.purchaserEmail ?? '',
      updateForm.purchaserRelationship ?? '',
      user.userName,
      Date.now(),
      updateForm.contractId
    )

  if (result.changes > 0) {
    const contractTypeFieldIds = (updateForm.contractTypeFieldIds ?? '').split(
      ','
    )

    for (const contractTypeFieldId of contractTypeFieldIds) {
      const fieldValue = updateForm[
        `fieldValue_${contractTypeFieldId}`
      ] as string

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ;(fieldValue ?? '') === ''
        ? deleteContractField(
            updateForm.contractId,
            contractTypeFieldId,
            user,
            database
          )
        : addOrUpdateContractField(
            {
              contractId: updateForm.contractId,
              contractTypeFieldId,
              fieldValue
            },
            user,
            database
          )
    }

    if (auditLogIsEnabled) {
      const recordAfter = database
        .prepare(/* sql */ `SELECT * FROM Contracts WHERE contractId = ?`)
        .get(updateForm.contractId)

      const differences = getObjectDifference(recordBefore, recordAfter)

      if (differences.length > 0) {
        createAuditLogEntries(
          {
            mainRecordType: 'contract',
            mainRecordId: String(updateForm.contractId),
            updateTable: 'Contracts'
          },
          differences,
          user,
          database
        )
      }
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
