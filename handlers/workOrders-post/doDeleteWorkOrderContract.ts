import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import deleteWorkOrderContract from '../../database/deleteWorkOrderContract.js'
import getContracts from '../../database/getContracts.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { Contract } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:workOrders:doDeleteWorkOrderContract`
)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteWorkOrderContractResponse =
  { success: boolean; workOrderContracts: Contract[] }
  | { errorMessage: string; success: false }

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { contractId: string; workOrderId: string }
  >,
  response: Response<DoDeleteWorkOrderContractResponse>
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = deleteWorkOrderContract(
      request.body.workOrderId,
      request.body.contractId,
      request.session.user as User,
      database
    )

    const workOrderContracts = await getContracts(
      {
        workOrderId: request.body.workOrderId
      },
      {
        limit: -1,
        offset: 0,

        includeFees: false,
        includeInterments: true,
        includeTransactions: false
      },
      database
    )

    response.json({
      success,
      workOrderContracts: workOrderContracts.contracts
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
