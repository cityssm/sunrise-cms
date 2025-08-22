import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddFeeForm {
  feeCategoryId: number | string
  feeName: string
  feeDescription: string
  feeAccount: string
  contractTypeId: number | string
  burialSiteTypeId: number | string
  feeAmount?: string
  feeFunction?: string
  taxAmount?: string
  taxPercentage?: string
  includeQuantity?: '' | '1'
  quantityUnit?: string
  isRequired?: '' | '1'
  orderNumber?: number
}

export default function addFee(feeForm: AddFeeForm, user: User, connectedDatabase?: sqlite.Database): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into Fees (
        feeCategoryId,
        feeName, feeDescription, feeAccount,
        contractTypeId, burialSiteTypeId,
        feeAmount, feeFunction,
        taxAmount, taxPercentage,
        includeQuantity, quantityUnit,
        isRequired, orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
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
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  if (connectedDatabase === undefined) {


    database.close();


  }
  return result.lastInsertRowid as number
}
