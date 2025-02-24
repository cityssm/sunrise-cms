import type { Request, Response } from 'express'

import addContractTypePrint, {
  type AddContractTypePrintForm
} from '../../database/addContractTypePrint.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, AddContractTypePrintForm>,
  response: Response
): Promise<void> {
  const success = await addContractTypePrint(
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
