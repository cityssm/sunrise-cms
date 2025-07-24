import type { Request, Response } from 'express'

import updateContractType, {
  type UpdateForm
} from '../../database/updateContractType.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response
): void {
  const success = updateContractType(request.body, request.session.user as User)

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
