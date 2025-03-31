import type { Request, Response } from 'express'

import addContractType, {
  type AddForm
} from '../../database/addContractType.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, AddForm>,
  response: Response
): Promise<void> {
  const contractTypeId = await addContractType(
    request.body,
    request.session.user as User
  )

  const contractTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  response.json({
    success: true,

    allContractTypeFields,
    contractTypeId,
    contractTypes
  })
}
