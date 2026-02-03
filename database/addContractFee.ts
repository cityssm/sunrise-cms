import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import {
  calculateFeeAmount,
  calculateTaxAmount
} from '../helpers/functions.fee.js'
import type { Contract, Fee } from '../types/record.types.js'

import getContract from './getContract.js'
import getFee from './getFee.js'

export interface AddContractFeeForm {
  contractId: number | string
  feeId: number | string

  feeAmount?: number | string
  quantity: number | string
  taxAmount?: number | string
}

async function determineFeeTaxAmounts(
  addFeeForm: AddContractFeeForm,
  database: sqlite.Database
): Promise<{ feeAmount: number; taxAmount: number }> {
  let feeAmount: number
  let taxAmount: number

  if ((addFeeForm.feeAmount ?? '') === '') {
    const contract = (await getContract(
      addFeeForm.contractId,
      database
    )) as Contract
    const fee = getFee(addFeeForm.feeId) as Fee

    feeAmount = calculateFeeAmount(fee, contract)
    taxAmount = calculateTaxAmount(fee, feeAmount)
  } else {
    feeAmount =
      typeof addFeeForm.feeAmount === 'string'
        ? Number.parseFloat(addFeeForm.feeAmount)
        : 0
    taxAmount =
      typeof addFeeForm.taxAmount === 'string'
        ? Number.parseFloat(addFeeForm.taxAmount)
        : 0
  }

  return { feeAmount, taxAmount }
}

export default async function addContractFee(
  addFeeForm: AddContractFeeForm,
  user: User,
  connectedDatabase?: sqlite.Database
): Promise<boolean> {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  // Calculate fee and tax (if not set)
  const { feeAmount, taxAmount } = await determineFeeTaxAmounts(
    addFeeForm,
    database
  )

  try {
    // Check if record already exists
    const record = database
      .prepare(/* sql */ `
        SELECT
          feeAmount,
          taxAmount,
          recordDelete_timeMillis
        FROM
          ContractFees
        WHERE
          contractId = ?
          AND feeId = ?
      `)
      .get(addFeeForm.contractId, addFeeForm.feeId) as
      | {
          feeAmount: number | null
          taxAmount: number | null

          recordDelete_timeMillis: number | null
        }
      | undefined

    if (record !== undefined) {
      if (record.recordDelete_timeMillis !== null) {
        database
          .prepare(/* sql */ `
            DELETE FROM ContractFees
            WHERE
              recordDelete_timeMillis IS NOT NULL
              AND contractId = ?
              AND feeId = ?
          `)
          .run(addFeeForm.contractId, addFeeForm.feeId)
      } else if (
        record.feeAmount === feeAmount &&
        record.taxAmount === taxAmount
      ) {
        database
          .prepare(/* sql */ `
            UPDATE ContractFees
            SET
              quantity = quantity + ?,
              recordUpdate_userName = ?,
              recordUpdate_timeMillis = ?
            WHERE
              contractId = ?
              AND feeId = ?
          `)
          .run(
            addFeeForm.quantity,
            user.userName,
            rightNowMillis,
            addFeeForm.contractId,
            addFeeForm.feeId
          )

        return true
      } else {
        const quantity =
          typeof addFeeForm.quantity === 'string'
            ? Number.parseFloat(addFeeForm.quantity)
            : addFeeForm.quantity

        database
          .prepare(/* sql */ `
            UPDATE ContractFees
            SET
              feeAmount = (feeAmount * quantity) + ?,
              taxAmount = (taxAmount * quantity) + ?,
              quantity = 1,
              recordUpdate_userName = ?,
              recordUpdate_timeMillis = ?
            WHERE
              contractId = ?
              AND feeId = ?
          `)
          .run(
            feeAmount * quantity,
            taxAmount * quantity,
            user.userName,
            rightNowMillis,
            addFeeForm.contractId,
            addFeeForm.feeId
          )

        return true
      }
    }

    // Create new record
    const result = database
      .prepare(/* sql */ `
        INSERT INTO
          ContractFees (
            contractId,
            feeId,
            quantity,
            feeAmount,
            taxAmount,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        addFeeForm.contractId,
        addFeeForm.feeId,
        addFeeForm.quantity,
        feeAmount,
        taxAmount,
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )

    return result.changes > 0
  } finally {
    if (connectedDatabase === undefined) {
      database.close()
    }
  }
}
