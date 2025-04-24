import type { Request, Response } from 'express'

import addContractType, {
  type AddForm
} from '../../database/addContractType.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, AddForm>,
  response: Response
): void {
  const contractTypeId = addContractType(
    request.body,
    request.session.user as User
  )

  const contractTypes = getContractTypes()
  const allContractTypeFields = getAllContractTypeFields()

  response.json({
    success: true,

    allContractTypeFields,
    contractTypeId,
    contractTypes
  })
}
