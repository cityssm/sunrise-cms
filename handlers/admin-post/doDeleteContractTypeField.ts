import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, { contractTypeFieldId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'ContractTypeFields',
    request.body.contractTypeFieldId,
    request.session.user as User
  )

  const contractTypes = getContractTypes()
  const allContractTypeFields = getAllContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
