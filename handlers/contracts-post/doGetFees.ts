import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getContract from '../../database/getContract.js'
import getFeeCategories from '../../database/getFeeCategories.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import type { Contract, FeeCategory } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doGetFees`)

export type DoGetFeesResponse =
  | {
      errorMessage: string

      success: false
    }
  | {
      success: true

      feeCategories: FeeCategory[]
    }

export default async function handler(
  request: Request<unknown, unknown, { contractId: string }>,
  response: Response<DoGetFeesResponse>
): Promise<void> {
  const contractId = request.body.contractId

  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const contract = (await getContract(contractId, database)) as Contract

    const feeCategories = getFeeCategories(
      {
        burialSiteTypeId: contract.burialSiteTypeId,
        contractTypeId: contract.contractTypeId
      },
      {
        includeFees: true
      },
      database
    )

    response.json({
      success: true,

      feeCategories
    })
  } catch (error) {
    debug(error)
    response
      .status(500)
      .json({ errorMessage: 'Database error', success: false })
  } finally {
    database?.close()
  }
}
