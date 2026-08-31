import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'
import getFee from './getFee.js'

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

export interface AddFeeForm {
  feeCategoryId: number | string
  feeDescription: string
  feeName: string

  feeAccount: string

  burialSiteTypeId: number | string
  contractTypeId: number | string

  feeAmount?: string
  feeFunction?: string
  taxAmount?: string
  taxPercentage?: string

  includeQuantity?: '' | '1'
  quantityUnit?: string

  isRequired?: '' | '1'
  orderNumber?: number
}

export default function addFee(
  feeForm: AddFeeForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        Fees (
          feeCategoryId,
          feeName,
          feeDescription,
          feeAccount,
          contractTypeId,
          burialSiteTypeId,
          feeAmount,
          feeFunction,
          taxAmount,
          taxPercentage,
          includeQuantity,
          quantityUnit,
          isRequired,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
    `)
    .run(
      feeForm.feeCategoryId,
      feeForm.feeName,
      feeForm.feeDescription,
      feeForm.feeAccount,
      feeForm.contractTypeId === '' ? undefined : feeForm.contractTypeId,
      feeForm.burialSiteTypeId === '' ? undefined : feeForm.burialSiteTypeId,
      feeForm.feeAmount === '' ? undefined : feeForm.feeAmount,
      feeForm.feeFunction ?? undefined,
      feeForm.taxAmount === '' ? undefined : feeForm.taxAmount,
      feeForm.taxPercentage === '' ? undefined : feeForm.taxPercentage,
      (feeForm.includeQuantity ?? '') === '' ? 0 : 1,
      feeForm.quantityUnit,
      (feeForm.isRequired ?? '') === '' ? 0 : 1,
      feeForm.orderNumber ?? -1,
      user.username,
      rightNowMillis,
      user.username,
      rightNowMillis
    )

  if (isAuditLoggingEnabled) {
    const recordAfter = getFee(result.lastInsertRowid as number, database)

    createAuditLogEntries(
      {
        mainRecordId: result.lastInsertRowid,
        mainRecordType: 'fee',
        updateTable: 'Fees'
      },
      [
        {
          property: '*',
          type: 'created',

          from: undefined,
          to: recordAfter
        }
      ],
      user,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return result.lastInsertRowid as number
}
