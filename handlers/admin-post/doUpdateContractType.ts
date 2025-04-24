import type { Request, Response } from 'express'

import updateContractType, {
  type UpdateForm
} from '../../database/updateContractType.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response
): void {
  const success = updateContractType(request.body, request.session.user as User)

  const contractTypes = getContractTypes()
  const allContractTypeFields = getAllContractTypeFields()

  response.json({
    success,

    allContractTypeFields,
    contractTypes
  })
}
