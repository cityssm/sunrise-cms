import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doMoveContractTypeUp`)

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success =
      request.body.moveToEnd === '1'
        ? moveRecordUpToTop('ContractTypes', request.body.contractTypeId, database)
        : moveRecordUp('ContractTypes', request.body.contractTypeId, database)

    const contractTypes = getCachedContractTypes()
    const allContractTypeFields = getAllCachedContractTypeFields()

    response.json({
      success,

      allContractTypeFields,
      contractTypes
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
