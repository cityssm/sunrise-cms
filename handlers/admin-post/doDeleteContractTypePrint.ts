import type { Request, Response } from 'express'

import deleteContractTypePrint from '../../database/deleteContractTypePrint.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'

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

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
