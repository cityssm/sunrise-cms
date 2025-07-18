import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<unknown, unknown, { contractTypeId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'ContractTypes',
    request.body.contractTypeId,
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
