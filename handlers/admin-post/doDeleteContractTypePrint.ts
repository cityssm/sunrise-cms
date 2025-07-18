import type { Request, Response } from 'express'

import deleteContractTypePrint from '../../database/deleteContractTypePrint.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { contractTypeId: string; printEJS: string }
  >,
  response: Response
): void {
  const success = deleteContractTypePrint(
    request.body.contractTypeId,
    request.body.printEJS,
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
