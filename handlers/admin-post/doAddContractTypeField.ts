import type { Request, Response } from 'express'

import addContractTypeField, {
  type AddContractTypeFieldForm
} from '../../database/addContractTypeField.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, AddContractTypeFieldForm>,
  response: Response
): Promise<void> {
  const contractTypeFieldId = await addContractTypeField(
    request.body,
    request.session.user as User
  )

  const contractTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success: true,
    contractTypeFieldId,
    contractTypes,
    allContractTypeFields
  })
}
