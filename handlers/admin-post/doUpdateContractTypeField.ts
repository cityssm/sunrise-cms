import type { Request, Response } from 'express'

import updateContractTypeField, {
  type UpdateContractTypeFieldForm
} from '../../database/updateContractTypeField.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default function handler(
  request: Request<unknown, unknown, UpdateContractTypeFieldForm>,
  response: Response
): void {
  const success = updateContractTypeField(
    request.body,
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
