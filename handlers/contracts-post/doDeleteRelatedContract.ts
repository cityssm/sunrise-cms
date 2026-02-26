import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import deleteRelatedContract, {
  type DeleteRelatedContractForm
} from '../../database/deleteRelatedContract.js'
import getContracts from '../../database/getContracts.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

import type { Contract } from '../../types/record.types.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:contracts:doDeleteRelatedContract`
)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteRelatedContractResponse =
  { success: true; relatedContracts: Contract[] }
  | { errorMessage: string; success: false }

export default async function handler(
  request: Request<unknown, unknown, DeleteRelatedContractForm>,
  response: Response<DoDeleteRelatedContractResponse>
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    deleteRelatedContract(request.body, database)

    const relatedContracts = await getContracts(
      {
        relatedContractId: request.body.contractId
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
      success: true,

      relatedContracts: relatedContracts.contracts
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
