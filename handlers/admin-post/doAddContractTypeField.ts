import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import addContractTypeField, {
  type AddContractTypeFieldForm
} from '../../database/addContractTypeField.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddContractTypeField`)

export default function handler(
  request: Request<unknown, unknown, AddContractTypeFieldForm>,
  response: Response
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const contractTypeFieldId = addContractTypeField(
      request.body,
      request.session.user as User,
      database
    )

    const contractTypes = getCachedContractTypes()
    const allContractTypeFields = getAllCachedContractTypeFields()

    response.json({
      success: true,

      allContractTypeFields,
      contractTypeFieldId,
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
