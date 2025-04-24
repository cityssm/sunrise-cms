import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

import addContractFee from './addContractFee.js'
import { getFeeCategory } from './getFeeCategories.js'

export interface AddContractCategoryForm {
  contractId: number | string
  feeCategoryId: number | string
}

export default async function addContractFeeCategory(
  addFeeCategoryForm: AddContractCategoryForm,
  user: User
): Promise<number> {
  const database = sqlite(sunriseDB)

  const feeCategory = getFeeCategory(addFeeCategoryForm.feeCategoryId, database)

  let addedFeeCount = 0

  for (const fee of feeCategory?.fees ?? []) {
    const success = await addContractFee(
      {
        contractId: addFeeCategoryForm.contractId,
        feeId: fee.feeId,
        quantity: 1
      },
      user,
      database
    )

    if (success) {
      addedFeeCount += 1
    }
  }

  database.close()

  return addedFeeCount
}
