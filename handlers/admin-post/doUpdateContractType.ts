import type { Request, Response } from 'express'

import updateContractType, {
  type UpdateForm
} from '../../database/updateContractType.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateForm>,
  response: Response
): Promise<void> {
  const success = await updateContractType(
    request.body,
    request.session.user as User
  )

  const contractTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success,
    contractTypes,
    allContractTypeFields
  })
}
