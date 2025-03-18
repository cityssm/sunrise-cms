import sqlite from 'better-sqlite3'

import addFee from '../../database/addFee.js'
import { sunriseDB as databasePath } from '../../helpers/database.helpers.js'

let feeCategoryId = 0

const feeCache = new Map<string, number>()

export async function getFeeIdByFeeDescription(
  feeDescription: string,
  user: User
): Promise<number> {
  if (feeCache.keys.length === 0) {
    const database = sqlite(databasePath, {
      readonly: true
    })

    const records = database
      .prepare(
        `select feeId, feeCategoryId, feeDescription
          from Fees
          where feeDescription like 'CMPP_FEE_%'`
      )
      .all() as Array<{
      feeId: number
      feeCategoryId: number
      feeDescription: string
    }>

    for (const record of records) {
      if (feeCategoryId === 0) {
        feeCategoryId = record.feeCategoryId
      }

      feeCache.set(record.feeDescription, record.feeId)
    }

    database.close()
  }

  let feeId = feeCache.get(feeDescription)

  if (feeId === undefined) {
    feeId = await addFee(
      {
        feeName: feeDescription.slice(9),
        feeDescription,
        feeCategoryId,
        feeAccount: '',
        contractTypeId: '',
        burialSiteTypeId: ''
      },
      user
    )

    feeCache.set(feeDescription, feeId)
  }

  return feeId
}
