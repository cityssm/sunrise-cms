import type { Request, Response } from 'express'

import addContractTypeField, {
  type AddContractTypeFieldForm
} from '../../database/addContractTypeField.js'
import {
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'

export default function handler(
  request: Request<unknown, unknown, AddContractTypeFieldForm>,
  response: Response
): void {
  const contractTypeFieldId = addContractTypeField(
    request.body,
    request.session.user as User
  )

  const contractTypes = getCachedContractTypes()
  const allContractTypeFields = getAllCachedContractTypeFields()

  response.json({
    success: true,

    allContractTypeFields,
    contractTypeFieldId,
    contractTypes
  })
}
