import { DatabaseSync } from 'node:sqlite'

import getObjectDifference from '@cityssm/object-difference'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'
import getFee from './getFee.js'

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

export interface UpdateFeeForm {
  feeId: string
  feeCategoryId: string
  feeName: string
  feeDescription: string
  feeAccount: string
  contractTypeId: string
  burialSiteTypeId: string
  feeAmount?: string
  feeFunction?: string
  taxAmount?: string
  taxPercentage?: string
  includeQuantity: '' | '1'
  quantityUnit?: string
  isRequired: '' | '1'
}

export default function updateFee(
  feeForm: UpdateFeeForm,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const recordBefore = isAuditLoggingEnabled
    ? getFee(feeForm.feeId, database)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE Fees
      SET
        feeCategoryId = ?,
        feeName = ?,
        feeDescription = ?,
        feeAccount = ?,
        contractTypeId = ?,
        burialSiteTypeId = ?,
        feeAmount = ?,
        feeFunction = ?,
        taxAmount = ?,
        taxPercentage = ?,
        includeQuantity = ?,
        quantityUnit = ?,
        isRequired = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND feeId = ?
    `)
    .run(
      feeForm.feeCategoryId,
      feeForm.feeName,
      feeForm.feeDescription,
      feeForm.feeAccount,
      feeForm.contractTypeId === '' ? null : feeForm.contractTypeId,
      feeForm.burialSiteTypeId === '' ? null : feeForm.burialSiteTypeId,
      feeForm.feeAmount === undefined || feeForm.feeAmount === ''
        ? null
        : feeForm.feeAmount,

      feeForm.feeFunction ?? null,

      feeForm.taxAmount === undefined || feeForm.taxAmount === ''
        ? null
        : feeForm.taxAmount,

      feeForm.taxPercentage === undefined || feeForm.taxPercentage === ''
        ? null
        : feeForm.taxPercentage,

      feeForm.includeQuantity === '' ? 0 : 1,
      feeForm.quantityUnit ?? null,
      feeForm.isRequired === '' ? 0 : 1,
      user.username,
      Date.now(),
      feeForm.feeId
    )

  if (isAuditLoggingEnabled && result.changes > 0) {
    const recordAfter = getFee(feeForm.feeId, database)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: feeForm.feeId,
          mainRecordType: 'fee',
          updateTable: 'Fees'
        },
        differences,
        user,
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

export interface UpdateFeeAmountForm {
  feeAmount: string
  feeId: string
}

export function updateFeeAmount(
  feeAmountForm: UpdateFeeAmountForm,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const recordBefore = isAuditLoggingEnabled
    ? getFee(feeAmountForm.feeId, database)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE Fees
      SET
        feeAmount = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND feeId = ?
    `)
    .run(
      feeAmountForm.feeAmount,
      user.username,
      Date.now(),
      feeAmountForm.feeId
    )

  if (isAuditLoggingEnabled && result.changes > 0) {
    const recordAfter = getFee(feeAmountForm.feeId, database)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: feeAmountForm.feeId,
          mainRecordType: 'fee',
          updateTable: 'Fees'
        },
        differences,
        user,
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return result.changes > 0
}
